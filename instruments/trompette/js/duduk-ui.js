
let inst_controls = {};

window.addEventListener('load', function () {
    inst_controls = inst.get_controls();

    for (let i = 0; i < duduk_knobs.length; i++){

        let p = inst.params[duduk_knobs[i].id]
        duduk_knobs[i].setValue(100*(p.value-p.range[0])/(p.range[1]-p.range[0]))
    }
})

function pb_change(a){
    let c = inst_controls["pb"];
    inst.set_controls({"pb": a}, false)
}

function Fl_change(a){
    let c = inst_controls["Fl"];
    inst.set_controls({"Fl": a}, false)
}

function mul_change(a){
    let c = inst_controls["mul"];
    inst.set_controls({"mul": a}, false)
}

function Ql_change(a){
    let c = inst_controls["Ql"];
    inst.set_controls({"Ql": a}, false)
}

function H_change(a){
    let c = inst_controls["H"];
    inst.set_controls({"H": a}, false)
}



let holes_opened = [false, false, false, false, false, false, false, false, false, false]
let holes_names = ['Gm1', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'Ap1', 'Bp1', 'Cp1']
    // $(elmnt).parent().

let holes  = $("#duduk_control").children();

function click_hole(elmnt){
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

// $('#duduk').mousedown(function(event) {
//     switch (event.which) {
//         case 1:
//             alert('Left Mouse button pressed.');
//             break;
//         case 2:
//             alert('Middle Mouse button pressed.');
//             break;
//         case 3:
//             alert('Right Mouse button pressed.');
//             break;
//         default:
//             alert('You have a strange Mouse!');
//     }
// });


$(document).on("contextmenu", "#duduk", function(e){
    $(".pop").hide()
    $("#duduk_menu").toggle();
    return false;
 });
