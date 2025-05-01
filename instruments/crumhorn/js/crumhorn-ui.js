let value_Fr = -1;

function Fr_change(a){
    
    if ((value_Fr > 0) && ($("#constant_mass").is( ":checked"))){
        
        let Kr = global_controls['instrument']["Kr"].currentValue/100*(instrument_controls["Kr"].range[1]-instrument_controls["Kr"].range[0])+instrument_controls["Kr"].range[0];
        let Fnew = a/100*(instrument_controls["Fr"].range[1]-instrument_controls["Fr"].range[0])+instrument_controls["Fr"].range[0];

        let Knew = (Fnew/value_Fr)**2*Kr;
        let b = 100*(Knew-instrument_controls["Kr"].range[0])/(instrument_controls["Kr"].range[1]-instrument_controls["Kr"].range[0])

        if ((b > 100) || (b < 0)){
            message("Warning, stiffness extreme value has been reached")
        } else {
            global_controls['instrument']["Kr"].setValue(b)
        }
    }
    
    try{
        value_Fr = a/100*(instrument_controls["Fr"].range[1]-instrument_controls["Fr"].range[0])+instrument_controls["Fr"].range[0];
        if (value_Fr < 0){
            value_Fr = instrument_controls["Fr"].value
        }
    } catch{}

    set_controls({"Fr": a}, false)
}




let holes_opened = [false, false, false, false, false, false, false, false, false, false]
let holes_names = ['Gm1', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'Ap1', 'Bp1', 'Cp1']
    // $(elmnt).parent().

let holes  = $("#crumhorn_control").children();

// function click_hole(elmnt, init=false){
//     // $(elmnt).parent().
//     let index = $(elmnt).index();
//     let state = holes_opened[index]

//     set_hole_states(index);

//     if (init){
//         //holes_opened[index] = false;
//         $(holes[index]).css("background-color", "red")
//         return
//     }

//     if (state){
//         $(holes[index]).css("background-color", "red")
//         holes_opened[index] = false;
//         // inst.change_fingering(holes_names[index])
//         simulationNode.port.postMessage({property:"exec", method:"change_fingering", params:holes_names[index]});
//         change_radiation_file(holes_names[index])
//     } else {
//         $(holes[index]).css("background-color", "black")
//         holes_opened[index] = true;
//         // inst.change_fingering(holes_names[index+1])
//         simulationNode.port.postMessage({property:"exec", method:"change_fingering", params:holes_names[index+1]});
//         change_radiation_file(holes_names[index+1])
//     }
// }

// function set_hole_states(index){
//     for (let i = 0; i < index; i++){
//         holes_opened[i] = true;
//         $(holes[i]).css("background-color", "black")
//     }

//     for (let i = index+1-1; i < holes_opened.length; i++){
//         holes_opened[i] = false;
//         $(holes[i]).css("background-color", "red")
//     }
// }

// $(document).on("contextmenu", "#crumhorn", function(e){
//     // $(".pop").hide()
//     $("#crumhorn_menu").toggle().css('top', e.pageY).css('left', e.pageX);
//     return false;
//  });


let midi_to_fingering ={55: "Gm1", 57: "A", 59: "B", 60: "C", 62: "D", 64: "E", 65: "F", 67: "G", 69: "Ap1", 71: "Bp1", 72: "Cp1"}

// window.play_midi_note = function(note, velocity){
//     if (note in midi_to_fingering){  

//         let index = holes_names.indexOf(midi_to_fingering[note])
//         set_hole_states(index)

//         simulationNode.port.postMessage({property:"exec", method:"change_fingering", params:midi_to_fingering[note]});
//         change_radiation_file(midi_to_fingering[note])
//     }
// }

// window.stop_midi_note = function(note, velocity){
//     // console.log("stop crumhorn", note, velocity)
// }

current_menu["crumhorn"] = 0;

// click_hole($("#G"), true) 

