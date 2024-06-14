let isPlaying = false;

function density_change(a, s){
  let display = inst.strings[s-1].set_control({"density" : a})
  $("#density€"+s+"_value").html(display)
}

function stiffness_change(a, s){
  let display = inst.strings[s-1].set_control({"stiffness" : a})
  $("#stiffness€"+s+"_value").html(display)

}

function tension_change(a, s){
  let display = inst.strings[s-1].set_control({"tension" : a})
  $("#tension€"+s+"_value").html(display)
}

function losses_eta_change(a, s){
  let display = inst.strings[s-1].set_control({"eta" : a})
  $("#losses_eta€"+s+"_value").html(display)

}

function losses_R_change(a, s){
  let display = inst.strings[s-1].set_control({"R" : a})
  $("#losses_R€"+s+"_value").html(display)
}

function regularity_change(a, s){
  let display = inst.set_plectrum({"regularity" : a})
  $("#regularity_value").html(display)
}

function width_change(a, s){
  let display = inst.set_plectrum({"width" : a})
  $("#width_value").html(display)
}

function position_change(a, s){
  let display = inst.set_plectrum({"position" : a})
  $("#position_value").html(display)
}

function duration_change(a, s){
  let display = inst.set_plectrum({"duration" : a})
  $("#duration_value").html(display)
}

function increase_duration_change(a, s){
  let display = inst.set_plectrum({"increase_duration" : a})
  $("#increase_duration_value").html(display)
}

function strength_change(a, s){
  let display = inst.set_plectrum({"strength" : a})
  $("#strength_value").html(display)
}

function widthmic_change(a, s){
  if (s < inst.mics.length) {
    let display = inst.mics[s-1].set_width(a)
    $("#widthmic€"+s+"_value").html(display)
  }
}

function gain_change(a, s){
  inst.gain.set_from_precentage(a);
  $("#gain_value").html(inst.gain.to_string() )
}

function attack_losses_change(a, s){
  inst.plectrum["losses"].set_from_precentage(a);
  $("#attack_losses_value").html(inst.plectrum["losses"].to_string() )
}

$("#fretboard").click(set_finger_callback);



function id_string_fret(e){
  e.stopPropagation();
    
  let string = inst.strings.length-Math.floor(inst.strings.length*(e.clientY-$("#fretboard").offset().top)/e.target.offsetHeight);
  let x = (e.clientX-$("#fretboard").offset().left)/e.target.offsetWidth;
  let fret = inst.fret_positions.findIndex(element => element > 100*x);

  return [string, fret]
  
}

function set_finger(string, fret){
    if (fret > 0){
       $('#finger'+(string)).css('left', (0.666*inst.fret_positions[fret-1]+0.333*inst.fret_positions[fret])*$("#fretboard").width()*0.01);
    } else {
       $('#finger'+(string)).css('left', -100);
    }
    inst.change_fingering(string-1, Math.pow(2, -fret/12));
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
  if (state == false){
      inst.strings[s-1].muted = false;
      $($(".stringName")[inst.strings.length-s]).css('color', 'lime');
  } else {
      inst.strings[s-1].muted = true;
      $($(".stringName")[inst.strings.length-s]).css('color', 'red');
  }
}

function toggle_string_callback(e, s){
  e.stopPropagation();
  mute_string(s, !inst.strings[s-1].muted)
}

$(".stringName").dblclick(function(){
  let index = inst.strings.length-$('.stringName').index(this);
  mute_string(index, false)
  for (let s = 1; s <= inst.strings.length; s++) {
    if (s != index){
      mute_string(s, true)
    }
  }
}); 


var struming = false;
var position_struming_x=0, position_struming_y=-0.5, timeStamp;
$("#struming").mousemove(strum);
$("#struming").mousedown(function(e){struming=true; var rect = e.target.getBoundingClientRect(); position_struming_y=(inst.strings.length*(e.clientY-rect.top)/$("#struming").height()-1/2);});
$("#struming").mouseup(function(){struming=false});


function strum(e){
  
  e.stopPropagation();
  
  if (e.target.id =="struming") {
    
    var x, y;
    var rect = e.target.getBoundingClientRect()
    
    y = (inst.strings.length*(e.clientY-rect.top)/$("#struming").height()-1/2);
    
    speed = (y - position_struming_y)/(e.timeStamp-timeStamp);

    position_struming_x = (1-(e.pageX-rect.left)/$("#struming").width())*0.3;
    
    if (Math.floor(y) != Math.floor(position_struming_y)  ) {
      if (y > position_struming_y && (y < inst.strings.length )) {
        for (var i = Math.floor(position_struming_y)+1; i <= Math.floor(y); i++) {
          inst.strings[5-i].pluck(position_struming_x, speed);
        }
      } else if (position_struming_y < inst.strings.length){
        
        for (var i = Math.floor(position_struming_y); i >= Math.floor(y)+1; i--) {
          inst.strings[5-i].pluck(position_struming_x, speed);
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


function all_strings(object){
  console.log("test", object.checked)
}

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

window.addEventListener('load', function () {
  setTimeout(() => {
    guitar_knobs.forEach((knob) => knob.setValue(50))
  }, 1000);
})