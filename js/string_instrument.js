'use strict';

import { instrument, parameter } from "./instrument.js?version=1.1";

class string_instrument extends instrument{
    constructor(name, params, strings, dim, limiter, output_impedance){
        // No params but can have mics and strings
        super(name, params, dim, limiter, output_impedance)
        this.dim = dim;
      
        this.strings_name = strings;
        this.strings = new Array(strings.length);
        this.mics = [];
    }

    change_dimension(value){
        if (value >= this.strings[0].dim){
            console.log("Pb de dimension")
            this.dim = this.strings[0].dim
        } else {
            this.dim = value;
        }
    }

    update_scheme_constants(){
        for (let s = 0; s < this.strings.length; s++){
            this.strings[s]._scheme_constants()
        }
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

    _create_string(data, s){
        return(new string(this, data["strings"][this.strings_name[s]], this.dim, this.limiter, this.output_impedance.value))
    }

    set_geometry(data){
        for (let s = 0; s < this.strings_name.length; s++){

            this.strings[s] = this._create_string(data, s);
            for (const param in this.strings[s].params) {
                this.params[param+'€'+(s+1)] = this.strings[s].params[param];
            }
        }

        for (let m=0; m < this.mics.length; m++){
            this.mics[m].compute_filter();
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
                this.mics[m].output(outputData, this.output_impedance.value)
            } else {
                this.mics[m].output(outputData, this.output_impedance.value)
            }
        }
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

}

// async function load_IRF(object){
//     // $.getJSON('./data/'+folder+'transfer.json', function( data ) {
//     //     object.transfer_functions[folder.slice(0, -1)] = data;
//     // });
//     $.ajax({
//         url: `./data/IFR/`,
//         success: function(data){
//             $(data).find("a:contains(wav)").each(function(){
//                 let file = $(this).attr("href");
//                 object.radiation_filters[file.split(".")[0]] = './data/IFR/'+file;
//                 if (object.radiation_filter.length == 0){
//                     object.radiation_filter = './data/IFR/'+file;
//                 }
//             })
//         },
//         error: function(XMLHttpRequest, textStatus, errorThrown) { 
//             alert("Status: " + textStatus); alert("Error: " + errorThrown); 
//         }    
//     });
    
// }

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
            this.Zc = 1;
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
       
        // this.compute_filter();
        
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
                    for (let n = 0; n < this.parent.dim; n++){
                        
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

        this.width.set_from_percentage(w);
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
            for (var n =0; n < this.parent.dim; n++){
                this.spatial_filter[s][n] = this.strings[s].r**2*this.Zc*Math.sin(2*(n+1)*Math.PI*this.position)*Math.sin((n+1)*Math.PI*this.width.value)/(n+1);
            }   
        } 
        
    }

    compute_filter_acoustic(){

        for (let s = 0; s < this.strings.length; s++){
            for (var n =0; n < this.parent.dim; n++){
                this.spatial_filter[s][n] = this.Zc*(this.parent.strings[s].params["tension"].value*((n+1)*Math.PI/this.parent.strings[s].L)*(-1)**(n+1)-this.parent.strings[s].params["stiffness"].value*((n+1)*Math.PI/this.parent.strings[s].L)*(-1)**(n+1)**3);
            }
        }

    }
        
}

class string extends instrument{
    constructor(parent, params, dim, limiter, output_impedance){
        // No params inherited
        super(params["brand"]+params["fundamental"], {}, dim, 0, output_impedance)
        
        this.parent = parent;

        this.r = params["r"]
        let mu = params['density']*Math.PI*(this.r**2);
        this.L = params['L'];
        this.L0 = this.L;
        let EI = params["young"]*Math.PI*(this.r**4)/4;
        let EA = params["young"]*Math.PI*(this.r**2);

        this.params["density"] = new parameter(mu, [mu*0.5, mu*2], 'g/m', 1e3, 2, true);
        this.params["tension"] = new parameter(params['T'], [params['T']*0.5, params['T']*2], 'N', 1, 0, true);
        this.params["stiffness"] = new parameter(EI, [EI*1e-2, EI*1e2], 'N', 1e3, 2, true);
        this.params["losses_eta"] = new parameter(params['eta'], [params['eta']/4, params['eta']*4], 'νs', 1e9, 1, true);
        this.params["losses_R"] = new parameter(params['R'], [params['R']/4, params['R']*4], 'Hz', 1, 2, true);
        this.params["nonlinearity"] = new parameter(EA, [EA*1e-2, EA*1e2], 'N', 1e-3, 0, true);



        console.log("Frequency", params["fundamental"], 1/(2*this.L)*(params['T']/mu)**0.5)
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
                
        this.buffer = new Array((buffer_size+2));   // Tableau contenant les lesdonnées en chaque temps
        for (let k=0; k < this.buffer.length; k++){
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
        
            let Lap = -1*(n*Math.PI/this.L)**2;                  
            a = this.params["density"].value-this.dt**2*(-this.params["stiffness"].value*this.theta*Lap**2+this.params["tension"].value*this.theta*Lap)-this.dt*(this.params["tension"].value*this.params["losses_eta"].value*Lap-this.params["density"].value*this.params["losses_R"].value);
            this.b[n-1] = (2*this.params["density"].value+this.dt**2*(-this.params["stiffness"].value*(1-2*this.theta)*Lap**2+this.params["tension"].value*(1-2*this.theta)*Lap))/a;
            this.c[n-1] = (-this.params["density"].value+this.dt**2*(-this.params["stiffness"].value*this.theta*Lap**2+this.params["tension"].value*this.theta*Lap)-this.dt*(this.params["tension"].value*this.params["losses_eta"].value*Lap-this.params["density"].value*this.params["losses_R"].value))/a
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
        var ip, ipm1, ipm2;
        for (var i = 2; i < buffer_size+2; i++){ // Pour chaque pas de temps

            // Strang splitting

            // this.add_attack(dt/2, this.buffer[ip], this.buffer[ipm2]);


            for (var n = 0; n < this.parent.dim; n++){
                this.buffer[i][n] = (this.buffer[i-1][n]*this.b[n]+this.c[n]*this.buffer[i-2][n]);
            }
            
            this.add_attack(dt, this.buffer[i], this.buffer[i-1], this.buffer[i-2]);

            // this.add_attack(dt/2, this.buffer[i], this.buffer[ipm1]);
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
            this.buffer[0][i] = this.buffer[this.buffer.length-2][i];
            this.buffer[1][i] = this.buffer[this.buffer.length-1][i];
        }
    }


    change_fingering(position){
        this.L = this.L0*position; 
        this._scheme_constants()
    }


}


async function load_string_details(object, string_name){

    let string_file = './data/strings/default/'+string_name+'.json';
    let response = await fetch(string_file)
    let data =  await response.json() 
    object.strings[string_name] = data;
}

async function load_strings(object){

    let response = await globalThis.fetch("./data/strings/default");
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

export { string_instrument, string, parameter, init_instrument };
