'use strict';

import { instrument, parameter, sensor } from "./instrument.js?version=1.2";
import { rungeKutta, midPoint } from "./rk4.js?version=1.02";

class complex{
    constructor(re, im) {
        this.re = re;
        this.im = im;
    }

    add(z){
        return(new complex(this.re+z.re, this.im+z.im))
    }

    sub(z){
        return(new complex(this.re-z.re, this.im-z.im))
    }

    div(z){
        let norm = (z.re**2+z.im**2);
        return(new complex((this.re*z.re+this.im*z.im)/norm, (-this.re*z.im+this.im*z.re)/norm))
    }

    mult(z){
        return(new complex(this.re*z.re-this.im*z.im, this.re*z.im+this.im*z.re))
    }

    abs(){
        return((this.re**2+this.im**2)**0.5)
    }
}

class microphone extends sensor{
    // constructor(parent, type = "down_stream", params, output_impedance = 0.333){
    //     super(parent, type, params)

    //     this.parent = parent;
    //     this.output_impedance = output_impedance;
    //     this.type = type;
    //     // this.params = {}
    //     if (type == "down_stream") {
    //         this.output = this.down_stream_output;
    //         // this.params["x"] = parseFloat(params['x']);
    //         // if (isNaN(this.params['x'])) {
    //         //     throw "Incompatible type for x";
    //         // }
    //         this.Zc = 1;
    //     } else if (type == "radiated") {
    //         this.output = this.radiated_output;
    //         // this.params["dx/dt"] = parseFloat(12);
    //         // if (isNaN(this.params['dx/dt'])) {
    //         //     throw "Incompatible type for dx/dt";
    //         // }
    //         this.Zc = 5e-4;

    //     } else if (type == "dual"){
    //     }
    // }

    change_output_impedance(value){
        this.output_impedance = value;
    }

    down_stream_output(output, gain){         

        let p;
        for (let i = 0; i < output.length; i++) {
            p = 0;
            for (let j = 2; j < this.parent.dim; j+=2) {
                p += this.parent.buffer[i][j];
            }
            output[i] = 2* p * this.Zc * gain;
        }
    }

    down_stream_init(){
        this.Zc = 1;
    }

     
    radiated_output(output, gain){

        let signalnp1, signaln;

        signalnp1 = 0;
        for (let j = 2; j < this.parent.dim; j+=2) {
            signalnp1 += this.parent.buffer[0][j];
        }    

        for (let i = 0; i < output.length; i++) {
            signaln = signalnp1;
            signalnp1 = 0;
            for (let j = 2; j < this.parent.dim; j+=2) {
                signalnp1 += this.parent.buffer[i+1][j];
            }
            output[i] = 2*48000* (signalnp1-signaln)* this.Zc * gain;
        }    
    }

    radiated_init(){
        this.Zc =  5e-4;
    }
}


class wind_instrument extends instrument {
    constructor(name, params, dim, impedances_dim, limiter, output_impedance, fingering = 0, fingerings= [], vocal_tract_dim = 0){
        super(name, params, dim, limiter, output_impedance)
        this.impedances_dim = impedances_dim;
        this.vocal_tract_dim = vocal_tract_dim;
        this.impedances = {};
        this.characteristic_impedance = 1;

        this.fingering = fingering;
        this.fingerings = fingerings;
        this.transitioning_impedance = false;
        this.S = []
        this.C = [];
        this._transition_impedance_counter = 0;
        this.X0 = new Array(this.dim).fill(0);

        // Initialising impedance coefficients
        this.S = new Array(this.impedances_dim+this.vocal_tract_dim );
        this.C = new Array(this.impedances_dim+this.vocal_tract_dim );

        this.S0 = new Array(this.impedances_dim+this.vocal_tract_dim );
        this.C0 = new Array(this.impedances_dim+this.vocal_tract_dim );
        this.S1 = new Array(this.impedances_dim+this.vocal_tract_dim );
        this.C1 = new Array(this.impedances_dim+this.vocal_tract_dim );

        for (let i=0; i < this.impedances_dim+this.vocal_tract_dim ; i++ ){
            this.S0[i] = new complex(0, 0);
            this.C0[i] = new complex(0, 0);
            this.S1[i] = new complex(0, 0);
            this.C1[i] = new complex(0, 0);
            this.S[i] = new complex(0, 0);
            this.C[i] = new complex(0, 0);
        }


        let der = new Float32Array(this.dim);
        this.model = this.model.bind(this)

        this.available_sensors["down_stream"] = {} //{"x": "mm"}
        this.available_sensors["radiated"] = {} //{"dx/dt" : "mm/s"}

        this.connected_sensors.push(new microphone(this, "down_stream", {}, 1))
        // this.connected_sensors.push(new microphone(this, "radiated", {}, 100000))

        this.sensor_class = microphone

        // console.log(this.model)

         // Functions to be calls when the fingering is chhanged
        // load_fingerings(this);
    }

    set_geometry(data){
        this.impedances = data.impedances;
        let dim = this.impedances_dim;

        Object.keys(data.impedances).forEach(function(key) {
            while (data.impedances[key]["C"].length < dim){
                data.impedances[key]["C"].push(new complex(0, 0))
                data.impedances[key]["S"].push(new complex(0, 0))
            }
         });

        this.change_fingering(this.fingering);
    }

    init_audio(buffer_size, dt){

        this.dt = dt;

        this.buffer = new Array(buffer_size+1);   // Tableau contenant les données en chaque temps
        // int.reset_buffer(buffer)
        for (let k=0; k < this.buffer.length; k++){
            this.buffer[k] = new Float64Array(this.dim) // Pour chaque temps, on a les composantes
            for (let i = 0; i < this.dim; i++){
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

        // this.S0 = this.impedances[this.fingering]['S'];
        // this.C0 = this.impedances[this.fingering]['C'];

        for (let i=0; i < this.vocal_tract_dim; i++ ){
            this.S0[i].re = this.S[i].re;
            this.S0[i].im = this.S[i].im;
            this.C0[i].re = this.C[i].re;
            this.C0[i].im = this.C[i].im;
            this.S1[i].re = this.S[i].re;
            this.S1[i].im = this.S[i].im;
            this.C1[i].re = this.C[i].re;
            this.C1[i].im = this.C[i].im;
        }
        
        for (let i=0; i < this.impedances_dim; i++ ){
            this.S0[i+this.vocal_tract_dim] = this.impedances[this.fingering]['S'][i];
            this.C0[i+this.vocal_tract_dim] = this.impedances[this.fingering]['C'][i];
            this.S1[i+this.vocal_tract_dim].re = this.impedances[name]['S'][i].re;
            this.S1[i+this.vocal_tract_dim].im = this.impedances[name]['S'][i].im;
            this.C1[i+this.vocal_tract_dim].re = this.impedances[name]['C'][i].re;
            this.C1[i+this.vocal_tract_dim].im = this.impedances[name]['C'][i].im;
        }
            
        this.transitioning_impedance = true;

        this.fingering = name;
    }

    change_vocal_tract(params){
        let vocal_tract_parameters = params["vocal_tract_parameters"];
        let continuous = params["continuous"];

        if (continuous){
            for (let i=0; i < this.vocal_tract_dim; i++ ){
                        this.S0[i] = this.S[i];
                        this.C0[i] = this.C[i]

                        this.S1[i].re = vocal_tract_parameters[i][0].re/this.characteristic_impedance;
                        this.S1[i].im = vocal_tract_parameters[i][0].im/this.characteristic_impedance;
                        this.C1[i].re = vocal_tract_parameters[i][1].re/this.characteristic_impedance;
                        this.C1[i].im = vocal_tract_parameters[i][1].im/this.characteristic_impedance;
                    }
                    
                    for (let i=0; i < this.impedances_dim; i++ ){
                        this.S0[i+this.vocal_tract_dim] = this.S[i+this.vocal_tract_dim];
                        this.C0[i+this.vocal_tract_dim] = this.C[i+this.vocal_tract_dim];
                        this.S1[i+this.vocal_tract_dim] = this.S[i+this.vocal_tract_dim];
                        this.C1[i+this.vocal_tract_dim] = this.C[i+this.vocal_tract_dim];

                    }
                
                    this.transitioning_impedance = true;
        } else {
            for (let i=0; i < this.vocal_tract_dim; i++ ){
                this.S[i].re = vocal_tract_parameters[i][0].re/this.characteristic_impedance;
                this.S[i].im = vocal_tract_parameters[i][0].im/this.characteristic_impedance;

                this.C[i].re = vocal_tract_parameters[i][1].re/this.characteristic_impedance;
                this.C[i].im = vocal_tract_parameters[i][1].im/this.characteristic_impedance;
            }
        }

        
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
        midPoint(this.model, this.X0, t0, buffer_size, dt, this.buffer);
    }

    transition_impedance(){
        if (this._transition_impedance_counter <= this.params['transition_time'].value){
            this._transition_impedance_counter+= this.dt;
            let t = this._transition_impedance_counter/this.params['transition_time'].value;
            let transition_speed = this.params['transition_speed'].value
            // let transition_coeff = 1/(1+10**(12*(1/2-t)));   
            // let transition_coeff = (1+Math.atan(transition_speed*(t-0.5))*2/Math.PI)/2;
            let transition_coeff = 1/(1+Math.exp(-transition_speed*0.5))
            transition_coeff = 1/(1+Math.exp(-transition_speed*(t-0.5)));
           
           
            for (let i=0; i < this.impedances_dim+this.vocal_tract_dim; i++){
                this.S[i].re = this.S0[i].re*(1-transition_coeff)+this.S1[i].re*transition_coeff;
                this.C[i].re = this.C0[i].re*(1-transition_coeff)+this.C1[i].re*transition_coeff;
                this.S[i].im = this.S0[i].im*(1-transition_coeff)+this.S1[i].im*transition_coeff;
                this.C[i].im = this.C0[i].im*(1-transition_coeff)+this.C1[i].im*transition_coeff;
                // 
            } 
            return(t)

        } else {
            this.transitioning_impedance = false;
            this._transition_impedance_counter = 0;

            return(0)
        }
    }

    // pressure_output(outputBuffer){
    //     let p;
    //     for (let i = 0; i < outputBuffer[0].length; i++) {
    //         p = 0;
    //         for (let j = 2; j < this.dim; j+=2) {
    //             p += this.buffer[i][j];
    //         }
    //         outputBuffer[0][i] = 2* p * this.output_impedance.value;
    //     }
    // }
    
    // pressure_derivative_output(outputBuffer){
    
    //     let signalnp1, signaln;
    
    //     signalnp1 = 0;
    //     for (let j = 2; j < this.dim; j+=2) {
    //         signalnp1 += this.buffer[0][j];
    //     }
        
    
    //     for (let i = 0; i < outputBuffer.length; i++) {
    //         signaln = signalnp1;
    //         signalnp1 = 0;
    //         for (let j = 2; j < this.dim; j+=2) {
    //             signalnp1 += this.buffer[i+1][j];
    //         }
    //         outputBuffer[i] = 100*(signalnp1-signaln) * this.output_impedance.value;
    //     }
    
    
    // }

    // output(outputBuffer){
    //     if (this.radiation_on){
    //          this.pressure_derivative_output(outputBuffer);
    //     } else {
    //         this.pressure_output(outputBuffer);
    //     }
    // }

    // save_session(){

    //     let session = this.save_parameters();

    //     return(session)
    // }

    // load_session(session){
    //     this.load_parameters(session)
    // }
}

function complexify(data){
    let object = {};
    let j, k;
    for (k in data) {
        object[k] = [];
        for (j = 0; j < data[k].length; j++){
            object[k].push(new complex(data[k][j][0], data[k][j][1]));
        }
    }
    return(object)
}


async function load_impedance(object, filename){

    let response = await fetch('./data/impedances/'+filename)
    let data =  await response.json() 
    object.impedances[filename.slice(0, -5)] = complexify(data);
}

async function load_fingerings(object){

    let response = await globalThis.fetch("./data/impedances/");
    let str = await response.text();
    let el = document.createElement('html');
    el.innerHTML = str;
    let list = el.getElementsByTagName("a");

    for (let item of list) {
        let ref = item.innerText;
        if (ref.slice(-5) == '.json'){
            await load_impedance(object, ref);
        }
    }
}

async function init_instrument(params){
    let object = {
        impedances :{},
    }
    await load_fingerings(object)
    return(object)
}

export { wind_instrument, parameter, init_instrument, complex };
