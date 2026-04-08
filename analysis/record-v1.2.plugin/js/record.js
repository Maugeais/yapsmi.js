"use strict";

let analysers = {};
// const chunk_size = 2048*2;

// const nbchunks_max = 20;
window.trigger_threshold = 1;

let recording_buffer = []


import {audioBufferToWav} from './audiobuffer-to-wav.js';


function init(uid){
    analysers[uid] = {}
    // analysers[uid].recorded_chunks = 0;
    register_controls("Record", {"record" : $("#toggle_recording")});

    // add_filter(init_record_analyser, -1, uid);
    init_knobs("record_controls€"+uid, "medium", "LittlePhatty");
    initial_draw(uid)
    

    // record_duration_change(50, uid)
}

// function init_record_analyser(audioCtx, uid){
//     console.log(analysers, uid)
//     analysers[uid].analyser = audioCtx.createAnalyser();
//     analysers[uid].analyser.smoothingTimeConstant = 0.0;
//     analysers[uid].analyser.fftSize = chunk_size;

//     analysers[uid].analyser.wavArray = new Float32Array(chunk_size);
//     analysers[uid].storing_chunk = 0;
//     analysers[uid].threshold = 0.5;

//     analysers[uid].x = new Float32Array(chunk_size*nbchunks_max);
//     analysers[uid].y = [new Float32Array(chunk_size*nbchunks_max), new Float32Array(chunk_size*nbchunks_max)];
//     analysers[uid].recording = false;

//     for (let i = 0; i < analysers[uid].x.length; i++){
//         analysers[uid].x[i] = i/fs;
//     }

//     return({'input': analysers[uid].analyser, 'output': null, 'is_on': true, 'callback': function(){}})
// }

// let view_record ={};

function dynamics(buffer, uid){
    let mx = Math.max(...buffer);
    let mn = Math.min(...buffer);
    $("#record_max€"+uid).html((mx-mn).toFixed(5))
    return(mx-mn)
}

function stop_recording(uid){
    simulationNode.port.postMessage({property:"record", method: "stop"});
}

// function record_chunk(uid){

//     analysers[uid].analyser.getFloatTimeDomainData(analysers[uid].analyser.wavArray);    

//     if (use_trigger){
//         let amplitude = dynamics(analysers[uid].analyser.wavArray, uid)/instrument_controls["output_impedance"].real_value;
//         if (amplitude < trigger_threshold) return;
//     }

//     let ref = chunk_size*(analysers[uid].recorded_chunks);
//     for (let i = 0; i < chunk_size; i++){
//         analysers[uid].y[ref+i] = analysers[uid].analyser.wavArray[i];
//     }      
//     analysers[uid].recorded_chunks++;
//     draw(uid, analysers[uid].x, analysers[uid].y)
// }


let start;
let duration;

window.recording_callback = function(buffer){
    duration  = parseInt(audioCtx.sampleRate*(performance.now()-start)/1000)
    duration = Math.min(duration, buffer[0].length)
    let uid = Object.keys(analysers)[0];
    recording_buffer = []
    // analysers[uid].recorded_chunks = nbchunks_max
    for (let c = 0; c < buffer.length; c++){
        // recording_buffer = [buffer[0].slice(0, duration), buffer[1].slice(0, duration)];
        recording_buffer.push(buffer[c].slice(0, duration));
    }

    let x = new Float32Array(duration)
    for (let i = 0; i < x.length; i++){
        x[i] = i/fs;
    }

    draw(uid, x, buffer)

    x = null;
    analysers[uid].recording = false;
    $("#recording_proof").css("backgroundColor", "#680f0f")
}

function record_analyser(uid){

    if (!analysers[uid].recording) return;

    let nb_sample = Math.ceil(audioCtx.sampleRate*parseFloat($("#record_duration").val()));
    let buffer = []
    for (let c = 0; c < audioCtx.destination.maxChannelCount; c++){
        // recording_buffer = [buffer[0].slice(0, duration), buffer[1].slice(0, duration)];
        buffer.push(new Float32Array(nb_sample));
    }
    // let buffer = [new Float32Array(nb_sample), new Float32Array(nb_sample)]

    initial_draw(uid)
    start = performance.now() ;
    simulationNode.port.postMessage({property:"record", buffer:buffer, method: "start"});

    // start = performance.now();

    // let interval = setInterval(function(){
    //     record_chunk(uid)
    //     if (analysers[uid].recorded_chunks >  nbchunks_max){
    //         clearInterval(interval)
    //         stop_recording(uid)     
    //         // draw(uid, analysers[uid].x, analysers[uid].y)
    //     } 
    // }, duration); 


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

function initial_draw(uid){
    data[uid] = [{
      x: [],
      y: [],
      line: {
        color: 'rgb(55, 128, 191)',
        width: 3},
      type: 'scatter'
    },{
      x: [],
      y: [],
      line: {
        color: 'rgb(191, 55, 55)',
        width: 3},
      type: 'scatter'
    }];
       
    time = 0

    Plotly.newPlot('record_display€'+uid, data[uid], layout);
}

let time = 0;
function draw(uid, x, y){
    
    // data[uid][0]['x'] = x.slice(0, analysers[uid].recorded_chunks*chunk_size);
    // data[uid][0]['y'] = y;
    
    // Plotly.redraw('record_display€'+uid);
    let beginning = 0; //Math.max(0, (analysers[uid].recorded_chunks-1)*chunk_size, -1)
    let end = duration; //analysers[uid].recorded_chunks*chunk_size
    data[uid].push({
            x: x.slice(beginning, end),
            y : y[0].slice(beginning, end),
            line: {
                color: 'rgb('+time*10+', 0, '+256-time*10+')',
                width: 3
            }
        })

    data[uid].push({
            x: x.slice(beginning, end),
            y : y[1].slice(beginning, end),
            line: {
                color: 'rgb('+time*10+', 0, '+256-time*10+')',
                width: 3
            }
        })
    Plotly.newPlot('record_display€'+uid, data[uid], layout);


    // console.log("Recorded chunks", analysers[uid].recorded_chunks)
    // var update = {
    //         x: [[x.slice((analysers[uid].recorded_chunks-1)*chunk_size, analysers[uid].recorded_chunks*chunk_size)]],
    //         y: [[y.slice((analysers[uid].recorded_chunks-1)*chunk_size, analysers[uid].recorded_chunks*chunk_size)]],
    // }

    ++time;

    // Plotly.extendTraces('record_display€'+uid, update, [0])
}


window.record_trigger_change = function(a, uid){
    analysers[uid].threshold = a/100;
    $("#record_trigger€"+uid+"_value").html(a/100);

}



window.toggle_recording = function(uid){

    if (!simu_on){
        message("Can only record when the simulation in on");
        return
    }

    if (analysers[uid].recording) {
        stop_recording(uid)
    } else {
        // analysers[uid].recorded_chunks = 0;
        analysers[uid].recording = true;
        $("#recording_proof").css("backgroundColor", "red")
        record_analyser(uid)
    }
}

window.save_recording = function(uid){

    // let data = analysers[uid].y.subarray(0, chunk_size*analysers[uid].recorded_chunks)

    if ($("#record_normalise_checkbox").is(":checked") ){

        for (let c = 0; c < recording_buffer.length; c++){
            let mx = Math.max(...recording_buffer[c]);
            let mn = Math.min(...recording_buffer[c]);

            let normalisation_factor = Math.max(Math.abs(mx), Math.abs(mn));

            for (let i=0; i < recording_buffer[c].length; i++){
                recording_buffer[c][i] = recording_buffer[c][i]/normalisation_factor;
            }
        }
    }

    // $("#record_normalise_checkbox")
    let buffer = {'numberOfChannels' : recording_buffer.length,
        "sampleRate" : audioCtx.sampleRate,
        "data" : recording_buffer
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
