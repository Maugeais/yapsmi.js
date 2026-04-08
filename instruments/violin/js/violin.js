'use strict';

import { bowed_instrument, parameter } from "../../../js/bowed_instrument.js?version=1.2";

let violin = new bowed_instrument("violin", 
                    {"dimension" : new parameter(50, [1, 100], '', 1,0)}, 
                    // ["E5", "A4", "D4", "G3"],
                    ["G3", "D4", "A4", "E5"],
                    { "theta" : new parameter(90, [0, 90], '°', 1, 0),
                        "bow_width" : new parameter(0.02, [0, 0.1], 'mm', 1, 2),
                        "position" : new parameter(0.055, [0.005, 0.05], 'cm', 1e2,1),
                        "bow_strength" : new parameter(0.5, [0.01, 3], 'N', 1, 1),
                        "bow_speed" : new parameter(0.12, [-0.2, 0.2], 'cm/s', 1e2, 2),
                        "bow_vreg" : new parameter(0.04, [5e-4, 1e1], 'cm/s', 1e2, 2, true),
                        "mus" : new parameter(0.5, [0.1, 1], '', 1, 2),
                        "mud" : new parameter(0.2, [0.1, 1], '', 1, 2),
                        "friction_s0" : new parameter(1e4, [1e2, 2e4], 'N/m', 1e-3, 2, true),
                        "friction_s1" : new parameter(0.1, [0.01, 1], 'kg/s', 1, 2, true),
                        "friction_s2" : new parameter(0.01, [0.01, 1], 'kg/s', 1, 2, true),
                        // "normalise" : 1
                    },
                    100, 10.0);


// violin.add_microphone("acoustic")



export { violin };

