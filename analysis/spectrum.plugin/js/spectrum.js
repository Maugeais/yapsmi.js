'use strict';

let spectrums_ctx ={}; //= getCTX("spectrum_canvas€0");
let analysers = {};



function init(uid){
    add_filter(init_spectrum_analyser, spectrum_analyser, uid);
    init_knobs("spectrum_controls€"+uid, "medium", "LittlePhatty");
    let canvas = document.getElementById("spectrum_canvas€"+uid);
    spectrums_ctx[uid] = canvas.getContext("2d");
    spectrums_ctx[uid].width = canvas.width;
    spectrums_ctx[uid].height = canvas.height;
    spectrums_ctx[uid].xmin = 0;
    spectrums_ctx[uid].dx = 300;
    spectrums_ctx[uid].ymin = -200;
    spectrums_ctx[uid].dy = 200;
}

// let analyser;

function init_spectrum_analyser(audioCtx, uid){
    analysers[uid] = audioCtx.createAnalyser();
    analysers[uid].fftSize = 32768; //2048*16*4;
    analysers[uid].smoothingTimeConstant = 0.0;
    analysers[uid].freqArray = new Float32Array(analysers[uid].frequencyBinCount);
    analysers[uid].channelInterpretation = "discrete";
    return([analysers[uid], spectrum_analyser])
}


let freqArray =[];
function spectrum_analyser(uid){
    analysers[uid].getFloatFrequencyData(analysers[uid].freqArray);
    spectrum_draw(analysers[uid].freqArray, uid)
}



let x = new Array(2048);



function spectrum_draw(fft, uid){
    let max = Math.max.apply(null, fft);
    for (let i = 0; i < x.length; i++){
        x[i] = i*48000/analysers[uid].fftSize;
        // fft[i] -= max;
    }
    drawCurve(spectrums_ctx[uid], x, fft);
}

function drawCurve(ctx, x, y){
    ctx.clearRect(0, 0, ctx.width, ctx.height); // canvas


    //ctx.setLineDash([1, 0]);
    // ctx.beginPath();
    // ctx.arc(x[x.length-1]-ctx.xmin, ctx.height-y[x.length-1], 2, 0, 2 * Math.PI, false);
    // ctx.fillStyle = 'green';
    // ctx.fill();
    // ctx.lineWidth = 5;
    // ctx.strokeStyle = '#003300';
    // ctx.stroke();

    // Draw the x axis
    for (let i =0; i < 5; i++){
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'gray';
        ctx.beginPath();
        ctx.moveTo(ctx.width*i/5, 0);
        ctx.lineTo(ctx.width*i/5, ctx.height);
        ctx.stroke()
        
        ctx.font = "10px Arial";
        ctx.fillStyle = "gray";
        ctx.fillText(ctx.xmin+i*ctx.dx/5+'Hz', 2+ctx.width*i/5, ctx.height-5); 
    }

    for (let i =3; i >0; i--){
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'gray';
        ctx.beginPath();
        ctx.moveTo(0, ctx.height*i/3);
        ctx.lineTo(ctx.width, ctx.height*i/3);
        ctx.stroke()
        
        ctx.font = "10px Arial";
        ctx.fillStyle = "gray";
        ctx.fillText(((-1+i/3)*ctx.dy).toFixed(2)+'dB', 5, ctx.height*(1-i/3)+10); 
    }

    // Draw the spectrum
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    ctx.moveTo((x[0]-ctx.xmin)*ctx.width/ctx.dx, ctx.height-(y[0]-ctx.ymin)*ctx.height/ctx.dy);
    for (let i = 1; i < x.length; i++) {
        ctx.lineTo((x[i]-ctx.xmin)*ctx.width/ctx.dx, ctx.height-(y[i]-ctx.ymin)*ctx.height/ctx.dy);
    }
    ctx.stroke()



}


window.spectrum_offset_x_change = function(a, uid){
    spectrums_ctx[uid].xmin = 5*a;
}


window.spectrum_offset_y_change = function(a, uid){
    spectrums_ctx[uid].ymin = -5*a;
}


window.spectrum_scale_x_change = function(a, uid){
    spectrums_ctx[uid].dx = 20*(1+a);
}


window.spectrum_scale_y_change = function(a, uid){
    spectrums_ctx[uid].dy = (1+a*10);
}

export { init }
