"use strict";

// For the different curves, see https://www.youtube.com/watch?v=2fb47zQdLy0

import { parameter } from "../../../js/parameters.js?version=1.02";

let waveshaper_normalisation = new parameter(1, [0.1, 50], '', 1, 1, true);

window.waveshaper_normalisation_change = function(a, uid){
    waveshaper_normalisation.set_from_percentage(a);
    $("#waveshaper_normalisation_value").html(waveshaper_normalisation.to_string()) 
    draw()
}

let waveshaper_type = "pol";

window.waveshaper_change_type = function(container){
    waveshaper_type = $(container).val();
    draw();
}

var waveshaper_knobs;
function init(uid){
    waveshaper_knobs = init_knobs("waveshaper_main", "medium", "LittlePhatty");
    add_filter(init_waveshaper, waveshaper_callback, uid);
    plugins[uid].save = save;
    plugins[uid].load = load;

    initial_draw();
}

function save(){
    let commands = {'normalisation' : waveshaper_normalisation.value, 'type' : waveshaper_type};
    return(commands)
}

function load(uid, commands){    
    $("#waveshaper_type").val(commands['type']);
    waveshaper_type = commands['type'];
    waveshaper_knobs[0].setValue(commands['normalisation']);
}

var waveshaper_on = false;
window.waveshaper_click = function(){
    
    if (!waveshaper_on){
        $("#waveshaper_on").css('background-image','url(../../css/images/plugin_on.png)');
    } else {
        $("#waveshaper_on").css('background-image','url(../../css/images/plugin_off.png)');
    }

    waveshaper_on = !waveshaper_on;
}


let waveshaper;

async function init_waveshaper(audioCtx){

    waveshaper = audioCtx.createWaveShaper();

    set_waveshapper_settings()

    return([waveshaper, waveshaper_callback, waveshaper_on])
}

async function set_waveshapper_settings(){
    if (waveshaper != null){
        waveshaper.curve = makeDistortionCurve(48000);
        waveshaper.oversample = "4x";
    }
}

function waveshaper_callback(){
}


var N = 100;
var data = [{'x' : new Float32Array(N), 'y':new Float32Array(N)}]
for (let i = 0; i < N; i++){
    data[0]['x'][i] = (-1+2*i/N);
}

function initial_draw(){
    data[0]['line'] = {
        color: 'rgb(55, 128, 191)',
        width: 3};
    data[0]["type"] = 'lines';
    var layout = {
            autosize: false,
            width: 240,
            height: 300,
            uirevision :true,
            margin: {
              l: 20,
              r: 0,
              b: 20,
              t: 0
            },
            xaxis: {
              title: 'Input',
              showgrid: true,
              zeroline: false
            },
            yaxis: {
              title: 'Output',
              showline: false
            }
          };

    Plotly.newPlot('waveshaper_display', data, layout);
    draw()
}

function makeDistortionCurve(n_samples) {
    let x;
    let curve = new Float32Array(n_samples);
    for (let i = 0; i < n_samples; i++){
        x = (-1+2*i/n_samples)*waveshaper_normalisation.value;
        switch (waveshaper_type){
            case 'pol': if (x < -1) {curve[i] = -1;}
                        else if (x > 1) { curve[i] = 1;}
                        else {curve[i] = 3*x/2-x**3/2};
                        break;
            case 'lin': if (x < -1) {curve[i] = -1;}
                        else if (x > 1) { curve[i] = 1;}
                        else {curve[i] = x};
                        break;
            case 'tanh': curve[i] = Math.tanh(x);
                        break;   
            case 'frac': curve[i] = x/(1+Math.abs(x));
                        break;           
        }
        
    }
    return curve;
}

function draw(){
 
    data[0]['y'] = makeDistortionCurve(N)
    
    Plotly.redraw('waveshaper_display');

    set_waveshapper_settings()

    restart()

}


export { init }
