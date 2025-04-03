'use strict';

import { bowed_instrument, parameter } from "../../../js/bowed_instrument.js?version=1.01";

let violin = new bowed_instrument("violin", 
                    {"dimension" : new parameter(2, [1, 30], '', 1,0)}, 
                    // ["E5", "A4", "D4", "G3"],
                    ["G3", "D4", "A4", "E5"],
                    { "width" : new parameter(0.02, [0, 10], 'mm', 1, 2),
                        "position" : new parameter(0.055, [0.005, 0.05], 'cm', 1e2,1),
                        "strength" : new parameter(0.5, [0.01, 8], 'N', 1, 1),
                        "bow_speed" : new parameter(0.0, [-0.2, 0.2], 'cm/s', 1e2, 2),
                        "vreg" : new parameter(0.02, [5e-4, 1e1], 'mm/s', 1e3, 2, true),
                        "mus" : new parameter(0.5, [0.1, 1], '', 1, 2),
                        "mud" : new parameter(0.2, [0.1, 1], '', 1, 2),
                        "friction_s0" : new parameter(1e4, [0.1, 1e5], 'N/m', 1e-3, 2),
                        "friction_s1" : new parameter(0.1, [0., 1], 'kg/s', 1, 2),
                        "friction_s2" : new parameter(0.0, [0., 1], 'kg/s', 1, 2),
                        // "normalise" : 1
                    },
                    30, 1.0, 2);


violin.add_microphone("acoustic")

let string_on = [-1, -1, -1, -1];
let strings_fundamental = [40, 45, 50, 55];


// Plays only first position
// Range = G3, D4, A4, E5

violin.play_note = function(note, velocity){
    let string = 4-Math.floor((note-55)/7);

    if ((string < 1) || (string > 4)){
        console.log("Bad string")
        return
    }

    let position = (note-55) % 7;

    if (inst.strings[string-1].muted) {
        inst.strings[string-1].muted = false;
    }
    set_finger(string, 2**(position/12)-1);
}

violin.stop_note = function(note, velocity){
    let string = 4-Math.floor((note-55)/7);

    if ((string < 1) || (string > 4)){
        console.log("Bad string")
        return
    }

    violin.strings[string-1].muted = true;
   
}


export { violin };

