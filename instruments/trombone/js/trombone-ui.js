// let value_Fr = -1;

// function Fr_change(a){
    
//     if ((value_Fr > 0) && ($("#constant_mass").is( ":checked"))){
        
//         let Kr = global_controls['instrument']["Kr"].currentValue/100*(instrument_controls["Kr"].range[1]-instrument_controls["Kr"].range[0])+instrument_controls["Kr"].range[0];
//         let Fnew = a/100*(instrument_controls["Fr"].range[1]-instrument_controls["Fr"].range[0])+instrument_controls["Fr"].range[0];

//         let Knew = (Fnew/value_Fr)**2*Kr;
//         let b = 100*(Knew-instrument_controls["Kr"].range[0])/(instrument_controls["Kr"].range[1]-instrument_controls["Kr"].range[0])

//         if ((b > 100) || (b < 0)){
//             message("Warning, stiffness extreme value has been reached")
//         } else {
//             global_controls['instrument']["Kr"].setValue(b)
//         }
        
//     }
    
//     try{
//         value_Fr = a/100*(instrument_controls["Fr"].range[1]-instrument_controls["Fr"].range[0])+instrument_controls["Fr"].range[0];
//         if (value_Fr < 0){
//             value_Fr = instrument_controls["Fr"].value
//         }
//     } catch{}

//     set_controls({"Fr": a}, false)
// }

slide_position_names = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14'],

window.change_slide_position = function(e){
    let position = 14*$(e).position().left/356;
    simulationNode.port.postMessage({property:"exec", method:"change_fingering", params:slide_position_names[Math.round(position)]});
}

// $(document).on("contextmenu", "#trombone", function(e){
//     // $(".pop").hide()
//     $("#trombone_menu").toggle().css('top', e.pageY).css('left', e.pageX);
//     return false;
//  });


let midi_to_fingering ={55: "Gm1", 57: "A", 59: "B", 60: "C", 62: "D", 64: "E", 65: "F", 67: "G", 69: "Ap1", 71: "Bp1", 72: "Cp1"}

window.play_midi_note = function(note, velocity){
    if (note in midi_to_fingering){  

        let index = holes_names.indexOf(midi_to_fingering[note])
        set_hole_states(index)

        simulationNode.port.postMessage({property:"exec", method:"change_fingering", params:midi_to_fingering[note]});
        change_radiation_file(midi_to_fingering[note])
    }
}

window.stop_midi_note = function(note, velocity){
    // console.log("stop trombone", note, velocity)
}

current_menu["trombone"] = 0;


