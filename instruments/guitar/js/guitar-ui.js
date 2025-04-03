let isPlaying = false;

function density_change(a, s){
  set_controls({["density€"+s] : a}, false)
}

function stiffness_change(a, s){
  set_controls({["stiffness€"+s] : a}, false)

  // inst.set_controls({["stiffness€"+s] : a}, false, is_shiftkey_pressed)
  // inst.strings[s-1]._scheme_constants()
}

function tension_change(a, s){
  set_controls({["tension€"+s] : a}, false)

  // inst.set_controls({["tension€"+s] : a}, false, is_shiftkey_pressed)
  // inst.strings[s-1]._scheme_constants()
}

function losses_eta_change(a, s){
  set_controls({["losses_eta€"+s] : a}, false)

  // inst.set_controls({["losses_eta€"+s] : a}, false, is_shiftkey_pressed)
  // inst.strings[s-1]._scheme_constants()
}

function losses_R_change(a, s){
  set_controls({["losses_R€"+s] : a}, false)

  // inst.set_controls({["losses_R€"+s] : a}, false, is_shiftkey_pressed)
  // inst.strings[s-1]._scheme_constants()
}

function nonlinearity_change(a, s){
  set_controls({["nonlinearity€"+s] : a}, false)

  // inst.set_controls({["nonlinearity€"+s] : a}, false, is_shiftkey_pressed)
  // inst.strings[s-1]._scheme_constants()
}

function regularity_change(a, s){
  set_controls({["regularity"] : a}, false)

  // inst.set_controls({["regularity"] : a}, false, is_shiftkey_pressed)
  // inst.compute_attack_coefs()
}

function width_change(a, s){
  set_controls({["width"] : a}, false)

  // inst.set_controls({["width"] : a}, false, is_shiftkey_pressed)
  // inst.compute_attack_coefs()
}

function position_change(a, s){
  set_controls({["position"] : a}, false)

  // inst.set_controls({["position"] : a}, false, is_shiftkey_pressed)
  // inst.compute_attack_coefs()
}

function duration_change(a, s){
  set_controls({["duration"] : a}, false)

  // inst.set_controls({["duration"] : a}, false, is_shiftkey_pressed)
  // inst.compute_attack_coefs()
}

function increase_duration_change(a, s){
  set_controls({["increase_duration"] : a}, false)

  // inst.set_controls({["increase_duration"] : a}, false, is_shiftkey_pressed)
}

function strength_change(a, s){
  set_controls({["strength"] : a}, false)

  // inst.set_controls({["strength"] : a}, false, is_shiftkey_pressed)
}

function attack_losses_change(a, s){
  set_controls({["attack_lossess€"+s] : a}, false)

  // inst.plectrum["losses"].set_from_precentage(a);
  // $("#attack_losses_value").html(inst.plectrum["losses"].to_string() )
  // inst.set_controls({["attack_losses€"+s] : a}, false, is_shiftkey_pressed)
  // inst.strings[s-1]._scheme_constants()
}

$("#fretboard").click(set_finger_callback);
let fret_positions = [2.54, 9.297, 16.05, 22.377, 28.441, 34.262, 39.741, 44.981, 49.90, 54.664, 59.003, 63.317, 67.243, 71.058, 74.668, 78.081, 81.375, 84.342, 87.183, 90.014, 92.555, 95.033, 97.367];



function id_string_fret(e){
  e.stopPropagation();
    
  let string = nb_strings-Math.floor(nb_strings*(e.clientY-$("#fretboard").offset().top)/e.target.offsetHeight);
  let x = (e.clientX-$("#fretboard").offset().left)/e.target.offsetWidth;
  let fret = fret_positions.findIndex(element => element > 100*x);

  return [string, fret]
  
}

function set_finger(string, fret){
    if (fret > 0){
       $('#finger'+(string)).css('left', (0.666*fret_positions[fret-1]+0.333*fret_positions[fret])*$("#fretboard").width()*0.01);
    } else {
       $('#finger'+(string)).css('left', -100);
    }
    simulationNode.port.postMessage({property:"exec", method:"change_fingering", params:{string: string-1, position: Math.pow(2, -fret/12)}});

}
  
function set_finger_callback(e){
  e.stopPropagation();
  let id = id_string_fret(e);
  if (e.detail === 1) {
    set_finger(id[0], id[1]);
  } else if (e.detail === 2){
    set_finger(id[0], 0);
  }
}

function mute_string(s, state){
  string_muted[s-1].muted = state;
  if (state == false){
      $($(".stringName")[string_muted.length-s]).css('color', 'lime');
  } else {
      $($(".stringName")[string_muted.length-s]).css('color', 'red');
  }
  simulationNode.port.postMessage({property:"exec", method:"mute_string", params:[{string: s, state:state}]});
}

let string_muted = [false, false, false, false, false, false];

function toggle_string_callback(e, s){
  e.stopPropagation();
  // mute_string(s, !inst.strings[s-1].muted)
  string_muted[s-1] = !string_muted[s-1]
  // simulationNode.port.postMessage({property:"exec", method:"mute_string", params:[{string: s, state:string_muted[s-1]}]});
  mute_string(s, !string_muted[s-1])
}

$(".stringName").dblclick(function(){
  let index = nb_strings-$('.stringName').index(this);
  mute_string(index, false)
  for (let s = 1; s <= nb_strings; s++) {
    if (s != index){
      mute_string(s, true)
    }
  }
}); 


var struming = false;
var position_struming_x=0, position_struming_y=-0.5, timeStamp;
$("#struming").mousemove(strum);
$("#struming").mousedown(function(e){struming=true; var rect = e.target.getBoundingClientRect(); position_struming_y=(nb_strings*(e.clientY-rect.top)/$("#struming").height()-1/2);});
$("#struming").mouseup(function(){struming=false});

var nb_strings = 6;

function strum(e){
  
  e.stopPropagation();
  
  if (e.target.id =="struming") {
    
    var x, y;
    var rect = e.target.getBoundingClientRect()
    
    y = (nb_strings*(e.clientY-rect.top)/$("#struming").height()-1/2);
    
    let speed = (y - position_struming_y)/(e.timeStamp-timeStamp);
    speed = 1;

    position_struming_x = (1-(e.pageX-rect.left)/$("#struming").width())*0.3;
    
    if (Math.floor(y) != Math.floor(position_struming_y)  ) {
      if (y > position_struming_y && (y < nb_strings )) {
        for (var i = Math.floor(position_struming_y)+1; i <= Math.floor(y); i++) {
          simulationNode.port.postMessage({property:"exec", method:"pluck", params:{position: position_struming_x, speed: speed, string_number: 5-i}});
        }
      } else if (position_struming_y < nb_strings){
        
        for (var i = Math.floor(position_struming_y); i >= Math.floor(y)+1; i--) {
          simulationNode.port.postMessage({property:"exec", method:"pluck", params:{position: position_struming_x, speed: speed, string_number: 5-i}});
        }
      }
    }    
    position_struming_y = y;
    timeStamp = e.timeStamp;
  } 
}



$(".pickup").draggable({axis:"x",
    containment: "parent",
    cursor:"move",
    handle:".pickupHandle",
    stop:function(e, ui){
      let index = e.target.id.substr(e.target.id.length - 1)-1;
      var rect = e.target.parentNode.getBoundingClientRect()
      pos = 1-(e.clientX-rect.left)/$("#struming").width();  
      inst.mics[index].set_position(0.17*pos)
    }
});

let chords;
$.getJSON("./data/chords.json", function(json) {
    chords = json; // this will show the info it in firebug console
});


const source = document.getElementById('chord_input');
const result = document.getElementById('result');

function set_chord(chord_shape){
  for (let s=0; s < chord_shape.length; s++){     
      if (chord_shape[s] == 'x'){
        mute_string(s+1, true)
        set_finger(s+1, 0);
      } else {
        mute_string(s+1, false)
        set_finger(s+1, chord_shape[s]);
      }
  }
}

$('#chords_list').click(function (e) {
  set_chord(chords[e.target.innerText][0].positions);
});

source.addEventListener('input', find_chords);

function find_chords(e){

  var z = Object.keys(chords).filter(function(k) {
    return k.indexOf(e.target.value) == 0;
  }).sort();

  $('#chords_list').empty();

  var html = '';
  z.forEach(element => {
    html += '<tr><td>' + element + '</td></tr>';
  });

  $('#chords_list').html(html);

}

$('input[type=radio][name=plectrum_shape_signal]').change(function() {
    inst.set_plectrum({"shape" : this.value});
});

$('input[type=checkbox][name=nl_microphone]').change(function() {
  let value = $(this).is(":checked");
  for (let m = 0; m < inst.mics.length; m++){
    inst.mics[m].non_lin = value;
  }
});

function change_microphone_selector(e){
  var offset = $("#microphone_selector polygon").offset(); 
  var parent_offset = $("#microphone_selector").offset(); 
   //or $(this).offset(); if you really just want the current element's offset
   var x = (e.pageX - offset.left)/100;
   var y = (e.pageY - offset.top)/100;
   var c = (2*x-1+y)/2;
   var b = (y+1-2*x)/2;
   var a = 1-b-c;
  inst.mics[0].change_gain(a);
  inst.mics[1].change_gain(b);
  inst.mics[2].change_gain(c);
  $("#microphone_selector_position").css({left : e.pageX -5, top:e.pageY -5});
}

current_menu["string_controls"] = 0;
current_menu["righthand_controls"] = 0;

// window.addEventListener('load', function () {
//   setTimeout(() => {
//     guitar_knobs.forEach((knob) => knob.setValue(50))
//   }, 1000);
// })