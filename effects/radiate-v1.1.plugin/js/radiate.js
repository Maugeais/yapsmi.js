// TODO : fadin lors du changement de ficihier radiate

"use strict";

let radiation_filters  = {};
let radiation_filter =  "";
let convolver_uid;
let radiate_on = false;

window.radiation_callback = function(test){
    console.log("now defined", test)
}



async function load_radiation_filters(){

    let response = await globalThis.fetch("./data/radiate");
    let str = await response.text();
    let el = document.createElement('html');
    el.innerHTML = str;
    let list = el.getElementsByTagName("a");
    let html = ''

    for (let item of list) {
        let filename = item.innerText;
        radiation_filters[filename.slice(0, -4)] = './data/radiate/'+filename;
        html += "<tr><td>"+filename.slice(0, -4)+"</td></tr>"
    }
    $("#radiate_files tbody").html(html);
    $("#radiate_files td").click(function(){ radiation_filter = radiation_filters[this.innerText]; change_radiation_file(this.innerText) })

    radiation_filter = radiation_filters[Object.keys(radiation_filters)[0]]
}

async function init(uid){
    add_filter(init_radiate, radiate_callback, uid);
    await load_radiation_filters()

    plugins[uid].save = save;
    plugins[uid].load = load;
    convolver_uid = uid;
}

window.radiate_click = function(){
    
    if (!radiate_on){
        $("#radiate_on").css('background-image','url(../../css/images/plugin_on.png)');
        // add_filter(init_radiate, radiate_callback);
    } else {
        $("#radiate_on").css('background-image','url(../../css/images/plugin_off.png)');
        // remove_filter(init_radiate, radiate_callback);
    }
    radiate_on = !radiate_on;

    simulationNode.port.postMessage({property:"exec", method:"set_radiation_status", params:radiate_on});
    toggle_audio_node(convolver_uid)
}

let convolver;

function init_radiate(audioCtx){

    convolver = audioCtx.createConvolver();
    set_radiation_file(0)
    return({'input': convolver, 'output': convolver, 'is_on': false, 'callback': radiate_callback})
}

async function set_radiation_file(id){
    if ((convolver != null) && (id in radiation_filters)){
        const response = await fetch(radiation_filters[id]);
        const arrayBuffer = await response.arrayBuffer();
        const decodedAudio = await audioCtx.decodeAudioData(arrayBuffer);
        convolver.normalize = true; // must be set before the buffer, to take effect
        convolver.buffer = decodedAudio;
    }
}

function radiate_callback(){   
}

window.change_radiation_file = function(id){

    set_radiation_file(id)
                
    $("#radiate_files tr").removeClass("selected_tr");
    $("#radiate_files td").filter(function() {
        return $(this).text() == id;
    }).closest("tr").addClass("selected_tr");
  

}

function save(uid){
    console.log("opphla")
    return({'radiation_filter': radiation_filter})
}


function load(uid, settings){
    radiation_filter = settings['radiation_filter']
    set_radiation_file()
}
export { init }
