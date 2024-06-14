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
}

var radiate_on = false;

window.radiate_click = function(){
    
    if (!radiate_on){
        $("#radiate_on").css('background-image','url(../../effects/radiate.plugin/css/images/on.png)');
        // add_filter(init_radiate, radiate_callback);
    } else {
        $("#radiate_on").css('background-image','url(../../effects/radiate.plugin/css/images/off.png)');
        // remove_filter(init_radiate, radiate_callback);
    }
    radiate_on = !radiate_on;
    restart()
}

async function init_radiate(audioCtx){

    // console.log(inst.radiation_filter);

    const convolver = audioCtx.createConvolver();
    const response = await fetch(inst.radiation_filter);
    const arrayBuffer = await response.arrayBuffer();
    const decodedAudio = await audioCtx.decodeAudioData(arrayBuffer);
    convolver.normalize = true; // must be set before the buffer, to take effect
    convolver.buffer = decodedAudio;
  
    return([convolver, radiate_callback, radiate_on])
}


function radiate_callback(){       
}

function change_radiation(id){

    $("#radiate_files tr").removeClass("selected_tr");
    $("#radiate_files td").filter(function() {
        return $(this).text() == id;
    }).closest("tr").addClass("selected_tr");
        
    if (radiate_on){
        restart();
    }
}
export { init }
