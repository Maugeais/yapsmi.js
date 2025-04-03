'use strict';

import { yin } from "./yin.js?version=1";

import { transform } from "./fft.js?version=1";

window.change_radiation_file = function(param){
    // console.log("Not yet defined...")
};



/*==================================*/
/* Gestion des filtres              */
/*==================================*/

let filters = [];

function next_filter_on(k){

    while ((k < filters.length) && (!filters[k].is_on)) {
        k++;
    }
    if (k == filters.length) return [k, vol]
    return [k, filters[k].input]
}

function disconnect_filters(){
    if (filters.length == 0) {
        simulationNode.disconnect(vol)
    } else {
        let k = 0, next, data;
        let current = simulationNode;
        data = next_filter_on(0)
        k = data[0]
        next = data[1]
        simulationNode.disconnect(next)
        current = next
        while(k < filters.length){
            let data = next_filter_on(k+1)
            k = data[0]
            next = data[1]
            current.disconnect(next)
            current = next
        }
    }
}
      
window.add_filter = function(init_filter, position = -1, uid){

    // Disconnect everything
    disconnect_filters()

    let index = filters.findIndex(elmnt => elmnt.uid==uid);

    // If already in the list
    if (index >= 0) {

        // find position and change is_on

        filters[index].is_on = true

    } else {

        let filter = init_filter(audioCtx, uid); 
        filter.uid = uid;

        if (position == -1 || filters.length >= position){
            filters.push(filter);

        } else {
            filters.splice(position, 0, filter);
        }

        // Sorting. Necessary for asynchronous reasons when loading the plugins from a session
        //sort_filters()
        
        filters.sort(order_filter);
    }

    connect_filters()
}

window.toggle_audio_node = function(uid){
    disconnect_filters()
    let index = filters.findIndex(elmnt => elmnt.uid==uid);
    if (index >= 0){
        filters[index].is_on = !filters[index].is_on;
    }
    connect_filters()
}

function order_filter(filter1, filter2){
        if (filter1.uid < filter2.uid) return -1;
        if (filter1.uid > filter2.uid) return 1;
        return(0)
    }
          
// function sort_filters(){
//         filters.sort(order_filter);
// }

window.remove_filter = function(uid){
    if (simu_on) audioCtx.close();

    // let index = 0;
    // while(index < filters.index & filters[index].uid != uid){index++};
    let index = filters.findIndex(elmnt => elmnt.uid==uid);

    // const index = filters.indexOf(f);
    if (index > -1) { // only splice array when item is found
        filters.splice(index, 1); // 2nd parameter means remove one item only
    }
    if (simu_on) init();

    console.log("remove", filters)
}

async function connect_filters(){ // connect_filters

    let current = simulationNode;

    if (filters.length > 0) {
        // // Initialise the filters
        for (let k=0; k < filters.length; k++){

            if ((filters[k].input != "") && (filters[k].is_on)){
                current.connect(filters[k].input)
                current = filters[k].output
            }
        }
    }

    current.connect(window.vol)
    current = window.vol

    current.connect(audioCtx.destination);
}

/*==================================*/
/* Computation of time consuming indicators 
   which must be computed at each step of analysers,
   only if necessary, and only once !!! */
/*==================================*/

let frequency_computed = false;
let frequency;
let frequency_length_computation = 2000;

window.get_frequency = function(data){
    if (data == null) {
        if (frequency_computed) return(frequency);
        console.log("Unable to compute frequency")
        return
    }
    if (frequency_computed == false) {
        frequency = yin(data.slice(0, frequency_length_computation), fs, 0.07);
        if (isNaN(frequency)){
            frequency = 100000.0;
        }
        frequency_computed = true;
    }
    return(frequency)
}

let fft_computed = false;
let imag, real;

window.compute_fft = function(data, len){
    if (fft_computed == false) {
        imag = new Float32Array(len);
        real = data.slice(0, len)
        transform(real, imag)
        fft_computed = true;
    } 
    return([real, imag])
}


window.change_global_gain = function(value){

    let now = audioCtx.currentTime   
    vol.gain.setValueAtTime(vol.gain.value, now);
    vol.gain.exponentialRampToValueAtTime(10**(3*(-1+value/100)), now + 0.255)
  
}

/*==================================*/
/* Communication with the simulation node */
/*==================================*/


let simulation_objects = {}

window.query_simulator = async function(method, params = null){
    simulation_objects[method] = null;
    simulationNode.port.postMessage({property:"exec", method:method, params: params});
    while(simulation_objects[method] == null){
        await delay(100)
    }
    return(simulation_objects[method])
}

async function inmessage(event) {
    switch(event.property){
        case "set_html_knob": 
            for (let key in event.knobs) {
                $("#"+key+"_value").html(event.knobs[key]["string"]);
                if ((event.knobs[key]["percentage"] >= 0) && (key in inst_controls)){  
                        inst_controls[key].setValue(event.knobs[key]["percentage"])
                }
            }
            break;
        case "get_controls_value": 
            for (let key in event.params){
                if (key in inst_controls) {
                    inst_controls[key].real_value = event.params[key].value
                } else {
                    inst_controls[key] = {"real_value" : event.params[key].value}
                }
            }
            break;
        case "return" :
            if ((event.method != null) && (event.method in simulation_objects)){
                simulation_objects[event.method] = event.result;
            }
            break;

        case "message" :
            message(event.text)
            break;
        case "computation_state" :
            if (event.state == "Ok"){
                $("#nan").css({"color":"darkgray"});
            } else if (event.state == "NaN"){
                $("#nan").css({"color":"red"})
            } else if (event.state =="overflow"){
                $("#nan").css({"color":"yellow"})
            }
            break;

        default : 
          console.log("oups")
      }
}



window.set_controls = async function(params, knob = true){
    simulationNode.port.postMessage({property:"set_controls", params : params});

    if (knob){
        console.log("knob = true", params)
        let index = inst_controls.findIndex(element => element.id == key);
        inst.knobs[index].setValue(params[key]);
    }
}

window.get_controls_value = async function(){
    simulationNode.port.postMessage({property:"get_controls_value"});
}

/*==================================*/
/* Gestion des analysers */
/*==================================*/


let timer;
let analysers_refresh_rate = 100; // In ms
let overclock = 0;
async function start_analysers(){
    // Execution of the analyser filters
    timer = setInterval(function () {
        let t0 = performance.now();
        simulationNode.port.postMessage({property:"get_controls_value"});
        frequency_computed = false;
        fft_computed = false;
        filters.forEach(filter => filter.callback(filter.uid))
        let speed = 100*(performance.now() - t0)/analysers_refresh_rate;
        if (speed > 50){
          overclock += 1;
          if (overclock == 3){
            analysers_refresh_rate *= 2
            message("The system is overloaded, the refresh rate of analysers has been reduced to " + analysers_refresh_rate)
            overclock = 0;
            clearInterval(timer)
            start_analysers()
          }
        }
        $("#speed").html("CPU: "+speed.toFixed(2)+'%');
    }, analysers_refresh_rate); 
}

/*======================================*/
/* Initialisation et toggle de l'audio */
/*======================================*/

window.simu_on = false;

window.toggle_audio = function(){

    if (~simu_on){
        audioCtx.resume()
        let now = audioCtx.currentTime
        vol.gain.setValueAtTime(Number.EPSILON, now);
        vol.gain.exponentialRampToValueAtTime(10**(3*(-1+gain_slider.value/100)), now + 0.25)
        start_analysers()
        $('#audio_start').css('background-image','url(../../css/images/on.png)');
    } else {
        let now = audioCtx.currentTime
     
        vol.gain.setValueAtTime(vol.gain.value, now);
        vol.gain.exponentialRampToValueAtTime(Number.EPSILON, now + 0.25)
        setTimeout(function(){
            audioCtx.suspend(),
            clearInterval(timer)

        } , 250);
        
        $('#audio_start').css('background-image','url(../../css/images/off.png)');
    }
    simu_on = ~simu_on;
}

window.audioCtx = new AudioContext();
await audioCtx.audioWorklet.addModule("../../js/audio-processor.js");

window.fs = audioCtx.sampleRate;
let dt = 1 / fs;
let buffer_size  = 128 //2*2048; //16384; ???? Chrmoe prend 512 !?
window.vol = audioCtx.createGain();
window.change_global_gain($("#gain_slider").val())

async function initialise_audio() {
 
    window.simulationNode = new AudioWorkletNode(
        audioCtx, "simulation-processor", {
            numberOfOutputs : 1, 
            processorOptions: {
                data : await init_instrument(),
                instrument_name : window.instrument_name,
                buffer_size : buffer_size
            }
    });
    
    simulationNode.port.onmessage = (e) => inmessage(e.data);

    simulationNode.connect(window.vol)
    vol.connect(audioCtx.destination);

    // get_controls_value()
    window.instrument_controls_details = await query_simulator("get_controls_details");
} 

export { initialise_audio}
