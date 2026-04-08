"use strict";


const pianoKeys = document.querySelectorAll(".pianokey");

let allKeys = [];

pianoKeys.forEach(key => {
    allKeys.push(key); // adding data-key value to the allKeys array
    // calling playTune function with passing data-key value as an argument
    key.addEventListener("mousedown", () => keyPlayed(key));
    key.addEventListener("mouseup", () =>  keyReleased(key))
    
});

function keyPlayed(evnt){
    let a = Array.prototype.indexOf.call(allKeys, evnt)
    play_midi_note(a+21, 100)
    console.log("down", a)
}

function keyReleased(evnt){
    let a = Array.prototype.indexOf.call(allKeys, evnt)
    stop_midi_note(a+21, 100)
    console.log("upn", a)
}

function init(uid){

    console.log("Im here")
        
        // let keys = Object.keys(instrument_controls);

        // $.each(keys, function (i, item) {
        //         $('#pad_x').append($('<option>', {
        //             value: item,
        //             text : item
        //         }));
        //         $('#pad_y').append($('<option>', {
        //             value: item,
        //             text : item
        //         }));
        // });
        plugins[uid].save = save;
        plugins[uid].load = load;
}

function save(){
    let commands = {"pad_x" : $("#pad_x").val(),
                    "pad_y" : $("#pad_y").val()
    }
    return(commands)
}

function load(uid, commands){
    $("#pad_x").val(commands["pad_x"])
    $("#pad_y").val(commands["pad_y"])
}

export { init }
