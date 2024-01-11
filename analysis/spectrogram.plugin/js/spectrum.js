'use strict';

import { transform } from './fft.js';

function init(){
    // add_filter(init_spectrum_analyser, spectrum_analyser);
    add_post_processor(spectrum_analyser);
    init_knobs("spectrum_controls", "medium", "LittlePhatty");
}

let analyser;

function init_spectrum_analyser(audioCtx){
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048*16;
    analyser.smoothingTimeConstant = 0.8;
    freqArray = new Float32Array(analyser.frequencyBinCount);
    return([analyser, spectrum_analyser])
}


let freqArray =[];
function spectrum_analyser(data, freq){
    let len = parseInt(48000/freq);
    let imag = new Float32Array(len);
    let real = data.slice(0, len)
    transform(real, imag)
    // analyser.getFloatFrequencyData(freqArray);
    spectrum_draw(real, imag, freq)
}




let spectrum_ctx = getCTX("spectrum_canvas");
let max_harmonics = 20;
let view_spectrum = new Array(max_harmonics);
let x = new Array(max_harmonics);

function spectrum_draw(real, imag,  freq){
    spectrum_ctx.clearRect(0, 0, spectrum_ctx.width, spectrum_ctx.height);
    spectrum_ctx.fillStyle = "red";
    for (let i = 0; i < view_spectrum.length; i++) {
        view_spectrum[i] = 10*Math.log10(real[i+1]**2+imag[i+1]**2);
        spectrum_ctx.fillRect(i*spectrum_ctx.width/max_harmonics, 
                                spectrum_ctx.height, 
                                spectrum_ctx.width/max_harmonics, 
                                -view_spectrum[i]*spectrum_scale_y-spectrum_offset_y);
    }

    // for (let i = 0; i < max_harmonics; i++){
    //         x[i] = spectrum_scale_x*2*i/max_harmonics;
    // }

    // drawArray(spectrum_ctx, x, view_spectrum);
}

spectrum_ctx.xmin = 0;
spectrum_ctx.xmax = 20;
spectrum_ctx.ymin = -10;
spectrum_ctx.ymax = 10;


let spectrum_offset_x = 0;
let spectrum_offset_y = 0;
let spectrum_scale_x = 1;
let spectrum_scale_y = 1;


function spectrum_offset_x_change(a){
    spectrum_offset_x = a;
}

window.spectrum_offset_y_change =function(a){
    spectrum_offset_y = 100*(a-50)/50;
}


function spectrum_scale_x_change(a){
    spectrum_scale_x = (1+a/100);
}

window.spectrum_scale_y_change = function(a){
    spectrum_scale_y = (1+a/10);
}

export { init }