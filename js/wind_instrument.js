'use strict';

import { instrument, parameter } from "./instrument.js";
import { rungeKutta } from "./rk4.js";


class wind_instrument extends instrument {
    constructor(name, params, dim, impedances_dim, max, gain, fingering = 0, fingerings= []){
        super(name, params, dim, max, gain)
        this.impedances_dim = impedances_dim;
        this.impedances = {};

        this.fingering = fingering;
        this.fingerings = fingerings;
        this.transitioning_impedance = false;
        this.S = []
        this.C = [];
        this.transition_time = 200;
        this._transition_impedance_counter = 0;
        this.X0 = new Array(this.dim).fill(0);

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

    init_audio(buffer_size, dt){

        this.buffer = new Array(buffer_size);   // Tableau contenant les données en chaque temps
        // int.reset_buffer(buffer)
        for (let k=0; k < buffer_size; k++){
            this.buffer[k] = new Float64Array(inst.dim) // Pour chaque temps, on a les composantes
            for (let i = 0; i < inst.dim; i++){
                this.buffer[k][i] = 0;
            }
        }
    }

    reset_chunk(){
        for (let i=0; i < this.dim; i++){
            this.X0[i] = 0;
        }
    }

    loop_chunk(){
        this.X0 = this.buffer[this.buffer.length-1];
    }

    change_fingering(name){

        this.S0 = this.impedances[this.fingering]['S'];
        this.C0 = this.impedances[this.fingering]['C'];
        
        for (let i=0; i < this.impedances_dim; i++ ){
            this.dS[i].re = (this.impedances[name]['S'][i].re-this.impedances[this.fingering]['S'][i].re)/this.transition_time;
            this.dC[i].re = (this.impedances[name]['C'][i].re-this.impedances[this.fingering]['C'][i].re)/this.transition_time;
            this.dS[i].im = (this.impedances[name]['S'][i].im-this.impedances[this.fingering]['S'][i].im)/this.transition_time;
            this.dC[i].im = (this.impedances[name]['C'][i].im-this.impedances[this.fingering]['C'][i].im)/this.transition_time;
        }
        
        this.radiation_filter = "./data/"+name+"/transfer.wav";
        
        this._change_radiation(name);
    
        this.transitioning_impedance = true;

        this.fingering = name;
    }

    get_controls(){
        let controls = {};
        controls['fingering'] = this.fingerings;

        for (const param in this.params) {
            controls[param] = this.params[param].range;
        }

        return(controls)
    }

    next_chunk(t0, buffer_size, dt){
        rungeKutta(this.model, this.X0, t0, buffer_size, dt, this.buffer);
    }

    transition_impedance(){
        if (this._transition_impedance_counter <= this.transition_time){
            this._transition_impedance_counter++;
            for (let i=0; i < this.impedances_dim; i++){
                this.S[i].re = this.S0[i].re+this.dS[i].re*this._transition_impedance_counter;
                this.C[i].re = this.C0[i].re+this.dC[i].re*this._transition_impedance_counter;
                this.S[i].im = this.S0[i].im+this.dS[i].im*this._transition_impedance_counter;
                this.C[i].im = this.C0[i].im+this.dC[i].im*this._transition_impedance_counter;
                return(this._transition_impedance_counter/this.transition_time)
            }
        } else {
            this.transitioning_impedance = false;
            this._transition_impedance_counter = 0;

            return(0)
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
    })
}

function load_transfer(object, folder){
    // $.getJSON('./data/'+folder+'transfer.json', function( data ) {
    //     object.transfer_functions[folder.slice(0, -1)] = data;
    // });
    object.radiation_filters[folder.slice(0, -1)] = './data/'+folder+'transfer.wav';
}

function load_fingerings(object){
    $.ajax({
        url: "./data/",
        success: function(data){
            $(data).find("a").each(function(){
                let ref = $(this).html();
                if (ref[ref.length-1] == '/'){
                    load_impedance(object, $(this).attr("href"));
                    load_transfer(object, $(this).attr("href"));
                }
            });
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) { 
            alert("Status: ",  textStatus); alert("Error: ",  errorThrown);
        }    
    });
}

export { wind_instrument, parameter };
