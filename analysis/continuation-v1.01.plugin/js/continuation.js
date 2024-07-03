"use strict";

import { parameter } from "../../../js/parameters.js?version=1.02";

let analysers = {};
const fs = 48000;


function init_waveform_analyser(audioCtx, uid){
    analysers = audioCtx.createAnalyser();
    analysers.fftSize = 2048*16;
    analysers.smoothingTimeConstant = 0.0;
    analysers.wavArray = new Float32Array(analysers.frequencyBinCount);
    return([analysers, waveform_analyser])
}

function waveform_analyser(uid){

    if (!drawing_on){
        return;
      }
    analysers.getFloatTimeDomainData(analysers.wavArray);
    let freq = get_frequency();
    var update = {
            x: [[compute_value(key_x, analysers.wavArray, freq)]],
            y: [[compute_value(key_y, analysers.wavArray, freq)]],
    }
    ++i;

    Plotly.extendTraces('continuation_display', update, [0], tail_size.value)
}


var i = 0;

var tail_size = new parameter(100, [10, 1000], '', 1, 0, true);
var key_x = Object.keys(inst.params)[0];
var key_y = "rms";

window.continuation_tail_change = function(a){
      tail_size.set_from_percentage(a);
      $("#continuation_tail_value").html(tail_size.to_string());
}

window.continuation_change_axis = function(axis, container){
      if (axis == "x") key_x = $(container).val();
      if (axis == "y") key_y = $(container).val();
      var update = {
        x: [[]],
        y: [[]],
      }
      Plotly.extendTraces('continuation_display', update, [0], 0)


      if (key_x in inst.params){
        Plotly.relayout('continuation_display', 'xaxis.range', [inst.params[key_x].range[0], inst.params[key_x].range[1]]) 
      } else {
        Plotly.relayout('continuation_display', 'xaxis.autorange', true) 
      }


      if (key_y in inst.params){
        Plotly.relayout('continuation_display', 'yaxis.range', [inst.params[key_y].range[0], inst.params[key_y].range[1]]) 
      } else {
        Plotly.relayout('continuation_display', 'yaxis.autorange', true) 
      }
}


let drawing_on = true;
   

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
              l: 20,
              r: 0,
              b: 20,
              t: 0
            },
            xaxis: {
              showgrid: false,
              zeroline: false
            },
            yaxis: {
              showline: false
            }
          };

    Plotly.newPlot('continuation_display', data, layout);
}

function compute_value(key, output){

  let freq = get_frequency();

  switch (key){
    case "rms" :
      let rms = 0;
      for (let j = 0; j < 48000/freq; j++) rms += output[j]*output[j];
      return(Math.sqrt(rms)/inst.gain.value);
    case "amplitude" :
      let amplitude = Math.max(...output)-Math.min(...output);
      return(amplitude/inst.gain.value);
    case "frequency" :
      return(freq);
    default :
      return(inst.params[key].value);
  }  
}

let continuation_knobs;
function init(uid){
  continuation_knobs = init_knobs("continuation_controls", "large", "Vintage");

  key_x = Object.keys(inst.params)[0];
  
  let keys = Object.keys(inst.params);
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
  add_filter(init_waveform_analyser, -1, uid);
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
