'use strict';

import { instrument, parameter } from "./instrument.js";
import { rungeKutta } from "./rk4.js";


class wind_instrument extends instrument {
    #fingering_callbacks = [];
    constructor(name, params, dim, impedances_dim, max, gain, fingering = 0, fingerings= []){
        super(name, params, dim, max, gain)
        this.impedances_dim = impedances_dim;
        this.impedances = {};
        this.transfer_functions = {};
        this.transfer_function = [];
        this.filters = {};
        this.fingering = fingering;
        this.fingerings = fingerings;
        this.transitioning_impedance = false;
        this.S = []
        this.C = [];
        this.transition_time = 2000;
        this._transition_impedance_counter = 0;

        // Initialising impedance coefficients
        this.S = new Array(this.impedances_dim);
        this.C = new Array(this.impedances_dim);

        this.S0 = new Array(this.impedances_dim);
        this.C0 = new Array(this.impedances_dim);

        this.dS = new Array(this.impedances_dim);
        this.dC = new Array(this.impedances_dim);

        for (let i=0; i < this.impedances_dim; i++ ){
            this.dS[i] = math.complex(0, 0);
            this.dC[i] = math.complex(0, 0);
            this.S[i] = math.complex(0, 0);
            this.C[i] = math.complex(0, 0);
        }
         // Functions to be calls when the fingering is chhanged
        load_fingerings(this);
    }
    

    // change_fingering = function(name){
    //      console.log("Function 'change_fingering' must be redefined. It must call _change_fingering at the end !");
    // }

    change_fingering = function(name){

        this.S0 = this.impedances[name]['S'];
        this.C0 = this.impedances[name]['C'];
        
        for (let i=0; i < this.impedances_dim; i++ ){
            this.dS[i].re = (this.impedances[name]['S'][i].re-this.impedances[this.fingering]['S'][i].re)/this.transition_time;
            this.dC[i].re = (this.impedances[name]['S'][i].re-this.impedances[this.fingering]['S'][i].re)/this.transition_time;
            this.dS[i].im = (this.impedances[name]['S'][i].im-this.impedances[this.fingering]['S'][i].im)/this.transition_time;
            this.dC[i].im = (this.impedances[name]['S'][i].im-this.impedances[this.fingering]['S'][i].im)/this.transition_time;
        }
        
        this.filter = "./data/"+name+"/transfer.wav";
        
        this._change_fingering(name);
    
        this.transitioning_impedance = true;
    
    }
    
    add_fingerging_callback(callback){
        this.#fingering_callbacks.push(callback);
    }
    
    _change_fingering(name){
        this.fingering = name;
        this.#fingering_callbacks.forEach((callback) => (callback(this.fingering)));
    }

    get_controls(){
        let controls = {};
        controls['fingering'] = this.fingerings;

        for (const param in this.params) {
            controls[param] = this.params[param].range;
        }

        return(controls)
    }

    next_chunk = function(t0, buffer_size, dt, buffer){
        rungeKutta(this.model, this.X0, t0, buffer_size, dt, buffer);
    }

    transition_impedance(){
        if (this._transition_impedance_counter < this.transition_time){
            this._transition_impedance_counter++;
            for (let i=0; i < this.impedances_dim; i++){
                this.S[i].re = this.S0[i].re+this.dS[i].re*this._transition_impedance_counter;
                this.C[i].re = this.C0[i].re+this.dC[i].re*this._transition_impedance_counter;
                this.S[i].im = this.S0[i].im+this.dS[i].im*this._transition_impedance_counter;
                this.C[i].im = this.C0[i].im+this.dC[i].im*this._transition_impedance_counter;
            }
        } else {
            this.transitioning_impedance = false;
            this._transition_impedance_counter = 0;
        }
    }
}

function complexify(data){
    let object = {};
    let j, k;
    for (k in data) {
        object[k] = [];
        for (j = 0; j < data[k].length; j++){
            object[k].push(math.complex(data[k][j][0], data[k][j][1]));
        }
    }
    return(object)
}


function load_impedance(object, folder){
    $.getJSON('./data/'+folder+'impedance.json', function( data ) {
        object.impedances[folder.slice(0, -1)] = complexify(data);

        while (object.impedances[folder.slice(0, -1)]["C"].length < (object.dim-2)/2){
            object.impedances[folder.slice(0, -1)]["C"].push(math.complex(0, 0))
            object.impedances[folder.slice(0, -1)]["S"].push(math.complex(0, 0))
        }

        if (folder.slice(0, -1) === object.fingering){
            object.change_fingering(folder.slice(0, -1));
        }
    });
}

function load_transfer(object, folder){
    // $.getJSON('./data/'+folder+'transfer.json', function( data ) {
    //     object.transfer_functions[folder.slice(0, -1)] = data;
    // });
    object.filters[folder.slice(0, -1)] = './data/'+folder+'transfer.wav';
}

function load_fingerings(object){
    $.ajax({
        url: "./data/",
        success: function(data){
            $(data).find("a").each(function(){
                load_impedance(object, $(this).attr("href"));
                load_transfer(object, $(this).attr("href"));
            });
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) { 
            alert("Status: " + textStatus); alert("Error: " + errorThrown); 
        }    
    });
}

export { wind_instrument, parameter };
