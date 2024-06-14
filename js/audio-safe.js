'use strict';

// let simu_on = 0;
let simu_on = false;

import { yin } from "./yin.js";

import { transform } from "./fft.js";

window.compute_fft = function(data, len){
    let imag = new Float32Array(len);
    let real = data.slice(0, len)
    transform(real, imag)
    return([real, imag])
}


function audio_start(){

    if (~simu_on){
        init(inst)
        $('#audio_start').css('background-image','url(../../css/images/on.png)');
    } else {
        audioCtx.close();
        $('#audio_start').css('background-image','url(../../css/images/off.png)');
    }
    simu_on = ~simu_on;
}

function audio_stop(){
   
        audioCtx.close();
        simu_on = false;
}

// let post_processors = [];
//
// function add_post_processor(f){
//         post_processors.push(f);
// }
//
// function remove_post_processor(f){
//     const index = post_processors.indexOf(f);
//     if (index > -1) { // only splice array when item is found
//         post_processors.splice(index, 1); // 2nd parameter means remove one item only
//     }
// }

let filters = [];
      
function add_filter(f, position = -1, uid){

    if (simu_on) audioCtx.close();

    let filter = { "init" : f, "uid" : uid, "callback" : function(){} };


    if (position == -1 || filters.length >= position){
        filters.push(filter);

    } else {
        filters.splice(position, 0, filter);
    }

    // Sorting necessary for asynchronous reasons when loading the plugins from a session
    sort_filters()

    if (simu_on) init(inst);
}

function order_filter(filter1, filter2){
        if (filter1.uid < filter2.uid) return -1;
        if (filter1.uid > filter2.uid) return 1;
        return(0)
    }
          
window.sort_filters = function(){
        filters.sort(order_filter);
}

function remove_filter(uid){
    if (simu_on) audioCtx.close();

    let index = 0;
    while(index < filters.index & filters[index].uid != uid){index++};
    // const index = filters.indexOf(f);
    if (index > -1) { // only splice array when item is found
        filters.splice(index, 1); // 2nd parameter means remove one item only
    }
    if (simu_on) init(inst);

    console.log("remove", filters)
}

window.restart = function(){
    if (simu_on) {
        audioCtx.close();
        init(inst);
    }
}

let audioCtx;
let buffer_size  = 16384;
let outputData;
let fs;

window.frequency = -1;
window.get_frequency = function(){
    if (frequency == -1) {
        frequency = yin(outputData, fs, 0.07);
    }
    return(frequency)
}

async function init(inst) {

    AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();

    fs = audioCtx.sampleRate;
    let dt = 1 / fs;

    inst.init_audio((buffer_size+1), dt)

    let scriptNode = audioCtx.createScriptProcessor(buffer_size, 1, 1); //(bufferSize, numberOfInputChannels, numberOfOutputChannels);

      let current = scriptNode;
      // Initialise the filters
      for (let k=0; k < filters.length; k++){
        let data = await filters[k].init(audioCtx, filters[k].uid); 
        filters[k].callback = data[1];
        if (data.length < 3 || data[2] == true) {
            if (data[0] != ""){
                current.connect(data[0])
                current = data[0];
            }
        }
      }

      current.connect(audioCtx.destination);

      let t = 0;


      // audioProcessingEvent ----------------------------------------------------------------------------------------
      scriptNode.onaudioprocess = function(audioProcessingEvent) {
            let t1 = Date.now();
            frequency = -1;


            let outputBuffer = audioProcessingEvent.outputBuffer;
            // si 2 voies imbriquer la boucle ci-dessous dans une autre
            // for (let channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
            //   let outputData = outputBuffer.getChannelData(channel);
            // }


            outputData = outputBuffer.getChannelData(0);
            
            inst.next_chunk(t, buffer_size, dt)
            inst.output(outputData)

            if (isNaN(Math.max.apply(null, outputData))){

                $("#nan").css({"color":"red"})
                inst.reset_chunk();

            } else {
                $("#nan").css({"color":"darkgray"})
                inst.loop_chunk();
                filters.forEach(filter => filter.callback(filter.uid));
            }

            t += buffer_size * dt;

            let deltaT = Date.now() - t1;
            $("#speed").html("CPU usage : "+(deltaT/(10*buffer_size*dt)).toFixed(2)+'%');

        }
} 


export { audio_start, audio_stop, add_filter, remove_filter}
//, add_post_processor, remove_post_processor
