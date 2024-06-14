"use strict";

// For the different curves, see https://www.youtube.com/watch?v=2fb47zQdLy0

let waveshaper_normalisation = 1;
window.waveshaper_normalisation_change = function(a){
    waveshaper_normalisation = 1+a/20;
    $("#waveshaper_normalisation_value").html(waveshaper_normalisation.toFixed(1)) 
    draw()
    restart();
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
    // waveshaper_knobs[0].setValue(20) 
    plugins[uid].save = save;
    plugins[uid].load = load;

    initial_draw();
}

function save(){
    let commands = {};
    return(commands)
}

function load(commands){
    // waveshaper_file = commands["waveshaper_file"];
}

var waveshaper_on = false;
window.waveshaper_click = function(){
    
    if (!waveshaper_on){
        $("#waveshaper_on").css('background-image','url(../../effects/waveshaper.plugin/css/images/on.png)');
        // add_filter(init_waveshaper, waveshaper_callback);
    } else {
        $("#waveshaper_on").css('background-image','url(../../effects/waveshaper.plugin/css/images/off.png)');
        // remove_filter(init_waveshaper, waveshaper_callback);
    }

    waveshaper_on = !waveshaper_on;
    restart()
}



async function init_waveshaper(audioCtx){

    const waveshaper = audioCtx.createWaveShaper();

    waveshaper.curve = makeDistortionCurve(48000);
    waveshaper.oversample = "4x";

    return([waveshaper, waveshaper_callback, waveshaper_on])
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
            width: 220,
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

// function makeDistortionCurve(amount) {
//     const k = typeof amount === "number" ? amount : 50;
//     const n_samples = 44100;
//     const curve = new Float32Array(n_samples);
//     const deg = Math.PI / 180;
  
//     for (let i = 0; i < n_samples; i++) {
//       const x = (i * 2) / n_samples - 1;
//       curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
//     }
//     return curve;
//   }

function makeDistortionCurve(n_samples) {
    let x;
    let curve = new Float32Array(n_samples);
    for (let i = 0; i < n_samples; i++){
        x = (-1+2*i/n_samples)*waveshaper_normalisation;
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
    // let x;
    // for (let i = 0; i < N; i++){
    //     x = (-1+2*i/N)*waveshaper_normalisation;
    //     data[0]['x'][i] = (-1+2*i/N);
    //     switch (waveshaper_type){
    //         case 'pol': if (x < -1) {data[0]['y'][i] = -1;}
    //                     else if (x > 1) { data[0]['y'][i] = 1;}
    //                     else {data[0]['y'][i] = 3*x/2-x**3/2};
    //                     break;
    //         case 'lin': if (x < -1) {data[0]['y'][i] = -1;}
    //                     else if (x > 1) { data[0]['y'][i] = 1;}
    //                     else {data[0]['y'][i] = x};
    //                     break;
    //         case 'tanh': data[0]['y'][i] = Math.tanh(x);
    //                     break;   
    //         case 'frac': data[0]['y'][i] = x/(1+Math.abs(x));
    //                     break;           
    //     }
        
    // }
    data[0]['y'] = makeDistortionCurve(N)
    
    Plotly.redraw('waveshaper_display');

}


export { init }
