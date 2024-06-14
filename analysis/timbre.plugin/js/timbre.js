'use strict';

let analysers = {};
let position = 0;
let drawing_on = true;
let tail_size = 5;

function init(uid){
    add_filter(init_timbre_analyser, -1, uid);
    init_knobs("timbre_controls", "medium", "LittlePhatty");
    draw();
}

function init_timbre_analyser(audioCtx, uid){
    analysers[uid] = audioCtx.createAnalyser();
    analysers[uid].fftSize = 2048*16;
    analysers[uid].smoothingTimeConstant = 0.0;
    analysers[uid].wavArray = new Float32Array(analysers[uid].frequencyBinCount);
    return([analysers[uid], timbre_analyser])
}

function timbre_analyser(uid){
    analysers[uid].getFloatTimeDomainData(analysers[uid].wavArray);
    let freq = get_frequency();
    let len = parseInt(48000/freq);
    const val = compute_fft(analysers[uid].wavArray, len)
    update_drawing(val[0], val[1], freq, uid)
}



let max_harmonics = 100;
let view_timbre = new Array(max_harmonics);
let x = new Array(max_harmonics);



window.spectrum_offset_x_change = function(a, uid){
    timbre_ctx[uid].xmin = a;
}


window.spectrum_offset_y_change = function(a, uid){
    timbre_ctx[uid].ymin = -5*a;
}



function draw(){
  var traces = [{
    x: [],
    y: [],
    type: 'scatter',
    "name" : "H0"
  }, {
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
  }];
  
  
    var layout = {
            autosize: true,
            width: 350,
            height: 200,
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

    if (!drawing_on){
      return;
    }

    position++;

    var values = [];
    var energy = 0;

    for (let i=0; i < 20; i++){
      values.push([Math.sqrt(real[i+1]**2+imag[i+1]**2)]);
      energy += values[i][0];
    }
    
    var update = { x : [[position], [position], [position], [position]],
      y:[[10*Math.log10(values[0]/energy)], [10*Math.log10(values[1]/energy)], [10*Math.log10(values[2]/energy)], [10*Math.log10(values[3]/energy)]]}

    Plotly.extendTraces('timbre_display', update, [0, 1, 2, 3], tail_size)
}

export { init }
