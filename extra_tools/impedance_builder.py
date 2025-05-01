#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Mon Apr 14 17:23:24 2025

@author: maugeais
"""

import numpy as np
import json

rho = 1.292*273.15/(273.15+18.5)//1.1851
c0 =  20.05*np.sqrt(273.15+18.5)


def modal_coeffs(N, L, R) :
    beta = 3e-5/(R*np.sqrt(2*np.pi))
#define R 0.0075/2 // Rayon à l'embouchure
    C = np.zeros(N, dtype = complex)
    S = np.zeros(N, dtype = complex)
    
    Zc = rho*c0/(np.pi*R**2);
    
    for i in range(N) :
        
        omega = (2*i+1)*np.pi*c0/(2*L);
        S[i] = 1j*omega-c0*beta*np.sqrt(omega);
        C[i] = Zc*c0/L;
        
        
    data = {'S' : [[np.real(s), np.imag(s)] for s in S],
            'C' : [[np.real(c), np.imag(c)] for c in C]}
    
    with open('impedance.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    

if __name__ == "__main__" :
    
    # Example for the bass crumhorn
    
    modal_coeffs(10, 0.813, 0.0075/2)