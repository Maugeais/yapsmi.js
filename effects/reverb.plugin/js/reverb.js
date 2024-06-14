"use strict";


function reverb_force_change(a){
    console.log(a)
}

function force2_change(a){
    console.log('-', a)
}

var reverb_knobs;
function init(uid){
    reverb_knobs = init_knobs("reverb_main", "medium", "LittlePhatty");
    add_filter(init_reverb, reverb_callback, uid);
    // reverb_knobs[0].setValue(20) 
    plugins[uid].save = save;
    plugins[uid].load = load;
}

function save(){
    let commands = {"reverb_file" : reverb_file};
    return(commands)
}

function load(commands){
    // reverb_file = commands["reverb_file"];
    console.log(commands)
}

var reverb_on = false;
window.reverb_click = function(){
    
    if (!reverb_on){
        $("#reverb_on").css('background-image','url(../../effects/reverb.plugin/css/images/on.png)');
        // add_filter(init_reverb, reverb_callback);
    } else {
        $("#reverb_on").css('background-image','url(../../effects/reverb.plugin/css/images/off.png)');
        // remove_filter(init_reverb, reverb_callback);
    }

    reverb_on = !reverb_on;
    restart()
}


let reverb_buffer;
let reverb_file = "../../effects/reverb.plugin/data/Memorial Church.wav";

async function init_reverb(audioCtx){

    const convolver = audioCtx.createConvolver();
    const response = await fetch(reverb_file);
    const arrayBuffer = await response.arrayBuffer();
    const decodedAudio = await audioCtx.decodeAudioData(arrayBuffer);
    convolver.normalize = true; // must be set before the buffer, to take effect
    convolver.buffer = decodedAudio;

    return([convolver, reverb_callback, reverb_on])
}


function reverb_callback(){
}

 $('#reverb_table td').click(function () {
    $("#reverb_table td").removeClass("selected_reverb");
    $(this).addClass("selected_reverb")
    reverb_file = "../../effects/reverb.plugin/data/"+$(this).text()+".wav";
    restart();
});



export { init }
