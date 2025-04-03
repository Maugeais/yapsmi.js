let isPlaying = false;


function position_change(a, motionless=false){
  set_controls({"position" : a}, false)
  if (!motionless){
    $("#bow").css({'left':(1-a/100)*$("#bowing_area").width()})
  } 
}


function output_impedance_change(a, s){
  set_controls({"output_impedance" : a}, false)
}

function dimension_change(a, s){
  simulationNode.port.postMessage({property:"exec", method:"change_dimension", params: 1+parseInt(a/3)});
  $("#dimension_value").html(1+parseInt(a/3))

}

function change_friction_model(e){
  let value = $(e).find(":selected").val();
  simulationNode.port.postMessage({property:"exec", method:"change_bow_model", params: value});
}

function change_friction_model_regularisation(e){
  let value = $(e).find(":selected").val();
  simulationNode.port.postMessage({property:"exec", method:"set_regularisation", params: value});
}

$("#fretboard").click(set_finger_callback);

// $('input[name=regularisation_choice]').change(function() {
//   console.log(this.value)
//   simulationNode.port.postMessage({property:"exec", method:"set_regularisation", params: this.value});

// });

function id_string_pos(e){
  e.stopPropagation();

  let x = (e.clientX-$("#fretboard").offset().left-10)/e.target.offsetWidth;
  let h = 2/3.5+(1-2/3.5)*x;
  let y = (e.clientY-$("#fretboard").offset().top)/e.target.offsetHeight;
  let yr = (y-1/2)/h+1/2;
  let string = inst.strings.length-Math.floor(inst.strings.length*yr);

  return [string, x]
  
}

function set_finger(string, x){
    let h = 2/3.5+(1-2/3.5)*x;
    let y = (-string/inst.strings.length+1/2)*h+1/2;
    if (x > 0){
       $('#finger'+(string)).css('left', x*$("#fretboard").width()).css('top', y*$("#fretboard").height());
    } else {
       $('#finger'+(string)).css('left', -100);
    }
    inst.change_fingering(string-1, (1-0.64*x));
}
  
function set_finger_callback(e){
  e.stopPropagation();
  let id = id_string_pos(e);
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

let string_muted = [false, false, false, false];

function toggle_string_callback(e, s){
  e.stopPropagation();
  // mute_string(s, !inst.strings[s-1].muted)
  string_muted[s-1] = !string_muted[s-1]
  // simulationNode.port.postMessage({property:"exec", method:"mute_string", params:[{string: s, state:string_muted[s-1]}]});
  mute_string(s, !string_muted[s-1])
}

$(".stringName").dblclick(function(){
  let index = string_muted.length-$('.stringName').index(this);
  mute_string(index, false)
  for (let s = 1; s <= string_muted.length; s++) {
    if (s != index){
      mute_string(s, true)
    }
  }
}); 


function all_strings(object){
  console.log("test", object.checked)
}

$("#bow").draggable({axis:"x",
  containment: "parent",
  cursor:"move",
  stop:function(e, ui){
    let index = e.target.id.substr(e.target.id.length - 1)-1;
    var rect = e.target.parentNode.getBoundingClientRect()
    pos = 1-(e.clientX-rect.left)/$("#bowing_area").width();  
    position_change(100*pos, true)
  }
});


current_menu["string_controls"] = 0;
current_menu["righthand_controls"] = 0;

