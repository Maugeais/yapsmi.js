"use strict";

let analysers = {};
const fs = 48000;

function init_waveform_analyser(audioCtx, uid){
    analysers[uid] = audioCtx.createAnalyser();
    analysers[uid].fftSize = 2048*16;
    analysers[uid].smoothingTimeConstant = 0.0;
    analysers[uid].wavArray = new Float32Array(analysers[uid].frequencyBinCount);
    return([analysers[uid], waveform_analyser])
}

function waveform_analyser(uid){

    if (!drawing_on){
        return;
      }
    analysers[uid].getFloatTimeDomainData(analysers[uid].wavArray);
    let freq = get_frequency();
    var update = {
            x: [[compute_value(key_x, analysers[uid].wavArray, freq)]],
            y: [[compute_value(key_y, analysers[uid].wavArray, freq)]],
    }
    ++i;

    Plotly.extendTraces('colino2d_display', update, [0], tail_size)
}


var i = 0;

var tail_size = 100;
var key_x = "rms";
var key_y = "rms";

window.colino2d_tail_change = function(a){
      tail_size = 10*(1+a);
      $("#colino2d_tail_value").html(tail_size);
}

window.colino2d_change_axis = function(axis, container){
      if (axis == "x") key_x = $(container).val();
      if (axis == "y") key_y = $(container).val();
}

// let canvas = document.getElementById("colino2d_display");
//
let drawing_on = true;
//
// canvas.addEventListener("mousedown", function(e) {
//     drawing_on = false;
// });
//
// canvas.addEventListener("mouseup", function(e) {
//     drawing_on = true;
// });
    

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
              title: 'Upstream pressure',
              showgrid: false,
              zeroline: false
            },
            yaxis: {
              title: 'RMS of downstream pressure',
              showline: false
            }
          };

    Plotly.newPlot('colino2d_display', data, layout);
}

function compute_value(key, output){

  let freq = get_frequency();

  switch (key){
    case "rms" :
      let rms = 0;
      for (let j = 0; j < 48000/freq; j++) rms += output[j]*output[j];
      return(Math.sqrt(rms));
    case "max" :
      let max = 0;
      for (let j = 0; j < 48000/freq; j++) max=Math.max(max, Math.abs(output[j]));
      return(max);
    case "frequency" :
      return(freq);
    default :
      return(inst.params[key].value);
  }  
}

// function update_drawing(output, freq){
//
//       if (!drawing_on){
//         return;
//       }
//
//       var update = {
//               x: [[compute_value(key_x, output, freq)]],
//               y: [[compute_value(key_y, output, freq)]],
//       }
//       ++i;
//
//       Plotly.extendTraces('colino2d_display', update, [0], tail_size)
// }

function init(uid){
    init_knobs("colino2d_controls", "large", "Vintage");

    let keys = Object.keys(inst.params);
    $.each(keys, function (i, item) {
        $('#colino2d_x').append($('<option>', {
            value: item,
            text : item
        }));
        $('#colino2d_y').append($('<option>', {
            value: item,
            text : item
        }));
    });

    draw();
    add_filter(init_waveform_analyser, -1, uid);

}

export { init };

// exemple d'update à https://plotly.com/javascript/streaming/#streaming-with-timestamp
//  Plotly.extendTraces
