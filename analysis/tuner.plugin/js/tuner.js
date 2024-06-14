'use strict';

const canvas = document.getElementById("tuner_canvas");
const ctx = canvas.getContext("2d");

const ratio = canvas.width/canvas.height;
function init(uid){
    add_filter(init_tuner, -1, uid);
}

function init_tuner(audioCtx, uid){
    return(["", draw_tuner])
}

// ctx.translate(canvas.width/2, canvas.height/2);

const notes = ["C", "©#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function draw_tuner(wav){

    let freq = get_frequency();
    $("#tuner_frequency").html(freq.toFixed(2)+'Hz')

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    let n = Math.round(12*Math.log2(freq/16.35));
    let octave = Math.floor(n/12);
    let note = n % 12;
    let deviation = (12*Math.log2(freq/16.35)-n)*100

    let angle = Math.PI+(deviation*1.5)* Math.PI / 180;

    ctx.moveTo(canvas.width/2, canvas.height/2);
    ctx.lineTo(canvas.width/2-canvas.width/2*Math.sin(angle), canvas.height/2+canvas.height/2*Math.cos(angle));

    ctx.strokeStyle = "red";
    ctx.stroke();

    $("#tuner_note").html(notes[note]+octave)
    $("#tuner_deviation").html(Math.round(deviation)+" cents")

    if (deviation < -5){
        $("#tuner_flat").css('color', 'red');
        $("#tuner_sharp").css('color', 'white');
    } else if (deviation > 5){
        $("#tuner_flat").css('color', 'white');
        $("#tuner_sharp").css('color', 'red');
    } else {
        $("#tuner_flat").css('color', 'green');
        $("#tuner_sharp").css('color', 'green');
    }
}


export { init }
