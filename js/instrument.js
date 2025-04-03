'use strict';

import { parameter } from "./parameters.js?version=1.1";

class instrument{
    
    constructor(name, params, dim, limiter, output_impedance){
        this.name = name;
        this.params = params;
        this.dim = dim;
        if (limiter > 0){
            this.limiter = new parameter(limiter, [0, limiter], '', 1, 1);
            this.params['limiter'] = this.limiter
        }
        this.output_impedance = new parameter(output_impedance, [output_impedance/2, output_impedance*2], '', 1e-9, 2, true)
        this.params["output_impedance"] = this.output_impedance
        // this.vars = {};
        // this.rms = 0;
        // this.freq= 0;
        // this.self = this;
        this.X0 = []; // Initial conditions
        this.radiation_on = false;
        this.error_time = new Date()
    }

    init_audio(buffer_size, dt){
        console.log("This function must be redefined by the user")
    }
    

    next_chunk(t0, size, dt){
        console.log("This function must be redefined by the user");
    }

    reset_chunk(){
        console.log("This function must be redefined by the user")
    }

    loop_chunk(){

    }
    
    get_controls(){
        return({})
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

    set_radiation_status(status){
        this.radiation_on = status;
    }

    update_scheme_constants(){
        // console.log("undefined")
    }

    set_controls(params){

        // Take value between 0 and 100
        let inst = this;
    
        Object.keys(params).forEach(function (key) {
            try {
            inst.params[key].set_from_percentage(params[key]);   
            } catch(err) {
                console.log(key, err)
            }
        });

        this.update_scheme_constants();

    }

    get_controls_details(){

        let controls = {};

        for (let key in this.params){
            controls[key] = {}
            controls[key].value = this.params[key].value;
            controls[key].range = this.params[key].range;
            controls[key].log_scale = this.params[key].log_scale;
        }

        return(controls)
    }

    set_controls_details(params){

        let output = {};

        for (let key in params){
            this.params[key].value = params[key].value;
            this.params[key].range = params[key].range;
            this.params[key].log_scale = params[key].log_scale;    
            output[key] = this.params[key].to_percentage()
        }

        return(output)
    }

    save_session(){
        let session = {}

        // session['output_impedance'] = {'value' : this.output_impedance.to_percentage(),
        //                     'range' : this.output_impedance.range
        //                 }

        session['params'] = {}
        for (var key in this.params){
            if (typeof(this.params[key]) == "object" ) {
                session['params'][key] = {'value' : this.params[key].to_percentage(),
                                            'range' : this.params[key].range
                                       }
            }
        }
        return(session)
    }

    load_session(session){

        console.log("loading")

        // this.output_impedance.range = session['output_impedance']['range']
        // this.output_impedance.set_from_percentage(session['output_impedance']['value'])


        for (var key in this.params){
            try{
            if ((typeof(this.params[key]) == "object" )){ //} && (knob_ids.includes(key))) {
                this.params[key].range = session['params'][key].range;   
                let param = {}
                param[key] = session['params'][key]['value'];
                this.set_controls(param)
            }} catch(e){
                console.log(key, e)
            }
        }
        return(session)
    }

    declare_error(message){

        let Delta = new Date()-this.error_time;
        if (Delta > 1000){
             this.port.postMessage({property:"message", 
                text : message
                });
             this.error_time = new Date()
        }
    }

}


export { instrument, parameter };
