"use strict";

var pointCount = 3142;
var i = 0;

var tail_size = 100;
var key_x = "rms";
var key_y = "rms";
var key_z = "rms";

window.colino3d_tail_change = function(a){
      tail_size = 10*(1+a);
      $("#colino3d_tail_value").html(tail_size);
}

window.colino3d_change_axis = function(axis, container){
  if (axis == "x") key_x = $(container).val();
  if (axis == "y") key_y = $(container).val();
  if (axis == "z") key_z = $(container).val();
}

let canvas = document.getElementById("colino3d_display");

let drawing_on = true;

canvas.addEventListener("mousedown", function(e) {
    drawing_on = false;
});

canvas.addEventListener("mouseup", function(e) {
    drawing_on = true;
});
    
function draw(){
    

    var x = [];
    var y = [];
    var z = [];
    var c = [];

    // for(i = 0; i < pointCount/4; i++)
    // {
    //     r = i * (pointCount - i);
    //     x.push(r * Math.cos(i / 30));
    //     y.push(r * Math.sin(i / 30));
    //     z.push(i);
    //     c.push(i)
    // }

    var layout = {
        autosize: false,
        width: 450,
        height: 300,
        uirevision :true,
        margin: {
          l: 0,
          r: 0,
          b: 0,
          t: 0
        },
        scene: {
          xaxis:{title: 'X AXIS TITLE'},
          yaxis:{title: 'Y AXIS TITLE'},
          zaxis:{title: 'Z AXIS TITLE'},
        },
      };

    Plotly.newPlot('colino3d_display', [{
        type: 'scatter3d',
        mode: 'lines',
        x: x,
        y: y,
        z: z,
        opacity: 0.7,
        line: {
        width: 10,
        color: c,
        colorscale: 'Viridis'}
        }], layout, {displayModeBar: false});

}


function compute_value(key, output, freq){

  switch (key){
    case "rms" :
      let rms = 0;
      for (let j = 0; j < 48000/freq; j++) rms += output[j]*output[j];
      return(Math.sqrt(rms));
    case "max" :
      let max = 0;
      for (let j = 0; j < 48000/freq; j++) max=Math.max(max, Math.abs(output[j]));
      return(max);
    case "frequency" :
      return(freq);
    default :
      return(inst.params[key].value);
  }  
}

function update_drawing(output, freq){

      if (!drawing_on){
        return;
      }

      let rms = 0;
      for (let j = 0; j < 48000/freq; j++){
        rms += output[j]*output[j];
      }

      rms = Math.sqrt(rms);
    
      var update = {
              x: [[compute_value(key_x, output, freq)]],
              y: [[compute_value(key_y, output, freq)]],
              z: [[compute_value(key_z, output, freq)]],
              'line.color': [[i]]
      }
      ++i;

      Plotly.extendTraces('colino3d_display', update, [0], tail_size)
}

let knobs;
function init(){
    knobs = init_knobs("colino3d_controls", "large", "Vintage");

    let keys = Object.keys(inst.params);
    $.each(keys, function (i, item) {
        $('#colino3d_x').append($('<option>', {
            value: item,
            text : item
        }));
        $('#colino3d_y').append($('<option>', {
            value: item,
            text : item
        }));
        $('#colino3d_z').append($('<option>', {
            value: item,
            text : item
        }));
    });


    draw();
    add_post_processor(update_drawing)
}

export { init };

// exemple d'update à https://plotly.com/javascript/streaming/#streaming-with-timestamp
//  Plotly.extendTraces
