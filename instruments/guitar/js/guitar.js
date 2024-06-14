'use strict';

import { plucked_instrument, parameter } from "../../../js/plucked_instrument.js";

let guitar = new plucked_instrument("Stratocaster", 
                    ["D'Addario/nylon/E2", "D'Addario/nylon/A2", "D'Addario/nylon/D3", "D'Addario/nylon/G3", "D'Addario/nylon/B3", "D'Addario/nylon/E4"],
                    50, 2, 2);

guitar.fret_positions = [2.54, 9.297, 16.05, 22.377, 28.441, 34.262, 39.741, 44.981, 49.90, 54.664, 59.003, 63.317, 67.243, 71.058, 74.668, 78.081, 81.375, 84.342, 87.183, 90.014, 92.555, 95.033, 97.367];

await guitar.init()
guitar.add_microphone("acoustic")


let string_on = [-1, -1, -1, -1, -1, -1];
let strings_fundamental = [40, 45, 50, 55, 59, 64];

guitar.play_note = function(note, velocity){
    console.log(velocity)
    let string_fret = [0, 0, 0, 0, 0, 0];
    for (let s=0; s < 6; s++){

       string_fret[s] = note-strings_fundamental[s];
       if ((string_fret[s]  < 0) || (string_fret[s] > 21) || (string_on[s] >= 0)){
        string_fret[s] = 100;
       }
    }
    // Play the note closest to the neck
    let s = string_fret.indexOf(Math.min.apply(Math, string_fret))
    if (string_fret[s] == 100){
        message("This note requires a string that is already being played")
        return
    }
    set_finger(s+1, string_fret[s]);
    string_on[s] = note;
    guitar.strings[s].pluck(0.1);
}

guitar.stop_note = function(note, velocity){
    let s = string_on.indexOf(note);
    string_on[s] = -1;
    // set_finger(s+1, -1);    
}


export { guitar };

