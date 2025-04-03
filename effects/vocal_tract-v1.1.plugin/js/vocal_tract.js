"use strict";

import { parameter } from "../../../js/parameters.js?version=1.1";
import { complex } from "../../../js/wind_instrument.js?version=1.1";


let vocal_tract_knobs;
let vocal_tract_vowels = {
  "none" : [[2, 240, 1e5], [2, 1040, 1e5], [2, 2200, 1e5], [2, 4000, 1e5]],  
  "low" : [[8, 240, 4e9], [10, 1040, 3e8], [30, 2200, 5e9], [30, 4000, 1e10]],
  "mid" : [[6, 300, 4e8], [30, 1140, 3e9], [30, 2500, 1e9], [30, 3800, 4e9]],
  "high" : [[6, 240, 1e8], [30, 1040, 3e9], [6, 2200, 1e9], [30, 3600, 4e9]]
};

let vocal_tract_buttons = [
        {
          "A" : new parameter(1e5, [1e5, 1e11], '', 1e-9, 2, true),
          "F" : new parameter(240, [200, 300], '', 1, 0, true),
          "Q" : new parameter(8, [2, 30], '', 1, 0, true),
        },
        {
          "A" : new parameter(2, [1e5, 1e11], '', 1e-9, 2, true),
          "F" : new parameter(1040, [800, 1400], '', 1, 0, true),
          "Q" : new parameter(10, [2, 30], '', 1, 0, true),
        },
        {
          "A" : new parameter(2, [1e5, 1e11], '', 1e-9, 2, true),
          "F" : new parameter(2200, [2100, 2300], '', 1, 0, true),
          "Q" : new parameter(30, [2, 30], '', 1, 0, true),
        },
        {
          "A" : new parameter(2, [1e5, 1e11], '', 1e-9, 2, true),
          "F" : new parameter(4000, [3500, 4500], '', 1, 0, true),
          "Q" : new parameter(30, [2, 30], '', 1, 0, true),
        }

];

let vowel = "none";

$('input[name=vowel]').change(function() {
  set_vowel(this.value)
});

let vocal_tract_parameters = [];

let F = new Float32Array(1000);
let Z = new Float32Array(1000);
let F0 = 100;
let Fm = 5000;

function real_to_complex(){
  for (let i = 0; i < 4; i++){
    vocal_tract_vowels[vowel][i][0] = vocal_tract_buttons[i]['Q'].value;

    let Q = vocal_tract_buttons[i]['Q'].value;
    let omega = 2*Math.PI*vocal_tract_buttons[i]['F'].value;
    let A = vocal_tract_buttons[i]['A'].value;

    let S = new complex(-omega/Q, omega*Math.sqrt(1-1/Q**2));
    let C = new complex(A/2, -A/2/Math.sqrt(Q**2-1));
    vocal_tract_parameters[i] = [S, C];
  }  
}

function update_vocal_tract_impedance(continuous = false){

  // let Q = duduk.params['vocal_tract_quality'].value;
  // let omega = 2*math.PI*duduk.params['vocal_tract_frequency'].value;
  // let A = duduk.params['vocal_tract_amplitude'].value;

  // let S = complex(-omega/Q, omega*math.sqrt(1-1/Q**2));
  // let C = complex(A/2, -A/2/math.sqrt(Q**2-1));

  // vocal_tract_parameters[vocal_tract[vowel]["main_mode"]] = [S, C];
  // // duduk.S[0].re = S.re;
  // // duduk.S[0].im = S.im;
  // // duduk.C[0].re = C.re;
  // // duduk.C[0].im = C.im;

  real_to_complex()

  simulationNode.port.postMessage({property:"exec", method:"change_vocal_tract", params: {vocal_tract_parameters : vocal_tract_parameters, continuous : continuous}});

  let i, j, s, S, C;
  for (i = 0; i < F.length; i++){
    s = new complex(0, 0);
    let jomega = new complex(0, 2*Math.PI*F[i]);
    for (j = 0; j < vocal_tract_parameters.length; j++){
      [S, C] = vocal_tract_parameters[j];
      s = s.add(C.div(jomega.sub(S)))
    }
    Z[i] = Math.log10(s.abs());
  }

  data['y'] = Z;

  Plotly.redraw('vocal_tract_display');
}

window.set_vowel = function(name){
  vowel = name;
  
  for (let i = 0; i < 4; i++){
      vocal_tract_buttons[i]['Q'].value = vocal_tract_vowels[name][i][0];
      vocal_tract_knobs["vocal_tract_Q€"+(i+1)].setValue(vocal_tract_buttons[i]['Q'].to_percentage())
      vocal_tract_buttons[i]['F'].range = [vocal_tract_vowels[name][i][1]/1.5, vocal_tract_vowels[name][i][1]*1.5];
      vocal_tract_buttons[i]['F'].value = vocal_tract_vowels[name][i][1];
      vocal_tract_knobs["vocal_tract_F€"+(i+1)].setValue(vocal_tract_buttons[i]['F'].to_percentage())
      vocal_tract_buttons[i]['A'].value = vocal_tract_vowels[name][i][2];
      vocal_tract_knobs["vocal_tract_A€"+(i+1)].setValue(vocal_tract_buttons[i]['A'].to_percentage())

  }

  update_vocal_tract_impedance(true);
}


function init(uid){
    // if (~Object.getOwnPropertyNames(inst).includes('vocal_tract_dim')){
    //   alert("Your instrument does not have an implemented vocal tract method")
    // } 

    // if (inst.vocal_tract_dim < 4){
    //   alert("Dimension too small")
    // }
    // 
    add_filter(init_vocal_tract_analyser, -1, uid);


    for (let i = 0; i < 4; i++){
          vocal_tract_parameters.push([new complex(0, 0), new complex(0, 0)]);
    }

    for (let i = 0; i < F.length; i++){
      F[i] =F0+(Fm-F0)*i/F.length; 
    }   
    
    draw()

    vocal_tract_knobs = init_knobs("vocal_tract_controls", "medium", "Vintage");
    let obj = {"none_vowel": $("#none_vowel"), "o_vowel": $("#o_vowel"), "u_vowel": $("#u_vowel"), "e_vowel": $("#e_vowel")}
    register_controls("vocal_tract", {...vocal_tract_knobs, ...obj})
    update_vocal_tract_impedance();
}

function init_vocal_tract_analyser(audioCtx, uid){
 
  return({'input': null, 'output': null, 'is_on': false, 'callback': vocal_tract_analyser})

}

function vocal_tract_analyser(uid){
  // let freq = get_frequency();

  // for(let i = 0; i < layout.shapes.length; i++) {
  //   if (isNaN(freq)){
  //     layout.shapes[i].visible = false;
  //   } else {
  //     layout.shapes[i].visible = true;
  //   }
  //   layout.shapes[i].y0 = (i+1)*freq;
  //   layout.shapes[i].y1 = (i+1)*freq;
  // }
  // Plotly.redraw('vocal_tract_display');
  // Plotly.relayout('vocal_tract_display')
}


window.vocal_tract_A_change = function(a, s){
    vocal_tract_buttons[s-1]['A'].set_from_percentage(a);
    $("#vocal_tract_A€"+s+"_value").html(vocal_tract_buttons[s-1]['A'].to_string());
    update_vocal_tract_impedance();
}

window.vocal_tract_Q_change = function(a, s){
  vocal_tract_buttons[s-1]['Q'].set_from_percentage(a);
  $("#vocal_tract_Q€"+s+"_value").html(vocal_tract_buttons[s-1]['Q'].to_string());
  update_vocal_tract_impedance();
}

window.vocal_tract_F_change = function(a, s){
  vocal_tract_buttons[s-1]['F'].set_from_percentage(a);
  $("#vocal_tract_F€"+s+"_value").html(vocal_tract_buttons[s-1]['F'].to_string());
  update_vocal_tract_impedance();
}

let data = [{
      x: Z,
      y: F,
      line: {
        color: 'rgb(55, 128, 191)',
        width: 3},
      type: 'scatter'
    }]; 
    
var layout = {
    autosize: false,
    width: 150,
    height: 300,
    uirevision :true,
    margin: {
      l: 30,
      r: 0,
      b: 20,
      t: 0
    },
    xaxis: {
      showgrid: false,
      zeroline: false
    },
    yaxis: {
      showline: false,
      autorange : "reversed",
      type: 'log'
    },
    // shapes: [
    //   {
    //       type: 'line',
    //       xref: 'paper',
    //       x0: 0,
    //       y0: 0.0,
    //       x1: 1,
    //       y1: 0.0,
    //       line:{
    //           color: 'rgb(255, 0, 0)',
    //           width: 2,
    //       }
    //   }, {
    //     type: 'line',
    //     xref: 'paper',
    //     x0: 0,
    //     y0: 0.0,
    //     x1: 2,
    //     y1: 0.0,
    //     line:{
    //         color: 'rgb(255, 0, 0)',
    //         width: 1,
    //         dash:'dot'
    //     }
    // }, {
    //   type: 'line',
    //   xref: 'paper',
    //   x0: 0,
    //   y0: 0.0,
    //   x1: 1,
    //   y1: 0.0,
    //   line:{
    //       color: 'rgb(255, 0, 0)',
    //       width: 1,
    //       dash:'dot'
    //   }
    // }, {
    //   type: 'line',
    //   xref: 'paper',
    //   x0: 0,
    //   y0: 0.0,
    //   x1: 1,
    //   y1: 0.0,
    //   line:{
    //       color: 'rgb(255, 0, 0)',
    //       width: 1,
    //       dash:'dot'
    //   }
    // }, {
    //   type: 'line',
    //   xref: 'paper',
    //   x0: 0,
    //   y0: 0.0,
    //   x1: 1,
    //   y1:0.0,
    //   line:{
    //       color: 'rgb(255, 0, 0)',
    //       width: 1,
    //       dash:'dot'
    //   }
    // }, {
    //   type: 'line',
    //   xref: 'paper',
    //   x0: 0,
    //   y0: 0.0,
    //   x1: 1,
    //   y1: 0.0,
    //   line:{
    //       color: 'rgb(255, 0, 0)',
    //       width: 1,
    //       dash:'dot'
    //   }
    // }
      // ]
  };

function draw(){
    Plotly.newPlot('vocal_tract_display', data, layout);
}

export { init }
