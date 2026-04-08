let isPlaying = false;

function young_y_change(a, s){

  // console.log("young y", s)
  // return
  try{
    let Ex = global_controls['instrument']["young_x"].currentValue/100*(instrument_controls["young_x"].range[1]-instrument_controls["young_x"].range[0])+instrument_controls["young_x"].range[0];
    let nux = global_controls['instrument']["poisson_x"].currentValue/100*(instrument_controls["poisson_x"].range[1]-instrument_controls["poisson_x"].range[0])+instrument_controls["poisson_x"].range[0];
    let Ey_new = a/100*(instrument_controls["young_y"].range[1]-instrument_controls["young_y"].range[0])+instrument_controls["young_y"].range[0];
    let nuy_new = nux*Ey_new/Ex;
    let b = 100*(nuy_new-instrument_controls["poisson_y"].range[0])/(instrument_controls["poisson_y"].range[1]-instrument_controls["poisson_y"].range[0])
    if ((b > 100) || (b < 0)){
      message("Warning, poisson_y extreme value has been reached")
    } else {
        global_controls['instrument']["poisson_y"].setValue(b, false)
    }
    let G_new = Ex*Ey_new/(Ex+Ey_new+2*Ex*nuy_new);
    let c = 100*(G_new-instrument_controls["shear"].range[0])/(instrument_controls["shear"].range[1]-instrument_controls["shear"].range[0])
    if ((c > 100) || (c < 0)){
      message("Warning, poisson_y extreme value has been reached")
    } else {
        global_controls['instrument']["shear"].setValue(b, false)
    }
    set_controls({"young_y" : a}, false)
    set_controls({"poisson_y" : b}, false)
    set_controls({"shear" : c}, false)
  } catch {}
}

function poisson_y_change(a, s){
  try{
    let Ex = global_contrls['instrument']["young_x"].currentValue/100*(instrument_controls["young_x"].range[1]-instrument_controls["young_x"].range[0])+instrument_controls["young_x"].range[0];

    // Il faut remplacer le calcul a partir des pourcentages par la ligne ci-dessous !!!!
    console.log(Ex, global_controls['instrument']["young_x"].value)
    let nux = global_controls['instrument']["poisson_x"].currentValue/100*(instrument_controls["poisson_x"].range[1]-instrument_controls["poisson_x"].range[0])+instrument_controls["poisson_x"].range[0];
    let nuy_new = a/100*(instrument_controls["poisson_y"].range[1]-instrument_controls["poisson_y"].range[0])+instrument_controls["poisson_y"].range[0];
    let Ey_new = nuy_new*Ex/nux;
    let G_new = Ex*Ey_new/(Ex+Ey_new+2*Ex*nuy_new);
    let b = 100*(Ey_new-instrument_controls["young_y"].range[0])/(instrument_controls["young_y"].range[1]-instrument_controls["young_y"].range[0])
    if ((b > 100) || (b < 0)){
      message("Warning, young_y extreme value has been reached")
    } else {
        global_controls['instrument']["young_y"].setValue(b, false)
    }
    set_controls({"young_y" : b}, false)
    set_controls({"poisson_y" : a}, false)
  } catch {}
}


function regularity_change(a, s){
  set_controls({["regularity"] : a}, false)
}

function width_change(a, s){
  set_controls({["width"] : a}, false)
}

function position_change(a, s){
  set_controls({["position"] : a}, false)
}

function duration_change(a, s){
  set_controls({["duration"] : a}, false)
}

function increase_duration_change(a, s){
  set_controls({["increase_duration"] : a}, false)
}

function strength_change(a, s){
  set_controls({["strength"] : a}, false)
}

// function attack_losses_change(a, s){
//   set_controls({["attack_lossess€"+s] : a}, false)

//   // inst.plectrum["losses"].set_from_precentage(a);
//   // $("#attack_losses_value").html(inst.plectrum["losses"].to_shell() )
//   // inst.set_controls({["attack_losses€"+s] : a}, false, is_shiftkey_pressed)
//   // inst.shells[s-1]._scheme_constants()
// }

let max_dim = 200;
function dimension_change(a, s){
  let new_dim = Math.min(max_dim, 1+parseInt(max_dim/100*a));
  simulationNode.port.postMessage({property:"exec", method:"change_dimension", params: new_dim});
  $("#dimension_value").html(new_dim)
}

let loss_models = {
    'aluminum' : {'C' : 900, 'alpha' : 22e-6, 'kappa' : 250, 'Rf' : 0.032, 'beta' : 0.9, 'tau_epsilon' :0.00166738920, 'tau_sigma' : 0.001660761},
    'wood' : {'C' : 2000, 'alpha' : 4e-6, 'kappa' : 0.2, 'Rf' : 2.4, 'beta' : 0.45, 'tau_epsilon' : 0.0550227211397, 'tau_sigma' : 0.01},
    'steel' : {'C' : 500, 'alpha' : 14e-6, 'kappa' : 30, 'Rf' : 0.032, 'beta' : 0.80, 'tau_epsilon' : 0.00680149, 'tau_sigma' : 0.00547230},
    'glass' : {'C' : 700, 'alpha' : 8e-6, 'kappa' : 1.1, 'Rf' : 0.88, 'beta' : 0.5, 'tau_epsilon' :0.1326291, 'tau_sigma' : 0.13054319},
}

$('#loss_model-select').on('change', function() {
  set_controls( loss_models[this.value], false, false )
});
// $("#fretboard").click(set_finger_callback);
// let fret_positions = [2.54, 9.297, 16.05, 22.377, 28.441, 34.262, 39.741, 44.981, 49.90, 54.664, 59.003, 63.317, 67.243, 71.058, 74.668, 78.081, 81.375, 84.342, 87.183, 90.014, 92.555, 95.033, 97.367];



// function id_shell_fret(e){
//   e.stopPropagation();
    
//   let shell = nb_shells-Math.floor(nb_shells*(e.clientY-$("#fretboard").offset().top)/e.target.offsetHeight);
//   let x = (e.clientX-$("#fretboard").offset().left)/e.target.offsetWidth;
//   let fret = fret_positions.findIndex(element => element > 100*x);

//   return [shell, fret]
  
// }

// function set_finger(shell, fret){
//     if (fret > 0){
//        $('#finger'+(shell)).css('left', (0.666*fret_positions[fret-1]+0.333*fret_positions[fret])*$("#fretboard").width()*0.01);
//     } else {
//        $('#finger'+(shell)).css('left', -100);
//     }
//     simulationNode.port.postMessage({property:"exec", method:"change_fingering", params:{shell: shell-1, position: Math.pow(2, -fret/12)}});

// }
  
// function set_finger_callback(e){
//   e.stopPropagation();
//   let id = id_shell_fret(e);
//   if (e.detail === 1) {
//     set_finger(id[0], id[1]);
//   } else if (e.detail === 2){
//     set_finger(id[0], 0);
//   }
// }

// function mute_shell(s, state){
//   shell_muted[s-1].muted = state;
//   if (state == false){
//       $($(".shellName")[shell_muted.length-s]).css('color', 'lime');
//   } else {
//       $($(".shellName")[shell_muted.length-s]).css('color', 'red');
//   }
//   simulationNode.port.postMessage({property:"exec", method:"mute_shell", params:[{shell: s, state:state}]});
// }

// let shell_muted = [false, false, false, false, false, false];

function toggle_isotropic(e){
  let value = $(e).prop('checked');
  simulationNode.port.postMessage({property:"exec", method:"set_isotropic", params:value});
}
// function toggle_shell_callback(e, s){
//   e.stopPropagation();
//   // mute_shell(s, !inst.shells[s-1].muted)
//   shell_muted[s-1] = !shell_muted[s-1]
//   // simulationNode.port.postMessage({property:"exec", method:"mute_shell", params:[{shell: s, state:shell_muted[s-1]}]});
//   mute_shell(s, !shell_muted[s-1])
// }

// $(".shellName").dblclick(function(){
//   let index = nb_shells-$('.shellName').index(this);
//   mute_shell(index, false)
//   for (let s = 1; s <= nb_shells; s++) {
//     if (s != index){
//       mute_shell(s, true)
//     }
//   }
// }); 

// window.change_plectrum_position = function(event){
//   if (is_shiftkey_pressed){
//     let x = (event.clientX-$("#struming").offset().left)/event.target.offsetWidth;
//     instrument_controls["position"].setValue((1-x)*100) 
//   }
// }


// $('#chords_list').click(function (e) {
//   set_chord(chords[e.target.innerText][0].positions);
// });


// $('input[type=radio][name=plectrum_shape_signal]').change(function() {
//     simulationNode.port.postMessage({property:"exec", method:"change_attack_shape", params:{shape: this.value}});
// });

// $('input[type=checkbox][name=nl_microphone]').change(function() {
//   let value = $(this).is(":checked");
//   for (let m = 0; m < inst.mics.length; m++){
//     inst.mics[m].non_lin = value;
//   }
// });

$(window).keypress(function (e) {
  if (e.key === 't') {
    // ' ' is standard, 'Spacebar' was used by IE9 and Firefox < 37
    e.preventDefault()
    // console.log('Space pressed')
    simulationNode.port.postMessage({property:"exec", method:"tap", params:{position: 0, speed: 0}});
  }
})

$("#ashby_materials").click(function(e){
  var parentOffset = $(this).offset(); 
  var relX = (e.pageX - parentOffset.left)/$("#ashby_materials").width();
  var relY = 1-(e.pageY - parentOffset.top)/$("#ashby_materials").height();

  console.log(relX, relY, 10**(2.48*relX+2), 10**(-2+5*relY));

  set_controls({"density" : 10**(2.48*relX+2)}, true, false)
  set_controls({"young_x" : 10**(-2+5*relY)*1e9}, true, false)

  e.stopPropagation();
});




current_menu["shell_controls"] = 0;
current_menu["righthand_controls"] = 0;


// let shell_on = [-1, -1, -1, -1, -1, -1];
// let shells_fundamental = [40, 45, 50, 55, 59, 64];

// window.play_midi_note = function(note, velocity){

//     let shell_fret = [0, 0, 0, 0, 0, 0];
//     for (let s=0; s < 6; s++){

//        shell_fret[s] = note-shells_fundamental[s];
//        if ((shell_fret[s]  < 0) || (shell_fret[s] > 21) || (shell_on[s] >= 0)){
//         shell_fret[s] = 100;
//        }
//     }
//     // Play the note closest to the neck
//     let s = shell_fret.indexOf(Math.min.apply(Math, shell_fret))
//     if (shell_fret[s] == 100){
//         message("This note requires a shell that is already being played")
//         return
//     }
//     set_finger(s+1, shell_fret[s]);
//     // guitar.shells[s].change_fingering(Math.pow(2, -shell_fret[s]/12));
//     simulationNode.port.postMessage({property:"exec", method:"change_fingering", params:{shell: s, position: Math.pow(2, -shell_fret[s]/12)}});
//     shell_on[s] = note;
//     // guitar.shells[s].pluck(0.01, params["velocity"]/100);
//     simulationNode.port.postMessage({property:"exec", method:"pluck", params:{speed: velocity/100, shell_number: s}});
// }

// window.stop_midi_note = function(note, velocity){
//     let s = shell_on.indexOf(note);
//     shell_on[s] = -1;
//     // set_finger(s+1, -1);    
// }

// // Set the buttons, in case reload
// $('input:radio[name=plectrum_shape_signal]').val(['triangle']); 

function set_striking_position(event){
  let pos = event.target.getBoundingClientRect();
  let mouseX = (event.clientX - pos.left)/pos.width;
  let mouseY = (event.clientY - pos.top)/pos.height;
  set_controls({"mallet_position_x" :  mouseX*100}, true)
  set_controls({"mallet_position_y" :  mouseY*100}, true)
}

let geometries = {};
let current_geometry;

function describe_geometry(geometry){
  $("#geometries_description").html(geometries[geometry]["description"])
}
// Load the geometries
$.ajax({
  url : "./data/geometries/",
  success: function (data) {
      //go through each item in folder
      let el = document.createElement('html');
      el.innerHTML = data;
      let list = el.getElementsByTagName("a");
      current_geometry = list[0].innerText.slice(0, -5);
      for (let item of list) {
              let ref = item.innerText;
              if (ref.slice(-4) == 'json'){
                $.getJSON("./data/geometries/"+ref, function(json) {
                   geometries[ref.slice(0, -5)] = json["manifest"]
                   if (current_geometry === ref.slice(0, -5)){
                      max_dim = parseInt(geometries[current_geometry]["max_dimension"]**0.5)
                   }
                   $("#geometries_list tr:last").after('<tr><td onclick="describe_geometry(\''+ref.slice(0, -5)+'\')">'+ref.slice(0, -5)+'</td></tr>');
                });
              }   
      }
  }
});  

