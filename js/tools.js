"use strict";

let plugins = [];
let plugins_list = {};

function loadPluginManifest(menu_entry,element){
    let pre_manifest = {"multi_threaded": false, "presentation":""};
    $.getJSON(`../../${menu_entry}/${element}.plugin/manifest.json`, function(manifest){
        plugins_list[element] = {"manifest" : Object.assign({}, pre_manifest, manifest)};
        $(`.plugin_menu:contains("${element}")`).find('.manifest').html(manifest.presentation)
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
                    let newDiv = `<div class="plugin_menu" onclick="load_plugin('${menu_entry}','${element}');">${element}<div class="manifest"></div></div>`;
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
                plugins.push(new plugin(element, menu_entry));
                let a = $("#wrapper").append(`<div class='plugin ${element}' id=\"${element}€${plugins[plugins.length-1].uid}\"></div>`).children().last();

                a.html(data.replaceAll('{{id}}', '€'+plugins[plugins.length-1].uid));
                loadJS(`../${menu_entry}/${element}.plugin/js/${element}.js`, plugins[plugins.length-1].uid);

                if (!plugins_list[element].manifest.multi_threaded){
                    $(`.plugin_menu:contains("${element}")`).css({"backgroundColor": "red", "pointer-events": "none"});
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

           // userValues[index].addEventListener("change", function() {
           //   window.inst.chgParameters(userValues[index].id.split("-")[0], userValues[index].value);
            })(i);
        }

        return(knobs)

        //dial1.getValue(); //get dial 1's value
        //dial2.setValue(20); //set dial 2's value to 20

        //the main event
/*

        let userValues = document.getElementsByClassName('value');
        for(let i = 0; i < userValues.length; i++) {
          (function(index) {
            userValues[index].addEventListener("change", function() {

              call_function(userValues[index].id.split("-")[0], userValues[index].value);
            })
          })(i);
        }*/
}

function new_session(){

}

const delay = ms => new Promise(res => setTimeout(res, ms));

async function load_session_elements(session){
    let i = 0;
    while(i < session.plugins.length){

        // if (plugins.length == 0 || (plugins.length == i && plugins[i-1].loaded == true)) {
        await load_plugin(session.plugins[i].entry, session.plugins[i].name);
        await delay(500) 
        console.log(session.plugins[i].state)
        plugins[i].load(plugins[i].uid, session.plugins[i].state)

        i++;
        // } 
        // else {
        //     await delay(500)
        // }
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
            console.log(session)
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

    session.plugins = [];

    for (let i=0; i < plugins.length; i++){
        let plug = plugins[i];
        plug.state = plugins[i].save();
        delete plug.uid;  
        session.plugins.push(plug);
    }

    console.log(session)
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
