"use strict";

function init(){
        
        let keys = Object.keys(inst.params);        
        $.each(keys, function (i, item) {
            $('#pad_x').append($('<option>', { 
                value: item,
                text : item
            }));
            $('#pad_y').append($('<option>', { 
                value: item,
                text : item
            }));
        });

}

let pad_canvas = document.getElementById("pad_gesture");

pad_canvas.width = $('#pad_gesture').width();
pad_canvas.height = $('#pad_gesture').height();

var pad_ctx = pad_canvas.getContext("2d");
let pad_canvasX = 0;
let pad_canvasY = pad_canvas.height;

let clic= 0;

pad_ctx.clearRect(0, 0, pad_canvas.width, pad_canvas.height); // pad_canvas

pad_canvas.addEventListener("mousemove", function(e) {
    if (clic==1) {
        var cRect = pad_canvas.getBoundingClientRect(); // Gets the CSS positions along with width/height
        pad_canvasX = Math.round(e.clientX - cRect.left); // Subtract the 'left' of the pad_canvas from the X/Y
        pad_canvasY = Math.round(e.clientY - cRect.top); // positions to get make (0,0) the top left of the
        pad_update(pad_canvasX, pad_canvasY);
    }
});

pad_canvas.addEventListener("mousedown", function(e) {
    clic = 1;
    var cRect = pad_canvas.getBoundingClientRect(); // Gets the CSS positions along with width/height
    pad_canvasX = Math.round(e.clientX - cRect.left); // Subtract the 'left' of the pad_canvas from the X/Y
    pad_canvasY = Math.round(e.clientY - cRect.top); // positions to get make (0,0) the top left of the
    pad_update(pad_canvasX, pad_canvasY);
});

pad_canvas.addEventListener("mouseup", function(e) {
    clic = 0;
});





pad_canvas.addEventListener("touchmove", function(e) {
    if (clic==1) {
        var cRect = pad_canvas.getBoundingClientRect(); // Gets the CSS positions along with width/height
        pad_canvasX = Math.round(e.touches[0].clientX - cRect.left); // Subtract the 'left' of the pad_canvas from the X/Y
        pad_canvasY = Math.round(e.touches[0].clientY - cRect.top); // positions to get make (0,0) the top left of the
        pad_update(pad_canvasX, pad_canvasY);
    }
}, false);

pad_canvas.addEventListener("touchstart", function(e) {
    clic = 1;
    var cRect = pad_canvas.getBoundingClientRect(); // Gets the CSS positions along with width/height
    pad_canvasX = Math.round(e.touches[0].clientX - cRect.left); // Subtract the 'left' of the pad_canvas from the X/Y
    pad_canvasY = Math.round(e.touches[0].clientY - cRect.top); // positions to get make (0,0) the top left of the
});

pad_canvas.addEventListener("touchend", function(e) {
    clic = 0;
});
    
    
function pad_update(pad_x, pad_y){
    let x = pad_x/pad_canvas.width;
    let y = (1-pad_y/pad_canvas.height);
    let params = {};

    let key = $("#pad_x").val();
    if (key != "none"){
        let range = inst.params[key].range;
        x = range[0]+x*(range[1]-range[0])   
        params[$("#pad_x").val()] = x;
    }

    key = $("#pad_y").val();
    if (key != "none"){
        let range = inst.params[key].range;
        y = range[0]+y*(range[1]-range[0])    
        params[$("#pad_y").val()] = y;
    }

    inst.update_parameters(params)
}

export { init }
