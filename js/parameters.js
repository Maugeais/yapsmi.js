'use strict';

class parameter{
    constructor(value, range, unit, normalisation = 1, precision = 0, log_scale = false, callback = () => { }){
        this.value = value;
        this.range = range;
        this.unit = unit;
        this.normalisation = normalisation;
        this.precision = precision;
        this.log_scale = log_scale;
        this.callback = callback;
    }

    to_percentage(){
        if (this.log_scale){
            return((Math.log(this.value/this.range[0]))/Math.log(this.range[1]/this.range[0])*100);
        }
        return((this.value-this.range[0])/(this.range[1]-this.range[0])*100);
    }

    set_from_percentage(value){

        if (this.log_scale){
          
            this.value = this.range[0]*Math.pow(this.range[1]/this.range[0], value/100);
        } else {            
     
            this.value = this.range[0]+value*(this.range[1]-this.range[0])/100;
        }

        this.callback(this.value)
    }

    to_string(){
        return((this.normalisation*this.value).toFixed(this.precision)+this.unit)
    }
}



export { parameter };
