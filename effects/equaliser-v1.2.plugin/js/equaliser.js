// cf. https://stackoverflow.com/questions/13794284/implementing-a-3-band-equalizer-using-web-audio-api
// et 
// https://developer.mozilla.org/fr/docs/Web/API/BiquadFilterNode pour la visualisation

"use strict";
let equaliser_knobs;

let equaliser_uid = -1;
/*
let threshold = -50;
let knee = 10; //(40, audioCtx.currentTime);
let ratio = 12; //setValueAtTime(12, audioCtx.currentTime);
let attack = 0; //setValueAtTime(0, audioCtx.currentTime);
let release = 0.25; //setValueAtTime(0.25, audioCtx.currentTime);*/

var filter_number = 0;

window.change_filter_number = function(val){
    filter_number = (filter_number+val + plugins[equaliser_uid].filters.length) % plugins[equaliser_uid].filters.length;
    console.log(plugins[equaliser_uid].filters, filter_number)
    equaliser_frequency_range.value = equaliser_frequency_value.value = plugins[equaliser_uid].filters[filter_number].frequency.value
    equaliser_Q_range.value = equaliser_Q_value.value = plugins[equaliser_uid].filters[filter_number].Q.value
    equaliser_gain_range.value = equaliser_gain_value.value = plugins[equaliser_uid].filters[filter_number].gain.value
    filter_type.value =  plugins[equaliser_uid].filters[filter_number].type
    $("#equaliser_filter_id").html(filter_number);
    update_ranges();
}


window.change_filter_type = function(a, uid){
    plugins[equaliser_uid].filters[filter_number].type = a;
    update_ranges();
    redraw()
}

window.change_equaliser_gain = function(a, uid){
    let val = parseFloat($("#equaliser_gain_value").val())
    plugins[equaliser_uid].filters[filter_number].gain.value = val;
    redraw()
}

let QdB = ["lowpass" , "highpass"]

function update_ranges(){
    console.log("Im gere")
    console.log(equaliser_uid)
    console.log(filter_number, QdB)
    if (QdB.includes(plugins[equaliser_uid].filters[filter_number].type)){
        equaliser_Q_range.max =10;
        equaliser_Q_range.min =-10
    } else {
        equaliser_Q_range.max = 10;
        equaliser_Q_range.min = 0;
    }
}
window.change_equaliser_Q = function(a, uid){
    let val = $("#equaliser_Q_value").val();
    val = val; //10**((val-50)/20)
    equaliser_Q_value.value=val;
    plugins[equaliser_uid].filters[filter_number].Q.value = val;
    redraw()
}
// window.change_equaliser_Q = function(a, uid){
//     // let val;
//     // if (QdB.includes(plugins[equaliser_uid].filters[filter_number].type)){
//     //     val = 10**(parseFloat($("#equaliser_Q_value").val())/20);
//     // } else {
//     //     val = parseFloat($("#equaliser_Q_value").val())
//     // }
//     // // plugins[equaliser_uid].filters[filter_number].Q.value = val;
//     // // draw()
// }

window.change_equaliser_frequency = function(a, uid){
    let val = parseFloat($("#equaliser_frequency_value").val())
    plugins[equaliser_uid].filters[filter_number].frequency.value = val;
    redraw()
}



const frequencyArray = new Float32Array(1000);
const magResponseOutput = new Float32Array(frequencyArray.length);
const phaseResponseOutput = new Float32Array(frequencyArray.length);
const complete_filter_reponse = new Float32Array(frequencyArray.length);
for (let i = 0; i < frequencyArray.length; i++){
    frequencyArray[i] = 50+i/frequencyArray.length*19950;
}

var data = [{
      x: frequencyArray,
      y: complete_filter_reponse,
      line: {
        color: 'rgb(55, 128, 191)',
        width: 3},
      type: 'scatter'
    }];

function compute_response(){
       for (let i = 0; i < frequencyArray.length; i++){
        complete_filter_reponse[i] = 1;
    }

    for (let j = 0; j < plugins[equaliser_uid].filters.length; j++){
        plugins[equaliser_uid].filters[j].getFrequencyResponse(
            frequencyArray,
            magResponseOutput,
            phaseResponseOutput,
        );

        for (let i = 0; i < frequencyArray.length; i++){
            complete_filter_reponse[i] *= magResponseOutput[i];
        }
    }
}

function initial_draw(){

    compute_response()

    var layout = {
            autosize: false,
            width: 466,
            height: 160,
            uirevision :true,
            margin: {
              l: 20,
              r: 0,
              b: 20,
              t: 0
            },
            xaxis: {
              showgrid: true,
              zeroline: false,
              type: 'log'
            },
            yaxis: {
              showgrid:true,
              showline: false,
              type: 'log'
            }
          };

    Plotly.newPlot('equaliser_display', data, layout);
}

function redraw(){

    compute_response()

    var layout = {
            autosize: false,
            width: 466,
            height: 160,
            uirevision :true,
            margin: {
              l: 20,
              r: 0,
              b: 20,
              t: 0
            },
            xaxis: {
              showgrid: true,
              zeroline: false,
              type: 'log'
            },
            yaxis: {
              showgrid:true,
              showline: false,
              type: 'log'
            }
          };

    Plotly.redraw('equaliser_display');
}

function init(uid){   
    
    equaliser_uid = uid;

    equaliser_knobs = init_knobs("equaliser_main", "medium", "LittlePhatty");
    // init_knobs("equaliser_controls2", "medium", "LittlePhatty");
    add_filter(init_equaliser, equaliser_callback, uid);
    // 

    plugins[uid].save = save;
    plugins[uid].load = load;    
    initial_draw()

}

function save(){
    let commands = {"threshold" : threshold, "knee" : knee, "ratio" : ratio, "attack" : attack, "release" : release};
    return(commands)
}

function load(uid, commands){
    // // threshold = commands["threshold"];
    // // knee = commands["knee"];
    // // ratio = commands["ratio"];
    // // attack = commands["attack"];
    // // release = commands["release"];
    // let index = equaliser_knobs.findIndex(element => element.id == "equaliser_threshold");
    // equaliser_knobs[index].setValue(commands["threshold"]+100);
    // index = equaliser_knobs.findIndex(element => element.id == "equaliser_knee");
    // equaliser_knobs[index].setValue(commands["knee"]*2);
    // index = equaliser_knobs.findIndex(element => element.id == "equaliser_ratio");
    // equaliser_knobs[index].setValue((commands["ratio"]-1)*4);
}

var equaliser_on = false;

window.equaliser_click = function(){

    if (!equaliser_on){
        $("#equaliser_on").css('background-image','url(../../effects/equaliser-v1.2.plugin/css/images/on.png)');
        // add_filter(init_equaliser, equaliser_callback);
    } else {
        $("#equaliser_on").css('background-image','url(../../effects/equaliser-v1.2.plugin/css/images/off.png)');
        // remove_filter(init_equaliser, equaliser_callback);
    }

    toggle_audio_node(equaliser_uid)
    equaliser_on = !equaliser_on;
}

function init_equaliser(audioCtx, uid){

    plugins[uid].filters = [audioCtx.createBiquadFilter(), audioCtx.createBiquadFilter(), audioCtx.createBiquadFilter()]

 //set the filter types (you could set all to 5, for a different result, feel free to experiment)
    plugins[uid].filters[0].type = "lowpass";
    plugins[uid].filters[0].Q.value = -2;
    plugins[uid].filters[0].frequency.value = 15000;
    plugins[uid].filters[1].type = "bandpass";
    plugins[uid].filters[2].type = "highpass";
    plugins[uid].filters[2].Q.value = -2;
    plugins[uid].filters[2].frequency.value = 50;

    plugins[uid].filters[0].connect(plugins[uid].filters[1])
    plugins[uid].filters[1].connect(plugins[uid].filters[2])

    change_filter_number(0)

  
    return({'input': plugins[uid].filters[0], 'output': plugins[uid].filters[plugins[uid].filters.length-1], 'is_on': false, 'callback': equaliser_callback})

}

function equaliser_callback(){
}


export { init }
