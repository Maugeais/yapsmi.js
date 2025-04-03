"use strict";

function init(){
        
        // let keys = Object.keys(inst.params);        
        // $.each(keys, function (i, item) {
        //     $('#pad_x').append($('<option>', { 
        //         value: item,
        //         text : item
        //     }));
        //     $('#pad_y').append($('<option>', { 
        //         value: item,
        //         text : item
        //     }));
        // });

    plugins[uid].save = save;
    plugins[uid].load = load;
}
    
function save(){
    // let commands = {"threshold" : threshold.to_percentage(), 
    //                 "knee" : knee.to_percentage(), 
    //                 "ratio" : ratio.to_percentage(),
    //                     "attack" : attack.to_percentage(), 
    //                     "release" : release.to_percentage()
    //                 };
    // return(commands)
}

function load(uid, commands){
    
    // let index = compressor_knobs.findIndex(element => element.id == "compressor_threshold");
    // compressor_knobs[index].setValue(commands["threshold"]);
    // index = compressor_knobs.findIndex(element => element.id == "compressor_knee");
    // compressor_knobs[index].setValue(commands["knee"]);
    // index = compressor_knobs.findIndex(element => element.id == "compressor_ratio");
    // compressor_knobs[index].setValue(commands["ratio"]);
    // index = compressor_knobs.findIndex(element => element.id == "compressor_attack");
    // compressor_knobs[index].setValue(commands["attack"]);
    // index = compressor_knobs.findIndex(element => element.id == "compressor_release");
    // compressor_knobs[index].setValue(commands["release"]);
}


let tabs = $('#automation_tabs').children();
console.log(tabs)
window.set_automation_tab = function(id){
    tabs.each(function () {
        $(this).hide(); // "this" is the current element in the loop
    });
    console.log()
    $(tabs[id]).show()
}


export { init }
