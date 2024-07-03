"use strict";

let waveform_ctx = {};
let analysers = {};
const fs = 48000;

function init(uid){
    add_filter(init_waveform_analyser, -1, uid);
    init_knobs("waveform_controls€"+uid, "medium", "LittlePhatty");
    // let canvas = document.getElementById("waveform_canvas€"+uid);
    // waveform_ctx[uid] = canvas.getContext("2d");
    // waveform_ctx[uid].width = canvas.width;
    // waveform_ctx[uid].height = canvas.height;
    // waveform_ctx[uid].xmin = 0;
    // waveform_ctx[uid].dx = 1;
    // waveform_ctx[uid].ymin = -1;
    // waveform_ctx[uid].dy = 2;
    view_waveform[uid] =  new Float32Array(300);
    initial_draw(uid)
}

function init_waveform_analyser(audioCtx, uid){
    analysers[uid] = audioCtx.createAnalyser();
    analysers[uid].fftSize = 2048*16;
    analysers[uid].smoothingTimeConstant = 0.0;
    analysers[uid].wavArray = new Float32Array(analysers[uid].frequencyBinCount);
    return([analysers[uid], waveform_analyser])
}

let view_waveform ={};

function from_max(uid, buffer){
    let firstPos = 0;
    let i = 0;
    
    let m = 0;
    for (let i=0; i < analysers[uid].wavArray.length; i++){
        if ((analysers[uid].wavArray[i] > m)){
            m = analysers[uid].wavArray[i];
            firstPos = i;
        }
    }

    for (i = 0; i < 300; i++) {
        view_waveform[uid][i] = (analysers[uid].wavArray[3*i+firstPos]);
    }
}

function from_trigger(){

}


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
    // from_max(uid, analysers[uid].wavArray)
    let x = new Array(parseInt(fs/freq));

    for (i = 0; i < fs/freq; i++){
            x[i] = i*freq/fs;
    }

    draw(uid, x.slice(0, 100), view_waveform[uid].slice(0, 100))


    // drawWaveform(waveform_ctx[uid], x, view_waveform);
}

// function drawWaveform(ctx, x, y){
//     ctx.clearRect(0, 0, ctx.width, ctx.height); // canvas

//     ctx.lineWidth = 2;
//     ctx.strokeStyle = 'blue';
//     ctx.beginPath();
//     ctx.moveTo((x[0]-ctx.xmin)*ctx.width/ctx.dx, ctx.height-(y[0]-ctx.ymin)*ctx.height/ctx.dy);
//     for (let i = 1; i < x.length; i++) {
//         ctx.lineTo((x[i]-ctx.xmin)*ctx.width/ctx.dx, ctx.height-(y[i]-ctx.ymin)*ctx.height/ctx.dy);
//     }
//     ctx.stroke()
// }

var data = {};

function initial_draw(uid){
    
//     let alpha = 1/(2*knee*ratio)-1/(2*knee);

//     for (let i = 0; i < input.length; i++) {
//         if (input[i] < threshold-knee/2) {
//             output[i] = input[i];
//         } else if (input[i] < threshold+knee/2){
//             output[i] = input[i] + alpha*(input[i]-threshold+knee/2)**2;
//         } else {
//             output[i] = (input[i]-threshold)/ratio+threshold;
//         } 
//     }
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
            width: 300,
            height: 220,
            uirevision :true,
            margin: {
              l: 20,
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

    Plotly.newPlot('waveform_display€'+uid, data[uid], layout);
}

function draw(uid, x, y){
    
    data[uid][0]['x'] = x;
    data[uid][0]['y'] = y;
    
    Plotly.redraw('waveform_display€'+uid);

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
