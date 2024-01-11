 
/********* Midi *************************** */

function midi_init(){

  navigator.requestMIDIAccess().then( onMIDISuccess, onMIDIFailure );

  // try{

  //     navigator.requestMIDIAccess()
  //       .then(function(access) {

  //         // Get lists of available MIDI controllers
  //         const inputs = access.inputs.values();
  //         const outputs = access.outputs.values();

  //         access.onstatechange = event => {

  //           // Print information about the (dis)connected MIDI controller
  //           console.log(event.port.name, event.port.manufacturer, event.port.state);
  //         };
  //       });
    
  // } catch(e) {
  //   console.log(e)
  // }
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
        console.log(entry)
        var input = entry[1];

        $('#midi_inputs').append($('<option>', { 
            value: entry.name,
            text : entry.name
        }));

        entry.onmidimessage = test;

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


function startLoggingMIDIInput( midiAccess) {
  if (midi !== null) {
    midiAccess.inputs.forEach( function(entry) {console.log(entry); entry.onmidimessage = test;});
  }
}

function test(message){
  var command = message.data[0];
  var note = message.data[1];
  var velocity = (message.data.length > 2) ? message.data[2] : 0; // a velocity value might not be included with a noteOff command

  switch (command){
    case 224 : console.log("pitch wheel", note, velocity);
    case 128 : console.log("note on", note, velocity);
    case 144 : console.log("note off", note, velocity);
    case 176 : console.log("control change", note, velocity);
  }
}

function set_midi_values(message){
  var focused = $(':focus');

  if (focused.length == 0) return;

  if ($(focused[0]).is("input")){
      if ($(focused[0]).parent().parent().parent().parent("#midi_events_table").length > 0){
        $(focused[0]).val(message.data[0])
      }
  };

  // var command = message.data[0];
  // var note = message.data[1];
  // var velocity = (message.data.length > 2) ? message.data[2] : 0; // a velocity value might not be included with a noteOff command

  // switch (command){
  //   case 224 : console.log("pitch wheel", note, velocity);
  //   case 128 : console.log("note on", note, velocity);
  //   case 144 : console.log("note off", note, velocity);
  //   case 176 : console.log("control change", note, velocity);
  // }
}

function add_midi_events(){
  console.log('add');
}

let setting_midi = false;
function set_midi_events(){

  if (setting_midi){
    $("#setting_midi").css('background', 'none');
    setting_midi = false;
    var input= $('#midi_inputs').find(":selected").text();
    midi.inputs.forEach( function(entry) {
      if (entry.name == input) entry.onmidimessage = test;
    });
  } else {
    $("#setting_midi").css('background', 'red');
    setting_midi = true;  
    var input= $('#midi_inputs').find(":selected").text();
    midi.inputs.forEach( function(entry) {
      if (entry.name == input) entry.onmidimessage = set_midi_values;
    });
  }
}