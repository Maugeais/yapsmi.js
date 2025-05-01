'use strict';

import { plucked_instrument, parameter } from "../../../js/plucked_instrument.js";

let guitar = new plucked_instrument("Stratocaster", 
                    {"dimension" : new parameter(45, [1, 50], '', 1,0),}, 
                    ["E2", "A2", "D3", "G3", "B3", "E4"],
                    50, 4.0, 0.1);

// await guitar.init()
guitar.add_microphone("acoustic")


export { guitar };

