import pandas as pd
import json
import math


def decode(value) :
    
    if type(value) == float:
        return(value)
    
    if type(value) == int :
        return(value)
    
    if type(value) == str :
        value = value.strip()
        
        if len(value) == 0 :
            return(float("nan"))
    
    if "-" in value : 
        rng = [float(a) for a in value.split('-')]
        return(sum(rng)/2)
        
    return(value)
    
density = pd.read_excel("materials.xlsx", 0) 
young_modulus  = pd.read_excel("materials.xlsx", 1) 

sample = {}
young_list = list(young_modulus["name"])

for i, name in enumerate(density["name"]):
    
    if name in young_list :
        j = young_list.index(name)
        
        dnst = decode(density["value"][i])
        yng = decode(young_modulus["value"][j])
                
        if (not math.isnan(dnst) and not math.isnan(yng)) :
            sample[name] = {"density" : dnst,
                            "Young modulus" : yng}


with open('material.json', 'w') as fp: 
      json.dump(sample, fp, indent=4)