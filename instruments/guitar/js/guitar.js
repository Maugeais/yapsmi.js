'use strict';

import { plucked_instrument, parameter } from "../../../js/plucked_instrument.js?version=1.2";

let guitar = new plucked_instrument("Stratocaster", 
                    {"dimension" : new parameter(25, [1, 50], '', 1,0),}, 
                    ["E2", "A2", "D3", "G3", "B3", "E4"],
                    50, 20.0, 3.0);

// await guitar.init()
// guitar.add_microphone("bridge")
// guitar.add_microphone("bridge")



export { guitar };

