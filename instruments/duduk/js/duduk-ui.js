
let inst_controls = {};

window.addEventListener('load', async function () {
    inst_controls = inst.get_controls();
    for (let i = 0; i < inst.knobs.length; i++){
        let p = inst.params[inst.knobs[i].id]
        inst.knobs[i].setValue(p.to_percentage()) //100*(p.value-p.range[0])/(p.range[1]-p.range[0]))
    }
})

function pm_change(a){
    inst.set_controls({"pm": a}, false, is_shiftkey_pressed)
}

function Fr_change(a){
    inst.set_controls({"Fr": a}, false, is_shiftkey_pressed)
}

function mur_change(a){
    inst.set_controls({"mur": a}, false, is_shiftkey_pressed)
}

function Kr_change(a){
    inst.set_controls({"Kr": a}, false, is_shiftkey_pressed)
}

function Qr_change(a){
    inst.set_controls({"Qr": a}, false, is_shiftkey_pressed)
}

function H_change(a){
    inst.set_controls({"H": a}, false, is_shiftkey_pressed)
}

function Cd_change(a){
    inst.set_controls({"Cd": a}, false, is_shiftkey_pressed)
}



let holes_opened = [false, false, false, false, false, false, false, false, false, false]
let holes_names = ['Gm1', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'Ap1', 'Bp1', 'Cp1']
    // $(elmnt).parent().

let holes  = $("#duduk_control").children();

function click_hole(elmnt, init=false){
    // $(elmnt).parent().
    let index = $(elmnt).index();

    for (let i = 0; i < index; i++){
        holes_opened[i] = true;
        $(holes[i]).css("background-color", "black")
    }

    for (let i = index+1; i < holes_opened.length; i++){
        holes_opened[i] = false;
        $(holes[i]).css("background-color", "red")
    }

    if (init){
        //holes_opened[index] = false;
        $(holes[index]).css("background-color", "red")
        return
    }

    if (holes_opened[index]){
        $(holes[index]).css("background-color", "red")
        holes_opened[index] = false;
        inst.change_fingering(holes_names[index])
    } else {
        $(holes[index]).css("background-color", "black")
        holes_opened[index] = true;
        inst.change_fingering(holes_names[index+1])
    }
}

$(document).on("contextmenu", "#duduk", function(e){
    // $(".pop").hide()
    $("#duduk_menu").toggle().css('top', e.pageY).css('left', e.pageX);
    return false;
 });

currentMenu["duduk"] = 0;

click_hole($("#C"), true) 

