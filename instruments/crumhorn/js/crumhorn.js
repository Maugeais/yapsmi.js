'use strict';

import { reed_instrument, parameter } from "../../../js/reed_instrument.js?version=1.1";

let crumhorn = new reed_instrument("Simon", {'pm': new parameter(1000, [200, 7000], 'Pa', 1, 0, false), 
                                        'Fr' : new parameter(1051, [1000, 2000], 'Hz'),
                                        'Qr' : new parameter(3.3, [1.5, 5], '', 1, 2),
                                        // 'mur' : new parameter(1.247, [0.5, 2.5], 'kg/m²'),
                                        'Kr' : new parameter(6325511, [3325511, 9325511], 'MPa/m', 10**(-6), 2),
                                        'H' : new parameter(0.42e-3, [0, 1e-3], 'mm', 10**3, 2, false),
                                        'Cp' : new parameter(0.0, [0, 1], '', 1, 2), // anche double
                                        'Rc' : new parameter(5e-3, [1e-4, 1e-2], 'mm', 1e3, 1), // rayon à la constriction anche double
                                        'Lr' : new parameter(0.002, [0, 1e-1], 'mm', 1e3, 1), // longueur aire pour le débit d'
                                        'w' : new parameter(20.2e-3, [10.2e-3, 40.2e-3], 'mm', 1e3, 1),
                                        'epsilon_beating' : new parameter(1e-3, [1e-4, 1e-0], '', 1, 2),
                                        'epsilon_flow' : new parameter(0.7, [1e-3, 1e1], '', 1, 2),
                                        'transition_time' : new parameter(0.2, [0.01, 1], 's', 1, 2),
                                        'transition_speed' : new parameter(150, [10, 200], '', 1, 2),
                                        'beta' : new parameter(1, [0.5, 2], '', 1, 2),
                                        'contact_stiffness' : new parameter(1e4, [0, 1e10], '', 1e-7, 2),
                                        'contact_alpha' : new parameter(2, [1, 3], '', 1, 1),
                                        'contact_beta' : new parameter(1, [0.5, 2], 's', 1, 2)},
                                         2*10+2+4*2, 10, 10.0, 0.001, 'G',
                                        ['G'],
                                        4);


export { crumhorn };
