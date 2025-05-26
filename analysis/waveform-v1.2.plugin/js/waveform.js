"use strict";

let analysers = {};

function init(uid){
  
    add_filter(init_waveform_analyser, -1, uid);   
    init_knobs("waveform_controls€"+uid, "medium", "LittlePhatty");
    initial_draw(uid)
}
    
function init_waveform_analyser(audioCtx, uid){

    let splitter;
    splitter = audioCtx.createChannelSplitter(2);
    analysers[uid] = {};
    analysers[uid]["0"] = audioCtx.createAnalyser();
    analysers[uid]["1"] = audioCtx.createAnalyser();
    analysers[uid]["0"].fftSize = 2048*16;
    analysers[uid]["0"].smoothingTimeConstant = 0.0;
    analysers[uid]["0"].wavArray = new Float32Array(analysers[uid]["0"].frequencyBinCount);
    analysers[uid]["1"].fftSize = 2048*16;
    analysers[uid]["1"].smoothingTimeConstant = 0.0;
    analysers[uid]["1"].wavArray = new Float32Array(analysers[uid]["1"].frequencyBinCount);
    splitter.connect(analysers[uid]["0"], 0);
    splitter.connect(analysers[uid]["1"], 1);
    return({'input': splitter, 'output': null, 'is_on': true, 'callback': waveform_analyser})
}

function waveform_analyser(uid){

  let ana;
  if (origin == "channel_1"){
    ana = analysers[uid]["1"];
  } else {
    ana = analysers[uid]["0"]; 
  }

  ana.getFloatTimeDomainData(ana.wavArray);

  let freq = get_frequency(ana.wavArray);
  let sr = parseInt(fs/freq);

  let minmax = ana.wavArray.slice(0, sr);
    
  // First find min and max, and store position of min
  let max = Math.max(...minmax), min = Math.min(...minmax);
  if (min >= max) {
    return
  }

  let x = new Array(sr+1);
  let y = new Array(sr+1);
  
  if (origin != "channel_0/1"){
    let firstPos = 0;

    while (ana.wavArray[firstPos]*ana.wavArray[firstPos+1] > 0 || ana.wavArray[firstPos] > ana.wavArray[firstPos+1]){
        ++firstPos;
    }

    let dec = ana.wavArray[firstPos]/(ana.wavArray[firstPos]-ana.wavArray[firstPos+1]);
    for (let i = 0; i < sr; i++){
            x[i] = (i)/sr;
            y[i] = (ana.wavArray[firstPos+i]+dec*(ana.wavArray[firstPos+i+1]-ana.wavArray[firstPos+i]))/instrument_controls['output_impedance'].value;
    }

  } else {
      analysers[uid]["1"].getFloatTimeDomainData(analysers[uid]["1"].wavArray);
      x = ana.wavArray.slice(0, sr+1)
      y = analysers[uid]["1"].wavArray.slice(0, sr+1)
  }

  //   let avg = 0;

  //   for (let i = 0; i < sr; i++){
  //     avg += ana.wavArray[i];
  //   }

  //   avg /= sr;


  //   for (let i = 0; i < sr; i++){
  //     ana.wavArray[i]-= avg;
  // }
    draw(uid, x, y)

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


let origin = "channel_0";

$('input[type=radio][name=waveform_sources]').change(function() {
  origin = this.value;
});


export { init }
