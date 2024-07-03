"use strict";

var state = "None";
var commands = {};

/********* Midi *************************** */

function init(uid){

  navigator.requestMIDIAccess({name: "midi"}).then( onMIDISuccess, onMIDIFailure );
  
  plugins[uid].save = save;
  plugins[uid].load = load;
}

function save(uid){
  return(commands)
}

function load(uid, settings){
  commands = settings;
  $("#midi_events_table > tbody").empty();
  $('#midi_events_table').append($('<tr>'));
  for (var controler in commands) {
    for (var key in commands[controler]) {
      $('#midi_events_table tr:last').after(`<tr><td><input onclick="record_midi_events()" value="${key}, ${controler}"></td><td onclick="choose_control(set_midi_control_events, this)">${commands[controler][key]} </td></tr>`);
    }
  }

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
        
        commands[entry.name] = {}

        entry.onmidimessage = logMIDIInput;
        state = "Play";

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

function parseMidiMessage(message) {
  // console.log(message)
  return {
    command: message.data[0],
    note: message.data[1],
    velocity: message.data[2] / 127,
    name : message.srcElement.name
  }
}

function logMIDIInput(message){
  
  const {command, note, velocity, name} = parseMidiMessage(message)

  // var command = message.data[0];
  // var note = message.data[1];
  // var velocity = (message.data.length > 2) ? message.data[2] : 0; // a velocity value might not be included with a noteOff command
  
  if (state == "Play"){

    // If 128 then play_note, otherwise see commands
    if (command == 144){
      inst.play_note(note, velocity)
    } else if (command == 128){
      inst.stop_note(note, velocity)
    } else {


      let a = commands[name][`${command}, ${note}`];

      let params = {};
      params[a[1]] = velocity*100;
      let myVar = controls[a[0]][a[1]][1]
      myVar(params)

      // console.log(myVar, params)
    }


  // switch (command){
  //   case 224 : console.log("pitch wheel", note, velocity);
  //   case 128 : console.log("note on", note, velocity);
  //   case 144 : console.log("note off", note, velocity);
  //   case 176 : console.log("control change", note, velocity);
  // }
  } else if (state = "Record") {
    var focused = $(':focus');
    
    if (focused.length == 0) return;

    if ($(focused[0]).is("input")){
        if ($(focused[0]).parent().parent().parent().parent("#midi_events_table").length > 0){
          $(focused[0]).val(`${command}, ${note}, ${name}`)
          let param = $(focused[0]).parent().parent().children()[1];
          let arr = $(param).text().split(",").map(item => item.trim());
          commands[name][`${command}, ${note}`] = arr; 
        }
    };
    state = "Wait";
  }

}

window.set_midi_events = function(message){
  console.log("test", state)
  if (state == "None" || state == "Play") {
    state = "Record";
    $("#midi_setting_in_progress").addClass("blink")

  } else {
    state = "Play";
    $("#midi_setting_in_progress").removeClass("blink")
  }
}

// function set_midi_values(message){
//   var focused = $(':focus');

//   if (focused.length == 0) return;

//   if ($(focused[0]).is("input")){
//       if ($(focused[0]).parent().parent().parent().parent("#midi_events_table").length > 0){
//         $(focused[0]).val(message.data[0])
//       }
//   };
// }


window.record_midi_events = function(){
  console.log("hola", state)
  if (state == "None" || state == "Wait"|| state == "Play"){
    state = "Record";
    $("#midi_setting_in_progress").addClass("blink")
  }
}


window.add_midi_events = function(){
  $('#midi_events_table tr:last').after('<tr><td><input onclick="record_midi_events()" value="124"></td><td onclick="choose_control(set_midi_control_events, this)">??? </td></tr>');
}

window.set_midi_control_events = function(control, a, midi_element){
  $(midi_element).text(control +', '+ a)
  
  let input = $(midi_element).parent().children(':first-child').children().val();
  let arr = input.split(",").map(item => item.trim());
  commands[arr[2]][[`${arr[0]}, ${arr[1]}`]] = [control, a]
  
  console.log(commands)//control, a, midi_element);
}


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

export { init }
