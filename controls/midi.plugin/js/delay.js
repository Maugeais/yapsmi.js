function delay_force_change(a){
    console.log(a)
}

function force2_change(a){
    console.log('-', a)
}

var delay_knobs;
function delay_init(){  
    delay_knobs = init_knobs("delay_main", "medium", "LittlePhatty");
    delay_knobs[0].setValue(20) 
}

var delay_on = false;
function delay_click(){
    
    if (delay_on){
        $("#delay_on").css('background-image','url(../../effects/delay/css/images/off.png)');
        delay_on = false;
    } else {
        $("#delay_on").css('background-image','url(../../effects/delay/css/images/on.png)');
        delay_on = true;
    }
    
    console.log('hpula 2');
}
