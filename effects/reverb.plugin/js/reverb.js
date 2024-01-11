"use strict";

function reverb_force_change(a){
    console.log(a)
}

function force2_change(a){
    console.log('-', a)
}

var reverb_knobs;
function init(){  
    reverb_knobs = init_knobs("reverb_main", "medium", "LittlePhatty");
    // add_filter(init_reverb, reverb_callback);
    // reverb_knobs[0].setValue(20) 
}

var reverb_on = false;
window.reverb_click = function(){
    
    if (~reverb_on){
        $("#reverb_on").css('background-image','url(../../effects/reverb.plugin/css/images/on.png)');
        add_filter(init_reverb, reverb_callback);
    } else {
        $("#reverb_on").css('background-image','url(../../effects/reverb.plugin/css/images/off.png)');
        remove_filter(init_reverb, reverb_callback);
    }

    reverb_on = ~reverb_on;
    
}


let reverb_filter;
let reverb_buffer;

async function init_reverb(audioCtx){
    const convolver = audioCtx.createConvolver();
    const response = await fetch("../../effects/reverb.plugin/data/Memorial Church_xcg1v2.wav");
    const arrayBuffer = await response.arrayBuffer();
    const decodedAudio = await audioCtx.decodeAudioData(arrayBuffer);
    convolver.normalize = true; // must be set before the buffer, to take effect
    convolver.buffer = decodedAudio;

    return([convolver, reverb_callback])
}


function reverb_callback(){
}

 $('#reverb_table td').click(function () {
                console.log($(this).text());
            });


export { init }
