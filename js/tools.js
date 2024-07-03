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
    register_controls("Audio", {"on/off" : [Boolean, audio_start]});
}

// async function loadJS(filename, uid){
//     let { init } = await import(filename);
//     init(uid);
//     // if (Object.keys(state).length > 0){
//     //     plugins[uid].load(state)
//     // }
//     plugins[uid].loaded = true;
// }

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


function init_knobs(name, size, type){

        let knobList = document.getElementById(name).getElementsByClassName('knob');
        let knobs = [];
        for(let i = 0; i < knobList.length; i++) {
          (function(index) {
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

              knobs.push(dial1);

            })(i);
        }

        return(knobs)
}

function new_session(){

}

const delay = ms => new Promise(res => setTimeout(res, ms));

async function load_session_elements(session){
    let i = 0;

    inst.load_session(session['main'])
    let plugin_keys = Object.keys(plugins_list)
    while(i < session.plugins.length){

        // Look for a suitable version
        let j = plugin_keys.findIndex(el => el.includes(session.plugins[i].name));

        await load_plugin(session.plugins[i].entry, plugin_keys[j], );
        await delay(500)         

        plugins[i].load(plugins[i].uid, session.plugins[i].state)

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

function save_session(){
    let session = {"program" : "yapsmi.js", "date" : Date()};

    session.main = inst.save_session()

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

let controls = {};

let register_controls_origin_callback;
let register_controls_origin_element;

let elmnt;
function register_controls_origin(inst, param){
    $("#controls").hide() 
    register_controls_origin_callback(inst, param, register_controls_origin_element)
}

function register_controls(module, objs){
    if (!(module in controls)) controls[module] = {};

    Object.keys(objs).forEach(function (k) { controls[module][k] = objs[k]; });

    // Rebuild the control element
    let html = "";
    for (const m in controls){
        html += "<div class='module' onclick=\"$('.controls').hide(); $(this).children(':first').show()\">"+m+"<table class='controls'>"
        let control = controls[m];
        for (const c in control){
            html += `<tr><td onclick="register_controls_origin('${m}', '${c}')">${c}</td/></tr>`;
        }
        html += "</table></div>";
    }

    $("#modules").html(html);
}

function choose_control(callback, elmnt){
    $("#controls").show();
    register_controls_origin_callback = callback;
    register_controls_origin_element = elmnt;
  }

// import('./controls.js')

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
    load_dropbox.css({"border":"1px solid red"});
}

function load_dragleave(e) {
    e.stopPropagation();
    e.preventDefault();
    load_dropbox.css({"border":"none"});
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


var currentMenu = {};
function change_controls(direction, menu=""){

    let controls_windows = $("#"+menu+" .instrument_controls_window");

    $(controls_windows[currentMenu[menu]]).fadeOut(300)

    currentMenu[menu] = (currentMenu[menu] + direction) % controls_windows.length;

    if (currentMenu[menu] < 0) {
      currentMenu[menu] += controls_windows.length;
    }

    $(controls_windows[currentMenu[menu]]).delay(300).fadeIn(300)

    // console.log(menu, direction, currentMenu)
}


function parameters_to_range(){

    $("#parameters_table tbody").empty(); 

    let content = "";

    for (let i = 0; i < inst.knobs.length; i++){
        let control = inst.knobs[i].id;

        content += '<tr><td>'+control+'</td>';
        content += '<td><input value="'+inst.params[control].value+'"></td>';
        content += '<td><input value="'+inst.params[control].range[0]+'"></td>';
        content += '<td><input value="'+inst.params[control].range[1]+'"></td>';

        content += '</tr>'

    }

    $("#parameters_table tbody").html(content) 
    $('#parameters_range').show()
}

function parameters_from_range(){

    let trs = $("#parameters_table").find("tr")

    for (let i = 0; i < inst.knobs.length; i++){

        let control = inst.knobs[i].id;

        let tds = $(trs[i+1]).find('td');

        inst.params[control].goal_value = parseFloat($($(tds[1]).find('input')[0]).val())
        inst.params[control].range[0] = parseFloat($($(tds[2]).find('input')[0]).val())
        inst.params[control].range[1] = parseFloat($($(tds[3]).find('input')[0]).val())

        inst.knobs[i].setValue(inst.params[control].to_percentage()) 

      }
}

function smoothening(){
    $('#smoothening_controls').show()

}

function change_smoothening_accuracy(value){
    inst.smoothening_accuracy.set_from_percentage(value);
    return(inst.smoothening_accuracy.to_string())
}

function change_smoothening_delay(value){
    inst.smoothening_delay.set_from_percentage(value);
    return(inst.smoothening_delay.to_string())
}

function toggle_smoothening(elmnt){
    for (var key in inst.params) {
        inst.params[key].smoothened = elmnt.checked;
    }
}


let is_shiftkey_pressed = false;

document.addEventListener("keydown", function(evt){if (evt.key == "Shift"){is_shiftkey_pressed = true}}, true); 
document.addEventListener("keyup", function(evt){if (evt.key == "Shift"){is_shiftkey_pressed = false}}, true); 
