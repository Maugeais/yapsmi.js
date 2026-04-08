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




let holes_names = ['G♭3(palm)', 'F3(front)', 'F3(palm)', 'E3(front)', 'E3(palm)', 'E♭3','D3', 'D♭3', 'C3', 'C3(bis)', 'B2', 'B♭2(bis)', 'B♭2', 'A2', 'A♭2', 'G2', 'G♭2(bis)', 'G♭2', 'F2', 'E2', 'E♭2', 'D2', 'D♭2', 'C2', 'C2(bis)', 'B1', 'B♭1(bis)', 'B♭1', 'A1', 'A♭1', 'G1', 'G♭1(bis)', 'G♭1', 'F1', 'E1', 'E♭1', 'D1', 'D♭1', 'C1', 'B0', 'B♭0']

holes_names.forEach((e) => ($("#saxophone_fingering").append('<option value='+e+'>'+e+'</option>')))

function reharm_change(a){
    set_controls({"reharm": a}, false)
    simulationNode.port.postMessage({property:"exec", method:"change_fingering", params:""});
}

window.change_saxophone_fingering = function(e){
    console.log(e.value)
    simulationNode.port.postMessage({property:"exec", method:"change_fingering", params:e.value});
}

let midi_to_fingering ={
    56: 'B♭0', 57: 'B0', 58: 'C1', 59: 'D♭1', 60: 'D1', 61: 'E♭1', 62: 'E1', 63: 'F1', 64: 'G♭1', 65: 'G1',
    66: 'A♭1', 67: 'A1', 68: 'B♭1', 69: 'B1', 70: 'C2', 71: 'D♭2', 72: 'D2', 73: 'E♭2', 74: 'E2', 75: 'F2',
    76: 'G♭2', 77: 'G2', 78: 'A♭2', 79: 'A2', 80: 'B♭2', 81: 'B2', 82: 'C3', 83: 'D♭3', 84: 'D3', 85: 'E♭3',
    86: 'E3(palm)', 87: 'F3(palm)', 88: 'G♭3(palm)'
}

window.play_midi_note = function(note, velocity){
    if (note in midi_to_fingering){  

        // let index = holes_names.indexOf(midi_to_fingering[note])
        // console.log(index)
        saxophone_fingering.value = midi_to_fingering[note]

        simulationNode.port.postMessage({property:"exec", method:"change_fingering", params:midi_to_fingering[note]});
        // change_radiation_file(midi_to_fingering[note])
    }
}

window.stop_midi_note = function(note, velocity){
    // console.log("stop saxophone", note, velocity)
}

current_menu["saxophone"] = 0;

// click_hole($("#G"), true) 

