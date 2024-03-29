'use strict';

// import { transform } from './fft.js';
let levels_ctx = {};
let analysers = {};

function init(uid){
    add_filter(init_levels_analyser, -1, uid);
    init_knobs("levels_controls€"+uid, "medium", "LittlePhatty");
    let canvas = document.getElementById("levels_canvas€"+uid);
    levels_ctx[uid] = canvas.getContext("2d");
    levels_ctx[uid].width = canvas.width;
    levels_ctx[uid].height = canvas.height;
    levels_ctx[uid].xmin = 0;
    levels_ctx[uid].dx = 5;
    levels_ctx[uid].ymin = 0;
    levels_ctx[uid].dy = 10;

}

let analyser;

function init_levels_analyser(audioCtx, uid){
    analysers[uid] = audioCtx.createAnalyser();
    analysers[uid].fftSize = 2048*16;
    analysers[uid].smoothingTimeConstant = 0.0;
    analysers[uid].wavArray = new Float32Array(analysers[uid].frequencyBinCount);
    return([analysers[uid], levels_analyser])
}



function levels_analyser(uid){
    analysers[uid].getFloatTimeDomainData(analysers[uid].wavArray);
    let freq = get_frequency();
    let len = parseInt(48000/freq);
    const val = compute_fft(analysers[uid].wavArray, len)
    levels_draw(val[0], val[1], freq, uid)
}




let max_harmonics = 100;
let view_levels = new Array(max_harmonics);
let x = new Array(max_harmonics);

function levels_draw(real, imag,  freq, uid){

    levels_ctx[uid].clearRect(0, 0, levels_ctx[uid].width, levels_ctx[uid].height);
    levels_ctx[uid].fillStyle = "red";
    for (let i = 0; i < levels_ctx[uid].dx; i++) {
        view_levels[i] = Math.sqrt(real[i+1]**2+imag[i+1]**2);
        levels_ctx[uid].fillRect(i*levels_ctx[uid].width/levels_ctx[uid].dx,
                                levels_ctx[uid].height,
                                levels_ctx[uid].width/levels_ctx[uid].dx-2,
                                -view_levels[i]*levels_ctx[uid].dy-levels_ctx[uid].ymin);
    }
}



window.levels_offset_x_change = function(a, uid){
    levels_ctx[uid].xmin = a/10;
}


window.levels_offset_y_change = function(a, uid){
    levels_ctx[uid].ymin = -5*a;
}


window.levels_scale_x_change = function(a, uid){
    levels_ctx[uid].dx = 1+a/10;
}


window.levels_scale_y_change = function(a, uid){
    levels_ctx[uid].dy = (1+a/10);
}

export { init }
