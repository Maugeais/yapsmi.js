"use strict";

import { parameter } from "../../../js/parameters.js?version=1.1";

let analysers = {};
let tail_size = 100;

function init_continuation_analyser(audioCtx, uid){
    analysers[uid] = audioCtx.createAnalyser();
    analysers[uid].fftSize = 2048*16;
    analysers[uid].smoothingTimeConstant = 0.0;
    analysers[uid].wavArray = new Float32Array(analysers[uid].frequencyBinCount);
    return({'input': analysers[uid], 'output': analysers[uid], 'is_on': true, 'callback': continuation_analyser})
}

function continuation_analyser(uid){

    analysers[uid].getFloatTimeDomainData(analysers[uid].wavArray);
    let freq = get_frequency(analysers[uid].wavArray);
    var update = {
            x: [[compute_value(key_x, analysers[uid].wavArray, freq)]],
            y: [[compute_value(key_y, analysers[uid].wavArray, freq)]],
    }

    ++time;

    Plotly.extendTraces('continuation_display', update, [0], tail_size)
}

var time = 0;

var history = new parameter(100, [0.85, 853.0], 's', 1, 0, true);
var key_x = Object.keys(inst_controls)[0];
var key_y = "rms";

window.continuation_tail_change = function(a){
      history.set_from_percentage(a);
      tail_size = history.value*48000/(2*2048);
      $("#continuation_tail_value").html(history.to_string());
}

window.continuation_change_axis = function(axis, container){
      if (axis == "x") key_x = $(container).val();
      if (axis == "y") key_y = $(container).val();
      var update = {
        x: [[]],
        y: [[]],
      }
      Plotly.extendTraces('continuation_display', update, [0], 0)


      // if (key_x in inst.params){
      //   Plotly.relayout('continuation_display', 'xaxis.range', [inst.params[key_x].range[0], inst.params[key_x].range[1]]) 
      // } else {
      //   Plotly.relayout('continuation_display', 'xaxis.autorange', true) 
      // }


      // if (key_y in inst.params){
      //   Plotly.relayout('continuation_display', 'yaxis.range', [inst.params[key_y].range[0], inst.params[key_y].range[1]]) 
      // } else {
      //   Plotly.relayout('continuation_display', 'yaxis.autorange', true) 
      // }
}

function draw(){
    var x = [];
    var y = [];
    var data = [{
      x: x,
      y: y,
      line: {
        color: 'rgb(55, 128, 191)',
        width: 3},
      type: 'scatter'
    }];
    var layout = {
            autosize: false,
            width: 450,
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
              zeroline: false,
              autorange: true
            },
            yaxis: {
              showline: false,
              autorange: true
            }
          };

    Plotly.newPlot('continuation_display', data, layout);
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

let continuation_knobs;
function init(uid){
  continuation_knobs = init_knobs("continuation_controls", "large", "Vintage");

  key_x = Object.keys(inst_controls)[0];
  
  let keys = Object.keys(inst_controls);
  $.each(keys, function (i, item) {
      $('#continuation_x').append($('<option>', {
          value: item,
          text : item
      }));
      $('#continuation_y').append($('<option>', {
          value: item,
          text : item
      }));
  });

  $("#continuation_x").val(key_x);

  draw();
  add_filter(init_continuation_analyser, -1, uid);
  plugins[uid].save = save;
  plugins[uid].load = load;

}


function save(){
  let commands = {'tail_size' :  tail_size , 'key_x' : key_x, 'key_y' : key_y};
    
  return(commands)
}

function load(uid, commands){    
  key_x = commands['key_x'];
  $("#continuation_x").val(key_x);
  key_y = commands['key_y'];
  $("#continuation_y").val(key_y);
  continuation_knobs[0].setValue(commands["tail_size"])

}

export { init };

// exemple d'update à https://plotly.com/javascript/streaming/#streaming-with-timestamp
//  Plotly.extendTraces
