// TODO Changement continu des paramètres du compresseyur
"use strict";

import { parameter } from "../../../js/parameters.js?version=1.02";


let threshold = new parameter(-50, [-100, 0], '', 1, 0, false);
let knee = new parameter(10, [0, 50], '', 1, 0, false);
let ratio = new parameter(12, [1, 26], '', 1, 0, true); //setValueAtTime(12, audioCtx.currentTime);
let attack = new parameter(1e-3, [1e-5, 1e-1], '', 1, 0, true)
let release = new parameter(1e-1, [50e-3, 5], '', 1, 0, true)

let compressor_knobs;

window.compressor_threshold_change = function(a, uid){
    threshold.set_from_percentage(a);
    draw()
}

window.compressor_knee_change = function(a, uid){
    knee.set_from_percentage(a);
    draw()
}

window.compressor_ratio_change = function(a, uid){
    ratio.set_from_percentage(a);
    draw()
}

window.compressor_attack_change = function(a, uid){
    attack.set_from_percentage(a);
    draw()
}

window.compressor_release_change = function(a, uid){
    release.set_from_percentage(a);
    draw()
}

let input = new Float64Array(100);
for (let i = 0; i < input.length; i++) {
    input[i] = -100+i;
}
let output = new Float64Array(100);

function draw(uid){
    
    let alpha = 1/(2*knee.value*ratio.value)-1/(2*knee.value);

    for (let i = 0; i < input.length; i++) {
        if (input[i] < threshold.value-knee.value/2) {
            output[i] = input[i];
        } else if (input[i] < threshold.value+knee.value/2){
            output[i] = input[i] + alpha*(input[i]-threshold.value+knee.value/2)**2;
        } else {
            output[i] = (input[i]-threshold.value)/ratio.value+threshold.value;
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

    set_compressor_settings(uid);

    // restart()
}

let compressor_uid = -1;

function init(uid){
    compressor_knobs = init_knobs("compressor_main", "medium", "LittlePhatty");
    add_filter(init_compressor, compressor_callback, uid);
    draw(uid)
    compressor_uid = uid;
    plugins[uid].save = save;
    plugins[uid].load = load;
}

function save(){
    let commands = {"threshold" : threshold.to_percentage(), 
                    "knee" : knee.to_percentage(), 
                    "ratio" : ratio.to_percentage(),
                     "attack" : attack.to_percentage(), 
                     "release" : release.to_percentage()
                    };
    return(commands)
}

function load(uid, commands){
    compressor_knobs["compressor_threshold"].setValue(commands["threshold"]);
    compressor_knobs["compressor_knee"].setValue(commands["knee"]);
    compressor_knobs["compressor_ratio"].setValue(commands["ratio"]);
    compressor_knobs["compressor_attack"].setValue(commands["attack"]);
    compressor_knobs["compressor_release"].setValue(commands["release"]);
}

var compressor_on = false;

window.compressor_click = function(e){
    let uid = Object.keys(compressor)[0];

    toggle_audio_node(compressor_uid)
    if (!compressor_on){
        $("#compressor_on").css('background-image','url(../../css/images/plugin_on.png)');
        // add_filter(init_compressor, compressor_callback);
    } else {
        $("#compressor_on").css('background-image','url(../../css/images/plugin_off.png)');
        // remove_filter(init_compressor, compressor_callback);
    }
    compressor_on = !compressor_on;
    // restart()
}

let compressor = {};
function init_compressor(audioCtx, uid){
    compressor = audioCtx.createDynamicsCompressor();
    set_compressor_settings(uid)
    
    return({'input': compressor, 'output': compressor, 'is_on': false, 'callback': compressor_callback})
}

function set_compressor_settings(uid){
    // if (compressor != null){
        compressor.threshold.value = threshold.value; //(-50, audioCtx.currentTime);
        compressor.knee.value = knee.value; //(40, audioCtx.currentTime);
        compressor.ratio.value = ratio.value; //setValueAtTime(12, audioCtx.currentTime);
        compressor.attack.value = attack.value; //setValueAtTime(0, audioCtx.currentTime);
        compressor.release.value = release.value; //setValueAtTime(0.25, audioCtx.currentTime);
    // }
}

function compressor_callback(){       
}


export { init }
