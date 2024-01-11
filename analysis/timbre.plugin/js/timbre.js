'use strict';

import { transform } from './fft.js';


let levels_ctx ={};

function init(uid){
    // add_filter(init_levels_analyser, levels_analyser);
    add_post_processor(levels_analyser);
    init_knobs("levels_controls", "medium", "LittlePhatty");
    let canvas = document.getElementById("spectrum_canvas€"+uid);
    levels_ctx[uid] = canvas.getContext("2d");
    levels_ctx[uid].width = canvas.width;
    levels_ctx[uid].height = canvas.height;
    levels_ctx[uid].xmin = 0;
    levels_ctx[uid].dx = 20;
    levels_ctx[uid].ymin = -200;
    levels_ctx[uid].dy = 200;
}

function levels_analyser(data, freq, uid){
    let len = parseInt(48000/freq);
    let imag = new Float32Array(len);
    let real = data.slice(0, len)
    transform(real, imag)
    levels_draw(real, imag, freq, uid)
}



let max_harmonics = 100;
let view_levels = new Array(max_harmonics);
let x = new Array(max_harmonics);

function levels_draw(real, imag,  freq){
    levels_ctx.clearRect(0, 0, levels_ctx.width, levels_ctx.height);
    levels_ctx.fillStyle = "red";
    for (let i = 0; i < levels_ctx[uid].dx; i++) {
        view_levels[i] = 10*Math.log10(real[i+1]**2+imag[i+1]**2);
        levels_ctx.fillRect(i*levels_ctx.width/levels_ctx[uid].dx,
                                levels_ctx.height,
                                levels_ctx.width/levels_ctx[uid].dx,
                                -view_levels[i]*levels_ctx[uid].dy-levels_ctx[uid].ymin);
    }
}



window.spectrum_offset_x_change = function(a, uid){
    levels_ctx[uid].xmin = a;
}


window.spectrum_offset_y_change = function(a, uid){
    levels_ctx[uid].ymin = -5*a;
}


window.spectrum_scale_x_change = function(a, uid){
    levels_ctx[uid].dx = 10*(1+a);
}


window.spectrum_scale_y_change = function(a, uid){
    levels_ctx[uid].dy = (1+a*10);
}

export { init }
