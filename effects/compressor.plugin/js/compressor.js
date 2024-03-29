"use strict";

let threshold = -50;
let knee = 10; //(40, audioCtx.currentTime);
let ratio = 12; //setValueAtTime(12, audioCtx.currentTime);
let attack = 0; //setValueAtTime(0, audioCtx.currentTime);
let release = 0.25; //setValueAtTime(0.25, audioCtx.currentTime);

let varTest = "toto";

window.compressor_threshold_change = function(a, uid){
    threshold = -100+a;
    draw()
}

window.compressor_knee_change = function(a, uid){
    knee = a/2;
    draw()
}

window.compressor_ratio_change = function(a, uid){
    ratio = a/4+1;
    draw()
}

window.compressor_attack_change = function(a, uid){
    draw()
}

window.compressor_release_change = function(a, uid){
    draw()
}

let input = new Float64Array(100);
for (let i = 0; i < input.length; i++) {
    input[i] = -100+i;
}
let output = new Float64Array(100);

function draw(){
    
    let alpha = 1/(2*knee*ratio)-1/(2*knee);

    for (let i = 0; i < input.length; i++) {
        if (input[i] < threshold-knee/2) {
            output[i] = input[i];
        } else if (input[i] < threshold+knee/2){
            output[i] = input[i] + alpha*(input[i]-threshold+knee/2)**2;
        } else {
            output[i] = (input[i]-threshold)/ratio+threshold;
        } 
    }

    var data = [{
      x: input,
      y: output,
      line: {
        color: 'rgb(55, 128, 191)',
        width: 3},
      type: 'scatter'
    }];
    var layout = {
            autosize: false,
            width: 215,
            height: 120,
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

    Plotly.newPlot('compressor_display', data, layout);

    restart()
}


function init(uid){
    init_knobs("compressor_controls1", "medium", "LittlePhatty");
    init_knobs("compressor_controls2", "medium", "LittlePhatty");
    add_filter(init_compressor, compressor_callback, uid);
    draw()
    plugins[uid].save = save;
    plugins[uid].load = load;
}

function save(){
    let commands = {"threshold" : threshold, "knee" : knee, "ratio" : ratio, "attack" : attack, "release" : release};
    return(commands)
}

function load(commands){
    threshold = commands["threshold"];
    knee = commands["knee"];
    ratio = commands["ratio"];
    attack = commands["attack"];
    release = commands["release"];
}

var compressor_on = false;

window.compressor_click = function(){
    
    if (!compressor_on){
        $("#compressor_on").css('background-image','url(../../effects/compressor.plugin/css/images/on.png)');
        // add_filter(init_compressor, compressor_callback);
    } else {
        $("#compressor_on").css('background-image','url(../../effects/compressor.plugin/css/images/off.png)');
        // remove_filter(init_compressor, compressor_callback);
    }
    compressor_on = !compressor_on;
    restart()
}

async function init_compressor(audioCtx){

    const compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.value = threshold; //(-50, audioCtx.currentTime);
    compressor.knee.value = knee; //(40, audioCtx.currentTime);
    compressor.ratio.value = ratio; //setValueAtTime(12, audioCtx.currentTime);
    compressor.attack.value = attack; //setValueAtTime(0, audioCtx.currentTime);
    compressor.release.value = release; //setValueAtTime(0.25, audioCtx.currentTime);
  
    return([compressor, compressor_callback, compressor_on])
}

function compressor_callback(){       
}


export { init }
