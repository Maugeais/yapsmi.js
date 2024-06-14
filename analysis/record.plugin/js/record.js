"use strict";

var analysers = {};
const fs = 48000;

import {audioBufferToWav} from './audiobuffer-to-wav.js';


function init(uid){
    add_filter(init_record_analyser, -1, uid);
    init_knobs("record_controls€"+uid, "medium", "LittlePhatty");
    // view_record[uid] =  new Float32Array(300);
    initial_draw(uid)
}

function init_record_analyser(audioCtx, uid){
    analysers[uid] = audioCtx.createAnalyser();
    analysers[uid].fftSize = 2048*2;
    analysers[uid].smoothingTimeConstant = 0.0;
    analysers[uid].wavArray = new Float32Array(analysers[uid].fftSize);
    analysers[uid].storing_chunk = 0;
    analysers[uid].nbchunks = 5;
    analysers[uid].threshold = 0.5;

    analysers[uid].x = new Float32Array(analysers[uid].fftSize*20);
    analysers[uid].y = new Float32Array(analysers[uid].fftSize*20);
    analysers[uid].recording = false;

    for (let i = 0; i < analysers[uid].x.length; i++){
        analysers[uid].x[i] = i/fs;
    }

    return([analysers[uid], record_analyser])
}

// let view_record ={};

function dynamics(buffer, uid){
    let mx = Math.max(...buffer);
    let mn = Math.min(...buffer);
    $("#record_max€"+uid).html((mx-mn).toFixed(5))
    return(mx-mn)
}

function start(uid){
    analysers[uid].storing_chunk = analysers[uid].nbchunks;
    $("#record_recording€"+uid).css("background-color","red")
}

function record(uid){
     if (analysers[uid].storing_chunk > 0){
        analysers[uid].storing_chunk--;
        let ref = analysers[uid].wavArray.length*(analysers[uid].nbchunks-analysers[uid].storing_chunk);
        for (let i = 0; i < analysers[uid].wavArray.length; i++){
            analysers[uid].y[ref+i] = analysers[uid].wavArray[i];
        }

        if (analysers[uid].storing_chunk  == 0){
            draw(uid, analysers[uid].x, analysers[uid].y)
            $("#record_recording€"+uid).css("background-color","transparent")
        }
    }
}


function record_analyser(uid){

    analysers[uid].getFloatTimeDomainData(analysers[uid].wavArray);

    // if ((dynamics(analysers[uid].wavArray, uid) > analysers[uid].threshold) && (analysers[uid].storing_chunk == 0)){
    //     analysers[uid].storing_chunk = analysers[uid].nbchunks;
    //     $("#record_recording€"+uid).css("background-color","red")
    // }

   record(uid)


}


var data = {};

function initial_draw(uid){
    
    data[uid] = [{
      x: [],
      y: [],
      line: {
        color: 'rgb(55, 128, 191)',
        width: 3},
      type: 'scatter'
    }];
    
    var layout = {
            autosize: false,
            width: 580,
            height: 220,
            uirevision :true,
            margin: {
              l: 35,
              r: 0,
              b: 20,
              t: 0
            },
            xaxis: {
              showgrid: true,
              zeroline: false
            },
            yaxis: {
              showgrid:true,
              showline: false
            }
          };

    Plotly.newPlot('record_display€'+uid, data[uid], layout);
}

function draw(uid, x, y){
    
    data[uid][0]['x'] = x;
    data[uid][0]['y'] = y;
    
    Plotly.redraw('record_display€'+uid);

}


window.record_trigger_change = function(a, uid){
    analysers[uid].threshold = a/100;
    $("#record_trigger€"+uid+"_value").html(a/100);

}


window.record_nbchunks_change = function(a, uid){
    analysers[uid].nbchunks = Math.round(a);
    $("#record_nbchunks€"+uid+"_value").html(Math.round(a));
}

window.start_recording = function(uid){
    start(uid);
}

window.save_recording = function(uid){
    let buffer = {'numberOfChannels' : 1,
        "sampleRate" : 48000,
        "data" : [analysers[uid].y.subarray(0, 2048*2*analysers[uid].nbchunks)]
    }

    var anchor = document.createElement('a')
    let opt = {"float32" : true}
    const wav = audioBufferToWav(buffer, opt);

    var blob = new window.Blob([wav], {
        type: 'audio/wav; codecs=MS_PCM'
      })

      var url = window.URL.createObjectURL(blob)
    anchor.href = url
    anchor.download = 'audio.wav'
    anchor.click()
    window.URL.revokeObjectURL(url)
  
  
}



export { init }
