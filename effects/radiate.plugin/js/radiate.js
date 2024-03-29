"use strict";

function radiate_force_change(a){
    // console.log(a)
}

function force2_change(a){
    // console.log('-', a)
}



var radiate_knobs;
function init(uid){
//    radiate_knobs = init_knobs("radiate_main", "medium", "LittlePhatty");
    add_filter(init_radiate, radiate_callback, uid);
    inst.add_fingerging_callback(change_fingering);
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

let radiate_filter;
let radiate_buffer;

async function init_radiate(audioCtx){

    console.log(inst.filter);

    const convolver = audioCtx.createConvolver();
    const response = await fetch(inst.filter);
    const arrayBuffer = await response.arrayBuffer();
    const decodedAudio = await audioCtx.decodeAudioData(arrayBuffer);
    convolver.normalize = true; // must be set before the buffer, to take effect
    convolver.buffer = decodedAudio;
  
    return([convolver, radiate_callback, radiate_on])
}


function radiate_callback(){       
}

function change_fingering(fingering){
    $("#radiate_note").text(inst.fingering);
    if (radiate_on){
        // console.log("toto", radiate_on)
        restart();
    }
}
export { init }
