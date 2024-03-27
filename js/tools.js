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

async function loadJS(filename, uid, state={}){
    let { init } = await import(filename);
    init(uid);
    plugins[uid].load(state)
    plugins[uid].loaded = true;
}


async function load_plugin(menu_entry, element, state = {}){

    $.get(
        `../../${menu_entry}/${element}.plugin/index.html`,
        {},
        function (data) {      
            plugins.push(new plugin(element, menu_entry));
            let a = $("#wrapper").append(`<div class='plugin ${element}' id=\"${element}€${plugins[plugins.length-1].uid}\"></div>`).children().last();

            a.html(data.replaceAll('{{id}}', '€'+plugins[plugins.length-1].uid));
            loadJS(`../${menu_entry}/${element}.plugin/js/${element}.js`, plugins[plugins.length-1].uid, state);

            if (!plugins_list[element].manifest.multi_threaded){
                console.log('Not multi');
                $(`.plugin_menu:contains("${element}")`).css({"backgroundColor": "red", "pointer-events": "none"});
            }    
            
            console.log("pop hide")
            $(".pop").hide();
        }
    );         
    



//     $(function(){
//         a.load(`../../${menu_entry}/${element}.plugin/index.html`, function(){
//             // $.getScript("../../"+menu_entry+"/"+element+".plugin/js/"+element+".js", function(){
//             //     eval(element+"_init()");
//             // });
//             // loadJS("../../"+menu_entry+"/"+element+".plugin/js/"+element+".js")
//             loadJS(`../../${menu_entry}/${element}.plugin/js/${element}.js`)
//
//         });
//     });

}


function message(text){
    $("#tools_message").show().html(text).delay(5000).fadeOut('slow');
}


function knobChanged(id, val) {
    id = id.split('€');
    // console.log(id);
    // Il faut d'écouper l'id en 2 et envoyer la seconde partie comme argument
     eval(`${id[0]}_change(val, ${id[1]})`);
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

function getCTX(Id){
    var obj = document.getElementById(Id);
    var ctx = obj.getContext("2d");
    obj.width = ctx.width = $("#"+Id).width(); //;
    obj.height = ctx.height = $("#"+Id).height(); //obj.height;
    //console.log($("#"+Id).width(), obj.width, obj.height)
    return(ctx);
}

function drawArray(ctx, x, y){
    ctx.clearRect(0, 0, ctx.width, ctx.height); // canvas


    //ctx.setLineDash([1, 0]);
    ctx.beginPath();
    ctx.arc((-ctx.xmin+x[x.length-1])/(ctx.xmax-ctx.xmin)*ctx.width, ctx.height-(-ctx.ymin+y[x.length-1])/(ctx.ymax-ctx.ymin)*ctx.height, 2, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'green';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#003300';
    ctx.stroke();


    ctx.lineWidth = 2;
    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    ctx.moveTo((-ctx.xmin+x[0])/(ctx.xmax-ctx.xmin)*ctx.width, ctx.height-(-ctx.ymin+y[0])/(ctx.ymax-ctx.ymin)*ctx.height);
    for (let i = 1; i < x.length; i++) {
        ctx.lineTo((-ctx.xmin+x[i])/(ctx.xmax-ctx.xmin)*ctx.width, ctx.height-(-ctx.ymin+y[i])/(ctx.ymax-ctx.ymin)*ctx.height);
    }
    ctx.stroke()
}

function new_session(){

}

const delay = ms => new Promise(res => setTimeout(res, ms));

async function load_session_elements(session){
    let i = 0;
    while(i < session.plugins.length){
        if (plugins.length == 0 || (plugins.length == i && plugins[i].loaded == true)) {
            load_plugin(session.plugins[i].entry, session.plugins[i].name, session.plugins[i].state);
            i++;
        } else {
            await delay(500)
        }
    }
}

function load_session(){
    $.getJSON("../../sessions/test2.json", function(session){

        if (session["program"] != "psmi.js"){
            message("File not compatible")
        } else {

            load_session_elements(session)
            message(`Session saved on ${session.date} loaded`)
        }
    }).fail(function(){
        console.log("Unknown file");
    });
}

function save_session(){
    let session = {"program" : "psmi.js", "date" : Date()};

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
