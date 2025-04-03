"use strict";

let plugins = [];
let plugins_list = {};

function loadPluginManifest(menu_entry,element){
    let pre_manifest = {"multi_threaded": false, "presentation":""};
    $.getJSON(`../../${menu_entry}/${element}.plugin/manifest.json`, function(manifest){
        plugins_list[element] = {"manifest" : Object.assign({}, pre_manifest, manifest)};
        $(`.plugin_menu:contains("${element.split('-')[0]}")`).find('.manifest').html(manifest.presentation)
    }).fail(function(){
        plugins_list[element] = {"manifest" : pre_manifest};
    });
}

function init_plugins(menu_entry){
    let pluginsName = new Array();
    $.ajax({
        url: `../../${menu_entry}/`,
        success: function(data){
            $(data).find("a:contains(plugin)").each(function(){
                pluginsName.push($(this).attr("href"));

                let element = $(this).attr("href").slice(0, -8);

                loadPluginManifest(menu_entry,element);

                if (element[0] != '/'){
                    let newDiv = `<div class="plugin_menu" onclick="load_plugin('${menu_entry}','${element}');">${element.split('-')[0]}<div class="manifest"></div></div>`;
                    $(`#tools_${menu_entry}_list`).append(newDiv);
                }
            })
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) { 
            alert("Status: " + textStatus); alert("Error: " + errorThrown); 
        }    
    });
}

function init_menu(){
    init_plugins("controls");
    init_plugins("effects");
    init_plugins("analysis");
    // register_controls("Audio", {"on/off" : [Boolean, audio_start]});
    rebuild_controls()
}

async function loadJS(filename, uid){
    return new Promise((resolve, reject) => {
       import(filename).then((obj) => {
            obj["init"](uid);
            plugins[uid].loaded = true;
            resolve("ok")
        }).catch((err) => {
            reject("Error")
        });
    })
    // init(uid);
    // if (Object.keys(state).length > 0){
    //     plugins[uid].load(state)
    // }
}


async function load_plugin(menu_entry, element){

    return new Promise((resolve, reject) => {

        $.get(
            `../../${menu_entry}/${element}.plugin/index.html`,
            {},
            function (data) {      
                let reduced_element = element.split('-')[0];
                plugins.push(new plugin(reduced_element, menu_entry));
                let a = $("#wrapper").append(`<div class='plugin ${reduced_element}' id=\"${reduced_element}€${plugins[plugins.length-1].uid}\"></div>`).children().last();

                a.html(data.replaceAll('{{id}}', '€'+plugins[plugins.length-1].uid));
                loadJS(`../${menu_entry}/${element}.plugin/js/${reduced_element}.js`, plugins[plugins.length-1].uid);

                if (!plugins_list[element].manifest.multi_threaded){
                    $(`.plugin_menu:contains("${reduced_element}")`).css({"backgroundColor": "red", "pointer-events": "none"});
                }    
                
                $(".pop").hide();
                resolve("ok");
            }
            ).fail(function(){
                reject("Error")
        });         
    })

}


function message(text){
    $("#tools_message").show().html(text).delay(5000).fadeOut('slow');
}


function knobChanged(id, val) {
    id = id.split('€');
    // console.log(id);
    // Il faut d'écouper l'id en 2 et envoyer la seconde partie comme argument
    eval(`${id[0]}_change(${val}, ${id[1]})`);
}

let timeout = 0;
window.inst_controls = {}
function load_inst_knobs(inst_id, step = 0){

    inst_controls = { ...inst_controls, ...init_knobs(inst_id, "large", "Vintage")};
    // if(typeof inst !== "undefined"){      

    //     if (step == 0) {
    //         inst.knobs = init_knobs(inst_id, "large", "Vintage");
        
    // Define thecontrols 
    // for (let k = 0; k < inst.knobs.length; k++){
    //     inst_controls[inst.knobs[k].id] = [Number,inst.knobs[k]];
    // }
    register_controls("instrument", inst_controls);
            
    // console.log(inst_controls)
    // for (var key in inst_controls){
    //     console.log(key)
    // }
    // //         inst_controls = inst.get_controls();
    //         step = 1;
    //     }

    //     if (timeout > 100) return;
    //     for (let i = step-1; i < inst.knobs.length; i++){

    //         if (!(inst.knobs[i].id in inst.params)){
    //             setTimeout(load_inst_knobs, 250, inst_id, i+1);
    //             timeout += 1;
    //             continue;
    //         }  else {
    //             let p = inst.params[inst.knobs[i].id]
    //             inst.knobs[i].setValue(p.to_percentage()) 
    //         }
    //     }
    // }
    // else{
    //     setTimeout(load_inst_knobs, 250, inst_id);
    // }
  }

function init_knobs(name, size, type){

    console.log("==========", name)

    let knobList = document.getElementById(name).getElementsByClassName('knob');
    let knobs = {};
    for(let i = 0; i < knobList.length; i++) {
        (function(index) {
            // Build the knob
            let dial1 = new Knob({
            size: size,
            type: type,
            lowVal: 0,
            highVal: 100,
            value: 50,
            sensitivity: 1,
            label: false,
            lblTxtColor: "black",
            id: knobList[index].id,
            path:'../../../../css/knobs/'
            });

            knobs[knobList[index].id] = dial1;

            // Build the callback function if it does not already exists
            let function_id = knobList[index].id.split("€")[0];
            if (typeof window[function_id+"_change"] !== "function") {   
                if (knobList[index].id.includes("€")){
                    window[function_id+"_change"] = new Function('a, s', 'set_controls({["'+function_id+"€"+'"+s]: a}, false);'); 
                } else {
                    window[function_id+"_change"] = new Function('a', 'set_controls({"'+function_id+'": a}, false);'); 
                }
            }
        })(i);
    }

    return(knobs)
}

/*===================================*/
/*  Handling the sessions           */
/*===================================*/
function new_session(){

}

const delay = ms => new Promise(res => setTimeout(res, ms));

async function load_session_elements(session){

    simulationNode.port.postMessage({property:"exec", method:"load_session", params:session['main']});

    // And set the knobs
    for (let key in inst_controls) {

        try{
            if (inst_controls[key] instanceof Knob) inst_controls[key].setValue(session['main'].params[key].value)
        } catch(error){
            console.log(error)
        }
        
    }

    let first_plugin_index = plugins.length;

    let plugin_keys = Object.keys(plugins_list)

    let i = 0;

    while(i < session.plugins.length){

        // Look for a suitable version
        let j = plugin_keys.findIndex(el => el.includes(session.plugins[i].name));

        await load_plugin(session.plugins[i].entry, plugin_keys[j], );
        await delay(500)         

        plugins[i+first_plugin_index].load(plugins[i+first_plugin_index].uid, session.plugins[i].state)

        i++;
    
    }
}


function load_session(file){
    const reader = new FileReader()

    let display_file = ( e ) => { // set the contents of the <textarea>
        try {
            let session = JSON.parse(e.target.result);
            if (session["program"] != "yapsmi.js"){
                message("Invalid configuration file")
                } else {
                    $("#load").hide();
                    load_session_elements(session)
                    message(`Session saved on ${session.date} loaded`)
                }
        } catch(e) {
            return message("Invalid configuration file") 
        }
    };

    let on_reader_load = ( fl ) => {
        // console.info( '. file reader load', fl );
        return display_file; // a function
        };

    reader.onload = on_reader_load(file);
    reader.readAsText(file) 
}

function load_example_session(file){
    $.getJSON("../../sessions/"+file, function(session){

        if (session["program"] != "yapsmi.js"){
            message("File not compatible")
        } else {
            $("#load").hide()
            load_session_elements(session)
            message(`Session saved on ${session.date} loaded`)
        }
    }).fail(function(){
        console.log("Unknown file");
    });
}

async function save_session(){
    let session = {"program" : "yapsmi.js", "date" : Date()};
    
    session.main = await query_simulator("save_session", null);
    console.log(session.main)

    session.plugins = [];

    for (let i=0; i < plugins.length; i++){
        let plug = plugins[i];
        plug.state = plugins[i].save();
        delete plug.uid;  
        session.plugins.push(plug);
    }

    const link = document.createElement("a");
    const file = new Blob([JSON.stringify(session)], { type: 'text/plain' });
    link.href = URL.createObjectURL(file);
    link.download = "sample.json";
    link.click();
    URL.revokeObjectURL(link.href);
}


/*===================================*/
/* Handling  the controls           */
/*===================================*/
window.global_controls = {};

// let set_control_destination_callback;
let set_control_destination_element;

function set_control_destination(plugin, control){
    $("#controls").hide() 
    $(set_control_destination_element).text(control +', ' + plugin)
    // set_control_destination_callback(plugin, control)
}

/*
    plugin_controls is of shape {"control_name" : callback_function}
    where callback_function take (identifier, percentage for parameter)
*/
function register_controls(plugin_name, plugin_controls){

    if (!(plugin_name in global_controls)) global_controls[plugin_name] = {};

    for (const control_key in plugin_controls){
        global_controls[plugin_name][control_key] = plugin_controls[control_key];
    }

   rebuild_controls()
}

function rebuild_controls(){
     // Rebuild the control element html
    let html = "";
    for (const plugin_key in global_controls){
        html += "<div class='plugin_controls' onclick=\"$('.controls').hide(); $(this).children(':first').show()\">"+plugin_key+"<table class='controls'>"
        for (const control in global_controls[plugin_key]){
            html += `<tr><td onclick="set_control_destination('${plugin_key}', '${control}')">${control}</td/></tr>`;
        }
        html += "</table></div>";
    }

    $("#plugins_controls").html(html);
}

function choose_control(elmnt){
    console.log("choose_control")
    $("#controls").show();
    // set_control_destination_callback = callback;
    set_control_destination_element = elmnt;
  }

$(".plugin").click(function(e){
    e.stopPropagation();
});


$("#tools").click(function(e){
    e.stopPropagation();
});

$("#model").click(function(e){
    e.stopPropagation();
});

$("#help").click(function(e){
    e.stopPropagation();
});

$("body").click(function(e){
    $(".pop").hide()
    $(".popup").hide()
});

/// Handling saving
function load_dragenter(e) {
    e.stopPropagation();
    e.preventDefault();
    $("#load_dropbox").css({"border":"1px solid red"});
}

function load_dragleave(e) {
    e.stopPropagation();
    e.preventDefault();
    $("#load_dropbox").css({"border":"none"});
}
  
function load_dragover(e) {
    e.stopPropagation();
    e.preventDefault();
}


function load_drop(e) {
    e.stopPropagation();
    e.preventDefault();

    const dt = e.originalEvent.dataTransfer;
    const files = dt.files;

    load_session(dt.files[0])

// handleFiles(files);
}

/*
    Handling tabs of parameters
*/

var current_menu = {};
function change_controls(direction, menu=""){

    let controls_windows = $("#"+menu+" .instrument_controls_window");

    $(controls_windows[current_menu[menu]]).fadeOut(300)

    current_menu[menu] = (current_menu[menu] + direction) % controls_windows.length;

    // console.log(direction, menu, current_menu)

    if (current_menu[menu] < 0) {
      current_menu[menu] += controls_windows.length;
    }

    $(controls_windows[current_menu[menu]]).delay(300).fadeIn(300)
}

/*
    Handling of parameters
*/

async function parameters_to_range(){

    $("#parameters_table tbody").empty(); 

    let content = "";
    // let params = await query_simulator("get_controls_details")
    instrument_controls_details = await query_simulator("get_controls_details");

    
    for (let control in instrument_controls_details){

        content += '<tr><td>'+control+'</td>';
        content += '<td><input value="'+instrument_controls_details[control].value+'"></td>';
        content += '<td><input value="'+instrument_controls_details[control].range[0]+'"></td>';
        content += '<td><input value="'+instrument_controls_details[control].range[1]+'"></td>';
        content += '<td style="width:5%"><input type="checkbox" value='+instrument_controls_details[control].log_scale+'"></td>';
        content += '</tr>'

    }

    $("#parameters_table tbody").html(content) 
    $('#parameters_range').show()
}


async function parameters_from_range(){

    instrument_controls_details = await query_simulator("get_controls_details")
    

    let trs = $("#parameters_table").find("tr")

    for (let i = 0; i < trs.length; i++){

        let tds = $(trs[i+1]).find('td');

        let control = $(tds[0]).text()

        if (control in instrument_controls_details){
            instrument_controls_details[control].value = parseFloat($($(tds[1]).find('input')[0]).val())
            instrument_controls_details[control].range[0] = parseFloat($($(tds[2]).find('input')[0]).val())
            instrument_controls_details[control].range[1] = parseFloat($($(tds[3]).find('input')[0]).val())
        }
    }

    instrument_controls_details = await query_simulator("set_controls_details", instrument_controls_details);

    for (let control in instrument_controls_details){

       if ((control in inst_controls) && (inst_controls[control] instanceof Knob)) {
            inst_controls[control].setValue(instrument_controls_details[control])
        
       }

    }
}



let is_shiftkey_pressed = false;

document.addEventListener("keydown", function(evt){
                            if (evt.key == "Shift"){is_shiftkey_pressed = true}
                            if (evt.key == " "){toggle_audio()}
                        }, true); 
document.addEventListener("keyup", function(evt){if (evt.key == "Shift"){is_shiftkey_pressed = false}}, true); 


