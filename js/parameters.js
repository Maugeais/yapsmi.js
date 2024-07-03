'use strict';

class parameter{
    constructor(value, range, unit, normalisation = 1, precision = 0, log_scale = false, smoothened = false){
        this.value = value;
        this.goal_value = value;
        this.dvalue = 0;
        this.range = range;
        this.unit = unit;
        this.normalisation = normalisation;
        this.precision = precision;
        this.log_scale = log_scale;
        this.smoothened = smoothened;
    }

    to_percentage(){
        if (this.log_scale){
            return((Math.log(this.goal_value/this.range[0]))/Math.log(this.range[1]/this.range[0])*100);
        }
        return((this.goal_value-this.range[0])/(this.range[1]-this.range[0])*100);
    }

    set_from_percentage(value, smoothening){

        this.value0 = this.value;

        if (this.log_scale){
            if (smoothening != null){
                this.dvalue = Math.exp(Math.sign(this.goal_value-this.value0)*Math.log(this.range[1]/this.range[0])*smoothening.accuracy.value);
            }
            this.goal_value = this.range[0]*Math.pow(this.range[1]/this.range[0], value/100);
        } else {            
            if (smoothening != null){
                this.dvalue = Math.sign(this.goal_value-this.value0)*(this.range[1]-this.range[0])*smoothening.accuracy.value;
            }
            this.goal_value = this.range[0]+value*(this.range[1]-this.range[0])/100;
        }

        if ((!this.smoothened) || (smoothening == null)){
            this.value = this.goal_value;
        } else {
            this.smooth_set(smoothening)
        }

    }

    async smooth_set(smoothening){
        while(Math.abs(this.value-this.goal_value) > smoothening.accuracy.value*(this.range[1]-this.range[0])) {
            if (this.log_scale){
                this.value *= this.dvalue;
            } else {
                this.value += this.dvalue;
            }
            await delay(smoothening.delay.value)
        }
    }

    to_string(){
        return((this.normalisation*this.goal_value).toFixed(this.precision)+this.unit)
    }
}



export { parameter };
