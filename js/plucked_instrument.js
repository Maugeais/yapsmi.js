'use strict';

import { string_instrument, string, parameter, sensor, init_instrument } from "./string_instrument.js?version=1.2";

class plucked_instrument extends string_instrument{
    constructor(name, params, strings, dim, limiter, gain){
        // No params and no dim but can have mics and strings
        super(name, params, strings, dim, limiter, gain)

        this.plectrum ={"width" : new parameter(0.02, [0, 3e-2], 'mm', 1e3, 1),
                        "position" : new parameter(0.13, [0.001, 0.17], 'cm', 1e2,1),
                        // "shape" : plectrum_square,
                        "strength" : new parameter(0.07, [0, 1], 'N', 1, 2),
                        "duration" : new parameter(10e-3, [1e-3, 100e-3], 'ms', 1e3, 1),
                        "increase_duration" : new parameter(0.5, [0, 1], '%', 100, 0),
                        "losses" : new parameter(1e-4, [6e-6, 1e-3], '', 1e6, 3, true),
                        "regularity" : new parameter(2, [0, 4], '', 1, 0),
                        "theta" : new parameter(10, [0, 90], '°', 1, 0),
                    }        

        for (let obj in this.plectrum){
            this.params[obj] = this.plectrum[obj]
        } 

        this.polarisation = true;
        this.nonlinearity  = true;
    }

    compute_attack_coefs(){
         for (let s=0; s < this.strings.length; s++){
            this.strings[s]._compute_extra_constants(this.plectrum);
        }
    }
    
    strum(speed){
        // var interval = 0; // how much time should the delay between two iterations be (in milliseconds)?
        // var promise = Promise.resolve();
        this.strings.forEach(function (s) {
          s.pluck(speed)
        });  
    }

    _create_string(data, s){
        return(new plucked_string(this, data["strings"][this.strings_name[s]], this.dim, this.limiter))
    }

    pluck(params){
        this.strings[params["string_number"]].pluck(params["speed"]);
    }
}

function binomial(n, k) {
    // Check if both n and k are of type number, if not, return false.
    if ((typeof n !== 'number') || (typeof k !== 'number')) 
        return false; 
    // Initialize the coefficient variable to 1.
    var coeff = 1;
    // Calculate the numerator of the binomial coefficient.
    for (var x = n - k + 1; x <= n; x++) coeff *= x;
    // Calculate the denominator of the binomial coefficient.
    for (x = 1; x <= k; x++) coeff /= x;
    // Return the calculated binomial coefficient.
    return coeff;
}

class plucked_string extends string{
    pluck( velocity ){
        if (!this.muted){
            // this.plectrum["position"].value = position;
            this.attack_strength = this.parent.plectrum["strength"].value*velocity;
            this.attack_time_position = this.parent.plectrum["duration"].value;
        }
    }

    // _compute_extra_constants(){

    //     let m = Math.round(this.parent.plectrum["regularity"].value);
    //     let normalisation = 0;
    //     for (let ell = 0; ell <= m; ell++){
    //         normalisation += (-1)**ell*binomial(ell, m)/(2*ell+1)
    //     }
    //     // m = 4;
    //     // Compute the alpha
    //     let alpha = new Array(m+1);
    //     for (let ell = 0; ell <= m; ell++){
    //         alpha[ell] = new Array(this.dim)
    //     }
    
    //     let x0 = Math.PI*this.parent.plectrum["position"].value/this.L;
    //     let delta = Math.PI*this.parent.plectrum["width"].value/(this.L*normalisation);
    
    //     for (let n = 1; n <= this.dim; n++){
    //         alpha[0][n-1] = 2*this.L/(n*Math.PI)*Math.sin(n*x0)*Math.sin(n*delta)
    //     }
    
    //     for (let ell = 1; ell <= m; ell++){
    //         for (let n = 1; n <= this.parent.dim; n++){
    //             alpha[ell][n-1] = 2*this.L/(n*Math.PI)*Math.sin(n*x0)*Math.sin(n*delta)+
    //                                  4*ell*this.L*Math.sin(n*x0)*Math.cos(n*delta)/(n**2*Math.PI*delta)
    //                                     -2*ell*(2*ell-1)*alpha[ell-1][n-1]/(n*delta)**2;
    
    //         }
    //     }
    
    //     if (typeof this.attack_coefs == 'undefined'){
    //         this.attack_coefs = new Float32Array(this.dim)
    //     }
        
    //     for (let n = 0; n < this.parent.dim; n++){
    //         for (let ell = 0; ell <= m; ell++){
    //             this.attack_coefs[n] = 4*(-1)**ell*binomial(ell, m)*alpha[ell][n]/this.L;
    //         }
    //     }
    // }

    _compute_extra_constants(){

        this.compute_attack_shape_decompostion(this.parent.params["position"].value, this.parent.params["width"].value)
    }

    add_attack(dt, buffer_z, buffer_zm1, buffer_zm2, buffer_y, buffer_ym1, buffer_ym2){
        
        if (this.attack_time_position > 0){
            // let t = 1-this.attack_time_position/this.parent.plectrum["duration"].value;
            // let attack = 1;
            // if (t < this.parent.plectrum["increase_duration"].value){
            //     let tt = t/this.parent.plectrum["increase_duration"].value;
            //     attack = Math.sin(Math.PI*t); //tt**2; //(2-tt**2);
            // } 
            let t = this.attack_time_position/this.parent.plectrum["duration"].value;
            let attack = Math.sin(Math.PI/2*t)*this.attack_strength/this.parent.plectrum["duration"].value; 

            let theta = 2*Math.PI*this.parent.plectrum["theta"].value/360;

            for (var n = 0; n < this.parent.dim; n++){
                buffer_z[n] += dt**2*attack*this.attack_coefs[n]/this.params["density_z"].value*Math.sin(theta);
            }

            if (this.parent.polarisation){
                for (var n = 0; n < this.parent.dim; n++){
                    buffer_y[n] += dt**2*attack*this.attack_coefs[n]/this.params["density_y"].value*Math.cos(theta);
                }  
            }
            this.attack_time_position -= dt;
        }
    }
}

function sinc(x){
    if (x <1e-6) return(1)
    return(Math.sin(x)/x)
}

    
export { plucked_instrument, string_instrument, string, parameter, sensor, init_instrument };
