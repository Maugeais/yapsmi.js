#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Tue Apr  9 14:20:06 2024

@author: maugeais
"""
import numpy as np
import json
from pathlib import Path

filename = "11-47.txt"
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
            "d" : float(line[1])*24.5e-3,
            "T": float(line[2])*9.81,
            "L": 0.6476,
            "eta": 1e-6,
            "epsilon": 1e-6
    }
    d = (data["T"]/(data["density"]*np.pi))**0.5/(frequencies[data["fundamental"]]*data["L"])
    data["d"] = d
    print(d, float(line[1])*25.4e-3)
    
    with open(f'{path}/{data["fundamental"]}.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    # mu = data["density"]*np.pi*data["d"]**2/4;
    # f1 = (data["T"]/mu)**0.5/(2*data["L"])
    # f0 = frequencies[data["fundamental"]]
    # print(f1, f0, 1200*np.log2(f1/f0))
