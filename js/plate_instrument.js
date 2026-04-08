'use strict';

import { instrument, parameter, sensor } from "./instrument.js?version=1.2";


class plate_instrument extends instrument{
    constructor(name, params, dim, limiter, gain){
        super(name, params, dim, limiter, gain)

        // dim is an array [m, n]
        // No params inherited
        // super(params["brand"]+params["fundamental"], {}, dim, 0)
        // super(params["brand"]+params["fundamental"], params, dim, limiter)
        
        // this.params = params;

       

        this.losses_eta = 1e-3;
        this.losses_R = 5e1;

        this.isotropic = true;

        this.Tx = this.Ty = 0.0;

        // this.dim = dim; // Nombre d'harmoniques maximal
        this.maximal_dim = dim;

        this.attack_time_position = 0; //attack_duration0;
        this.b = new Array();
        this.c = new Array();
        this.data = new Array();
        this.b = new Float32Array(this.dim*this.dim).fill(0);
        this.c = new Float32Array(this.dim*this.dim).fill(0);

        this.X0 = new Array(this.dim*this.dim).fill(0);
        
        // Données pour le théta schéma
        // this._scheme_constants()

        this.first = true;

        
        // this.set_geometry()
        
        this.theta = 0.5;
        this.muted = false;


        // this.available_sensors["mic"] = {}
        this.available_sensors["displacement"] = {polarisation: "y or z", position: "m"}
        // this.available_sensors["velocity"] = {polarisation: "y or z", position: "m/s"}

        this.sensor_class = microphone

        this.connected_sensors.push(new microphone(this, "displacement", {"position":[0, 1]}))
        this.connected_sensors.push(new microphone(this, "displacement", {"position":[0, 1]}))

        this.mallet = {
            'mallet_mass' : new parameter(0.1, [0.01, 1], 'kg', 1, 2),
            'mallet_speed' : new parameter(1.0, [0.01, 1], 'm.s⁻¹', 1, 2),
            'mallet_radius' : new parameter(1e-2, [1e-3, 1e-1], 'cm', 1e2, 2),
            'mallet_position_x' : new parameter(0.3785, [0, 1], '%', 1e2, 0),
            'mallet_position_y' : new parameter(0.7226, [0, 1], '%', 1e2, 0),
            'mallet_stiffness' : new parameter(1e12, [1e10, 1e14], '??', 1e-12, 2, true),
            'mallet_power' : new parameter(2.5, [1.5, 5], '', 1, 2),
            'height' : [0, 0],
            'projection' : new Array(this.dim*this.dim),
        }

        for (let obj in this.mallet){
            if (this.mallet[obj] instanceof parameter) {
                this.params[obj] = this.mallet[obj]
            }
        } 

        this.losses = {
            'C' : new parameter(900, [400, 3000], 'J/Kg°C', 1, 2), 
            'alpha' :  new parameter(22e-6, [1, 1e3], 'K⁻¹', 1e6, 2, true), 
            'kappa' : new parameter(250, [0.01, 300], 'W/mK', 1e6, 2, true),  
            'Rf' : new parameter(0.032, [0.01, 5], 's⁻¹', 1, 4, true),  
            'beta' : new parameter(0.9, [0.01, 0.99], '', 1, 3), 
            'tau_epsilon' : new parameter(0.00166738920, [1e-4, 1], 'ms', 1e3, 3), 
            'tau_sigma' : new parameter(0.001660761, [1e-4, 1], 'ms', 1e3, 3)
        }

        for (let obj in this.losses){
            this.params[obj] = this.losses[obj]
        } 

        this.temp = 295;
               

        this.geometry_ready = false;

        this.compute_attack_shape_decompostion();
    }

    
    /**
     *  Initialise les variables pour les calculs sur la string : le buffer des coefficents de Fourier et les constantes du theta-schéma
     */ 
    init_audio(buffer_size, dt){

        this.dt = dt;
                 
        this.buffer = new Array((buffer_size+2));   // Tableau contenant les lesdonnées en chaque temps


        for (let k=0; k < this.buffer.length; k++){
            this.buffer[k] = new Float32Array(this.dim*this.dim).fill(0) // Pour chaque temps, on a les composantes 
        }      
        
        // for (let i=1; i < this.dim; i++){
        //     for (let j = 1; j < this.dim; j++){

        //         // this.b[(i-1)*this.parent.dim+j-1] 

        //         if ((i/this.Lx)**2+(j/this.Ly)**2 < max_freq){               
        //             let omega = (this.D/(2*this.h*this.rho))**0.5*((i*Math.PI/this.Lx)**2+(j*Math.PI/this.Ly)**2)

        //             this.data.push([i, j])
        //             console.log(i, j, omega/(2*Math.PI))
        //         }
        //     }
        //     console.log(this.data.length)
        // }
        
        this._scheme_constants();

    }

    set_geometry(data){

        // console.log("Geometry set", this.connected_sensors)
        for (let m=0; m < this.connected_sensors.length; m++){
            this.connected_sensors[m].compute_filter();
        }

        this.geometry_ready = true;
    }

    set_isotropic(state){
        this.isotropic = state;
        this.update_scheme_constants();
    }
    
    update_scheme_constants(){
        this._scheme_constants()
        this.compute_attack_shape_decompostion()
    }
    /**
     *  Calcul les constantes pour le theta schema, doit être appelé après chaque changment de paramètres physique de la string
     */ 
    _scheme_constants(){

        let m, n;

        console.log("_scheme_contants")
        let Ex =  this.params["young_x"].value, Ey = this.params["young_y"].value;
        let nux =  this.params["poisson_x"].value, nuy = this.params["poisson_y"].value;   
        let h = this.params["thickness"].value;
        let G = this.params["shear"].value;

        if (this.isotropic){
            Ey = Ex;
            nuy = nux;
            G = Ex/(2*(1+nux))
        }

        let D1 = Ex*h**3/(12*(1-nux*nuy));
        let D3 = Ey*h**3/(12*(1-nux*nuy));
        let D2 = Ex*nuy*h**3/(6*(1-nux*nuy));
        let D4 = G*h**3/3;
        
        this.rho = this.params["density"].value*h;
        // this.Dx = this.params["thickness"].value**3*this.params["young_x"].value/(12*(1-this.params["poisson_x"].value**2));
        let Lx = this.params["length"].value, Ly = this.params["width"].value;

        // console.log("constsantes", this.Dx, D1, D3)

        let max_freq = (this.dim)*Math.PI/(Lx*Ly)/2;

        this.data = new Array();

        for (m=1; m < this.dim; m++){
            for (n = 1; n < this.dim; n++){

                if ((m/Lx)**2+(n/Ly)**2 < max_freq)                {               
                    let omega = (this.Dx/(this.rho))**0.5*((m*Math.PI/Lx)**2+(n*Math.PI/Ly)**2)
                    // console.log(m, n, omega/(2*Math.PI))
                    this.data.push([m, n])
                }
            }
            
        }

        this.losses_R = this.params["losses"].value;
        var a, Lap, Lap2, omega;

        // let C = 900, alpha = 24e-6, kappa = 200, T0 = 295;
        // let phix = alpha*Ex**0.5/(1-2*nux), phiy = alpha*Ey/(1-2*nuy);
        // let tau = this.params["density"].value*C*h**2/(kappa*Math.PI**2);
        // let zeta = 8*T0*h**2/(kappa*Math.PI**6), omega_zener=Math.PI*kappa/h^2;
        // let g_max = alpha**2*Ex*T0/(2*C);

        // console.log(phix, tau)

        let R;

        for (let k=0; k < this.data.length; k++){
            let index = (this.data[k][0]-1)*this.dim+this.data[k][1]-1;
            m = this.data[k][0];
            n = this.data[k][1];
            // let Lap_old = -((m/Lx)**2+(n/Ly)**2)*Math.PI**2;   
            Lap = -(this.Tx*(m/Lx)**2+this.Ty*(n/Ly)**2)*Math.PI**2;   
            Lap2 = (D1*(m/Lx)**4 + D3*(n/Ly)**4 + (D2+D4)*((m/Lx)*(n/Ly))**2)*Math.PI**4;

            omega = ((Lap2  - Lap)/this.rho)**0.5;

            /* Thermoelastic losses */

            let phi = this.params['alpha'].value*Ex/(1-2*nux);
            let tau = this.params["density"].value*this.params["C"].value*h**2/(this.params["kappa"].value*Math.PI**2)
            let zeta = 8*this.temp*h**2/(this.params["kappa"].value*Math.PI**6)

            let d_th = phi**2*zeta*omega/(1+tau**2*omega**2)/(D1/h**3);

            let R_th = -d_th*Lap2/omega;

            /* visco elastic losses */

            let beta = this.params["beta"].value
    
            let d_visc = (this.params["tau_epsilon"].value**beta-this.params["tau_sigma"].value**beta)*(omega**beta)*Math.sin(Math.PI*beta/2)/(1+this.params["tau_epsilon"].value**(2*beta)*(omega**(2*beta)))

            let R_visc = -d_visc*Lap2/omega;

            /* Loading by air */
            let rho_a = 1.293;
            let c0 = 343;

            let omega_c = c0**2*(this.params["density"].value/h**2/(D1/h**3))**0.5
            let om = omega/omega_c;

            let a0 = 1.1669, a1 = 1.6574, a2 = 1.5528, a3 = 1, b1 = 0.0620, b2 = 0.5950, b3 = 1.0272;

            let d_air = omega*((b1-b3*om**2)*(a0-a2*om**2)+(b2*om**2*(a1-a3*om**2)))/((a0-a2*om**2)**2+om**2*(a1-a3*om**2)**2)

            d_air *= 2*rho_a*c0/(this.params["density"].value*h*omega_c**2)

            let R_air = -d_air*Lap2/omega;
           
            // a = this.rho-this.dt**2*(-this.theta*Lap2+this.theta*Lap)-this.dt*(this.losses_eta*Lap-this.rho*this.losses_R);
            // this.b[index] = (2*this.rho+this.dt**2*(-(1-2*this.theta)*Lap2+(1-2*this.theta)*Lap))/a;
            // this.c[index] = (-this.rho+this.dt**2*(-this.theta*Lap2+this.theta*Lap)-this.dt*(this.losses_eta*Lap-this.rho*this.losses_R))/a;

         
            // R_air = 0;
            // R_visc = 0;
            // R_th = 50000;
            // console.log(omega/2/3.14, R_th, R_visc, R_air, this.losses_eta*Lap-this.rho*this.losses_R)
            a = this.rho-this.dt**2*(-this.theta*Lap2+this.theta*Lap)-this.dt*(R_th+R_visc+R_air)/2;
            this.b[index] = (2*this.rho+this.dt**2*(-(1-2*this.theta)*Lap2+(1-2*this.theta)*Lap))/a;
            this.c[index] = (-this.rho+this.dt**2*(-this.theta*Lap2+this.theta*Lap)-this.dt*(R_th+R_visc+R_air)/2)/a;
        } 

        // console.log(this.data.length)

        this._compute_extra_constants()   
        this.set_geometry()  
    }

    _compute_extra_constants(){
        
    }

    compute_attack_shape_decompostion(position, width){
        let m, n;
        if (typeof this.attack_coefs == 'undefined'){
            this.attack_coefs = new Float32Array(this.dim*this.dim)
        }

        let Lx = this.params['length'].value;
        let Ly = this.params['width'].value;
        let x0 = Math.PI*this.mallet['mallet_position_x'].value; 
        let y0 = Math.PI*this.mallet['mallet_position_y'].value;
        let r = this.mallet['mallet_radius'].value;
        let norm = 4*r**3/3;

        for (let k = 0; k < this.data.length; k++){
            m = this.data[k][0];
            n = this.data[k][1];
            let index = (m-1)*this.dim+n-1;
            // this.attack_coefs[index] = Math.sin(m*x0)*Math.sin(n*y0);
            this.attack_coefs[index] = 4*Lx**2/(m**2*Math.PI**3)*Math.sin(m*x0)*(r*Math.cos(m*Math.PI*r/Lx)-Lx/(m*Math.PI)*Math.sin(m*Math.PI*r/Lx))/norm;
            this.attack_coefs[index] *= 4*Ly**2/(n**2*Math.PI**3)*Math.sin(n*y0)*(r*Math.cos(n*Math.PI*r/Ly)-Ly/(n*Math.PI)*Math.sin(n*Math.PI*r/Ly))/norm;
        }
    }
    
    tap(strengh, position){
        // console.log("tap")
        this.attack_time_position = this.dt*1e2;
        this.mallet['height'] = [this.mallet['mallet_radius'].value-this.mallet['mallet_speed'].value*this.dt,
                                        this.mallet['mallet_radius'].value];
    }

    add_attack(dt, buffer, bufferm1, bufferm2){

        let F;

        if (this.mallet['height'][0] < this.mallet['mallet_radius'].value){
            // Compute displacement
            let disp = 0;
            for (let k=0; k < this.data.length; k++){
                let index = (this.data[k][0]-1)*this.dim+this.data[k][1]-1;
                disp += buffer[index]*this.attack_coefs[index];
            }

            if (disp > this.mallet['height'][0]-this.mallet['mallet_radius'].value) {
                // console.log(disp-(this.mallet['height'][0]-this.mallet['mallet_radius'].value))
                F = this.mallet['mallet_stiffness'].value*(disp-(this.mallet['height'][0]-this.mallet['mallet_radius'].value))**this.mallet['mallet_power'].value;
                // console.log("= F =", F)
                // Mallet position
                let un = 2*this.mallet['height'][0]-this.mallet['height'][1]+this.dt**2*F/this.mallet['mallet_mass'].value;
                this.mallet['height'][1] = this.mallet['height'][0];
                this.mallet['height'][0] = un;

                // plaque position
                for (let k=0; k < this.data.length; k++){
                    let index = (this.data[k][0]-1)*this.dim+this.data[k][1]-1;
                    // buffer[index] = 2*bufferm1[index] - bufferm2[index] - dt**2*F/this.rho; 
                    buffer[index] -=  this.attack_coefs[index]*dt**2*F/this.rho; 
                }
            } else {
                F = 0;
            }

            
        }

        // if (this.attack_time_position > 0){
           
        //     let t = this.attack_time_position/duration;
        //     let attack = 1e5*Math.sin(Math.PI*(1-t))**2; 

        //     // let theta = 2*Math.PI*this.parent.plectrum["theta"].value/360;

        //     for (let k=0; k < this.data.length; k++){
        //         let index = (this.data[k][0]-1)*this.dim+this.data[k][1]-1;
        //         buffer[index] += dt**2*attack*this.attack_coefs[index]/this.rho; //*Math.sin(theta);
        //         // console.log(m, n, index)
        //     }

        //     this.attack_time_position -= dt;
        //     // console.log("attack", this.rho, attack, this.attack_coefs[0], buffer[0]);
        // }

    }

    transition_length(dt){


    //     if (this._transition_length_counter <= this.parent.params["transition_time"].value){
    //         // this.muted = true;

    //         // console.log("Imhere", this._transition_length_counter, this.parent.params["transition_time"].value, dt)
            
    //         this._transition_length_counter+=dt;
    //         let t = this._transition_length_counter/this.parent.params["transition_time"].value;
    //         let transition_coeff = (1+1/(1+Math.exp(-this.parent.params["transition_speed"].value*t)))/2;
    //         transition_coeff = Math.sin(Math.PI/2*t)**2;
           
    //         this.L = transition_coeff*this.goal_L+(1-transition_coeff)*this.origin_L;  
        
    //         this._scheme_constants()
            
    //         return(t)

    //     } else {
    //         // this.muted = false

    //         return(0)
    //     }

    }
    
    /**
     *  Calcule les coffeficients de Fourier pour le prochain buffer 
     *  à redéfinir !!!
     */ 
    next_chunk(t0, buffer_size, dt){

        if (this.muted) return;

        for (var i = 2; i < buffer_size+2; i++){ // Pour chaque pas de temps
            // this.transition_length(dt)
            // for (let k in this.data){
            //     let m = this.data[k][0];
            //     let n = this.data[k][1];
            //     let index = (m-1)*this.dim+n-1;
            //     this.buffer[i][index] = 0;
            // }

            for (let k=0; k < this.data.length; k++){
                let index = (this.data[k][0]-1)*this.dim+this.data[k][1]-1;

                this.buffer[i][index] = (this.b[index]*this.buffer[i-1][index]+this.c[index]*this.buffer[i-2][index])
            }

            this.add_attack(dt, this.buffer[i], this.buffer[i-1], this.buffer[i-2]);
        }
    }    

    reset_chunk(){
        for (let k=0; k < this.data.length; k++){
            let index = (this.data[k][0]-1)*this.dim+this.data[k][1]-1;

            this.buffer[0][index] = 0;
            this.buffer[1][index] = 0;
            
        }

        this._reset_chunk()
    }

    _reset_chunk(){

    }

    loop_chunk(){
         for (let k=0; k < this.data.length; k++){
            let index = (this.data[k][0]-1)*this.dim+this.data[k][1]-1;

            this.buffer[0][index] = this.buffer[this.buffer.length-2][index];
            this.buffer[1][index] = this.buffer[this.buffer.length-1][index];
          
        }  
        this._loop_chunk();
    }

    _loop_chunk(){

    }

    change_dimension(value){
        if (value > this.maximal_dim){
            console.log("Pb de dimension")
            this.dim = this.maximal_dim
        } else {
            this.dim = value;
        }
        this.update_scheme_constants()
    }


    change_fingering(position){
        this.origin_L = this.L;
        this.goal_L = this.L0*position; 
        this._transition_length_counter = 0;
    }


}

class microphone extends sensor{
    constructor(parent, type = "bridge", params = {}){
        super(parent, type, params)

        this.parent = parent;

        // this.gain = gain;
        // this.non_lin = false;
        this.type = type;
        // console.log(this[type+"_output"])
        // if (type == "bridge") {
        //     this.output = this.bridge_output;
        //     this.compute_filter = this.compute_filter_bridge;
        //     this.Zc = 1;
        // } else                 
        // 
        this.spatial_filter =  new Float32Array((this.parent.dim)**2).fill(0);

        if (type == "displacement") {
            this.output = this.displacement_output;
            this.position = params["position"]
            this.compute_filter = this.displacement_compute_filter;
            this.Zc = 1;

        }
        // else if (type == "single") {
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
        //             this.compute_filter()
        // this.displacement_compute_filter()

  
        if (this.parent.geometry_ready){
            this.compute_filter();
        }
        
    }

    change_gain(value){
        this.gain = value;
    }

    /* Definition of the bridge sensor*/
    mic_output(output){

        // let x;
        // let buffer_string;
        // for (let k=0; k < output.length; k++){
        //     x = 0;
        //     for (var s = 0; s < this.parent.strings.length; s++){
                
        //         if (!this.parent.strings[s].muted){ 
        //             // if (this.parent.polarisation){
        //             //     buffer_string = this.strings[s].buffer_y[k];
        //             // } else {
        //                 buffer_string = this.parent.strings[s].buffer_z[k];
        //             // }
        //             for (let n = 0; n < this.parent.dim; n++){
                        
        //                 x += buffer_string[n]*this.spatial_filter[s][n];
        //             }  
        //         }         
        //     }
        //     output[k] += x;
            
        // }        
    }

    mic_init(params){
        this.compute_filter = this.mic_compute_filter
        this.output_impedance = 3;
        this.unit = "N"
    }

    mic_compute_filter(){

        // for (let s = 0; s < this.parent.strings.length; s++){
        //     for (var n =0; n < this.parent.dim; n++){
        //         this.spatial_filter[s][n] = (this.parent.strings[s].params["tension_y"].value*((n+1)*Math.PI/this.parent.strings[s].L)*(-1)**(n+1)-this.parent.strings[s].params["stiffness_y"].value*((n+1)*Math.PI/this.parent.strings[s].L)*(-1)**(n+1)**3);
        //     }
        // }

    }

    /* Definition of thte displacement filter */
    displacement_output(output){

        let x, k, index;
        for (let i=0; i < output.length; i++){
            x = 0;
            for (k=0; k < this.parent.data.length; k++){
                index = (this.parent.data[k][0]-1)*this.parent.dim+this.parent.data[k][1]-1;
                x += this.parent.buffer[i][index]*this.spatial_filter[index];
            }
            output[i] += x;
        }
    }

    displacement_init(params){
        this.compute_filter = this.displacement_compute_filter
        this.position = params["position"]
        this.output_impedance = 1e8;
        this.unit = "m"
    }


    displacement_compute_filter(){
        for (let k in this.parent.data){
            let m = this.parent.data[k][0];
            let n = this.parent.data[k][1];
            let index = (m-1)*this.parent.dim+n-1;
            this.spatial_filter[index] = Math.sin(m*0.1)*Math.sin(n*0.1);
            // console.log("======", m, n, index, Math.sin(m*1)*Math.sin(n*1), this.spatial_filter[index])

        }      
        
        // console.log("Displacement compute filter)", this.parent.data, this.spatial_filter)

    }

    /* Definition of thte velocity filter */
    velocity_output(output){

        // let x;
        // let buffer_string;
        // for (let k=0; k < output.length; k++){
        //     x = 0;
        //     for (var s = 0; s < this.parent.strings.length; s++){
                
        //         if (!this.parent.strings[s].muted){ 
        //             if (this.polarisation == "y"){
        //                 buffer_string = this.parent.strings[s].buffer_y[k];
        //             } else {
        //                 buffer_string = this.parent.strings[s].buffer_z[k];
        //             }
        //             for (let n = 0; n < this.parent.dim; n++){  
        //                 x += buffer_string[n]*this.spatial_filter[s][n];
        //             }  
        //         }         
        //     }
        //     output[k] += x;
        // }  
    }

    velocity_init(params){
        this.compute_filter = this.velocity_compute_filter
        this.polarisation = params['polarisation']
        this.position = params["position"]
        this.output_impedance = 1e2;
        this.unit = "m/s"
    }


    velocity_compute_filter(){
        // for (let s = 0; s < this.parent.strings.length; s++){
        //     for (var n =0; n < this.parent.dim; n++){
        //         this.spatial_filter[s][n] = Math.cos((n+1)*Math.PI*this.position/this.parent.strings[s].L)*(n+1)*Math.PI/this.parent.strings[s].L;
        //     }
        // }
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



// async function load_string_details(object, string_name){

//     let string_file = './data/strings/default/'+string_name+'.json';
//     let response = await fetch(string_file)
//     let data =  await response.json() 
//     object.strings[string_name] = data;
//     console.log(data)
// }

// async function load_strings(object){

//     let response = await globalThis.fetch("./data/strings/default/");
//     let str = await response.text();
//     let el = document.createElement('html');
//     el.innerHTML = str;
//     let list = el.getElementsByTagName("a");

//     for (let item of list) {
//         let ref = item.innerText;
//         if (ref.slice(-4) == 'json'){
//             await load_string_details(object, ref.slice(0, -5));
//             // await load_transfer(object, ref);
//         }   
//     }
// }

async function init_instrument(params){
    let object = {
        impedances :{},
        strings : {}
    }
    // await load_strings(object)
    return(object)
}

export { plate_instrument, parameter, sensor, init_instrument };
