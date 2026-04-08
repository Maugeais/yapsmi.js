'use strict';

import { instrument, parameter, sensor } from "./instrument.js?version=1.2";
import { rungeKutta, midPoint } from "./rk4.js?version=1.02";

let rho  = 1.292*273.15/(273.15+20)//1.1851


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
    down_stream_output(output){         

        let p;
        for (let i = 0; i < output.length; i++) {
            p = 0;
            for (let j = this.parent.vocal_tract_dim*2+2; j < this.parent.dim; j+=2) {
                p += this.parent.buffer[i][j];
            }
            output[i] = 2* p;
        }
    }

    down_stream_init(){
        this.output_impedance = 0.001;
        this.unit = "Pa"
    }

     
    radiated_output(output){

        let signalnp1, signaln;

        signalnp1 = 0;
        for (let j = this.parent.vocal_tract_dim*2+2; j < this.parent.dim; j+=2) {
            signalnp1 += this.parent.buffer[0][j];
        }    

        for (let i = 0; i < output.length; i++) {
            signaln = signalnp1;
            signalnp1 = 0;
            for (let j = this.parent.vocal_tract_dim*2+2; j < this.parent.dim; j+=2) {
                signalnp1 += this.parent.buffer[i+1][j];
            }
            output[i] = 2*sampleRate* (signalnp1-signaln);
        }    
    }

    radiated_init(){
        this.output_impedance = 1e-6;
        this.unit = "Pa/s"
    }
}


class wind_instrument extends instrument {
    constructor(name, params, dim, impedances_dim, limiter, fingering = 0, fingerings= [], vocal_tract_dim = 0){
        super(name, params, dim, limiter)
        this.impedances_dim = impedances_dim;
        this.vocal_tract_dim = vocal_tract_dim;
        this.impedances = {};
        this.characteristic_impedance = 1;


        this.params["F0"] = new parameter(0.0, [0.0, 1.0], '', 1, 2, false)
        this.params["reharm"] = new parameter(0, [0, 1.0], '', 1, 2, false)

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


        this.model = this.model.bind(this)

        this.available_sensors["down_stream"] = {} 
        this.available_sensors["radiated"] = {} 

        this.connected_sensors.push(new microphone(this, "down_stream", {}))
        this.connected_sensors.push(new microphone(this, "radiated", {}))

        this.sensor_class = microphone
    }

    regularized_beating(h){
        let eta = this.params["epsilon_beating"].value*this.params['H'].value**2;
        let reg = (h+(h**2+0.5*eta)/((h**2)+eta)**0.5)/2;
        return(reg);
    }

    differential_regularized_beating(h){
        let eta = this.params["epsilon_beating"].value*this.params['H'].value**2;
        return(1/2*(1+h*(h**2+1.5*eta)/(h**2+eta)**1.5));
    }

    regularized_flow(deltap, h){
        let epsilon = 16*Math.PI*18e-6*this.params["epsilon_flow"].value;
        let S = this.params['w'].value*this.regularized_beating(h);
        return(Math.sign(deltap)*(-epsilon+(epsilon**2+S**2*2*rho*Math.abs(deltap)/rho)**0.5))
        // return((2/rho)**0.5*(1+epsilon)*deltap/(deltap**2+Pc**2*epsilon)**0.25);
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

        if (name == "") name = this.fingering;

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
        
        let F0 = this.impedances[name]['S'][0].im;

        for (let i=0; i < this.impedances_dim; i++ ){
            this.S0[i+this.vocal_tract_dim] = this.impedances[this.fingering]['S'][i];
            this.C0[i+this.vocal_tract_dim] = this.impedances[this.fingering]['C'][i];

            let F = F0*Math.round(this.impedances[name]['S'][i].im/F0);
            this.S1[i+this.vocal_tract_dim].im = (1-this.params["reharm"].value)*this.impedances[name]['S'][i].im+this.params["reharm"].value*F;
            this.S1[i+this.vocal_tract_dim].re = this.impedances[name]['S'][i].re ;
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
            let transition_coeff = Math.sin(Math.PI/2*t)**2; //1/(1+Math.exp(-transition_speed*0.5))
            // transition_coeff = 1/(1+Math.exp(-transition_speed*(t-0.5)));
           
           
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
