'use strict';

import { reed_instrument, parameter } from "../../../js/reed_instrument.js?version=1.2";

let rho  = 1.292*273.15/(273.15+20)//1.1851
let R = 0.56; // Rayon à l'embouchure, très grand à cause de la normalisation des impédances (*1e3)
let c0 = 20.05*(273.15+20)**0.5;


let duduk = new reed_instrument("Simon", {'pm': new parameter(1000, [200, 7000], 'Pa', 1, 0, false), 
                                        'Fr' : new parameter(500, [200, 800], 'Hz'),
                                        'Qr' : new parameter(3.3, [1.5, 5], '', 1, 2),
                                        // 'mur' : new parameter(1.247, [0.5, 2.5], 'kg/m²'),
                                        'Kr' : new parameter(15e6, [1e6, 60e6], 'MPa/m', 10**(-6), 2),
                                        'H' : new parameter(0.3e-3, [0, 1e-3], 'mm', 10**3, 2, false),
                                        'Cp' : new parameter(0.0, [0, 1], '', 1, 2), // anche double
                                        'Rc' : new parameter(5e-3, [1e-4, 1e-2], 'mm', 1e3, 1), // rayon à la constriction anche double
                                        'Lr' : new parameter(0.006, [0, 1e-1], 'mm', 1e3, 1), // longueur aire pour le débit d'
                                        'w' : new parameter(0.018, [0.018, 0.018], 'mm', 1e3, 2),
                                        'epsilon_beating' : new parameter(1e-1, [1e-4, 1e-0], '', 1, 2),
                                        'epsilon_flow' : new parameter(1e0, [1e-3, 1e1], '', 1, 2),
                                        'transition_time' : new parameter(0.2, [0.01, 1], 's', 1, 2),
                                        'transition_speed' : new parameter(150, [10, 200], '', 1, 2),
                                        'beta' : new parameter(1, [0.5, 2], '', 1, 2),
                                        'contact_stiffness' : new parameter(1e4, [0, 1e10], '', 1e-7, 2),
                                        'contact_alpha' : new parameter(2, [1, 3], '', 1, 1),
                                        'contact_beta' : new parameter(1, [0.5, 2], 's', 1, 2)},
                                         2*10+2+4*2, 10, 10.0, 0.001, 'C',
                                        ['G-1', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'A+1', 'B+1', 'C+1'],
                                        4);
// 'vocal_tract_amplitude' : new parameter(1e7, [1e6, 1e8], 'Pa', 1e-9, 1, false, false, update_vocal_tract_impedance),
                                        // 'vocal_tract_frequency' : new parameter(240, [200, 300], 'Hz', 1, 0, false, false, update_vocal_tract_impedance),
                                        // 'vocal_tract_quality' : new parameter(8, [3, 20], '   ', 1, 1, false, false, update_vocal_tract_impedance)}, 
                                        
let Zc = rho*c0/(Math.PI*R**2); // Correcting the characteristic impedance of the resonator
duduk.characteristic_impedance = Zc;
          
export { duduk };
