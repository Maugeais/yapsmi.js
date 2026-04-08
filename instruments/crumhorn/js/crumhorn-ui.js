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




let holes_names = ['F', 'G', 'A♭', 'A', 'B♭', 'B', 'C', 'C♯', 'D', 'E♭', 'E', 'F1', 'F1♯', 'G1', 'G1♯', 'A1', 'B1♭']

holes_names.forEach((e) => ($("#crumhorn_fingering").append('<option value='+e+'>'+e+'</option>')))

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

window.change_crumhorn_fingering = function(e){
    console.log(e.value)
    simulationNode.port.postMessage({property:"exec", method:"change_fingering", params:e.value});
}

let midi_to_fingering ={41: 'F', 43: 'G', 44: 'A♭', 45: 'A', 46: 'B♭', 47: 'B', 48: 'C', 49: 'C♯', 50: 'D', 51: 'E♭', 52: 'E', 53: 'F1', 54: 'F1♯', 55: 'G1', 56: 'G1♯', 57: 'A1', 58: 'B1♭'}

window.play_midi_note = function(note, velocity){
    if (note in midi_to_fingering){  

        // let index = holes_names.indexOf(midi_to_fingering[note])
        // console.log(index)
        crumhorn_fingering.value = midi_to_fingering[note]

        simulationNode.port.postMessage({property:"exec", method:"change_fingering", params:midi_to_fingering[note]});
        // change_radiation_file(midi_to_fingering[note])
    }
}

window.stop_midi_note = function(note, velocity){
    // console.log("stop crumhorn", note, velocity)
}

current_menu["crumhorn"] = 0;

// click_hole($("#G"), true) 

