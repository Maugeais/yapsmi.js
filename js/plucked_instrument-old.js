'use strict';

import { string_instrument, string, parameter } from "./string_instrument.js";

class plucked_instrument extends string_instrument{
    constructor(name, strings, dim, max, gain){
        // No params and no dim but can have mics and strings
        super(name, strings, dim, max, gain)

        this.plectrum ={"width" : new parameter(0.02, [0, 3e-2], 'mm', 1e3, 1),
                        "position" : new parameter(0.13, [0.005, 0.17], 'cm', 1e2,1),
                        "shape" : plectrum_square,
                        "strength" : new parameter(0.2, [0, 2], 'N', 1, 1),
                        "duration" : new parameter(20e-3, [0, 40e-3], 'ms', 1e3, 1),
                        "losses" : new parameter(0.635, [0.635/4, 0.635*4], '', 1, 3, true)
                    }        
    }
    
    set_plectrum(params){
        let inst = this;
        let key = Object.keys(params)[0];    
        if (key == "shape"){
            switch (params["shape"]) {
                case 'triangle':
                    inst.plectrum["shape"] = plectrum_triangle;
                    break;
                case 'sine':
                    inst.plectrum["shape"] = plectrum_sine;
                    break;
                default:
                    inst.plectrum["shape"] = plectrum_square;
            } 
        } else {
            inst.plectrum[key].set_from_precentage(params[key]);
            return(inst.plectrum[key].to_string())
            
        }
    }

    strum(position, speed){
        var interval = 0; // how much time should the delay between two iterations be (in milliseconds)?
        var promise = Promise.resolve();
        this.strings.forEach(function (s) {
          // promise = promise.then(function () {
          //   s.pluck(position, speed)
          s.pluck(this.plectrum["position"].value, speed)
          //   return new Promise(function (resolve) {
          //     setTimeout(resolve, interval);
          //   });
          // });
        });  
    }

    
}

 /**
     *  Gratte la string en une certaine position et une certaines vitesse
     *  @param position {float} dans [0, 1] - Position relative
     *  @param speed {float} dans [0, 1] - Vitesse, qui permet de régler la force
     */ 
string.prototype.pluck  = function( position, velocity ){
    // this.pluck_position = position*this.params["L"];
    if (!this.muted){
        // this.plectrum["position"].value = position;
        this.attack_time_position = this.plectrum["duration"].value;
    }
}

string.prototype.change_plectrum_shape = function(shape){
        this.plectrum_shape = shape;
    }

const m = 3;
string.prototype.pluck_constants = function(){
        let t = this.attack_time_position/this.plectrum["duration"].value;
        let x0 = 2*Math.PI*this.plectrum["position"].value/this.L;
        let delta = Math.PI*this.plectrum["width"].value/this.L;

        return({"F" : this.plectrum["strength"].value/(delta**m), "pos":x0, "width" : delta*(this.plectrum["shape"](t)), "t":t})

    }

string.prototype.add_attack = function(dt, buffer, buffer2){
        // if (this.attack_time_position == this.plectrum["duration"].value){
        //     // console.log("test")
        //     for (var n = 0; n < this.dim; n++){
        //         buffer[n] = 0;
        //     }
        // }
        if (this.attack_time_position > 0){
            let attack = this.pluck_constants();
            for (var n = 0; n < this.dim; n++){
                buffer[n] += attack.F*(-2*attack.width*Math.sin((n+1)*attack.pos)*sinc((n+1)*attack.width))**m/this.mu;
                buffer[n] -= dt*attack['t']**2*this.plectrum["losses"].value*(buffer[n]-buffer2[n])/this.mu;
            }
            this.attack_time_position -= dt;
        }
    }
    
   

function plectrum_sine(t){
    return((1-t)**4)
    // return(Math.cos(Math.PI*t/2))
}

function plectrum_square(t){
    return(1)
}


function plectrum_triangle(t){
    return(1-t)
}

function sinc(x, m = 1){
    if (Math.abs(x) < 1e-6) {return(1);}
    return((Math.sin(x)/x))
}

export { plucked_instrument, parameter };
