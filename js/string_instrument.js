'use strict';

import { instrument, parameter, sensor } from "./instrument.js?version=1.2";

class string_instrument extends instrument{
    constructor(name, params, strings, dim, limiter){
        // No params but can have mics and strings
        super(name, params, dim, limiter)
        this.maximal_dim = dim;
      
        this.strings_name = strings;
        this.strings = new Array(strings.length);
        this.mics = [];

        this.params["transition_time"] = new parameter(1e-4, [1e-6, 1e-2], 'μs', 1e6, 0, false)
        this.params["transition_speed"] = new parameter(1e4, [100, 1e5], '', 1e-3, 2, false)

        this.attack_shape = "triangle";
    
        this.polarisation = false;
        this.nonlinearity  = false;

        this.available_sensors["bridge"] = {}
        this.available_sensors["displacement"] = {polarisation: "y or z", position: "m"}
        this.available_sensors["velocity"] = {polarisation: "y or z", position: "m/s"}

        this.sensor_class = microphone

        this.connected_sensors.push(new microphone(this, "bridge"))
        this.connected_sensors.push(new microphone(this, "bridge"))

        this.geometry_ready = false;
    }

    change_dimension(value){
        if (value > this.maximal_dim){
            console.log("Pb de dimension")
            this.dim = this.maximal_dim
        } else {
            this.dim = value;
        }
    }

    update_scheme_constants(){
        for (let s = 0; s < this.strings.length; s++){
            this.strings[s]._scheme_constants()
        }
    }

    // add_microphone(type, position=0){
    //     let new_mic = new microphone(this, {position:position}, type, 1)
    //     this.mics.push(new_mic)     
    //     this.connected_sensors.push(new_mic)   
    // }

    init_audio(buffer_size, dt){
        for (var s = 0; s < this.strings.length; s++){
            this.strings[s].init_audio(buffer_size, dt)
        }
    }

    next_chunk(t0, buffer_size, dt){
        for (var s = 0; s < this.strings.length; s++){
           this.strings[s].next_chunk(t0, buffer_size, dt)
       }
    }

    reset_chunk(){
        for (var s = 0; s < this.strings.length; s++){
            this.strings[s].reset_chunk()
        }
    }

    loop_chunk(){
        for (var s = 0; s < this.strings.length; s++){
            this.strings[s].loop_chunk()
        }
    }

    _create_string(data, s){
        return(new string(this, data["strings"][this.strings_name[s]], this.dim, this.limiter))
    }

    set_geometry(data){
        for (let s = 0; s < this.strings_name.length; s++){

            this.strings[s] = this._create_string(data, s);
            for (const param in this.strings[s].params) {
                this.params[param+'€'+(s+1)] = this.strings[s].params[param];
            }
        }

        for (let m=0; m < this.connected_sensors.length; m++){
            this.connected_sensors[m].compute_filter();
        }

        this.geometry_ready = true;
    }

    change_fingering(params){
        if ((params["string"] >= 0) && (params["string"] < this.strings.length)) {
            if (params["position"] < 0){
                console.log("mute")
            } else {
                this.strings[params["string"]].change_fingering(params["position"])
            }
        }
    }

    mute_string(params){
        for (let i = 0; i < params.length; i++){
            this.strings[params[i].string-1].muted = params[i].state;
        }
    }

    toggle_polarisation(params){
        this.polarisation = params.value;
    }

    toggle_nonlinearity(params){
        this.nonlinearity = params.value;
    }

    change_attack_shape(params){
        this.attack_shape = params["shape"];
        for (var s = 0; s < this.strings.length; s++){
            this.strings[s]._compute_extra_constants()
        }
    }

}

class microphone extends sensor{
    constructor(parent, type = "bridge", params = {}){
        super(parent, type, params)

        // this.parent = parent;
        // this.gain = gain;
        // this.non_lin = false;
        // this.type = type;
        // console.log(this[type+"_output"])
        // if (type == "bridge") {
        //     this.output = this.bridge_output;
        //     this.compute_filter = this.compute_filter_bridge;
        //     this.Zc = 1;
        // } else if (type == "displacement") {
        //     this.output = this.displacement_output;
        //     this.polarisation = params['polarisation']
        //     this.position = params["position"]
        //     this.compute_filter = this.compute_filter_displacement;
        //     this.Zc = 1;
        // } else if (type == "single") {
        //     this.width = new parameter(0.02, [0.01, 0.03], 'mm', 1e3, 0);
        //     this.output = this.electric_output;
        //     this.compute_filter = this.compute_filter_electric;
        //     this.position = position;
        //     this.Zc = 1e-3;

        // } else if (type == "dual"){
        //     this.width = new parameter(0.04, [0.02, 0.06], 'mm', 1e3, 0);
        //     this.output = this.electric_output;
        //     this.compute_filter = this.compute_filter_electric;
        //     this.position = position;
        //     this.Zc = 1e-3;
        // }

        this.spatial_filter = new Array(this.parent.strings.length)
        for (let s = 0; s < this.parent.strings.length; s++){
            this.spatial_filter[s] = new Float32Array(this.parent.maximal_dim);
        }
       
        if (this.parent.geometry_ready){
            this.compute_filter();
        }
        
    }

    change_gain(value){
        this.gain = value;
    }

    /* Definition of the bridge sensor*/
    bridge_output(output){

        let x;
        let buffer_string;
        for (let k=0; k < output.length; k++){
            x = 0;
            for (var s = 0; s < this.parent.strings.length; s++){
                
                if (!this.parent.strings[s].muted){ 
                    // if (this.parent.polarisation){
                    //     buffer_string = this.strings[s].buffer_y[k];
                    // } else {
                        buffer_string = this.parent.strings[s].buffer_z[k];
                    // }
                    for (let n = 0; n < this.parent.dim; n++){
                        
                        x += buffer_string[n]*this.spatial_filter[s][n];
                    }  
                }         
            }
            output[k] += x;
            
        }        
    }

    bridge_init(params){
        this.compute_filter = this.bridge_compute_filter
        this.output_impedance = 3;
        this.unit = "N"
    }

    bridge_compute_filter(){

        for (let s = 0; s < this.parent.strings.length; s++){
            for (var n =0; n < this.parent.dim; n++){
                this.spatial_filter[s][n] = (this.parent.strings[s].params["tension_y"].value*((n+1)*Math.PI/this.parent.strings[s].L)*(-1)**(n+1)-this.parent.strings[s].params["stiffness_y"].value*((n+1)*Math.PI/this.parent.strings[s].L)*(-1)**(n+1)**3);
            }
        }

    }

    /* Definition of thte displacement filter */
    displacement_output(output){

        let x;
        let buffer_string;
        for (let k=0; k < output.length; k++){
            x = 0;
            for (var s = 0; s < this.parent.strings.length; s++){
                
                if (!this.parent.strings[s].muted){ 
                    if (this.polarisation == "y"){
                        buffer_string = this.parent.strings[s].buffer_y[k];
                    } else {
                        buffer_string = this.parent.strings[s].buffer_z[k];
                    }
                    for (let n = 0; n < this.parent.dim; n++){  
                        x += buffer_string[n]*this.spatial_filter[s][n];
                    }  
                }         
            }
            output[k] += x;
        }  
    }

    displacement_init(params){
        this.compute_filter = this.displacement_compute_filter
        this.polarisation = params['polarisation']
        this.position = params["position"]
        this.output_impedance = 1e2;
        this.unit = "m"
    }


    displacement_compute_filter(){
        for (let s = 0; s < this.parent.strings.length; s++){
            for (var n =0; n < this.parent.dim; n++){
                this.spatial_filter[s][n] = Math.sin((n+1)*Math.PI*this.position/this.parent.strings[s].L);
            }
        }
    }

    /* Definition of thte velocity filter */
    velocity_output(output){

        let x;
        let buffer_string;
        for (let k=0; k < output.length; k++){
            x = 0;
            for (var s = 0; s < this.parent.strings.length; s++){
                
                if (!this.parent.strings[s].muted){ 
                    if (this.polarisation == "y"){
                        buffer_string = this.parent.strings[s].buffer_y[k];
                    } else {
                        buffer_string = this.parent.strings[s].buffer_z[k];
                    }
                    for (let n = 0; n < this.parent.dim; n++){  
                        x += buffer_string[n]*this.spatial_filter[s][n];
                    }  
                }         
            }
            output[k] += x;
        }  
    }

    velocity_init(params){
        this.compute_filter = this.velocity_compute_filter
        this.polarisation = params['polarisation']
        this.position = params["position"]
        this.output_impedance = 1e2;
        this.unit = "m/s"
    }


    velocity_compute_filter(){
        for (let s = 0; s < this.parent.strings.length; s++){
            for (var n =0; n < this.parent.dim; n++){
                this.spatial_filter[s][n] = Math.cos((n+1)*Math.PI*this.position/this.parent.strings[s].L)*(n+1)*Math.PI/this.parent.strings[s].L;
            }
        }
    }


    // electric_output(output, gain){
        
    //     for (var s = 0; s < this.parent.strings.length; s++){
    //         if (!this.parent.strings[s].muted){ 
    //             let x, x1=0;

    //             // Compute x0
    //             for (let n = 0; n < this.parent.dim; n++){
    //                 x1 += this.parent.strings[s].buffer_z[0][n]*this.spatial_filter[s][n];
    //             }  

    //             for (let k=0; k < output.length; k++){

    //                 x = x1;
    //                 x1 = 0;

    //                 for (let n = 0; n < this.parent.dim; n++){
    //                     x1 += this.parent.strings[s].buffer_z[k+1][n]*this.spatial_filter[s][n];
    //                 }  
                    
    //                 if (!this.non_lin){
                        
    //                     output[k] += gain*this.gain*x*1e3;
    //                 } else {
    //                     // Derivative and gain
    //                     output[k] += gain*this.gain*(x1-x)/this.strings[s].dt;
    //                 }

    //             }  
    //         }       
    //     }
    // }

    /* cf. Non-Linear Identification of an Electric Guitar Pickup*/
    // nlin(x){
    //     if (!this.non_lin){return(x)}
    //     return(7.5e-2*x+6.75e-3*x**2+2.11e-3*x**3+4.75e-4*x**4+8.31e-4*x**5)
    // }

    // set_width(w){

    //     this.width.set_from_percentage(w);
    //     let display = this.width.to_string();
    //     this.compute_filter();
    //     return(display)

    //     // this.position = pos;
      
        
    //     // this.compute_filter();
    // }
        
    // set_position(pos){

    //     this.position = pos;
        
    //     this.compute_filter();
    // }
    
    
    // compute_filter_electric(){

    //     for (let s = 0; s < this.parent.strings.length; s++){
    //         for (var n =0; n < this.parent.dim; n++){
    //             this.spatial_filter[s][n] = this.parent.strings[s].r**2*this.Zc*Math.sin(2*(n+1)*Math.PI*this.position)*Math.sin((n+1)*Math.PI*this.width.value)/(n+1);
    //         }   
    //     } 
        
    // }
        
}

class string extends instrument{
    constructor(parent, params, dim, limiter){
        // No params inherited
        super(params["brand"]+params["fundamental"], {}, dim, 0)
        
        this.parent = parent;

        this.r = params["r"]
        let mu = params['density']*Math.PI*(this.r**2);
        this.goal_L =  this.origin_L = this.L = params['L'];
        this.L0 = this.L;
        let EI = params["young"]*Math.PI*(this.r**4)/4;
        let EA = params["young"]*Math.PI*(this.r**2);

        this.params["density_y"] = new parameter(mu, [mu*0.5, mu*2], 'g/m', 1e3, 2, true);
        this.params["tension_y"] = new parameter(params['T'], [params['T']*0.5, params['T']*2], 'N', 1, 0, true);
        this.params["stiffness_y"] = new parameter(EI, [EI*1e-2, EI*1e2], 'N', 1e3, 2, true);
        this.params["losses_eta_y"] = new parameter(params['eta']/4, [params['eta']/40, params['eta']*4], 'νs', 1e9, 1, true);
        this.params["losses_R_y"] = new parameter(params['R']/4, [params['R']/40, params['R']*4], 'Hz', 1, 2, true);
        this.params["nonlinearity_y"] = new parameter(EA, [1e-3, EA*1e2], 'N', 1e-3, 0, true);

        this.params["density_z"] = new parameter(mu, [mu*0.5, mu*2], 'g/m', 1e3, 2, true);
        this.params["tension_z"] = new parameter(params['T'], [params['T']*0.5, params['T']*2], 'N', 1, 0, true);
        this.params["stiffness_z"] = new parameter(EI, [EI*1e-2, EI*1e2], 'N', 1e3, 2, true);
        this.params["losses_eta_z"] = new parameter(params['eta'], [params['eta']/10, params['eta']*10], 'νs', 1e9, 1, true);
        this.params["losses_R_z"] = new parameter(params['R'], [params['R']/10, params['R']*10], 'Hz', 1, 2, true);
        this.params["nonlinearity_z"] = new parameter(EA, [1e-3, EA*1e2], 'N', 1e-3, 0, true);

        // console.log("Frequency", params["fundamental"], 1/(2*this.L)*(params['T']/mu)**0.5)
        this.dim = dim; // Nombre d'harmoniques maximal

        this.attack_time_position = 0; //attack_duration0;
        
        // Données pour le théta schéma
        this.b_y = new Float32Array(this.dim).fill(0);
        this.c_y = new Float32Array(this.dim).fill(0);
        this.b_z = new Float32Array(this.dim).fill(0);
        this.c_z = new Float32Array(this.dim).fill(0);
        
        this.X0 = new Array(this.dim).fill(0);
        this.Y0 = new Array(this.dim).fill(0);

        
        this.theta = 0.5;
        this.muted = false;

        this._transition_length_counter = this.parent.params["transition_speed"].value;     
    }

    
    /**
     *  Initialise les variables pour les calculs sur la string : le buffer des coefficents de Fourier et les constantes du theta-schéma
     */ 
    init_audio(buffer_size, dt){

        this.dt = dt;
                 
        this.buffer_z = new Array((buffer_size+2));   // Tableau contenant les lesdonnées en chaque temps
        this.buffer_y = new Array((buffer_size+2));   // Tableau contenant les lesdonnées en chaque temps
        this.KC = new Float32Array((buffer_size+2)); 


        for (let k=0; k < this.buffer_z.length; k++){
            this.buffer_z[k] = new Float32Array(this.parent.dim).fill(0) // Pour chaque temps, on a les composantes 
            this.buffer_y[k] = new Float32Array(this.parent.dim).fill(0) // Pour chaque temps, on a les composantes 
        }      
        this._scheme_constants();
    }
    
    /**
     *  Calcul les constantes pour le theta schema, doit être appelé après chaque changment de paramètres physique de la string
     */ 
    _scheme_constants(){
        var a;
        for (var n=1; n <= this.parent.dim; n++){
        
            let Lap = -1*(n*Math.PI/this.L)**2;         
            a = this.params["density_y"].value-this.dt**2*(-this.params["stiffness_y"].value*this.theta*Lap**2+this.params["tension_y"].value*this.theta*Lap)-this.dt*(this.params["tension_y"].value*this.params["losses_eta_y"].value*Lap-this.params["density_y"].value*this.params["losses_R_y"].value);
            this.b_y[n-1] = (2*this.params["density_y"].value+this.dt**2*(-this.params["stiffness_y"].value*(1-2*this.theta)*Lap**2+this.params["tension_y"].value*(1-2*this.theta)*Lap))/a;
            this.c_y[n-1] = (-this.params["density_y"].value+this.dt**2*(-this.params["stiffness_y"].value*this.theta*Lap**2+this.params["tension_y"].value*this.theta*Lap)-this.dt*(this.params["tension_y"].value*this.params["losses_eta_y"].value*Lap-this.params["density_y"].value*this.params["losses_R_y"].value))/a;

            a = this.params["density_z"].value-this.dt**2*(-this.params["stiffness_z"].value*this.theta*Lap**2+this.params["tension_z"].value*this.theta*Lap)-this.dt*(this.params["tension_z"].value*this.params["losses_eta_z"].value*Lap-this.params["density_z"].value*this.params["losses_R_z"].value);
            this.b_z[n-1] = (2*this.params["density_z"].value+this.dt**2*(-this.params["stiffness_z"].value*(1-2*this.theta)*Lap**2+this.params["tension_z"].value*(1-2*this.theta)*Lap))/a;
            this.c_z[n-1] = (-this.params["density_z"].value+this.dt**2*(-this.params["stiffness_z"].value*this.theta*Lap**2+this.params["tension_z"].value*this.theta*Lap)-this.dt*(this.params["tension_z"].value*this.params["losses_eta_z"].value*Lap-this.params["density_z"].value*this.params["losses_R_z"].value))/a
        }      

        this._compute_extra_constants()       
    }

    _compute_extra_constants(){
        
    }

    compute_attack_shape_decompostion(position, width){

        if (typeof this.attack_coefs == 'undefined'){
            this.attack_coefs = new Float32Array(this.dim)
        }

         
        let x0 = Math.PI*position/this.L;
        let delta = Math.PI*width/this.L;

        if (this.parent.attack_shape == "dirac"){
            for (let n = 0; n < this.parent.dim; n++){
                this.attack_coefs[n] = Math.sin((n+1)*x0)
            }
            return
        }
 
        if (this.parent.attack_shape == "rectangle"){
    
            for (let n = 0; n < this.parent.dim; n++){
                    this.attack_coefs[n] = Math.sin((n+1)*x0)*sinc((n+1)*delta);  
            }
            return
        }

        if (this.parent.attack_shape == "triangle"){
    
            for (let n = 0; n < this.parent.dim; n++){
                this.attack_coefs[n] = Math.sin((n+1)*x0)*cosc((n+1)*delta);
            }
            return
        }

        if (this.parent.attack_shape == "sine"){

    
            for (let n = 0; n < this.parent.dim; n++){

                if (Math.abs((n+1)*delta/Math.PI-1) > 1e-6) {
                    this.attack_coefs[n] = -Math.sin((n+1)*x0)*sinc((n+1)*delta)/(((n+1)*delta/Math.PI)**2-1);
                } else {
                    this.attack_coefs[n] = Math.sin((n+1)*x0)/2;
                }
            }
            return
        }


    }


    add_attack(buffer, buffer2){

    }

    transition_length(dt){


        if (this._transition_length_counter <= this.parent.params["transition_time"].value){
            // this.muted = true;

            // console.log("Imhere", this._transition_length_counter, this.parent.params["transition_time"].value, dt)
            
            this._transition_length_counter+=dt;
            let t = this._transition_length_counter/this.parent.params["transition_time"].value;
            let transition_coeff = (1+1/(1+Math.exp(-this.parent.params["transition_speed"].value*t)))/2;
            transition_coeff = Math.sin(Math.PI/2*t)**2;
           
            this.L = transition_coeff*this.goal_L+(1-transition_coeff)*this.origin_L;  
        
            this._scheme_constants()
            
            return(t)

        } else {
            // this.muted = false

            return(0)
        }

    }
    
    /**
     *  Calcule les coffeficients de Fourier pour le prochain buffer 
     *  à redéfinir !!!
     */ 
    next_chunk(t0, buffer_size, dt){

        if (this.muted) return;

        this.KC[1] = 0;

        for (var i = 2; i < buffer_size+2; i++){ // Pour chaque pas de temps
            this.transition_length(dt)
            for (var n = 0; n < this.parent.dim; n++){
                this.buffer_z[i][n] = 0;
                if (this.parent.polarisation){
                    this.buffer_y[i][n] = 0;
                }
            }

            // First part of Strang splitting on the attack

            // this.add_attack(dt/2, this.buffer_z[i], this.buffer_z[i-1], this.buffer_z[i-2], this.buffer_y[i], this.buffer_y[i-1], this.buffer_y[i-2]);
                       
            // Theta-scheme + First part of Strang plitting on Kirchhoff Carrier
            let kc_y = 0;
            let kc_z = 0;

            if (this.parent.nonlinearity){
                kc_y = dt**2/4*this.KC[i-1]/this.params['density_y'].value;
                kc_z = dt**2/4*this.KC[i-1]/this.params['density_z'].value;
            }


            this.KC[i] = 0;

            for (var n = 0; n < this.parent.dim; n++){
                this.buffer_z[i][n] += (this.buffer_z[i-1][n]*this.b_z[n]+this.c_z[n]*this.buffer_z[i-2][n])- kc_z*this.buffer_z[i-1][n]*(n+1)**2;
                this.KC[i] += (this.buffer_z[i][n]*(n+1))**2;
                if (this.parent.polarisation){
                    this.buffer_y[i][n] += (this.buffer_y[i-1][n]*this.b_y[n]+this.c_y[n]*this.buffer_y[i-2][n])- kc_y*this.buffer_y[i-1][n]*(n+1)**2;
                    this.KC[i] += (this.buffer_y[i][n]*(n+1))**2;        
                }
            }

            // Second part of Strang splitting on Kirchhoff Carrier
            // this.KC[i] = 0;
            // for (let n = 0; n < this.parent.dim; n++){
            //     this.KC[i] += (this.buffer_z[i][n]*(n+1))**2;
            //     if (this.parent.polarisation){
            //         this.KC[i] += (this.buffer_y[i][n]*(n+1))**2;        
            //     }
            // }

            this.KC[i] *= this.params["nonlinearity_z"].value*(Math.PI/this.L)**4/(4*this.L);

            if (this.parent.nonlinearity){
                kc_y = dt**2/4*this.KC[i]/this.params['density_y'].value;
                kc_z = dt**2/4*this.KC[i]/this.params['density_z'].value;
            
                for (let n = 0; n < this.parent.dim; n++){
                    this.buffer_z[i][n] -= kc_z*this.buffer_z[i][n]*(n+1)**2;
                    if (this.parent.polarisation){
                        this.buffer_y[i][n] -= kc_y*this.buffer_y[i][n]*(n+1)**2;
                    }
                }
            }

            // Second part of Strang splitting on the attack

            
            this.add_attack(dt, this.buffer_z[i], this.buffer_z[i-1], this.buffer_z[i-2], this.buffer_y[i], this.buffer_y[i-1], this.buffer_y[i-2]);

            // this.add_attack(dt/2, this.buffer_z[i], this.buffer_z[ipm1]);
        }
    }    

    reset_chunk(){
        for (let i=0; i < this.dim; i++){
            this.buffer_z[0][i] = 0;
            this.buffer_z[1][i] = 0;
            this.buffer_y[0][i] = 0;
            this.buffer_y[1][i] = 0;
            
        }
        this.KC[0] = 0;
        this.KC[1] = 0;
        this._reset_chunk()
    }

    _reset_chunk(){

    }

    loop_chunk(){
        for (let i=0; i < this.dim; i++){
            this.buffer_z[0][i] = this.buffer_z[this.buffer_z.length-2][i];
            this.buffer_z[1][i] = this.buffer_z[this.buffer_z.length-1][i];
            this.buffer_y[0][i] = this.buffer_y[this.buffer_y.length-2][i];
            this.buffer_y[1][i] = this.buffer_y[this.buffer_y.length-1][i];
          
        }  
        this.KC[0] = this.KC[this.KC.length-2]
        this.KC[1] = this.KC[this.KC.length-1]
        this._loop_chunk();
    }

    _loop_chunk(){

    }


    change_fingering(position){
        this.origin_L = this.L;
        this.goal_L = this.L0*position; 
        this._transition_length_counter = 0;
    }


}


function sinc(x){
    if (x <1e-6) return(1)
    return(Math.sin(x)/x)
}

function cosc(x){
    if (x <1e-6) return(1)
    return(2*(1-Math.cos(x))/x**2)
}



async function load_string_details(object, string_name){

    let string_file = './data/strings/default/'+string_name+'.json';
    let response = await fetch(string_file)
    let data =  await response.json() 
    object.strings[string_name] = data;
    console.log(data)
}

async function load_strings(object){

    let response = await globalThis.fetch("./data/strings/default/");
    let str = await response.text();
    let el = document.createElement('html');
    el.innerHTML = str;
    let list = el.getElementsByTagName("a");

    for (let item of list) {
        let ref = item.innerText;
        if (ref.slice(-4) == 'json'){
            await load_string_details(object, ref.slice(0, -5));
            // await load_transfer(object, ref);
        }   
    }
}

async function init_instrument(params){
    let object = {
        impedances :{},
        strings : {}
    }
    await load_strings(object)
    return(object)
}

export { string_instrument, string, parameter, sensor, init_instrument };
