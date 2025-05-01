'use strict';

import { wind_instrument, parameter, init_instrument } from "./wind_instrument.js?version=1.1";

let epsilon = 1e-6;

let rho  = 1.292*273.15/(273.15+20)//1.1851


class reed_instrument extends wind_instrument{
    theta(h, q = 1.0){
        // if (h > 0) return h;
        // return 0;
        let eta = this.params["epsilon_beating"].value*this.params['H'].value**2;
        let reg = (h+(h**2+0.5*eta)/((h**2)+eta)**0.5)/2;
        return(reg**q);
    }

    regularized_flow(deltap, Pc){
        let epsilon = this.params["epsilon_flow"].value;
        return(Math.sign(deltap)*(-epsilon+(epsilon**2+Math.abs(deltap))**0.5)/rho)
        // return((2/rho)**0.5*(1+epsilon)*deltap/(deltap**2+Pc**2*epsilon)**0.25);
    }

    differential_theta(h){
        let eta = this.params["epsilon_beating"].value*this.params['H'].value**2;
        return(1/2*(1+h*(h**2+1.5*eta)/(h**2+eta)**1.5));
    }

    model(t, x){ 
        let der = new Float32Array(this.dim);

        let p = 0;
        let h = x[0];
        let u = 0;
        let Pc = this.params['H'].value*this.params['Kr'].value;
        let omegar = 2*Math.PI*this.params['Fr'].value;
        let S = this.params['w'].value*this.theta(h, this.params['beta'].value);   
    
        let alpha = (Math.PI*this.params['Rc'].value**2);
        alpha = this.params['Cp'].value*(S/alpha)**2;
    
        if (1-alpha < 1e-2){
            alpha = 1-1e-2;
            this.declare_error("Problem with constriction radius")
        }
    
        let Fc = (1-this.params['contact_beta'].value/this.params['H'].value*x[1])*this.params['contact_stiffness'].value*this.theta(-x[0])**this.params['contact_alpha'].value;

        if (this.transitioning_impedance){
            this.transition_impedance();
        }
    
        for (let i=0; i < this.impedances_dim+this.vocal_tract_dim; i++) { // ok
            p += 2*x[2*i+2];
        }
                
        u = S/(1-alpha)**0.5*this.regularized_flow(this.params['pm'].value-p, Pc)-this.params['w'].value*this.params['Lr'].value*x[1]*this.differential_theta(x[0]);
        
        der[0] = x[1];
        der[1] = -omegar/this.params['Qr'].value*x[1]+omegar**2*(this.params['H'].value-x[0]) - (this.params['pm'].value-p)*omegar**2/this.params['Kr'].value+Fc; // ok
                
        // Adding modes for the vocal tract
        for (let i=0; i < this.vocal_tract_dim; i++){
            
            der[2*i+2] = this.S[i].re*x[2*i+2]-this.S[i].im*x[2*i+3]-u*this.C[i].re;
            der[2*i+3] = this.S[i].im*x[2*i+2]+this.S[i].re*x[2*i+3]-u*this.C[i].im;
        }
    
        // Adding modes for the this
        for (let i=this.vocal_tract_dim; i < this.impedances_dim+this.vocal_tract_dim; i++){
            
            der[2*i+2] = this.S[i].re*x[2*i+2]-this.S[i].im*x[2*i+3]+this.characteristic_impedance*u*this.C[i].re;
            der[2*i+3] = this.S[i].im*x[2*i+2]+this.S[i].re*x[2*i+3]+this.characteristic_impedance*u*this.C[i].im;
        }
            
        return(der)
    }
}
    
export { reed_instrument, parameter, init_instrument };
