"use strict";

let waveform_ctx = {};
let analysers = {};
const fs = 48000;

function init(uid){
    add_filter(init_waveform_analyser, -1, uid);
    init_knobs("waveform_controls€"+uid, "medium", "LittlePhatty");
    let canvas = document.getElementById("waveform_canvas€"+uid);
    waveform_ctx[uid] = canvas.getContext("2d");
    waveform_ctx[uid].width = canvas.width;
    waveform_ctx[uid].height = canvas.height;
    waveform_ctx[uid].xmin = 0;
    waveform_ctx[uid].dx = 1;
    waveform_ctx[uid].ymin = -1;
    waveform_ctx[uid].dy = 2;
}

function init_waveform_analyser(audioCtx, uid){
    analysers[uid] = audioCtx.createAnalyser();
    analysers[uid].fftSize = 2048*16;
    analysers[uid].smoothingTimeConstant = 0.0;
    analysers[uid].wavArray = new Float32Array(analysers[uid].frequencyBinCount);
    return([analysers[uid], waveform_analyser])
}

let view_waveform = new Float32Array(600);

function waveform_analyser(uid){

    let freq = get_frequency();
    analysers[uid].getFloatTimeDomainData(analysers[uid].wavArray);

    let trigger = 0
    let firstPos = 0;
    let i = 0;
    while (trigger == 0 && i < analysers[uid].wavArray.length){
        if ((analysers[uid].wavArray[i] > 0.01) && (analysers[uid].wavArray[i-1] <= 0.01)){
            trigger = 1;
            firstPos = i;
        }
        ++i;
    }
    for (i = 0; i < fs/freq; i++) {
        view_waveform[i] = (analysers[uid].wavArray[i+firstPos]);
    }

    let x = new Array(parseInt(fs/freq));

    for (i = 0; i < fs/freq; i++){
            x[i] = i*freq/fs;
    }

    drawWaveform(waveform_ctx[uid], x, view_waveform);
}

function drawWaveform(ctx, x, y){
    ctx.clearRect(0, 0, ctx.width, ctx.height); // canvas

    ctx.lineWidth = 2;
    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    ctx.moveTo((x[0]-ctx.xmin)*ctx.width/ctx.dx, ctx.height-(y[0]-ctx.ymin)*ctx.height/ctx.dy);
    for (let i = 1; i < x.length; i++) {
        ctx.lineTo((x[i]-ctx.xmin)*ctx.width/ctx.dx, ctx.height-(y[i]-ctx.ymin)*ctx.height/ctx.dy);
    }
    ctx.stroke()
}


window.waveform_offset_x_change = function(a, uid){
    waveform_ctx[uid].xmin = a/100;
}


window.waveform_offset_y_change = function(a, uid){
    waveform_ctx[uid].ymin = (50-a)/50;
}


window.waveform_scale_x_change = function(a, uid){
    waveform_ctx[uid].dx = 1+a/10;
}


window.waveform_scale_y_change = function(a, uid){
    waveform_ctx[uid].dy = a/50;
}

export { init }
