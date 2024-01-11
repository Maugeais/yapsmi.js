'use strict';

import { FFTJS } from './fft-min.js'
//import { rungeKutta } from "./rk4.js";


let simu_on = 0;
var audioCtx; 

console.log("Loading audio...");

function audio_start(){
    if (simu_on == 0){
        init(inst)
        // ctxW = getCTX("wavForm");../css/images/off.png
        simu_on = 1;
        $('#audio_start').css('background-image','url(../../css/images/on.png)');
        //startLoggingMIDIInput(window.inst)


        //drawingUpdate(true);
    } else if (simu_on == 1){
        simu_on = 2;
        audioCtx.suspend();
        $('#audio_start').css('background-image','url(../../css/images/off.png)');
        //drawingUpdate(false);
    } else {
        simu_on = 1;
        audioCtx.resume();
        $('#audio_start').css('background-image','url(../../css/images/on.png)');
        //drawingUpdate(true);
    }
}

function audio_stop(){
   
        audioCtx.close();
        $('#audio_start').html('Play')
        //drawingUpdate(false);
        simu_on = 0;
  
}



let buffer_size  = 2048*2;

let hanning = new Array(buffer_size);
for (let i = 0; i < buffer_size; i++){
    hanning[i] = (1-math.cos(2*math.PI*i/(buffer_size-1)))/2;
}

function apply_window(data){
    for (let i=0; i < buffer_size; i++){
        data[i] = data[i] * hanning[i];
    }
}

async function createFilter(audioCtx) {
    let convolver = audioCtx.createConvolver();

    // load impulse response from file
    let response     = await fetch(inst.transfer_function);
    let arraybuffer  = await response.arrayBuffer();
    convolver.buffer = await audioCtx.decodeAudioData(arraybuffer);

    console.log("test");
    return convolver;
}

let post_processors = [];

function add_post_processor(f){
        post_processors.push(f);
}

function remove_post_processor(f){
    const index = post_processors.indexOf(f);
    if (index > -1) { // only splice array when item is found
        post_processors.splice(index, 1); // 2nd parameter means remove one item only
    }
}

const f = new FFTJS(buffer_size);
const fft = f.createComplexArray();
const convolution = f.createComplexArray();
const complex_signal = f.createComplexArray();


function convolveFR(fft, output){
    
    let transfer = inst.transfer_function;
    
    for (let i = 0; i < fft.length/2; i++){
        convolution[2*i] = (fft[2*i]*transfer[2*i]-fft[2*i+1]*transfer[2*i+1]);
        convolution[2*i+1] = (fft[2*i]*transfer[2*i+1]+fft[2*i+1]*transfer[2*i]);
    }
    
    f.inverseTransform(complex_signal, convolution);
    
    for (let i = 0; i < fft.length/2; i++){
        output[i] = complex_signal[2*i+1];
    }
    fft= [...convolution];
}

async function init(inst) {

      audioCtx = new window.AudioContext();
           
      // Il faut mettre ici le filtre
      let filter = await createFilter(audioCtx);

      let fs = audioCtx.sampleRate;
      let dt = 1 / fs;

      var p;
      
      let buffer = new Array((buffer_size+1));   // Tableau contenant les les données en chaque temps
      for (let k=0; k < buffer.length; k++){
        buffer[k] = new Float64Array(inst.dim) // Pour chaque temps, on a les composantes
        for (let i = 0; i < inst.dim; i++){
            buffer[k][i] = 0;
        }
      }
   
      let scriptNode = audioCtx.createScriptProcessor(buffer_size, 1, 1); //(bufferSize, numberOfInputChannels, numberOfOutputChannels);
      
      scriptNode.connect(filter);
      filter.connect(audioCtx.destination);
      if ( $('#isFilterOn').is(":checked") ){
        scriptNode.connect(filter);
      
        filter.connect(audioCtx.destination);
      } else {
        scriptNode.connect(audioCtx.destination);
      }


      
      // inst.mics[0].addEffect(audioCtx, scriptNode)

      scriptNode.connect(audioCtx.destination);

      let t = 0;


      // audioProcessingEvent ----------------------------------------------------------------------------------------
      scriptNode.onaudioprocess = function(audioProcessingEvent) {
            let t1 = Date.now();


            let outputBuffer = audioProcessingEvent.outputBuffer;
            // si 2 voies imbriquer la boucle ci-dessous dans une autre
            // for (let channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
            //   let outputData = outputBuffer.getChannelData(channel);
            // }


            let outputData = outputBuffer.getChannelData(0);
            
            inst.next_chunk(t, buffer_size, dt, buffer)
            inst.output(buffer, outputData)

            console.log(outputData)
            // apply_window(outputData);
            
            // f.realTransform(fft, outputData);
            
            
            
            // if ( $('#isFilterOn').is(":checked") ){
            //     convolveFR(fft, outputData);
            // }
            
                                    
            t += buffer_size * dt;
  
            // post_processors.forEach((f) => f(outputData, fft));
            
            let deltaT = Date.now() - t1;
            $("#speed").html("CPU usage : "+(deltaT/(10*buffer_size*dt)).toFixed(2)+'%');

            inst.X0 = buffer[buffer.length-1]
            //console.log("CPU usage : "+(deltaT/(10*buffer_size*dt)).toFixed(2)+'%');
            
        }

} 


export { audio_start, audio_stop, audioCtx, add_post_processor, remove_post_processor}
