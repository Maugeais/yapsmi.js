'use strict';

import { instrument, parameter } from "./instrument.js";

class string_instrument extends instrument{
    constructor(name, strings, dim, max, gain){
        // No params and no dim but can have mics and strings
        super(name, [], {}, dim, max, gain)
        this.dim = dim;
      
        this.strings_details = strings;
        this.strings = new Array(strings.length);
        this.mics = [];
    }

    async init(){
        for (let s = 0; s < this.strings_details.length; s++) {
            let string_file = './data/strings/'+this.strings_details[s]+'.json';
            await fetch(string_file)
                .then((response) => response.json())
                .then((params) => {
                    this.strings[s] = new string(this, params, this.dim, this.max, this.gain.value);
                });  
                
        }     
        
        load_IRF(this);
    }

    add_microphone(type, position=0){
        let new_mic = new microphone(this, type, this.dim, position, 1, this.strings)
        this.mics.push(new_mic)        
    }

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

    output(outputData){
        // C'est la somme des outputs de toutes les cordes
        // Radiate sert de microphones = fonction de transfert
        for (let n = 0; n < outputData.length; n++){
            outputData[n] = 0;
        }
        for (let m=0; m < this.mics.length; m++){
            if (this.mics[m].type == "acoustic"){
                this.mics[m].output(outputData, this.gain.value)
            } else {
                this.mics[m].output(outputData, this.gain.value)
            }
        }
    }

    change_fingering(string, position){
        if ((string >= 0) && (string < this.strings.length)) {
            if (position < 0){
                console.log("mute")
            } else {
                this.strings[string].change_fingering(position)
            }
        }
    }

}

async function load_IRF(object){
    // $.getJSON('./data/'+folder+'transfer.json', function( data ) {
    //     object.transfer_functions[folder.slice(0, -1)] = data;
    // });
    $.ajax({
        url: `./data/IFR/`,
        success: function(data){
            $(data).find("a:contains(wav)").each(function(){
                let file = $(this).attr("href");
                object.radiation_filters[file.split(".")[0]] = './data/IFR/'+file;
                if (object.radiation_filter.length == 0){
                    object.radiation_filter = './data/IFR/'+file;
                }
            })
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) { 
            alert("Status: " + textStatus); alert("Error: " + errorThrown); 
        }    
    });
    
}

class microphone{
    constructor(parent, type = "acoustic", dim = 15, position = 0.01, gain = 0.333, strings = []){

        this.parent = parent;
        this.dim = dim;
        this.gain = gain;
        this.non_lin = false;
        this.type = type;
        this.strings = strings;
        if (type == "acoustic") {
            this.width = new parameter(0, [0, 0.1], 'mm', 1e3, 0);
            this.output = this.acoustic_output;
            this.compute_filter = this.compute_filter_acoustic;
            this.Zc = 1e-10;
        } else if (type == "single") {
            this.width = new parameter(0.02, [0.01, 0.03], 'mm', 1e3, 0);
            this.output = this.electric_output;
            this.compute_filter = this.compute_filter_electric;
            this.position = position;
            this.Zc = 1e-3;

        } else if (type == "dual"){
            this.width = new parameter(0.04, [0.02, 0.06], 'mm', 1e3, 0);
            this.output = this.electric_output;
            this.compute_filter = this.compute_filter_electric;
            this.position = position;
            this.Zc = 1e-3;
        }

        this.spatial_filter = new Array(this.strings.length)
        for (let s = 0; s < this.strings.length; s++){
            this.spatial_filter[s] = new Float32Array(dim);
        }
       
        this.compute_filter();
        
    }

    change_gain(value){
        this.gain = value;
    }

    acoustic_output(output, gain){
        let x;
        let buffer_string;
        for (let k=0; k < output.length; k++){
            x = 0;
            for (var s = 0; s < this.strings.length; s++){
                
                if (!this.strings[s].muted){ 
                    buffer_string = this.strings[s].buffer[k];
                    for (let n = 0; n < this.strings[s].dim; n++){
                        
                        x += buffer_string[n]*this.spatial_filter[s][n];
                    }  
                }         
            }
            output[k] += gain*x;
        }

        
    }

    electric_output(output, gain){
        
        for (var s = 0; s < this.strings.length; s++){
            if (!this.strings[s].muted){ 
                let x, x1=0;

                // Compute x0
                for (let n = 0; n < this.dim; n++){
                    x1 += this.strings[s].buffer[0][n]*this.spatial_filter[s][n];
                }  

                for (let k=0; k < output.length; k++){

                    x = x1;
                    x1 = 0;

                    for (let n = 0; n < this.dim; n++){
                        x1 += this.strings[s].buffer[k+1][n]*this.spatial_filter[s][n];
                    }  
                    
                    if (!this.non_lin){
                        
                        output[k] += gain*this.gain*x*1e3;
                    } else {
                        // Derivative and gain
                        output[k] += gain*this.gain*(x1-x)/this.strings[s].dt;
                    }

                }  
            }       
        }
    }

    /* cf. Non-Linear Identification of an Electric Guitar Pickup*/
    nlin(x){
        if (!this.non_lin){return(x)}
        return(7.5e-2*x+6.75e-3*x**2+2.11e-3*x**3+4.75e-4*x**4+8.31e-4*x**5)
    }

    set_width(w){

        this.width.set_from_precentage(w);
        let display = this.width.to_string();
        this.compute_filter();
        return(display)

        // this.position = pos;
      
        
        // this.compute_filter();
    }
        
    set_position(pos){

        this.position = pos;
        
        this.compute_filter();
    }
    
    
    compute_filter_electric(){

        for (let s = 0; s < this.strings.length; s++){
            for (var n =0; n < this.dim; n++){
                this.spatial_filter[s][n] = this.strings[s].r**2*this.Zc*Math.sin(2*(n+1)*Math.PI*this.position)*Math.sin((n+1)*Math.PI*this.width.value)/(n+1);
            }   
        } 
        
    }

    compute_filter_acoustic(){

        for (let s = 0; s < this.strings.length; s++){
            for (var n =0; n < this.dim; n++){
                this.spatial_filter[s][n] = this.Zc*(this.strings[s].T*(n+1)+this.strings[s].EI*(n+1)**3);
            }
        }

    }
        
}

class string extends instrument{
    constructor(parent, params, dim, max, gain){
        super(params["brand"]+params["fundamental"], params, dim, max, gain)
        
        this.parent = parent;

        this.r = params["r"]
        this.EI = this.params["young"]*Math.PI*(params["r_core"]**4)/4; // Module d'Young...
        this.mu = params['density']*Math.PI*(this.r**2);
        this.T = params['T'];
        this.L = params['L'];
        this.R = params['R'];
        this.eta = params['eta'];

        this.params["density"] = new parameter(this.mu, [this.mu*0.5, this.mu*2], 'g/m', 1e3, 0, true);
        this.params["tension"] = new parameter(this.T, [this.T*0.5, this.T*2], 'N', 1, 0, true);
        this.params["stiffness"] = new parameter(this.EI, [this.EI*1e-2, this.EI*1e2], 'N', 1e3, 2, true);
        this.params["eta"] = new parameter(this.eta, [this.eta/4, this.eta*4], 'νs', 1e9, 1, true);
        this.params["R"] = new parameter(this.R, [this.R/4, this.R*4], 'Hz', 1, 2, true);


        
        this.dim = dim; // Nombre d'harmoniques

        this.attack_time_position = 0; //attack_duration0;
        
        // Données pour le théta schéma
        this.b = new Float32Array(this.dim);
        this.c = new Float32Array(this.dim);
        
        this.X0 = new Array(this.dim).fill(0);
        
        this.theta = 0.5;
        this.muted = false;
    }

    
    /**
     *  Initialise les variables pour les calculs sur la string : le buffer des coefficents de Fourier et les constantes du theta-schéma
     */ 
    init_audio(buffer_size, dt){

        this.dt = dt;
                
        this.buffer = new Array((buffer_size+1));   // Tableau contenant les lesdonnées en chaque temps
        for (let k=0; k < buffer_size+1; k++){
            this.buffer[k] = new Float32Array(this.dim) // Pour chaque temps, on a les composantes 
            for (let i = 0; i < this.dim; i++){
                this.buffer[k][i] = 0;
            }
        }      
        this._scheme_constants();
    }
    
    /**
     *  Calcul les constantes pour le theta schema, doit être appelé après chaque changment de paramètres physique de la string
     */ 
    _scheme_constants(){
        var a;
        for (var n=1; n <= this.dim; n++){
        
            let Lap = -Math.pow(n*Math.PI/this.L, 2);                  
            a = this.mu-Math.pow(this.dt, 2)*(-this.EI*this.theta*Math.pow(Lap, 2)+this.T*this.theta*Lap)-2*this.dt*(this.T*this.eta*Lap-this.mu*this.R);
            this.b[n-1] = (2*this.mu+Math.pow(this.dt, 2)*(-this.EI*(1-2*this.theta)*Math.pow(Lap, 2)+this.T*(1-2*this.theta)*Lap))/a;
            this.c[n-1] = (-this.mu+Math.pow(this.dt, 2)*(-this.EI*this.theta*Math.pow(Lap, 2)+this.T*this.theta*Lap)-2*this.dt*(this.T*this.eta*Lap-this.mu*this.R))/a
        }

        this._compute_extra_constants()       
    }

    _compute_extra_constants(){
        
    }


    add_attack(buffer, buffer2){
        // if (this.attack_time_position > 0){
        //     let attack = this.pluck_constants();
        //     for (var n = 0; n < this.dim; n++){
        //         buffer[n] += attack.F*Math.sin((n+1)*attack.pos)*sinc((n+1)*attack.width)/this.mu;
        //     }
        //     this.attack_time_position -= 1/48000;
        // }
    }
    
    /**
     *  Calcule les coffeficients de Fourier pour le prochain buffer 
     *  à redéfinir !!!
     */ 
    next_chunk(t0, buffer_size, dt){
        var ip, ipm1;

        for (var i = 0; i < buffer_size+1; i++){ // Pour chaque pas de temps

            if (i == 0){

                ip = buffer_size-1;
                ipm1 = buffer_size-2;

            } else if (i == 1){

                ip = 0;
                ipm1 = buffer_size-1;

            } else {

                ip = i-1;
                ipm1 = i-2;

            }

            for (var n = 0; n < this.dim; n++){
                this.buffer[i][n] = (this.buffer[ip][n]*this.b[n]+this.c[n]*this.buffer[ipm1][n])
            }

            this.add_attack(dt, this.buffer[i], this.buffer[ip]);
        }
    }    

    reset_chunk(){
        for (let i=0; i < this.dim; i++){
            this.buffer[0][i] = 0;
            this.buffer[1][i] = 0;
        }
    }

    loop_chunk(){
        for (let i=0; i < this.dim; i++){
            this.buffer[0][i] = this.buffer[this.buffer.length-3][i];
            this.buffer[1][i] = this.buffer[this.buffer.length-2][i];
        }
    }


    change_fingering(position){
        this.L = this.params["L"]*position; 
        this._scheme_constants()
    }

    set_control(params){
        let s = this;         

        let key = Object.keys(params)[0];        
        this.params[key].set_from_precentage(params[key]);
       

        switch (key) {
            case 'density' : 
                    s.mu = s.params[key].value;
                    break;
            case 'tension' :
                    s.T = s.params[key].value;
                    break;
            case 'stiffness' :
                    s.EI = s.params[key].value;
                    break;
            case 'R' :
                    s.R = s.params[key].value;
                    break;
            case 'eta' : 
                    s.eta = s.params[key].value;
                    break
        }

        this._scheme_constants();

        return(this.params[key].to_string())
    }
}


export { string_instrument, string, microphone, parameter };
