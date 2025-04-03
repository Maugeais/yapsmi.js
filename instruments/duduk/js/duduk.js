'use strict';

import { wind_instrument, parameter } from "../../../js/wind_instrument.js?version=1.1";

let rho  = 1.292*273.15/(273.15+20)//1.1851
let R = 0.56; // Rayon à l'embouchure, très grand à cause de la normalisation des impédances (*1e3)
let c0 = 20.05*(273.15+20)**0.5;


let w = 0.018;

let duduk = new wind_instrument("Simon", {'pm': new parameter(1000, [200, 7000], 'Pa', 1, 0, false), 
                                        'Fr' : new parameter(500, [200, 800], 'Hz'),
                                        'Qr' : new parameter(3.3, [1.5, 5], '', 1, 2),
                                        // 'mur' : new parameter(1.247, [0.5, 2.5], 'kg/m²'),
                                        'Kr' : new parameter(15e6, [1e6, 60e6], 'MPa/m', 10**(-6), 2),
                                        'H' : new parameter(0.3e-3, [0, 1e-3], 'mm', 10**3, 2, false),
                                        'Cp' : new parameter(0.0, [0, 1], '', 1, 2), // anche double
                                        'Rc' : new parameter(5e-3, [1e-4, 1e-2], 'mm', 1e3, 1), // rayon à la constriction anche double
                                        'Lr' : new parameter(0.006, [0, 1e-1], 'mm', 1e3, 1), // longueur aire pour le débit d'
                                        'epsilon_beating' : new parameter(1e-2, [1e-4, 1e-0], '', 1, 2),
                                        'epsilon_flow' : new parameter(1e-6, [1e-7, 1e-1], '', 1, 2),
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
                                        
let Zc = rho*c0/(Math.PI*R**2); //Impedance caracteristique du résonateur
duduk.characteristic_impedance = Zc;
console.log("Characteristic impedance = ", Zc)
          
// THe state vector is in the complex form: h, h', real(p1), image(p1), ...

let epsilon = 1e-6;
let der = new Float32Array(duduk.dim);

function theta(h, q = 1.0){
    // if (h > 0) return h;
    // return 0;
    let eta = duduk.params["epsilon_beating"].value*duduk.params['H'].value**2;
    let reg = (h+(h**2+0.5*eta)/((h**2)+eta)**0.5)/2;
    return(reg**q);
}

function regularized_flow(deltap, Pc){
    let epsilon = duduk.params["epsilon_flow"].value;
    return((1+epsilon)*deltap/(deltap**2+Pc**2*epsilon)**0.25);
}

duduk.model = function(t, x){ 
    
    let p = 0;
    let h = x[0];
    let u = 0;
    let Pc = duduk.params['H'].value*duduk.params['Kr'].value;
    let omegar = 2*Math.PI*duduk.params['Fr'].value;
    let S = w*theta(h, duduk.params['beta'].value);   

    let alpha = (Math.PI*duduk.params['Rc'].value**2);
    alpha = duduk.params['Cp'].value*(S/alpha)**2;

    if (1-alpha < 1e-2){
        alpha = 1-1e-2;
        duduk.declare_error("Problem with constriction radius")
    }

    let Fc = (1-duduk.params['contact_beta'].value/duduk.params['H'].value*x[1])*duduk.params['contact_stiffness'].value*theta(-x[0])**duduk.params['contact_alpha'].value;
    if (duduk.transitioning_impedance){
        duduk.transition_impedance();
    }

    for (let i=0; i < duduk.impedances_dim+duduk.vocal_tract_dim; i++) { // ok
        p += 2*x[2*i+2];
    }
        
    // Expression exacte du débit
    u = S*(2/(rho*(1-alpha)))**0.5*regularized_flow(duduk.params['pm'].value-p, Pc)+w*duduk.params['Lr'].value*x[1];
    
    // // Expression régularisée du débit
    // if (h > 0){
    //     u = w*h*(2/rho)**0.5*(duduk.params['pm'].value-p)/((duduk.params['pm'].value-p)**2+Pc**2*epsilon)**0.25;
    // }
    // u = w*theta(h)*regularized_flow(2*(duduk.params['pm'].value-p)/rho);
    // if (duduk.params['pm'].value > p){
    //     u = w*theta(h)*(2*(duduk.params['pm'].value-p)/rho)**0.5;
    // } else {
    //     u = -w*theta(h)*(2*(p-duduk.params['pm'].val ue)/rho)**0.5;
    // }


    // p -= Cp*rho*(u/Rc)**2/2;

    
    der[0] = x[1];
    der[1] = -omegar/duduk.params['Qr'].value*x[1]+omegar**2*(duduk.params['H'].value-x[0]) - (duduk.params['pm'].value-p)*omegar**2/duduk.params['Kr'].value+Fc; // ok
            
    // Adding modes for the vocal tract
    for (let i=0; i < duduk.vocal_tract_dim; i++){
        
        der[2*i+2] = duduk.S[i].re*x[2*i+2]-duduk.S[i].im*x[2*i+3]-u*duduk.C[i].re;
        der[2*i+3] = duduk.S[i].im*x[2*i+2]+duduk.S[i].re*x[2*i+3]-u*duduk.C[i].im;
    }

    // Adding modes for the duduk
    for (let i=duduk.vocal_tract_dim; i < duduk.impedances_dim+duduk.vocal_tract_dim; i++){
        
        der[2*i+2] = duduk.S[i].re*x[2*i+2]-duduk.S[i].im*x[2*i+3]+Zc*u*duduk.C[i].re;
        der[2*i+3] = duduk.S[i].im*x[2*i+2]+duduk.S[i].re*x[2*i+3]+Zc*u*duduk.C[i].im;
    }
        
    return(der)
}



duduk.output = function(outputBuffer){
    if (this.radiation_on){
         this.pressure_derivative_output(outputBuffer);
    } else {
        this.pressure_output(outputBuffer);
    }
}



let midi_to_fingering ={55: "Gm1", 57: "A", 59: "B", 60: "C", 62: "D", 64: "E", 65: "F", 67: "G", 69: "Ap1", 71: "Bp1", 72: "Cp1"}

duduk.play_note = function(note, velocity){
    if (note in midi_to_fingering){
        let index = holes_names.indexOf(midi_to_fingering[note])
        set_hole_states(index)

        // click_hole($(midi_to_fingering[note]), false)
        duduk.change_fingering(midi_to_fingering[note])
        // console.log(duduk.fingering)
    }
}

duduk.stop_note = function(note, velocity){
    // console.log("stop duduk", note, velocity)
}
export { duduk };
