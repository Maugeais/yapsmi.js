"use strict";

function init(uid){
    add_filter(init_radiate, radiate_callback, uid);
    inst.add_radiation_callback(change_radiation);

    let html = ''
    Object.keys(inst.radiation_filters).forEach(element => {
        html += "<tr><td>"+element+"</td></tr>"
    });
    $("#radiate_files").html(html);
    $("#radiate_files td").click(function(){ inst.radiation_filter = inst.radiation_filters[this.innerText]; change_radiation(this.innerText) })

    plugins[uid].save = save;
    plugins[uid].load = load;
}

window.radiate_click = function(){
    
    if (!window.radiate_on){
        $("#radiate_on").css('background-image','url(../../css/images/plugin_on.png)');
        // add_filter(init_radiate, radiate_callback);
    } else {
        $("#radiate_on").css('background-image','url(../../css/images/plugin_off.png)');
        // remove_filter(init_radiate, radiate_callback);
    }
    radiate_on = !radiate_on;

    inst.radiate_status(radiate_on)

    restart()

}

let convolver;

async function init_radiate(audioCtx){

    convolver = audioCtx.createConvolver();
    set_radiation_file()
  
    return([convolver, radiate_callback, radiate_on])
}

async function set_radiation_file(){
    const response = await fetch(inst.radiation_filter);
    const arrayBuffer = await response.arrayBuffer();
    const decodedAudio = await audioCtx.decodeAudioData(arrayBuffer);
    convolver.normalize = true; // must be set before the buffer, to take effect
    convolver.buffer = decodedAudio;
}

function radiate_callback(){       
}

async function change_radiation(id){

    set_radiation_file()
                
    $("#radiate_files tr").removeClass("selected_tr");
    $("#radiate_files td").filter(function() {
        return $(this).text() == id;
    }).closest("tr").addClass("selected_tr");
  

}

function save(uid){
    console.log("opphla")
    return({'radiation_filter': inst.radiation_filter})
}


function load(uid, settings){
    inst.radiation_filter = settings['radiation_filter']
    set_radiation_file()
}
export { init }
