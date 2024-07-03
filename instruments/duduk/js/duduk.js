'use strict';

import { wind_instrument, parameter } from "../../../js/wind_instrument.js?version=1.02";

//#define rho 1.1851
//#define R 0.0135 //0.012 // Rayon à l'embouchure
//#define c0 346.19
let rho  = 1.292*273.15/(273.15+20)//1.1851
let R = 0.56; // Rayon à l'embouchure
let c0 = 20.05*(273.15+20)**0.5;

let Zc = rho*c0/(math.pi*R*R); //Impedance caracteristique du résonateur

let w = 0.018;


let duduk = new wind_instrument("Simon", {'pm': new parameter(500, [200, 7000], 'Pa', 1, 0, false, false), 
                                        'Fr' : new parameter(480, [200, 800], 'Hz'),
                                        'Qr' : new parameter(3.3, [1.5, 5], '', 1, 2),
                                        // 'mur' : new parameter(1.247, [0.5, 2.5], 'kg/m²'),
                                        'Kr' : new parameter(15e6, [1e6, 30e6], 'MPa/m', 10**(-6), 2),
                                        'H' : new parameter(0.3e-3, [0, 1e-3], 'mm', 10**3, 2, false, false),
                                        'Cd' : new parameter(0, [0, 1], 'mm')}, 2*10+2, 10, 9000, 0.001, 'C',
                                        ['G-1', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'A+1', 'B+1', 'C+1']);


// Le vecteur d'etat est sous la forme complexe : h, h', real(p1), image(p1), ...
let pnR = new Float32Array(duduk.dim);
let pnI = new Float32Array(duduk.dim);

let epsilon = 1e-2;
let der = new Float32Array(duduk.dim);

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

duduk.model = function(t, x){
    
    let p = 0;
    let h = x[0];
    let u;
    let omegar = 2*math.pi*duduk.params['Fr'].value;
    if (duduk.transitioning_impedance){
        duduk.transition_impedance();
    }

    for (let i=0; i < duduk.impedances_dim; i++) { // ok
        pnR[i] = x[2*i+2];
        pnI[i] = x[2*i+3];
        p += 2*x[2*i+2];
    }
        
    // Expression exacte du débit
    
    // Expression régularisée du débit
    u = w*theta(h)*(2/rho)**0.5*(duduk.params['pm'].value-p)/((-duduk.params['pm'].value+p)**2+epsilon**2)**0.25;
    // u = w*theta(h)*regularized_flow(2*(duduk.params['pm'].value-p)/rho);
    // if (duduk.params['pm'].value > p){
    //     u = w*theta(h)*(2*(duduk.params['pm'].value-p)/rho)**0.5;
    // } else {
    //     u = -w*theta(h)*(2*(p-duduk.params['pm'].value)/rho)**0.5;
    // }


    // p -= Cd*rho*(u/Sc)**2/2;

    
    der[0] = x[1];
    der[1] = -omegar/duduk.params['Qr'].value*x[1]-omegar**2*(x[0]-duduk.params['H'].value) - (duduk.params['pm'].value-p)*duduk.params['Kr'].value/omegar**2; // ok
            
    for (let i=0; i < duduk.impedances_dim; i++){
        
        der[2*i+2] = duduk.S[i].re*pnR[i]-duduk.S[i].im*pnI[i]+Zc*u*duduk.C[i].re;
        der[2*i+3] = duduk.S[i].im*pnR[i]+duduk.S[i].re*pnI[i]+Zc*u*duduk.C[i].im;
    }
        
    return(der)
}


duduk.output = function(outputBuffer){
    if (radiate_on) {
        this.pressure_derivative_output(outputBuffer);
    } else {
        this.pressure_output(outputBuffer);
    }
}



duduk.radiate_status = function(status){

    if(status){
        message("The sound you hear is the radiated sound 1.5 m from the source")
    } else {
        message("The sound you hear is the sound in the reed")
    }

}

// Define the duduk controls 

let duduk_controls = {"gain" : [Number, duduk.set_controls],
                        "fingering" :[Array, duduk.set_controls]}

for (const p in duduk.params){
    duduk_controls[p] = [Number, duduk.set_controls];
}

register_controls("instrument", duduk_controls);

export { duduk };
