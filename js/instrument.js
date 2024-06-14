'use strict';

class parameter{
    constructor(value, range, unit, normalisation = 1, precision = 0, log_scale = false){
        this.value = value;
        this.range = range;
        this.unit = unit;
        this.normalisation = normalisation;
        this.precision = precision;
        this.log_scale = log_scale;
    }

    to_percentage(){
        if (this.log_scale){
            return((Math.log(this.value/this.range[0]))/Math.log(this.range[1]-this.range[0])*100);
        }
        return((this.value-this.range[0])/(this.range[1]-this.range[0])*100);
    }

    set_from_precentage(value){
        if (this.log_scale){
            this.value = this.range[0]*Math.pow(this.range[1]/this.range[0], value/100);
        } else {
            this.value = this.range[0]+value*(this.range[1]-this.range[0])/100;
        }
    }

    to_string(){
        return((this.normalisation*this.value).toFixed(this.precision)+this.unit)
    }
}

class instrument{
    
    constructor(name, params, dim, max, gain){
        this.name = name;
        this.params = params;
        this.dim = dim;
        this.max = max;
        this.gain = new parameter(gain, [0, gain*2], '', 1, 2, false)
        this.vars = {};
        this.rms = 0;
        this.freq= 0;
        this.self = this;
        this.X0 = []; // Initial conditions
        this.radiation_callbacks = [];
        this.radiation_filters = {};
        this.radiation_filter = "";
    }

    init_audio(buffer_size, dt){
        console.log("Cette fonction doit être redéfinie")
    }
    

    next_chunk(t0, size, dt){
        console.log("la fonction 'next_chunk' doit être redéfinie");
    }

    reset_chunk(){
        console.log("Cette fonction doit être redéfinie")
    }

    loop_chunk(){

    }
    
    get_controls(){
        return({})
    }

    set_controls(params, knob){

    }

    play_note(note, velocity){
        console.log("play", note, velocity)
    }

    stop_note(note, velocity){
        console.log("stop", note, velocity)
    }

    output(outputData){
        return(0);
    }

    add_radiation_callback(callback){
        this.radiation_callbacks.push(callback);
    }

    _change_radiation(name){
        this.radiation_callbacks.forEach((callback) => (callback(name)));
    }

}


export { instrument, parameter };
