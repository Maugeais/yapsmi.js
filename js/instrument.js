'use strict';

class parameter{
    constructor(value, range, unit){
        this.value = value;
        this.range = range;
        this.unit = unit;
    }
}

class instrument{
    constructor(name, params, max, gain){
        this.name = name;
        this.params = params;
        this.X0 = [];
        this.max = max;
        this.gain = gain;
        this.vars = {};
        this.rms = 0;
        this.freq= 0;
        this.range = ["C4", "C5"];
        this.dim = 0;

    }
    
    model(){
        console.log("la fonction 'model' doit être redéfinie");
    }

    next_chunk(t0, t1, dt){
        console.log("la fonction 'next_chunk' doit être redéfinie");
    }
    
    onMIDIMessage(event){
        console.log("la fonction 'onMidiMessage' doit être redéfinie");
    }
    
    output(){
        return(0);
    }

}


export { instrument, parameter };
