"use strict";

let convolver;
let reverb_file = "../../effects/reverb-v1.1.plugin/data/Memorial Church.wav";

let convolver_uid = -1;

var reverb_knobs;
function init(uid){
    reverb_knobs = init_knobs("reverb_main", "medium", "LittlePhatty");
    add_filter(init_reverb, reverb_callback, uid);
    plugins[uid].save = save;
    plugins[uid].load = load;
    convolver_uid = uid;
}

function save(uid){
    let commands = {"reverb_file" : reverb_file};
    return(commands)
}

function load(uid, commands){
    reverb_file = commands["reverb_file"];
    let name = reverb_file.split('/');
    name = name[name.length-1].split('.')[0]
    $($("#reverb_table td:contains("+name+")")[0]).addClass("selected_reverb")
}

var reverb_on = false;
window.reverb_click = function(){
    
    if (!reverb_on){
        $("#reverb_on").css('background-image','url(../../css/images/plugin_on.png)');
    } else {
        $("#reverb_on").css('background-image','url(../../css/images/plugin_off.png)');
    }

    toggle_audio_node(convolver_uid)
    reverb_on = !reverb_on;
}

function init_reverb(audioCtx, uid){

    convolver = audioCtx.createConvolver();
    set_reverb_file();
    return({'input': convolver, 'output': convolver, 'is_on': false, 'callback': reverb_callback})
}

async function set_reverb_file(){

    if (convolver != null) {
        const response = await fetch(reverb_file);
        const arrayBuffer = await response.arrayBuffer();
        const decodedAudio = await audioCtx.decodeAudioData(arrayBuffer);
        convolver.normalize = true; // must be set before the buffer, to take effect
        convolver.buffer = decodedAudio;
    }
}

function reverb_callback(){
}

$('#reverb_table td').click(async function () {
    $("#reverb_table td").removeClass("selected_reverb");
    $(this).addClass("selected_reverb")
    reverb_file = "../../effects/reverb-v1.1.plugin/data/"+$(this).text()+".wav";
    set_reverb_file()
});



export { init }
