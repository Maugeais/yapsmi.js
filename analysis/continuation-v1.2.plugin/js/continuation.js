"use strict";

import { parameter } from "../../../js/parameters.js?version=1.1";

let analysers = {};
let tail_size = 100;

function init_continuation_analyser(audioCtx, uid){
  let splitter;

    splitter = audioCtx.createChannelSplitter(2);
    analysers[uid] = {};
    analysers[uid].channel = "0"
    analysers[uid]["0"] = audioCtx.createAnalyser();
    analysers[uid]["1"] = audioCtx.createAnalyser();
    analysers[uid]["0"].fftSize = 2048*16;
    analysers[uid]["0"].smoothingTimeConstant = 0.0;      
    analysers[uid]["0"].wavArray = new Float32Array(analysers[uid]["0"].frequencyBinCount);
    analysers[uid]["1"].fftSize = 2048*16;
    analysers[uid]["1"].smoothingTimeConstant = 0.0;
    analysers[uid]["1"].wavArray = new Float32Array(analysers[uid]["1"].frequencyBinCount);
    splitter.connect(analysers[uid]["0"], 0);
    splitter.connect(analysers[uid]["1"], 1);
    return({'input': splitter, 'output': null, 'is_on': true, 'callback': continuation_analyser})
}

function continuation_analyser(uid){

  let channel = "0", update_indeces;
  if ((analysers[uid].channel == "0") || (analysers[uid].channel == "1")){
    channel = analysers[uid].channel;
    update_indeces = [0];
  } 

  analysers[uid][channel].getFloatTimeDomainData(analysers[uid][channel].wavArray);
  let freq = get_frequency(analysers[uid][channel].wavArray);
  var update = {
          x: [[compute_value(key_x, analysers[uid][channel].wavArray, freq)]],
          y: [[compute_value(key_y, analysers[uid][channel].wavArray, freq)]],
          'marker.color': [[time]],
  }

  if (analysers[uid].channel == "0+1"){
    update_indeces = [0, 1];

    analysers[uid]["1"].getFloatTimeDomainData(analysers[uid]["1"].wavArray);

    update["x"].push([compute_value(key_x, analysers[uid]["1"].wavArray, freq)])
    update["y"].push([compute_value(key_y, analysers[uid]["1"].wavArray, freq)])
    update['marker.color'].push([0])
  }

  ++time;

  Plotly.extendTraces('continuation_display', update, update_indeces, tail_size)
}

var time = 0;

var history = new parameter(100, [0.85, 853.0], 's', 1, 0, true);
var key_x = Object.keys(instrument_controls)[0];
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

var color = 'rgb(55, 128, 191)';

window.change_color = function(){
  color = 'rgb(128, 0, 0)'
  var update = {
    line: {
        color: 'orange',
        size: 10
        }
    };
    
    Plotly.restyle('continuation_display', update);
}

var data = [{
      x: [],
      y: [],
      mode: 'markers',
      marker: {
        size: 10,
        color: [0],
        colorscale: 'Jet',
      },
      type: 'scatter'
    },{
      x: [],
      y: [],
      mode: 'markers',
      marker: {
        size: 10,
        color: [0],
        colorscale: 'Jet',
      },
      type: 'scatter'
    }];
    
function draw(){
    
    var layout = {
            autosize: false,
            width: 450,
            height: 300,
            uirevision :true,
            legend: {x: 0., y: 0.},
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
      return(Math.sqrt(rms*freq/fs));
    case "amplitude" :
      let amplitude = Math.max(...output)-Math.min(...output);
      return(amplitude);
    case "frequency" :
      return(freq);
    default :
      return(instrument_controls[key].value);
  }  
}

let continuation_knobs;
function init(uid){
  continuation_knobs = init_knobs("continuation_controls", "medium", "Vintage");
  
  key_x = Object.keys(instrument_controls)[0];
  
  let keys = Object.keys(instrument_controls);
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

window.change_axis_scale = function(value, axis){ 
  if (value) {
    Plotly.relayout('continuation_display', axis+'axis.type', 'log') 
  } else {
    Plotly.relayout('continuation_display', axis+'axis.type', 'linear') 
  }
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
  continuation_knobs["continuation_tail"].setValue(commands["tail_size"])

}

window.change_continuation_channel = function(value){
  let uid = Object.keys(analysers)[0];
  analysers[uid].channel = value;
}


export { init };

// exemple d'update à https://plotly.com/javascript/streaming/#streaming-with-timestamp
//  Plotly.extendTraces
