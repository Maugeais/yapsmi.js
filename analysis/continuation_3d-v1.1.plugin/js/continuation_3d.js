"use strict";

import { parameter } from "../../../js/parameters.js?version=1.1";

let analysers = {};
let tail_size = 100;

function init_continuation_3d_analyser(audioCtx, uid){
  analysers[uid] = audioCtx.createAnalyser();
  analysers[uid].fftSize = 2048*16;
  analysers[uid].smoothingTimeConstant = 0.0;
  analysers[uid].wavArray = new Float32Array(analysers[uid].frequencyBinCount);
  return({'input': analysers[uid], 'output': analysers[uid], 'is_on': true, 'callback': continuation_3d_analyser})
}


function continuation_3d_analyser(uid){

  analysers[uid].getFloatTimeDomainData(analysers[uid].wavArray);
  let freq = get_frequency(analysers[uid].wavArray);
  var update = {
          x: [[compute_value(key_x, analysers[uid].wavArray, freq)]],
          y: [[compute_value(key_y, analysers[uid].wavArray, freq)]],
          z: [[compute_value(key_z, analysers[uid].wavArray, freq)]],
  }

  ++time;

  Plotly.extendTraces('continuation_3d_display', update, [0], tail_size)
}

var time = 0;

var history = new parameter(100, [0.85, 853.0], 's', 1, 0, true);
var key_x = Object.keys(inst_controls)[0];
var key_y = "rms";
var key_z = "rms";

window.continuation_3d_tail_change = function(a){
  history.set_from_percentage(a);
  tail_size = history.value*48000/(2*2048);
  $("#continuation_3d_tail_value").html(history.to_string());
}

window.continuation_3d_change_axis = function(axis, container){
  if (axis == "x") key_x = $(container).val();
  if (axis == "y") key_y = $(container).val();
  if (axis == "z") key_z = $(container).val();

  var update = {
    x: [[]],
    y: [[]],
    z: [[]]
  }
  Plotly.extendTraces('continuation_3d_display', update, [0], 0)
}

// let canvas = document.getElementById("continuation_3d_display");

let drawing_on = true;

// canvas.addEventListener("mousedown", function(e) {
//     drawing_on = false;
// });

// canvas.addEventListener("mouseup", function(e) {
//     drawing_on = true;
// });
    
function draw(){
    

    var x = [];
    var y = [];
    var z = [];
    var c = [];
    var data = [{
      type: 'scatter3d',
      mode: 'lines',
      opacity: 0.7,
      x: x,
      y: y,
      z: z,
      line: {
        width: 10,
        color: c,
        colorscale: 'Viridis'},
    }];

    // for(i = 0; i < pointCount/4; i++)
    // {
    //     r = i * (pointCount - i);
    //     x.push(r * Math.cos(i / 30));
    //     y.push(r * Math.sin(i / 30));
    //     z.push(i);
    //     c.push(i)
    // }

    var layout = {
        autosize: false,
        width: 450,
        height: 300,
        uirevision :true,
        margin: {
          l: 0,
          r: 0,
          b: 0,
          t: 0
        },
        scene: {
          xaxis:{title: 'X AXIS TITLE'},
          yaxis:{title: 'Y AXIS TITLE'},
          zaxis:{title: 'Z AXIS TITLE'},
        },
      };

    Plotly.newPlot('continuation_3d_display', data, layout, {displayModeBar: false});
// [{
//         type: 'scatter3d',
//         mode: 'lines',
//         x: x,
//         y: y,
//         z: z,
//         opacity: 0.7,
//         line: {
//         width: 10,
//         color: c,
//         colorscale: 'Viridis'}
//         }]
}


function compute_value(key, output){

  let freq = get_frequency();

  switch (key){
    case "time" :
      return(time*2*2048/48000)
    case "rms" :
      let j;
      let rms = -0.5*output[0]**2;
      for (j = 0; j < fs/freq; j++) rms += output[j]**2;
      rms -= 0.5*output[j]**2;
      return(Math.sqrt(rms*freq/fs)/inst_controls['output_impedance'].real_value);
    case "amplitude" :
      let amplitude = Math.max(...output)-Math.min(...output);
      return(amplitude/inst_controls['output_impedance'].real_value);
    case "frequency" :
      return(freq);
    default :
      return(inst_controls[key].real_value);
  }  
}

let continuation_3d_knobs;
function init(uid){

  continuation_3d_knobs = init_knobs("continuation_3d_controls", "large", "Vintage");

  key_x = Object.keys(inst_controls)[0];
  
  let keys = Object.keys(inst_controls);
  $.each(keys, function (i, item) {
      $('#continuation_3d_x').append($('<option>', {
          value: item,
          text : item
      }));
      $('#continuation_3d_y').append($('<option>', {
          value: item,
          text : item
      }));
      $('#continuation_3d_z').append($('<option>', {
          value: item,
          text : item
      }));
  });


  draw();
  add_filter(init_continuation_3d_analyser, -1, uid); 
  
  plugins[uid].save = save;
  plugins[uid].load = load;

}

function save(){
  let commands = {'tail_size' :  tail_size , 'key_x' : key_x, 'key_y' : key_y, 'key_z' : key_z};
    
  return(commands)
}

function load(uid, commands){    
  key_x = commands['key_x'];
  $("#continuation_3d_x").val(key_x);
  key_y = commands['key_y'];
  $("#continuation_3d_y").val(key_y);
  key_y = commands['key_y'];
  $("#continuation_3d_y").val(key_y);
  continuation_3d_knobs[0].setValue(commands["tail_size"])

}

export { init };

// exemple d'update à https://plotly.com/javascript/streaming/#streaming-with-timestamp
//  Plotly.extendTraces
