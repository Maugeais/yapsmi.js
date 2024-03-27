'use strict';

import { wind_instrument, parameter } from "../../../js/wind_instrument.js";
import { rungeKutta } from "../../../js/rk4.js";


//LIP

let N = 7;

let S = Array(math.complex(-14.41293, 237.53607),
                math.complex(-16.59293,698.86081),
                math.complex(-21.14837,1062.56089),
                math.complex(-24.1732 ,1437.72419),
                math.complex(-26.3253 ,1838.54184),
                math.complex(-30.20993,2176.1095),
                math.complex(-33.85253,2531.31976), 
                math.complex(-35.8441 ,2920.11011),
                math.complex(-40.61091,3308.21541),
                math.complex(-46.039  ,3707.95216),
                math.complex(-226.89665,4927.59548)); // ok


let C = Array(math.complex(291.6312 ,17.69525),
                math.complex(217.72573 ,5.16942),
                math.complex(223.73498 ,4.45304),
                math.complex(212.29938 ,3.5695),
                math.complex(240.34596 ,3.44141), 
                math.complex(270.40222 ,3.75387),
                math.complex(164.53925 ,2.20046), 
                math.complex(149.6101  ,1.83645), 
                math.complex(171.15563 ,2.10107),
                math.complex(100.73013 ,1.25069),
                math.complex(1139.80737,52.48371));

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

let duduk = new wind_instrument("Simon", {'pb': new parameter(2000, [1000, 4000], 'Pa'), 
                                        'Fl' : new parameter(330, [200, 800], 'Hz'),
                                        'Ql' : new parameter(3, [1.5, 5], ''),
                                        'mul' : new parameter(2.14, [1.5, 2.5], 'g/m²'),
                                        'H' : new parameter(0.3e-3, [0, 1e-2], 'μm')}, 9000, 1/9000, 'A',
                                        ['G-1', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'A+1', 'B+1', 'C+1']);

let pb = 3000;

duduk.dim=2*10+2;

duduk.fingerings=['a', 'b', 'c']

// Le vecteur d'etat est sous la forme complexe : h, h', real(p1), image(p1), ...
let pnR = new Float32Array(duduk.dim);
let pnI = new Float32Array(duduk.dim);

duduk.change_fingering = function(name){
    
    S = duduk.impedances[name]['S'];
    C = duduk.impedances[name]['C'];
    // this.filter = duduk.filters[name];
    
    N = S.length;
    
    duduk._change_fingering();
}
    
duduk.X0 = new Array(duduk.dim).fill(0);

let epsilon = 1e-1;
let der = new Float32Array(duduk.dim);

duduk.model = function(t, x){
    

    let p = 0;
    let h = x[0];
    let u;
    
    //H = 7.4e-2/(226.03604058517865);
        
    for (let i=0; i < N; i++) { // ok
        pnR[i] = x[2*i+2];
        pnI[i] = x[2*i+3];
        p += 2*x[2*i+2];
    }
        
    // Expression exacte du débit
    
    // Expression régularisée du débit
    u = w*H*(theta(h)/H)**q*(2*rho)**0.5*(pb-p)/((-pb+p)**2+epsilon)**0.25;
    
    der[0] = x[1];
    der[1] = -omegal/Ql*x[1]-omegal*omegal*(x[0]-H) - (pb-p)/mu; // ok
            
    for (let i=0; i < N; i++){
        
        der[2*i+2] = S[i].re*pnR[i]-S[i].im*pnI[i]+Zc*u*C[i].re; //math.multiply(S[i], pn[i]), math.multiply(Zc*u, C[i])); // ok
        der[2*i+3] = S[i].im*pnR[i]+S[i].re*pnI[i]+Zc*u*C[i].im;
    }
        
    return(der)
}

duduk.next_chunk = function(t0, buffer_size, dt, buffer){
    rungeKutta(duduk.model, duduk.X0, t0, buffer_size, dt, buffer);
}

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
        for (let j = 0; j < N; j++) {
            p += buffer[i][2*j+2];
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
