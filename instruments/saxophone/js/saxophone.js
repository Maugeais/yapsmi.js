'use strict';

import { reed_instrument, parameter } from "../../../js/reed_instrument.js?version=1.3";

let saxophone = new reed_instrument("Selmer serie II", {'pm': new parameter(1000, [200, 7000], 'Pa', 1, 0, false), 
                                        'Fr' : new parameter(2000, [1500, 2500], 'Hz'),
                                        'Qr' : new parameter(3.3, [1.5, 5], '', 1, 2),
                                        'Pell' : new parameter(0, [0, 2000], 'kN/m²', 1e-3, 2),
                                        // 'mur' : new parameter(1.247, [0.5, 2.5], 'kg/m²'),
                                        'Kr' : new parameter(6325511, [3325511, 9325511], 'MPa/m', 10**(-6), 2),
                                        'H' : new parameter(0.6e-3, [0, 1e-3], 'mm', 10**3, 2, false),
                                        'Cp' : new parameter(0.0, [0, 1], '', 1, 2), // anche double
                                        'Rc' : new parameter(5e-3, [1e-4, 1e-2], 'mm', 1e3, 1), // rayon à la constriction anche double
                                        'Lr' : new parameter(3e-2, [0, 1e-1], 'mm', 1e3, 1), // longueur aire pour le débit d'
                                        'w' : new parameter(16e-3, [10.2e-3, 40.2e-3], 'mm', 1e3, 1),
                                        'epsilon_beating' : new parameter(1e-3, [0, 1e-2], '', 1e3, 2),
                                        'epsilon_flow' : new parameter(1e-4, [0, 1e-1], 'cm', 1e2, 2, false),
                                        'transition_time' : new parameter(0.2, [0.01, 1], 's', 1, 2),
                                        'transition_speed' : new parameter(150, [10, 200], '', 1, 2),
                                        'beta' : new parameter(1, [0.5, 2], '', 1, 2),
                                        'contact_stiffness' : new parameter(1e4, [0, 1e10], '', 1e-7, 2),
                                        'contact_alpha' : new parameter(2, [1, 3], '', 1, 1),
                                        'contact_beta' : new parameter(1, [0.5, 2], 's', 1, 2),
                                        'F0' : new parameter(0, [0, 1], '', 1, 2),
                                        'reharm' : new parameter(0, [0, 1], '', 1, 2)},
                                         2*10+2+4*2, 10, 1e4, 'B0',
                                        ['B0'],
                                        4);


export { saxophone };
