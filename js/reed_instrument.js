'use strict';

import { wind_instrument, parameter, init_instrument } from "./wind_instrument.js?version=1.2";

// let epsilon = 1e-6;

// let rho  = 1.292*273.15/(273.15+20)//1.1851


class reed_instrument extends wind_instrument{
    model(t, x){ 
        let der = new Float32Array(this.dim);

        let p = 0;
        let h = x[0];
        let u = 0;
        let Pc = this.params['H'].value*this.params['Kr'].value;
        let omegar = 2*Math.PI*this.params['Fr'].value;
        let S = this.params['w'].value*this.regularized_beating(h, this.params['beta'].value);
        let mu = this.params['Kr'].value/omegar**2;
    
        let alpha = (Math.PI*this.params['Rc'].value**2);
        alpha = this.params['Cp'].value*(S/alpha)**2;
    
        if (1-alpha < 1e-2){
            alpha = 1-1e-2;
            this.declare_error("Problem with constriction radius")
        }
    
        let Fc = (1-this.params['contact_beta'].value/this.params['H'].value*x[1])*this.params['contact_stiffness'].value*this.regularized_beating(-x[0])**this.params['contact_alpha'].value;

        if (this.transitioning_impedance){
            this.transition_impedance();
        }
    
        for (let i=0; i < this.impedances_dim+this.vocal_tract_dim; i++) { // ok
            p += 2*x[2*i+2];
        }
                
        u = 1/(1-alpha)**0.5*this.regularized_flow(this.params['pm'].value-p, h)-this.params['w'].value*this.params['Lr'].value*x[1]*this.differential_regularized_beating(x[0]);
        
        der[0] = x[1];
        // der[1] = -omegar/this.params['Qr'].value*x[1]+omegar**2*(this.params['H'].value-x[0]) - (this.params['pm'].value-p)*omegar**2/this.params['Kr'].value+Fc; // ok
        der[1] = -omegar/this.params['Qr'].value*x[1]+omegar**2*(this.params['H'].value-x[0]) - (this.params['pm'].value-p)/mu -this.params['Pell'].value/mu; // ok

                
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
