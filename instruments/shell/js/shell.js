'use strict';

import { shell_instrument, parameter } from "../../../js/shell_instrument.js?version=1.0";

let shell = new shell_instrument("aluminium", 
                    {
                        "dimension" : new parameter(170, [1, 200], '', 1,0),
                        "density" : new parameter(2660, [10, 5000], 'kg.m⁻³ ', 1,0),
                        "length" : new parameter(6e-1, [1e-1, 1e0], 'cm', 1e2, 1),
                        "width" : new parameter(4e-1, [1e-1, 1e0], 'cm', 1e2, 1),
                        "thickness" : new parameter(2e-3, [1e-3, 1e-1], 'cm', 1e2,1),
                        "young_x" : new parameter(69e9, [10.9e8, 10.9e10], 'Gpa', 1e-9,1),
                        "poisson_x" : new parameter(0.33, [0.1, 0.9], '', 1,3),      
                        "young_y" : new parameter(69e9, [10.9e8, 10.9e10], 'Gpa', 1e-9,1),
                        "poisson_y" : new parameter(0.1, [0.1, 0.9], '', 1,3),      
                        "shear" : new parameter(10.9e9, [10.9e8, 10.9e10], 'Gpa', 1e-9,1),
                        "curvature" : new parameter(0, [0, 1], 'm⁻¹', 1,3, false),                     
                    },
                    200, 20.0, 3.0);

export { shell };

