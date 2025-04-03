#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Tue Apr  9 14:20:06 2024

@author: maugeais
"""
import numpy as np
import json
from pathlib import Path

filename = "nylon.txt"
path = filename.split('.')[0]
Path(path).mkdir(parents=True, exist_ok=True)


frequencies = {"E2" : 82.40689,
               "A2" : 110,
               "D3" : 146.8324,
               "G3" : 195.9977,
               "B3" : 246.9417,
               "E4" : 329.6276 }

with open("./temp/"+filename) as file:
    lines = [line.split("\t") for line in file]
    
for line in lines :
    data = {
            "brand" : "D'addario",
            "fundamental" : line[0].strip(),
            "young": 65e9,
            "density": 8800,
            "r" : 0.5*float(line[1])*24.5e-3, # Conversion to m
            "T": float(line[2])*9.81, # Conversion to N
            "L": 0.6476,
            "R": 0.645,
            "eta": 2.2e-8
    }
    r = (data["T"]/(data["density"]*np.pi))**0.5/(2*frequencies[data["fundamental"]]*data["L"])
    data["r"] = r
    print(data["fundamental"], 2*r, float(line[1])*25.4e-3)
    if data["fundamental"] in ["E2", "A2", "D3"] :
        data["r_core"] = r/2
    else :
        data["r_core"] = r
    
    with open(f'{path}/{data["fundamental"]}.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    # mu = data["density"]*np.pi*data["d"]**2/4;
    # f1 = (data["T"]/mu)**0.5/(2*data["L"])
    # f0 = frequencies[data["fundamental"]]
    # print(f1, f0, 1200*np.log2(f1/f0))
