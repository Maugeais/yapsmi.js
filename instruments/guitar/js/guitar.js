'use strict';

import { plucked_instrument, parameter } from "../../../js/plucked_instrument.js";

let guitar = new plucked_instrument("Stratocaster", 
                    {"dimension" : new parameter(20, [1, 30], 'cm', 1,0)}, 
                    ["E2", "A2", "D3", "G3", "B3", "E4"],
                    50, 4.0, 2);

// await guitar.init()
guitar.add_microphone("acoustic")


let string_on = [-1, -1, -1, -1, -1, -1];
let strings_fundamental = [40, 45, 50, 55, 59, 64];

guitar.play_note = function(params){
    let string_fret = [0, 0, 0, 0, 0, 0];
    for (let s=0; s < 6; s++){

       string_fret[s] = params["note"]-strings_fundamental[s];
       if ((string_fret[s]  < 0) || (string_fret[s] > 21) || (string_on[s] >= 0)){
        string_fret[s] = 100;
       }
    }
    // Play the note closest to the neck
    let s = string_fret.indexOf(Math.min.apply(Math, string_fret))
    if (string_fret[s] == 100){
        console.log("This note requires a string that is already being played")
        return
    }
    // set_finger(s+1, string_fret[s]);
    guitar.strings[s].change_fingering(Math.pow(2, -string_fret[s]/12));
    string_on[s] = params["note"];
    guitar.strings[s].pluck(0.01, params["velocity"]/100);
}

guitar.stop_note = function(params){
    let s = string_on.indexOf(params["note"]);
    string_on[s] = -1;
    // set_finger(s+1, -1);    
}


export { guitar };

