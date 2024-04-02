'use strict';

import { wind_instrument, parameter } from "../../../js/wind_instrument.js";

//#define rho 1.1851
//#define R 0.0135 //0.012 // Rayon à l'embouchure
//#define c0 346.19
let rho  = 1.292*273.15/(273.15+20)//1.1851
let R = 0.008; // Rayon à l'embouchure
let c0 = 20.05*(273.15+20)^0.5;

let Zc = 1/(math.pi*R*R); //Impedance caracteristique du résonateur

// fonction de heavisyde
function theta(x){
    if (x > 0){
        return(x);
    } else {
        return(0);
    }
}


let omegal = 2*math.pi*600;
let Ql = 3;
let mu  = 2.14;
let H = 0.3e-3;
let w = 0.018;
let q = 1;

let duduk = new wind_instrument("Simon", {'pb': new parameter(1000, [100, 2500], 'Pa'), 
                                        'Fl' : new parameter(480, [200, 800], 'Hz'),
                                        'Ql' : new parameter(3.3, [1.5, 5], ''),
                                        'mul' : new parameter(1.52, [0.5, 2.5], 'g/m²'),
                                        'H' : new parameter(0.3e-3, [0, 1e-2], 'μm')}, 2*10+2, 10, 9000, 1/9000, 'A',
                                        ['G-1', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'A+1', 'B+1', 'C+1']);

let pb = 3000;

// Le vecteur d'etat est sous la forme complexe : h, h', real(p1), image(p1), ...
let pnR = new Float32Array(duduk.dim);
let pnI = new Float32Array(duduk.dim);

let epsilon = 1e-6;
let der = new Float32Array(duduk.dim);

duduk.model = function(t, x){
    
    let p = 0;
    let h = x[0];
    let u;

    if (duduk.transitioning_impedance){
        duduk.transition_impedance(t);
    }
    
    //H = 7.4e-2/(226.03604058517865);
        
    for (let i=0; i < (duduk.dim-2)/2; i++) { // ok
        pnR[i] = x[2*i+2];
        pnI[i] = x[2*i+3];
        p += 2*x[2*i+2];
    }
        
    // Expression exacte du débit
    
    // Expression régularisée du débit
    u = w*theta(h)*(2/rho)**0.5*(pb-p)/((-pb+p)**2+epsilon*pb**2)**0.25;
    
    der[0] = x[1];
    der[1] = -omegal/Ql*x[1]-omegal**2*(x[0]-H) - (pb-p)/mu; // ok
            
    for (let i=0; i < (duduk.dim-2)/2; i++){
        
        der[2*i+2] = duduk.S[i].re*pnR[i]-duduk.S[i].im*pnI[i]+Zc*u*duduk.C[i].re; //math.multiply(S[i], pn[i]), math.multiply(Zc*u, C[i])); // ok
        der[2*i+3] = duduk.S[i].im*pnR[i]+duduk.S[i].re*pnI[i]+Zc*u*duduk.C[i].im;
    }
        
    return(der)
}

// duduk.next_chunk = function(t0, buffer_size, dt, buffer){
//     rungeKutta(duduk.model, duduk.X0, t0, buffer_size, dt, buffer);
// }

duduk.set_controls = function(params, knob = true){
    // Prend des valeurs entre 0 et 100

    let keys = Object.keys(params);        
    $.each(keys, function (val, key) {
        let display = "";
        let c = duduk.params[key].range;
        let value = c[0]+params[key]*(c[1]-c[0])/100;

        duduk.params[key].value = value;

        if (knob){
            let index = duduk_knobs.findIndex(element => element.id == key);

            // duduk_knobs[index].setValue(100*(params[key]-c[0])/(c[1]-c[0]));
            duduk_knobs[index].setValue(params[key]);

        }

        switch (key) {
            case 'pb' : 
                    pb = value;
                    display = value.toFixed(0);
                    break;
            case 'Fl' :
                    omegal = 2*math.pi*value;
                    display = value.toFixed(0)
                    break;
            case 'H' :
                    H = value;
                    display = Math.round(value*1e6)
                    break;
            case 'mul' :
                    mu = value;
                    display = Math.round(value*1e3)
                    break;
            case 'Ql' :
                    Ql  = value;
                    display = value.toFixed(2)
                    break;
            case 'fingering' :
                    break;

        }

        $("#"+key+"_value").html(display+duduk.params[key].unit);

    });
}

duduk.output = function (buffer, outputBuffer){
    let p;
    for (let i = 0; i < outputBuffer.length; i++) {
        p = 0;
        for (let j = 2; j < duduk.dim; j+=2) {
            p += buffer[i][j];
        }
        outputBuffer[i] = p * duduk.gain;
    }
}

// Define the controls of teh duduk

let duduk_controls = {"gain" : [Number, duduk.set_controls],
                        "fingering" :[Array, duduk.set_controls]}

for (const p in duduk.params){
    duduk_controls[p] = [Number, duduk.set_controls];
}

register_controls("instrument", duduk_controls);

export { duduk };
