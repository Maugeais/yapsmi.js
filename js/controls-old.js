"use strict";

let register_controls_origin_callback;
let register_controls_origin_element;

let elmnt;

window.register_controls_origin = function(inst, param){
    $("#controls").hide() 
    register_controls_origin_callback(inst, param, register_controls_origin_element)
}

window.register_controls = function(module, objs){
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


window.choose_control = function(callback, elmnt){
    $("#controls").show();
    register_controls_origin_callback = callback;
    register_controls_origin_element = elmnt;
  }
