'use strict';

import { string_instrument, string, parameter, init_instrument } from "./string_instrument.js?version=1.1";

class bowed_instrument extends string_instrument{
    constructor(name, params, strings, bow, dim, limiter, output_impedance){
        // No params but can have mics and strings
        super(name, params, strings, dim, limiter, output_impedance)

        this.bow = bow;
        for (const param in this.bow) {
            this.params[param] = this.bow[param];
        }

        this.bow.model = 0;
        this.friction = Ablitzer;
    }

    compute_attack_coefs(){
        for (let s=0; s < this.strings.length; s++){
            this.strings[s]._compute_extra_constants(this.bow);
        }
    }
    
    set_bow(params){
        let inst = this;
        let key = Object.keys(params)[0];    
        inst.bow[key].set_from_percentage(params[key]);
        inst.compute_attack_coefs()
        return(inst.bow[key].to_string())    
    
    }

    change_bow_model(value){
        if (value == "elasto-plastic"){
            this.bow.model = 1;
        } else {
            this.bow.model = 0;
        }

        console.log("value")
    }

    _create_string(data, s){
        return(new bowed_string(this, data["strings"][this.strings_name[s]], this.dim, this.limiter, this.output_impedance.value))
    }

    set_regularisation(value){
        switch(value){
            // case "Coulomb" : this.friction = Coulomb;
            //                 break;
            case "Stribeck" : this.friction = Stribeck;
                            break;
            case "Galluzzo" : this.friction = Galluzzo;
                            break;
            case "Bilbao" : this.friction = Bilbao;
                            break;
            case "Vigue" : this.friction = Vigue;
                            break;
            case "Ablitzer" : this.friction = Ablitzer;
                break;
            default : console.log("Unknown regularisation value")
            this.friction = Ablitzer;
        }
    }
    
}

/* Regularisation functions for the static friction model */

// function Coulomb(Dv, vt, mu_s, mu_c){
//     if (Dv == 0) return(0)
//     if (Dv < 0) return((vt*mu_s-mu_c*Dv)/(-Dv+vt))
//     return((-vt*mu_s-mu_c*Dv)/(Dv+vt))
// }

function Stribeck(Dv, vt, mu_s, mu_c){
    Dv = Dv/vt;
    return(Math.sign(Dv)*(mu_c+(mu_s-mu_c)*Math.exp(-1*Dv**2)));
}

function Galluzzo(Dv, vt, mu_s, mu_c){
    Dv = Dv/vt;
    return(Math.sign(Dv)*(mu_c+(mu_s-mu_c)*Math.exp(-Math.abs(Dv))));
}

function Bilbao(Dv, vt, mu_s, mu_c){
    Dv = Dv/vt;
    return(2.8*(mu_s-mu_c)*Dv*Math.exp(-1*Dv**2)+mu_c*2/Math.PI*Math.atan(Dv))

}

function Vigue(Dv, vt, mu_s, mu_c){
    let epsilon = 1e-6
    Dv = Dv/vt;
    return((mu_c*Dv*(Dv**2+epsilon)**(0.5)+2*(mu_s*(mu_s-mu_c))**(0.5)*Dv)/(Dv**2+1));
}

function Ablitzer(Dv, vt, mu_s, mu_c){
    Dv = Dv/vt;
    return(mu_c*Math.tanh(4*Dv)+16*(mu_s-mu_c)*Dv/(Dv**2+3)**2);
}

class bowed_string extends string{
    _compute_extra_constants(){
    
        if (typeof this.zn == 'undefined'){
            this.zn = 0.0;
            this.znm1 = 0.0;
        }

        // if (typeof this.attack_coefs == 'undefined'){
        //     this.attack_coefs = new Float32Array(this.dim)
        // }
        
        // for (let n = 0; n < this.dim; n++){
        //     this.attack_coefs[n] = Math.sin((n+1)*x0); // Add sinc(n*delta)
        // }
        // console.log(this.attack_coefs[0])
    }

    reset_chunk(){
        for (let i=0; i < this.dim; i++){
            this.buffer[0][i] = 0;
            this.buffer[1][i] = 0;
        }
        this.zn = 0;
    }

    add_attack(dt, buffer, bufferm1, bufferm2){
        let x0 = Math.PI*this.parent.bow["position"].value/this.L;
        let mu;

        // Compute the speed at time i using i-2
        let vc = 0;
        for (let n = 0; n < this.parent.dim; n++){
            // vc += (buffer[n]-bufferm1[n])*Math.sin((n+1)*x0)/(dt);
            vc += (3/2*buffer[n]-2*bufferm1[n]+1/2*bufferm2[n])/(dt)*Math.sin((n+1)*x0);

        }
    
        let vt = this.parent.bow["vreg"].value;
        let Dv = (vc-this.parent.bow["bow_speed"].value);
        let mu_s= this.parent.bow["mus"].value;
        let mu_c= this.parent.bow["mud"].value;
        let s0 = this.parent.bow["friction_s0"].value;
        let s1 = this.parent.bow["friction_s1"].value;
        let s2 = this.parent.bow["friction_s2"].value;

        mu = this.parent.friction(Dv, vt, mu_s, mu_c);
        
        // // let attack = 2/Math.PI*(Math.atan(-alpha*Dv)*((mu_c + (mu_s-mu_c)/(1+Math.abs(Dv)/vinf))));
        // switch (this.parent.regularisation){
        //     case "A" : mu = mu_c*Math.tanh(4*Dv/vt)+16*(mu_s-mu_c)*(Dv/vt)/((Dv/vt)**2+3)**2;
        //                 break;
        //     case "B" : mu = Math.sign(Dv)*(mu_c+(mu_s-mu_c)*Math.exp(-1*(Dv/vt)**2))
        //                 break;
        //     case "D" : break;
        // }
        // mu = mu_c*Math.tanh(4*Dv/vt)+16*(mu_s-mu_c)*(Dv/vt)/((Dv/vt)**2+3)**2;
        let f_ep;

        if (this.parent.bow.model  == 0){

            f_ep = mu*this.parent.bow["strength"].value;

        } else if (this.parent.bow.model == 1){
        

            let zba =  0.7*mu_c*this.parent.bow["strength"].value/s0;
            let zss = mu*this.parent.bow["strength"].value/s0;
            let a = alpha(this.zn, Dv, zba, zss);
            
            // Heun method is used to compude this.zn
            let dz = Dv*(1-a*this.zn/zss); 
            let zt = this.zn+dt*dz;
            let dzt = Dv*(1-alpha(zt, Dv, zba, zss)*zt/zss);
            this.zn += dt/2*(dzt+dz);


            f_ep = s0*this.zn+s1*dz+s2*Dv;
        }


        let attack = -(dt**2)*f_ep/this.params["density"].value;

        for (var n = 0; n < this.parent.dim; n++){
            // buffer[n] += this.parent.bow["shape"](t, this.parent.bow["duration"].value)*this.attack_strength*this.attack_coefs[n]/this.mu;
            buffer[n] += attack*Math.sin((n+1)*x0);
        } 

        return(attack)
    }
}
    
function alpha(z, v, zba, zss){

    // printf("Alpha : %f, %f, %f, %f\n", z, v, z_ba, zss);
    if (Math.sign(v) != Math.sign(z)) return(0);

    if (Math.abs(z) < zba) return(0);

    if (Math.abs(z) > Math.abs(zss)) return(1);

    let theta = (z-Math.sign(z)/2*(Math.abs(zss)+zba))/(Math.abs(zss)-zba);
    // console.log(theta, z, zss, zba)
    return((1+Math.sign(z)*Math.sin(Math.PI*theta))/2);
}



export { bowed_instrument, string_instrument, string, parameter, init_instrument };
