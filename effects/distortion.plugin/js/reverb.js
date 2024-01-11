function reverb_force_change(a){
    console.log(a)
}

function force2_change(a){
    console.log('-', a)
}

var reverb_knobs;
function reverb_init(){  
    reverb_knobs = init_knobs("reverb_main", "medium", "LittlePhatty");
    add_filter(init_reverb, reverb_callback);
    reverb_knobs[0].setValue(20) 
}

var reverb_on = false;
function reverb_click(){
    
    if (reverb_on){
        $("#reverb_on").css('background-image','url(../../effects/reverb.plugin/css/images/off.png)');
        add_filter(init_reverb, reverb_callback);
        reverb_on = false;
    } else {
        $("#reverb_on").css('background-image','url(../../effects/reverb.plugin/css/images/on.png)');
        remove_filter(init_reverb, reverb_callback);
        reverb_on = true;
    }
    
}


let reverb_filter;
let reverb_buffer;
let frameCount;

async function init_reverb(audioCtx){
    // reverb_filter = audioCtx.createConvolver();
    // reverb_filter.normalize = false;
    // reverb_buffer = audioCtx.createBuffer(1, 200, audioCtx.sampleRate);
    // frameCount = audioCtx.sampleRate*2;
    // set_reverb(1)
    // reverb_filter.buffer = reverb_buffer;
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
