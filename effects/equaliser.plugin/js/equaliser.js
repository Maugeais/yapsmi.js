// cf. https://stackoverflow.com/questions/13794284/implementing-a-3-band-equalizer-using-web-audio-api
// et 
// https://developer.mozilla.org/fr/docs/Web/API/BiquadFilterNode pour la visualisation

"use strict";

let threshold = -50;
let knee = 10; //(40, audioCtx.currentTime);
let ratio = 12; //setValueAtTime(12, audioCtx.currentTime);
let attack = 0; //setValueAtTime(0, audioCtx.currentTime);
let release = 0.25; //setValueAtTime(0.25, audioCtx.currentTime);

let equaliser_knobs;

window.equaliser_threshold_change = function(a, uid){
    threshold = -100+a;
    draw()
}

window.equaliser_knee_change = function(a, uid){
    knee = a/2;
    draw()
}

window.equaliser_ratio_change = function(a, uid){
    ratio = a/4+1;
    draw()
}

window.equaliser_attack_change = function(a, uid){
    draw()
}

window.equaliser_release_change = function(a, uid){
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

    Plotly.newPlot('equaliser_display', data, layout);

    restart()
}


function init(uid){
    equaliser_knobs = init_knobs("equaliser_main", "medium", "LittlePhatty");
    // init_knobs("equaliser_controls2", "medium", "LittlePhatty");
    add_filter(init_equaliser, equaliser_callback, uid);
    draw()
    plugins[uid].save = save;
    plugins[uid].load = load;
}

function save(){
    let commands = {"threshold" : threshold, "knee" : knee, "ratio" : ratio, "attack" : attack, "release" : release};
    return(commands)
}

function load(uid, commands){
    // threshold = commands["threshold"];
    // knee = commands["knee"];
    // ratio = commands["ratio"];
    // attack = commands["attack"];
    // release = commands["release"];
    let index = equaliser_knobs.findIndex(element => element.id == "equaliser_threshold");
    equaliser_knobs[index].setValue(commands["threshold"]+100);
    index = equaliser_knobs.findIndex(element => element.id == "equaliser_knee");
    equaliser_knobs[index].setValue(commands["knee"]*2);
    index = equaliser_knobs.findIndex(element => element.id == "equaliser_ratio");
    equaliser_knobs[index].setValue((commands["ratio"]-1)*4);
}

var equaliser_on = false;

window.equaliser_click = function(){
    
    if (!equaliser_on){
        $("#equaliser_on").css('background-image','url(../../effects/equaliser.plugin/css/images/on.png)');
        // add_filter(init_equaliser, equaliser_callback);
    } else {
        $("#equaliser_on").css('background-image','url(../../effects/equaliser.plugin/css/images/off.png)');
        // remove_filter(init_equaliser, equaliser_callback);
    }
    equaliser_on = !equaliser_on;
    restart()
}

async function init_equaliser(audioCtx){

    const equaliser = audioCtx.createDynamicsequaliser();
    equaliser.threshold.value = threshold; //(-50, audioCtx.currentTime);
    equaliser.knee.value = knee; //(40, audioCtx.currentTime);
    equaliser.ratio.value = ratio; //setValueAtTime(12, audioCtx.currentTime);
    equaliser.attack.value = attack; //setValueAtTime(0, audioCtx.currentTime);
    equaliser.release.value = release; //setValueAtTime(0.25, audioCtx.currentTime);
  
    return([equaliser, equaliser_callback, equaliser_on])
}

function equaliser_callback(){       
}


export { init }
