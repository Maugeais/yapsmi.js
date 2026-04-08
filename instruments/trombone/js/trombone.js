'use strict';

import { brass_instrument, parameter } from "../../../js/brass_instrument.js?version=1.2";

let rho  = 1.292*273.15/(273.15+20)//1.1851
let R = 8e-3; 
let c0 = 20.05*(273.15+20)**0.5;


let trombone = new brass_instrument("Simon", {'pm': new parameter(1000, [200, 7000], 'Pa', 1, 0, false), 
                                        'Fr' : new parameter(500, [50, 600], 'Hz'),
                                        'Qr' : new parameter(3.3, [1.5, 5], '', 1, 2),
                                        // 'mur' : new parameter(1.247, [0.5, 2.5], 'kg/m²'),
                                        'Kr' : new parameter(4563705, [1e5, 60e6], 'MPa/m', 10**(-6), 2),
                                        'mur' : new parameter(1, [0.1, 10], 'kg/m', 1, 2),
                                        'H' : new parameter(0.1e-3, [-1e-3, 1e-3], 'mm', 10**3, 2, false),
                                        'Cp' : new parameter(0.0, [0, 1], '', 1, 2), // anche double
                                        'Rc' : new parameter(5e-3, [1e-4, 1e-2], 'mm', 1e3, 1), // rayon à la constriction anche double
                                        'Lr' : new parameter(0.0, [0, 1e-1], 'mm', 1e3, 1), // longueur aire pour le débit d'
                                        'w' : new parameter(0.018, [0.018, 0.018], 'mm', 1e3, 2),
                                        'epsilon_beating' : new parameter(1e-1, [1e-4, 1e-0], '', 1, 2),
                                        'epsilon_flow' : new parameter(1e0, [1e-3, 1e2], '', 1, 2),
                                        'transition_time' : new parameter(0.2, [0.01, 1], 's', 1, 2),
                                        'transition_speed' : new parameter(150, [10, 200], '', 1, 2)},
                                         2*13+2+4*2, 10, 1e4, '00',
                                        ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14'],
                                        4);
// 'vocal_tract_amplitude' : new parameter(1e7, [1e6, 1e8], 'Pa', 1e-9, 1, false, false, update_vocal_tract_impedance),
                                        // 'vocal_tract_frequency' : new parameter(240, [200, 300], 'Hz', 1, 0, false, false, update_vocal_tract_impedance),
                                        // 'vocal_tract_quality' : new parameter(8, [3, 20], '   ', 1, 1, false, false, update_vocal_tract_impedance)}, 
                                        
let Zc = rho*c0/(Math.PI*R**2); // Correcting the characteristic impedance of the resonator
trombone.characteristic_impedance = Zc;
          
export { trombone };
