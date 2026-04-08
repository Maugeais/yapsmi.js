'use strict';

import { wind_instrument, parameter } from "../../../js/wind_instrument.js";

//#define rho 1.1851
//#define R 0.0135 //0.012 // Rayon à l'embouchure
//#define c0 346.19
let rho  = 1.292*273.15/(273.15+20)//1.1851
let R = 0.012; // Rayon à l'embouchure
let c0 = 20.05*(273.15+20)^0.5;
let epsilon = 1e-4;

let Zc = rho*c0/(math.pi*R*R); //Impedance caracteristique du résonateur

let omegal = 2*math.pi*600;
let Ql = 3;
let mu  = 2.14;
let H = 0.3e-3;
let w = 0.012;
let q = 1;

let trombone = new wind_instrument("Simon", {'pb': new parameter(2000, [500, 4500], 'Pa'),
                                        'Fl' : new parameter(282, [50, 700], 'Hz'),
                                        'Ql' : new parameter(4.24, [1.5, 5], ''),
                                        'mul' : new parameter(1.25, [0.5, 2.5], 'g/m²'),
                                        'H' : new parameter(0, [-1e-3, 1e-3], 'μm')}, 2*12+2, 12, 9000, 1/9000, 'A',
                                        ['A']);

let pb = 3000;

// Le vecteur d'etat est sous la forme complexe : h, h', real(p1), image(p1), ...
let pnR = new Float32Array(trombone.dim);
let pnI = new Float32Array(trombone.dim);

let der = new Float32Array(trombone.dim);

// fonction de heavisyde
function theta(x){

    if (x > 0){
        return(x);
    } else {
        return(0);
    }
}

function regularized_flow(x){
    return (x/(x**2+epsilon)**0.25);
}

trombone.model = function(t, x){
    
    let p = 0;
    let h = x[0];
    let u;

    if (trombone.transitioning_impedance){
        trombone.transition_impedance(t);
    }
    
    //H = 7.4e-2/(226.03604058517865);
        
    for (let i=0; i < trombone.impedances_dim; i++) { // ok
        pnR[i] = x[2*i+2];
        pnI[i] = x[2*i+3];
        p += 2*x[2*i+2];
    }
        
    // Expression exacte du débit
    
    // Expression régularisée du débit
    u = w*theta(h)*regularized_flow(2*(pb-p)/rho);
    
    der[0] = x[1];
    der[1] = -omegal/Ql*x[1]-omegal**2*(x[0]-H) + (pb-p)/mu; // ok
            
    for (let i=0; i < trombone.impedances_dim; i++){
        
        der[2*i+2] = trombone.S[i].re*pnR[i]-trombone.S[i].im*pnI[i]+Zc*u*trombone.C[i].re;
        der[2*i+3] = trombone.S[i].im*pnR[i]+trombone.S[i].re*pnI[i]+Zc*u*trombone.C[i].im;
    }
        
    return(der)
}

// trombone.next_chunk = function(t0, buffer_size, dt, buffer){
//     rungeKutta(trombone.model, trombone.X0, t0, buffer_size, dt, buffer);
// }

trombone.set_controls = function(params, knob = true){
    // Prend des valeurs entre 0 et 100

    let keys = Object.keys(params);        
    $.each(keys, function (val, key) {
        let display = "";
        let c = trombone.params[key].range;
        let value = c[0]+params[key]*(c[1]-c[0])/100;

        trombone.params[key].value = value;

        if (knob){
            let index = trombone_knobs.findIndex(element => element.id == key);

            // trombone_knobs[index].setValue(100*(params[key]-c[0])/(c[1]-c[0]));
            trombone_knobs[index].setValue(params[key]);

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

        $("#"+key+"_value").html(display+trombone.params[key].unit);

    });
}

trombone.output = function (buffer, outputBuffer){
    let p;
    for (let i = 0; i < outputBuffer.length; i++) {
        p = 0;
        for (let j = 2; j < trombone.dim; j+=2) {
            p += buffer[i][j];
        }
        outputBuffer[i] = p * trombone.gain;
    }
}

// Define the controls of teh trombone

let trombone_controls = {"gain" : [Number, trombone.set_controls],
                        "fingering" :[Array, trombone.set_controls]}

for (const p in trombone.params){
    trombone_controls[p] = [Number, trombone.set_controls];
}

register_controls("instrument", trombone_controls);

export { trombone };
