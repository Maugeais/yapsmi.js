'use strict';

let analysers = {};
let position = 0;
let tail_size = 5;
let indicators = {
  "4 normalised harmonics" : 3
}

let timbre_knobs;
 
function init(uid){ 
    add_filter(init_timbre_analyser, -1, uid);
    init_knobs("timbre_controls", "medium", "LittlePhatty");
    draw();
}

function init_timbre_analyser(audioCtx, uid){
    analysers[uid] = audioCtx.createAnalyser();
    // analysers[uid].fftSize = 2048*4;
    analysers[uid].smoothingTimeConstant = 0.0;
    analysers[uid].wavArray = new Float32Array(analysers[uid].frequencyBinCount);
    return({'input': analysers[uid], 'output': analysers[uid], 'is_on': true, 'callback': timbre_analyser})
}

function timbre_analyser(uid){

    position++;
    analysers[uid].getFloatTimeDomainData(analysers[uid].wavArray);
    let freq = get_frequency(analysers[uid].wavArray);
    if ((freq > 40) && (freq < 10000.0)){
    let len = parseInt(fs/freq);
      const val = compute_fft(analysers[uid].wavArray, len)
      update_drawing(val[0], val[1], freq, uid)    
    }
}

window.timbre_tail_change = function(a, s){
  // vocal_tract_buttons[s-1]['A'].set_from_percentage(a);
  tail_size = parseInt(5+2*a);
  $("#timbre_tail_value").html((tail_size*2*2048/fs).toFixed(2)+'s') //vocal_tract_buttons[s-1]['A'].to_string());
}

let indicator = "4-harmonics";

window.change_timbre_indicator = function(e){

  indicator = e.value;
  switch(indicator){
    case "4-harmonics" : traces = tracesH4;
      break;
    case "9-harmonics" : traces = tracesH9;
      break;
    case "cgs" : traces = tracesCGS;
      break;
    case "tristimulus" :
      break;
    case "odd2even" :
      break;
  }
  draw()
}

var tracesH4 = [{
        x: [],
        y: [],
        type: 'scatter',
        "name" : "H1"
      }, {
        x: [],
        y: [],
        type: 'scatter',
        "name" : "H2"
      }, {
        x: [],
        y: [],
        type: 'scatter',
        "name" : "H3"
      }, {
        x: [],
        y: [],
        type: 'scatter',
        "name" : "H4"
      }];

var tracesH9 = [{
      x: [],
      y: [],
      type: 'scatter',
      "name" : "H1"
    }, {
      x: [],
      y: [],
      type: 'scatter',
      "name" : "H2"
    }, {
      x: [],
      y: [],
      type: 'scatter',
      "name" : "H3"
    }, {
      x: [],
      y: [],
      type: 'scatter',
      "name" : "H4"
    },{
      x: [],
      y: [],
      type: 'scatter',
      "name" : "H5"
    }, {
      x: [],
      y: [],
      type: 'scatter',
      "name" : "H6"
    }, {
      x: [],
      y: [],
      type: 'scatter',
      "name" : "H7"
    }, {
      x: [],
      y: [],
      type: 'scatter',
      "name" : "H8"
    },{
      x: [],
      y: [],
      type: 'scatter',
      "name" : "H9"
    }];
var tracesCGS = [{
      x: [],
      y: [],
      type: 'scatter',
      "name" : "CGS"
    }, 
];

var traces = tracesH4;

function draw(){
  
  var layout = {
          autosize: true,
          width: 350,
          height: 250,
          uirevision :true,
          margin: {
            l: 20,
            r: 0,
            b: 20,
            t: 0
          },
          xaxis: {
            title: 'Time (s)',
            showgrid: true,
            zeroline: false
          },
          yaxis: {
            showline: false
          }
        };

    Plotly.newPlot('timbre_display', traces, layout);
}

function update_drawing(real, imag, freq, uid){

    var values = [];
    var energy = 0;

    for (let i=0; i < 10; i++){
      values.push((real[i+1]**2+imag[i+1]**2));
      energy += values[i];
    }

    // console.log(values)
    let x = new Array(traces.length);
    let y = new Array(traces.length);

    
    // var update = { x : [[position], [position], [position], [position]],
    //   y:[[10*Math.log10(values[0]/energy)], [10*Math.log10(values[1]/energy)], [10*Math.log10(values[2]/energy)], [10*Math.log10(values[3]/energy)]]}
    var t = [];
    for (let i = 0; i < traces.length; i++){
      x[i] = [position*2*2048/48000]
      t.push(i)
    }

    switch(indicator){
        case "4-harmonics" : 
        case "9-harmonics" :  for (let i = 0; i < y.length; i++){
                                y[i] = [10*Math.log10(values[i]/energy)]
                              } 
                              break;
          break;
        case "cgs" :  let cgs = 0;
                      for (let i = 0; i < 10; i++){
                          cgs += (i+1)*values[i]**0.5;
                      } 
                      y[0] = [freq*cgs/energy**0.5];
                      console.log(cgs, energy**0.5)
          break;
        case "tristimulus" :
          break;
        case "odd2even" :
          break;
      
    }
    
    // for (let i = 0; i < max_harmonics; i++){
    //   y[i] = [10*Math.log10(values[i]/energy)]
    // }


    var update = { x : x, y : y};

    Plotly.extendTraces('timbre_display', update, t, parseInt(tail_size))
}

export { init }
