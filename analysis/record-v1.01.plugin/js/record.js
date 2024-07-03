"use strict";

var analysers = {};
const fs = 48000;
const chunk_size = 2048*2;

const nbchunks_max = 120;
window.trigger_threshold = 1;


import {audioBufferToWav} from './audiobuffer-to-wav.js';


function init(uid){

    add_filter(init_record_analyser, -1, uid);
    init_knobs("record_controls€"+uid, "medium", "LittlePhatty");
    initial_draw(uid)
    analysers[uid] = {}
    analysers[uid].recorded_chunks = 0;

    // record_duration_change(50, uid)
}

function init_record_analyser(audioCtx, uid){
    analysers[uid].analyser = audioCtx.createAnalyser();
    analysers[uid].analyser.smoothingTimeConstant = 0.0;
    analysers[uid].analyser.fftSize = chunk_size;

    analysers[uid].analyser.wavArray = new Float32Array(chunk_size);
    analysers[uid].storing_chunk = 0;
    analysers[uid].threshold = 0.5;

    analysers[uid].x = new Float32Array(chunk_size*nbchunks_max);
    analysers[uid].y = new Float32Array(chunk_size*nbchunks_max);
    analysers[uid].recording = false;

    for (let i = 0; i < analysers[uid].x.length; i++){
        analysers[uid].x[i] = i/fs;
    }

    return([analysers[uid].analyser, record_analyser])
}

// let view_record ={};

function dynamics(buffer, uid){
    let mx = Math.max(...buffer);
    let mn = Math.min(...buffer);
    $("#record_max€"+uid).html((mx-mn).toFixed(5))
    return(mx-mn)
}

function stop_recording(uid){
    analysers[uid].recording = false;
    $("#toggle_recording").html("Start");
    $("#recording_proof").removeClass('pulsating-circle');
    draw(uid, analysers[uid].x, analysers[uid].y)
}

function record(uid){

    $("#recording_proof").addClass('pulsating-circle');
    if (analysers[uid].recorded_chunks <  nbchunks_max){
        let ref = analysers[uid].analyser.wavArray.length*(analysers[uid].recorded_chunks);
        for (let i = 0; i < analysers[uid].analyser.wavArray.length; i++){
            analysers[uid].y[ref+i] = analysers[uid].analyser.wavArray[i]/inst.gain.value;
        }      
        analysers[uid].recorded_chunks++;
    } else {
        stop_recording(uid)
    }

}


function record_analyser(uid){

    if (!analysers[uid].recording) return;

    analysers[uid].analyser.getFloatTimeDomainData(analysers[uid].analyser.wavArray);

    if (use_trigger){
        let amplitude = dynamics(analysers[uid].analyser.wavArray, uid)/inst.gain.value;
        console.log(amplitude, trigger_threshold)
        if (amplitude < trigger_threshold) return;
    }

    record(uid)

}


let use_trigger = false;

window.set_record_trigger = function(elmnt){
    if (!elmnt.checked){
        $("#record_trigger_value").addClass('disabled');
        use_trigger = false;
    } else {
        $("#record_trigger_value").removeClass('disabled');
        use_trigger = true;
    }
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
            height: 250,
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
    
    data[uid][0]['x'] = x.slice(0, analysers[uid].recorded_chunks*chunk_size);
    data[uid][0]['y'] = y;
    
    Plotly.redraw('record_display€'+uid);

}


window.record_trigger_change = function(a, uid){
    analysers[uid].threshold = a/100;
    $("#record_trigger€"+uid+"_value").html(a/100);

}



window.toggle_recording = function(uid){

    if (analysers[uid].recording) {
        stop_recording(uid)
    } else {
        analysers[uid].recorded_chunks = 0;
        analysers[uid].recording = true;
        $("#toggle_recording").html("Stop")
    }
}

window.save_recording = function(uid){

    let data = analysers[uid].y.subarray(0, chunk_size*analysers[uid].recorded_chunks)

    if ($("#record_normalise_checkbox").is(":checked") ){
        let mx = Math.max(...data);
        let mn = Math.min(...data);

        let normalisation_factor = Math.max(Math.abs(mx), Math.abs(mn));

        for (let i=0; i < data.length; i++){
            data[i] = data[i]/normalisation_factor;
        }
    }

    // $("#record_normalise_checkbox")
    let buffer = {'numberOfChannels' : 1,
        "sampleRate" : 48000,
        "data" : [data]
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
