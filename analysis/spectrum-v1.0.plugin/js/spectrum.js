'use strict';

let analysers = {};

let fs = 48000;
const fftSize = 32768;
let F0 = 100;
let F1 = 20000;

function init(uid){
    analysers[uid] = {};
    draw(uid);
    add_filter(init_spectrum_analyser, -1, uid);
}


let x = new Array(parseInt((F1-F0)*fftSize/fs));
for (let i = 0; i < x.length; i++){
    x[i] = i*fs/fftSize+F0;
}


function init_spectrum_analyser(audioCtx, uid){
    analysers[uid].analyser = audioCtx.createAnalyser();
    fs  = audioCtx.sampleRate;
    analysers[uid].analyser.fftSize = fftSize; //2048*16*4;
    analysers[uid].analyser.smoothingTimeConstant = 0.0;
    analysers[uid].analyser.freqArray = new Float32Array(analysers[uid].analyser.frequencyBinCount);
    analysers[uid].analyser.channelInterpretation = "discrete";

    return([analysers[uid].analyser, spectrum_analyser])
}


function spectrum_analyser(uid){
    analysers[uid].analyser.getFloatFrequencyData(analysers[uid].analyser.freqArray);
    analysers[uid].data[0]['y'] = analysers[uid].analyser.freqArray;
    Plotly.redraw('spectrum_display€'+uid)
}

function draw(uid){    

    analysers[uid].data = [{
      x: x,
      y: x,
      line: {
        color: 'rgb(55, 128, 191)',
        width: 3},
      type: 'line'
    }];    
    
    var layout = {
            autosize: false,
            width: 450,
            height: 300,
            uirevision :true,
            margin: {
              l: 50,
              r: 0,
              b: 30,
              t: 0
            },
            xaxis: {
              title : "Frequency (Hz)",
              showgrid: true,
              zeroline: true,
              gridcolor: "black",
              range: [100, 6000],
            },
            yaxis: {    
              title : "Amplitude (dB)",
              showgrid : true,  
              showline: true,
              gridcolor: "black",
              range: [-40, 10],
            }
          };


    Plotly.newPlot('spectrum_display€'+uid, analysers[uid].data, layout);    
}


export { init }
