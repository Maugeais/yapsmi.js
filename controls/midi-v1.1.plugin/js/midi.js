"use strict";

import { interpolant } from "../../../js/interpolation.js?version=1.1";

var midi_record = false;
var midi_to_control = {};

/********* Midi *************************** */

function init(uid){

  navigator.requestMIDIAccess({name: "midi"}).then( onMIDISuccess, onMIDIFailure );
  
  plugins[uid].save = save;
  plugins[uid].load = load;
  draw_automation()

}

function save(uid){
  return(midi_to_control)
}

function load(uid, settings){
  midi_to_control = settings;
  $("#midi_events_table > tbody").empty();
  let html = ""
  for (var controler in midi_to_control) {
    for (var key in midi_to_control[controler]) {
      let command = midi_to_control[controler][key];


      for (let i = 0; i < command.length; i++){     
        
        var interpol = new interpolant(command[i]["automation"].x, command[i]["automation"].y, command[i]["automation"].method)
        command[i].automation = interpol;

        html += `<tr><td><input onclick="record_midi_events()" value="${key}, ${controler}"></td><td onclick="choose_control(this)">${command[i]['control']}, ${command[i]['plugin']}</td><td onclick="choose_midi_automation(this)">${interpol}</td></tr>`;
      }
    }
  }
  $('#midi_events_table tbody').html(html);
}


var midi = null;  // global MIDIAccess object
function onMIDISuccess( midiAccess ) {
  console.log( "MIDI ready!" );
  midi = midiAccess;  // store in the global (in real usage, would probably keep in an object instance)
  listInputsAndOutputs(midi)
}

function onMIDIFailure(msg) {
  console.log( "Failed to get MIDI access - " + msg );
}

function listInputsAndOutputs( midiAccess ) {

  if (midiAccess.inputs.size < 2){
    message("No MIDI input detectd")
  } else {
      midiAccess.inputs.forEach( function(entry) {
        var input = entry[1];

        $('#midi_inputs').append($('<option>', { 
            value: entry.name,
            text : entry.name
        }));
        
        midi_to_control[entry.name] = {}

        entry.onmidimessage = log_midi_input;
        // state = "Play";

        // startLoggingMIDIInput(midiAccess, 0, 0)
      });
}

  // for (var entry of midiAccess.outputs) {
  //   var output = entry[1];
  //   console.log( "Output port [type:'" + output.type + "'] id:'" + output.id +
  //     "' manufacturer:'" + output.manufacturer + "' name:'" + output.name +
  //     "' version:'" + output.version + "'" );
  // }
}

/*
function startLoggingMIDIInput( midiAccess) {
  if (midi !== null) {
    midiAccess.inputs.forEach( function(entry) {console.log(entry); entry.onmidimessage = test;});
  }
}*/

function parse_midi_message(message) {
  return {
    command: message.data[0],
    note: message.data[1],
    velocity: 100*message.data[2]/127,
    controler : message.srcElement.name
  }
}

function play_midi(command, note, velocity, controler){
  // If 128 then play_note, otherwise see commands
    if (command == 144){
      // inst.play_note(note, velocity)
      simulationNode.port.postMessage({property:"exec", method:"play_note", params:{note: note, velocity:velocity, string:0}});
    } else if (command == 128){
      simulationNode.port.postMessage({property:"exec", method:"stop_note", params:{note: note, velocity:velocity, string:0}});
    } else {
      let key = `${command}, ${note}`;
      if (key in midi_to_control[controler]){
        let control = midi_to_control[controler][key];

        for (let i = 0; i < control.length; i++){
          let plugin = control[i]['plugin'];
          let contr = control[i]['control'];
          let auto = control[i]['automation'];

          if ( global_controls[plugin][contr] instanceof Knob){   
            global_controls[plugin][contr].setValue(100*auto.eval(velocity/100))
          } else {
            global_controls[plugin][contr].click(); 
          }
        }

      } else {
      }
      // callback(velocity)

      // let params = {};
      // params[a[1]] = velocity*100;
      // let myVar = global_controls[a[0]][a[1]][1]
      // myVar(params)

    }
}

function record_midi(command, note, velocity, controler){
   var focused = $(':focus');
    
    if (focused.length == 0) return;

    if ($(focused[0]).is("input")){
        if ($(focused[0]).parent().parent().parent().parent("#midi_events_table").length > 0){
          $(focused[0]).val(`${command}, ${note}, ${controler}`)
          // let param = $(focused[0]).parent().parent().children()[1];
          // let arr = $(param).text().split(",").map(item => item.trim());
          // midi_to_control[name][`${command}, ${note}`] = arr; 
          // console.log(midi_to_control)
        }
    };
}

function log_midi_input(message){
  
  const {command, note, velocity, controler} = parse_midi_message(message)

  $("#last_midi_event").html(`Event: ${command}, ${note}`)
  
  if (!midi_record){
    play_midi(command, note, velocity, controler)
  } else {
    record_midi(command, note, velocity, controler)
  }

}

window.record_midi_events = function(message){

  if (!midi_record || message) {
    midi_record = true;
    $("#recording_midi").addClass("blink")
    $("#record_text").html("Save")
  } else {
    midi_record = false;
    $("#recording_midi").removeClass("blink")
    $("#record_text").html("Record")
    save_midi_events()
  }
}

window.choose_midi_control = function(elmnt){
  if (midi_record) choose_control(elmnt)
}

window.add_midi_events = function(){
  $('#midi_events_table tr:last').after('<tr><td><input onclick="record_midi_events(true)" value="?, ?, ?"></td><td onclick="choose_control(this)">?, ?</td><td onclick="choose_midi_automation(this)">{"method" : "lagrange", "x":[0, 1], "y":[0, 1]}</td></tr>');
}


function save_midi_events(){

  for (let controler in midi_to_control){
    midi_to_control[controler] = {};
  }

  let midi_entries = $("#midi_events_table tbody").find('tr')

  for (let k=0; k < midi_entries.length; k++){
    let entry = $(midi_entries[k]).find('td');
    let midi_code = $(entry[0]).find('input').val().split(",").map(item => item.trim());
    let control = $(entry[1]).text().split(",").map(item => item.trim());
    let automation = JSON.parse($(entry[2]).text())
    let key = `${midi_code[0]}, ${midi_code[1]}`;
    if ((midi_code[0] != '?') && (control[0] != '?')){
      if (!(key in midi_to_control[midi_code[2]])){
        midi_to_control[midi_code[2]][key] = [];
      }
      var obj ={'plugin': control[1], 'control': control[0], 'automation' : new interpolant(automation["x"], automation["y"], automation["method"])};
      midi_to_control[midi_code[2]][key].push(obj);

    }  
  }

}


/*===================================*/
/* Handling the automation           */
/*===================================*/

let set_automation_destination_element;

window.choose_midi_automation = function(elmnt){
  // choose_automation(elmnt)
  set_automation_destination_element = elmnt;

  $("#midi_automation").show()
  automation_canvas_bounds = automation_canvas.getBoundingClientRect()

  let part = JSON.parse(elmnt.innerText);
  interp.method = part.method;
  interp.x.length = part.x.length;
  interp.y.length = part.x.length;
  for (let i = 0; i < part.x.length; i++){
    interp.x[i] = part.x[i];
    interp.y[i] = part.y[i]
  }
  compute_y_cont()
  Plotly.redraw('midi_automation_display');
}


// window.set_automation_destination = function (plugin, control){
//     $("#automation").hide() 
//     $(set_automation_destination_element).text(plugin +', '+ control)
// }

// window.choose_automation = function(elmnt){
//     $("#automation").show();
//     set_automation_destination_element = elmnt;
// }

let x_cont = new Array(100)
let y_cont = new Array(100)

function compute_y_cont(){
  for (let i = 0; i < x_cont.length; i++){
    x_cont[i] = i/x_cont.length;
    y_cont[i] = interp.eval(x_cont[i])
  }

}

let interp = new interpolant([0, 1], [0, 1], "lagrange");


var trace = [{
    x: x_cont,
    y: y_cont,
    type: 'scatter',
    }, {
    x: interp.x,
    y: interp.y,
    type: 'scatter',
    mode: 'markers',
    marker: {
      size: 10,
      color: 'rgb(128, 0, 128)'
    }
  }
  ];


var layout = {
          // autosize: true,
          width: 300,
          height: 250,
          // uirevision :true,
          margin: {
            l: 15,
            r: 0,
            b: 15,
            t: 0
          },
          hovermode : false,
          xaxis: {
            range: [0, 1],
            // showgrid: true,
            fixedrange : true,
            dtick: 0.1,
            gridcolor: 'rgb(152,152,152)',
          },
          yaxis: {
            range: [0, 1],
            fixedrange : true,
            dtick: 0.1,
            gridcolor: 'rgb(152,152,152)',
          },
          showlegend: false
        };


function draw_automation(){
    Plotly.newPlot('midi_automation_display', trace, layout, {displaylogo: false, modeBarButtonsToRemove: ["zoom2d", "pan2d", "select2d", "lasso2d", "zoomIn2d", "zoomOut2d", "autoScale2d", "resetScale2d", "hoverClosestCartesian", "hoverCompareCartesian", "zoom3d", "pan3d", "resetCameraDefault3d", "resetCameraLastSave3d", "hoverClosest3d", "orbitRotation", "tableRotation", "zoomInGeo", "zoomOutGeo", "resetGeo", "hoverClosestGeo", "toImage", "sendDataToCloud", "hoverClosestGl2d", "hoverClosestPie", "toggleHover", "resetViews", "toggleSpikelines", "resetViewMapbox"]});
    automation_canvas = document.getElementById('midi_automation_display').getElementsByClassName("svg-container")[0];
}

let automation_canvas = document.getElementById('midi_automation_display');
let automation_canvas_bounds;


function whileMove(evt){
  var xInDataCoord = (evt.x - automation_canvas_bounds.x)/automation_canvas_bounds.width; 
  var yInDataCoord = 1-(evt.y - automation_canvas_bounds.y)/automation_canvas_bounds.height;

  if (movingPointIndex >= 0){
    interp.x[movingPointIndex] = xInDataCoord;
    interp.y[movingPointIndex] = yInDataCoord;
    compute_y_cont()
    Plotly.redraw('midi_automation_display');
  } 
}



var endMove = function () {
  Plotly.redraw('midi_automation_display');

  window.removeEventListener('mousemove', whileMove);
  window.removeEventListener('mouseup', endMove);
};

let movingPointIndex;

automation_canvas.addEventListener('mousedown', function (evt) {

  movingPointIndex = -1;

  var xInDataCoord = (evt.x - automation_canvas_bounds.x)/automation_canvas_bounds.width; 
  var yInDataCoord = 1-(evt.y - automation_canvas_bounds.y)/automation_canvas_bounds.height;

  for (let i = 0; i < interp.x.length; i++){
    let norm = (interp.x[i]-xInDataCoord)**2+(interp.y[i]-yInDataCoord)**2;
    if (norm < 0.03){
      movingPointIndex = i;
    }
  } 

  evt.stopPropagation(); // remove if you do want it to propagate ..
  window.addEventListener('mousemove', whileMove);
  window.addEventListener('mouseup', endMove);   
});



automation_canvas.addEventListener('click', function(evt) {
 
  var xInDataCoord = (evt.x - automation_canvas_bounds.x)/automation_canvas_bounds.width; 
  var yInDataCoord = 1-(evt.y - automation_canvas_bounds.y)/automation_canvas_bounds.height;
 
  interp.x.push(xInDataCoord)
  interp.y.push(yInDataCoord)
  
  Plotly.redraw('midi_automation_display');
});


window.update_midi_automation = function(){
  let y0 = parseFloat($("#midi_automation_slider_0").val())/100;
  let y1 = parseFloat($("#midi_automation_slider_1").val())/100;
  interp.y = [y0, y1]
  Plotly.redraw('midi_automation_display');
}

window.reset_midi_interpolant =function(){
  interp.x.length = 2
  interp.x[0] = 0;
  interp.x[1] = 1;

  interp.y.length = 2
  interp.y[0] = 0;
  interp.y[1] = 1;

  for (let i = 0; i < x_cont.length; i++){
    y_cont[i] = interp.eval(x_cont[i])
  }
  Plotly.redraw('midi_automation_display');
}

window.save_midi_interpolant =function(){
  $(set_automation_destination_element).text(interp) 
  // structuredClone(x)
}


$('#midi_automation').click(function(event){
  event.stopPropagation();
});

$(window).resize(function() {
  automation_canvas_bounds = automation_canvas.getBoundingClientRect()
});


// let setting_midi = false;
// function set_midi_events(){
// 
//   if (setting_midi){
//     $("#setting_midi").css('background', 'none');
//     setting_midi = false;
//     var input= $('#midi_inputs').find(":selected").text();
//     midi.inputs.forEach( function(entry) {
//       if (entry.name == input) entry.onmidimessage = test;
//     });
//   } else {
//     $("#setting_midi").css('background', 'red');
//     setting_midi = true;  
//     var input= $('#midi_inputs').find(":selected").text();
//     midi.inputs.forEach( function(entry) {
//       if (entry.name == input) entry.onmidimessage = set_midi_values;
//     });
//   }
// }

$("#midi_automation").draggable()


export { init }
