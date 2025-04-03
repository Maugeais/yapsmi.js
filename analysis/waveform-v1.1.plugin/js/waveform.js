"use strict";

let waveform_ctx = {};
let analysers = {};

function init(uid){
    add_filter(init_waveform_analyser, -1, uid);
    init_knobs("waveform_controls€"+uid, "medium", "LittlePhatty");
    initial_draw(uid)
}

function init_waveform_analyser(audioCtx, uid){
    analysers[uid] = audioCtx.createAnalyser();
    analysers[uid].fftSize = 2048*16;
    analysers[uid].smoothingTimeConstant = 0.0;
    analysers[uid].wavArray = new Float32Array(analysers[uid].frequencyBinCount);
    return({'input': analysers[uid], 'output': analysers[uid], 'is_on': true, 'callback': waveform_analyser})
}


function waveform_analyser(uid){

    let freq = get_frequency(analysers[uid].wavArray);
    let sr = parseInt(fs/freq);
    analysers[uid].getFloatTimeDomainData(analysers[uid].wavArray);

    let firstPos = 0;
    
    // First find min and max, and store position of min
    let max = 0, min = 0;
    for (let i = 0; i < sr; i++){
        max = Math.max(max, analysers[uid].wavArray[i])
        if (analysers[uid].wavArray[i] < min) {
            firstPos = i;
            min =  analysers[uid].wavArray[i]
        }
    }

    if (min < max) {

        // Then phase condition
        while (analysers[uid].wavArray[firstPos]*analysers[uid].wavArray[firstPos+1] > 0 || analysers[uid].wavArray[firstPos] > analysers[uid].wavArray[firstPos+1]){
            ++firstPos;
        }
        // from_max(uid, analysers[uid].wavArray)
        let x = new Array(sr);
        let y = new Array(sr);



        for (let i = 0; i < sr; i++){
                x[i] = i/sr;
                y[i] = analysers[uid].wavArray[firstPos+i];
        }

        draw(uid, x, y)
    }
}

var data = {};

function initial_draw(uid){
    data[uid] = [{
      x: [],
      y: [],
      line: {
        color: 'rgb(55, 128, 191)',
        width: 3},
      type: 'scatter'
    }];
    
    var layout = {
            autosize: false,
            width: 333,
            height: 300,
            uirevision :true,
            margin: {
                l: 30,
                r: 0,
                b: 20,
                t: 0
              },
            xaxis: {
              showgrid: true,
              zeroline: false
            },
            yaxis: {
              showgrid:true,
              showline: false
            }
          };

    Plotly.newPlot('waveform_display€'+uid, data[uid], layout);
}

function draw(uid, x, y){
    
    data[uid][0]['x'] = x;
    data[uid][0]['y'] = y;
    
    Plotly.redraw('waveform_display€'+uid);

}

export { init }
