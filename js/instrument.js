'use strict';

import { parameter } from "./parameters.js?version=1.02";

class instrument{
    
    constructor(name, params, dim, max, gain){
        this.name = name;
        this.params = params;
        this.dim = dim;
        this.max = max;
        this.gain = new parameter(gain, [0, gain*2], '', 1, 2, false)
        this.smoothening_accuracy = new parameter(1e-4, [1e-5, 1e-3], '%', 1e2, 3, true)
        this.smoothening_delay = new parameter(1e-4, [1e-2, 10], 'ms', 1, 2, true)
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

    // set_controls(params, knob){

    // }

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

    radiate_status(status){
    }

    set_controls(params, knob = true, relative  = false){
        // Prend des valeurs entre 0 et 100

        let inst = this;
        let smoothening = {'accuracy' : this.smoothening_accuracy, 'delay' : this.smoothening_delay}
    
        let keys = Object.keys(params);        

        $.each(keys, function (val, key) {
            // let c = duduk.params[key].range;
    
            if (relative){
                let old = inst.params[key].to_percentage();
                inst.params[key].set_from_percentage(old+0.01*(params[key]-old), smoothening)
            } else {
                inst.params[key].set_from_percentage(params[key], smoothening);
            }
    
            if (knob){
                let index = inst.knobs.findIndex(element => element.id == key);
                inst.knobs[index].setValue(params[key]);
            }
    
            $("#"+key+"_value").html(inst.params[key].to_string());
    
            return(inst.params[key].to_string())
    
        });
    }

    save_parameters(){
        let session = {}

        session['gain'] = {'value' : this.gain.to_percentage(),
                            'range' : this.gain.range
                        }

        session['smoothening_accuracy'] = {'value' : this.smoothening_accuracy.to_percentage(),
                                            'range' : this.smoothening_accuracy.range
                                        }

        session['smoothening_delay'] = {'value' : this.smoothening_delay.to_percentage(),
                                        'range' : this.smoothening_delay.range
                                    }

        session['params'] = {}
        for (var key in this.params){
            session['params'][key] = {'value' : this.params[key].to_percentage(),
                                        'range' : this.params[key].range
            }
        }
        return(session)
    }

    load_parameters(session){

        this.gain.range = session['gain']['range']
        this.gain.set_from_percentage(session['gain']['value'])

        this.smoothening_accuracy.range = session['smoothening_accuracy']['range']
        this.smoothening_accuracy.set_from_percentage(session['smoothening_accuracy']['value'])
        $('#smoothening_accuracy_slider_output').html(this.smoothening_accuracy.to_string())
        $('#smoothening_accuracy_slider').val(session['smoothening_accuracy']['value'])

        this.smoothening_delay.range = session['smoothening_delay']['range']
        this.smoothening_delay.set_from_percentage(session['smoothening_delay']['value'])
        $('#smoothening_delay_slider_output').html(this.smoothening_delay.to_string())
        $('#smoothening_delay_slider').val(session['smoothening_delay']['value'])



        for (var key in this.params){
            this.params[key].range = session['params'][key].range;   
            let param = {}
            param[key] = session['params'][key]['value'];
            this.set_controls(param, true, false)
        }
        return(session)
    }

}


export { instrument, parameter };
