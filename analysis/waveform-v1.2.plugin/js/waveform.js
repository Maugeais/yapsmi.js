"use strict";

let analysers = {};

function init(uid){
  
    add_filter(init_waveform_analyser, -1, uid);   
    init_knobs("waveform_controls€"+uid, "medium", "LittlePhatty");
    initial_draw(uid)


  plugins[uid].save = save;
  plugins[uid].load = load;

}

function save(){
  let commands = {};

  return(commands)
}

function load(uid, commands){
  // key_x = commands['key_x'];
  // $("#continuation_x").val(key_x);
  // key_y = commands['key_y'];
  // $("#continuation_y").val(key_y);
  // continuation_knobs["continuation_tail"].setValue(commands["tail_size"])
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
  let y = [new Array(sr+1)];

  if (origin == "channel_0+1"){
    y.push(new Array(sr+1));
    analysers[uid]["1"].getFloatTimeDomainData(analysers[uid]["1"].wavArray);
  }
  
  if (origin != "channel_0/1"){
    let firstPos = 0;

    while (ana.wavArray[firstPos]*ana.wavArray[firstPos+1] > 0 || ana.wavArray[firstPos] > ana.wavArray[firstPos+1]){
        ++firstPos;
    }

    let dec = ana.wavArray[firstPos]/(ana.wavArray[firstPos]-ana.wavArray[firstPos+1]);
    for (let i = 0; i < sr; i++){
            x[i] = (i)/sr;
            y[0][i] = (ana.wavArray[firstPos+i]+dec*(ana.wavArray[firstPos+i+1]-ana.wavArray[firstPos+i]));
            if (origin == "channel_0+1"){
              y[1][i] = (analysers[uid]["1"].wavArray[firstPos+i]+dec*(analysers[uid]["1"].wavArray[firstPos+i+1]-analysers[uid]["1"].wavArray[firstPos+i]));
            }
    }

  } else {
      analysers[uid]["1"].getFloatTimeDomainData(analysers[uid]["1"].wavArray);
      x = ana.wavArray.slice(0, sr+1)
      y = [analysers[uid]["1"].wavArray.slice(0, sr+1)]
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
    },{
      x: [],
      y: [],
      line: {
        color: 'rgb(128, 128, 0)',
        width: 3},
      type: 'scatter'
    }];
    
    var layout = {
            autosize: false,
            width: 333,
            height: 300,
            uirevision :true,
            legend: {x: 0., y: 0.},
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
    data[uid][0]['y'] = y[0];

    if (y.length > 1){
      data[uid][1]['x'] = x;
      data[uid][1]['y'] = y[1];
    } else {
      data[uid][1]['x'] = [];
      data[uid][1]['y'] = [];
    }
    Plotly.redraw('waveform_display€'+uid);

}


let origin = "channel_0";

$('input[type=radio][name=waveform_sources]').change(function() {
  origin = this.value;
});

$(".waveform_ranges input[type='text']").on('keyup', function (e) {
    if (e.key === 'Enter' || e.keyCode === 13) {
      let elt = e.currentTarget;
      let direction = elt.id.split("_")[1][0]
      let min = better_parseFloat("waveform_"+direction+"min")
      let max = better_parseFloat("waveform_"+direction+"max")
      Plotly.relayout(elt.parentNode.parentNode.id.replace("€", "_display€"), direction+'axis.range', [min, max])

    }
});


export { init }
