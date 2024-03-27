'use strict';

import { instrument, parameter } from "./instrument.js";

class wind_instrument extends instrument {
    #fingering_callbacks = [];
    constructor(name, params, max, gain, fingering = 0, fingergings= []){
        super(name, params, max, gain)
        this.impedances = {};
        this.transfer_functions = {};
        this.transfer_function = [];
        this.filters = {};
        this.filter = "./data/A/transfer.wav";
        this.fingering = fingering; // Current fingering
        this.fingerings = []; // Possible fingerings
         // Functions to be calls when the fingering is chhanged
        load_fingerings(this);
    }
    

    change_fingering = function(name){
         console.log("la fonction 'change_fingering' doit être redéfinie, it must call _change_fingering at the end !");
    }
    
    add_fingerging_callback(callback){
        fingering_callbacks.push(callback);
    }
    
    _change_fingering(){
        this.#fingering_callbacks.forEach((callback) => (callback(this.fingering)));
        console.log("_change_fingering");
    }

    get_controls(){
        let controls = {};
        controls['fingering'] = this.fingerings;

        for (const param in this.params) {
            controls[param] = this.params[param].range;
        }

        return(controls)
    }
}

function complexify(data){
    let object = {};
    let j, k;
    for (k in data) {
        object[k] = [];
        for (j = 0; j < data[k].length; j++){
            object[k].push(math.complex(data[k][j][0], data[k][j][1]));
        }
    }
    return(object)
}


function load_impedance(object, folder){
    $.getJSON('./data/'+folder+'impedance.json', function( data ) {
        object.impedances[folder.slice(0, -1)] = complexify(data);
        if (folder.slice(0, -1) == object.fingering){
            object.change_fingering(folder.slice(0, -1));
        }
    });
}

function load_transfer(object, folder){
    // $.getJSON('./data/'+folder+'transfer.json', function( data ) {
    //     object.transfer_functions[folder.slice(0, -1)] = data;
    // });
    object.filters[folder.slice(0, -1)] = './data/'+folder+'transfer.wav';
}

function load_fingerings(object){
    $.ajax({
        url: "./data/",
        success: function(data){
            $(data).find("a").each(function(){
                load_impedance(object, $(this).attr("href"));
                load_transfer(object, $(this).attr("href"));
            });
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) { 
            alert("Status: " + textStatus); alert("Error: " + errorThrown); 
        }    
    });
}

export { wind_instrument, parameter };
