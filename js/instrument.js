'use strict';

class parameter{
    constructor(value, range, unit){
        this.value = value;
        this.range = range;
        this.unit = unit;
    }
}

class instrument{
    constructor(name, params, dim, max, gain){
        this.name = name;
        this.params = params;
        this.dim = dim;
        this.X0 = new Array(this.dim).fill(0);
        this.max = max;
        this.gain = gain;
        this.vars = {};
        this.rms = 0;
        this.freq= 0;
        this.range = ["C4", "C5"];
        this.self = this
    }
    
    model(){
        console.log("la fonction 'model' doit être redéfinie");
    }

    next_chunk(t0, t1, dt){
        console.log("la fonction 'next_chunk' doit être redéfinie");
    }
    
    get_controls(){
        return({})
    }

    set_controls(params, knob){

    }


    output(){
        return(0);
    }

}


export { instrument, parameter };
