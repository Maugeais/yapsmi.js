"use strict";

function init(uid){
    $('#formula_tabs select').each(function(){
        for (let key in instrument_controls){
            $(this).append($('<option>', { 
                value: key,
                text : key
            }))
        }
    })
  
    plugins[uid].save = save;
    plugins[uid].load = load;
}
    
function save(uid){

    let commands = {"tabs" : new Array(tabs.length)}

    for (let n = 0; n < tabs.length; n++){
        commands["tabs"][n] = {
            "control" : $(tabs[n]).find("select").val(),
            "formula" : $(tabs[n]).find("textarea").val(),
            "duration" : $(tabs[n]).find(".formula_duration").find("input").val(),
            "time_step" : $(tabs[n]).find(".formula_step").find("input").val()
        }
    }

    return(commands)
}

function load(uid, commands){

    for (let n = 0; n < commands["tabs"].length; n++){
        if (n >= tabs.length) {
            add_formula_tab()
            
        }
        
        $(tabs[n]).find("select").val(commands["tabs"][n]['control']),
        $(tabs[n]).find("textarea").val(commands["tabs"][n]['formula']),
        $(tabs[n]).find(".formula_duration").find("input").val(commands["tabs"][n]['duration']),
        $(tabs[n]).find(".formula_step").find("input").val(commands["tabs"][n]['time_step'])
    }

}


let tabs = $('#formula_tabs').children();
let tabs_button = $("#formula_nav").children();
let last_formula_tab = tabs.length;
let first_formula_tab_shown = 0;
window.set_formula_tab = function(id){
    tabs.each(function () {
        $(this).hide(); // "this" is the current element in the loop
    });
    tabs_button.each(function () {
        $(this).removeClass("set_formula_nav"); // "this" is the current element in the loop
    });
    $(tabs[id]).show()
    $(tabs_button[id+3]).addClass("set_formula_nav")
}

window.draw_formula_tab = function(position){
    tabs_button.each(function (index) {
        if ((index >= 3) && (index <= last_formula_tab+2)){
            $(this).hide();
        }
    });
    switch(position){
        case "first" : first_formula_tab_shown = 0;
            break;
        case "last" : first_formula_tab_shown = last_formula_tab-3;
            break;
        case "next" : first_formula_tab_shown = Math.min(last_formula_tab-3, first_formula_tab_shown+1);
            break;
        case "previous" : first_formula_tab_shown = Math.max(0, first_formula_tab_shown-1);
            break;
    }

    tabs_button.each(function (index) {
        if ((index >= first_formula_tab_shown+3) && (index <= first_formula_tab_shown+5)){
             $(this).show()
        } 
    });

}

window.add_formula_tab = function(){
    let new_tab = '<div class="formula_tab" id="formula_€"  style="display:none"><select><option value = "none">None</option></select><div class="formula_textarea"><textarea id="formula_formula_€" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"    cols="40" rows="5"></textarea></div><div class="formula_duration"><label for = "formula_duration_€">Duration (ms)</label><input type="text" id="formula_duration_€" value="10000"/></div><div class="formula_step"><label for = "formula_step_€">Time step(ms)</label><input type="text" id="formula_step_€"  value="100"/></div><button onclick="exec_formula(€)">Exec</button></div>';
    new_tab = new_tab.replace(/€/g, ++last_formula_tab);
    $("#formula_tabs").append(new_tab)
    tabs = $('#formula_tabs').children();
    set_formula_tab(last_formula_tab-1)
    draw_formula_tab("last")
    let select =$(tabs[last_formula_tab-1]).find("select");
    for (let key in instrument_controls){
        $(select).append($('<option>', { 
            value: key,
            text : key
        }))
    }
}

let formula_intervals = new Array(12);

window.exec_formula = function(id){

    let t = 0;
    let user_func = new  Function("t, T, dt", $("#formula_formula_"+id).val());
    try{
        user_func(0)
    } catch(error){
        message(error)
        return
    }

    let duration = 0, step = 10;
    try{
        duration = parseFloat($("#formula_duration_"+id).val());
    } catch(error){
        message(error)
        return
    }

    try{
        step = parseFloat($("#formula_step_"+id).val())
    } catch(error){
        message(error)
        return
    }

    let control = $("#formula_"+id+" select").val() 
    if (!(control in instrument_controls)){
        message('"'+control+'" is not defined as a control parameter')
        return
    }

    clearInterval(formula_intervals[id]);

//     $("#recording_proof").removeClass('pulsating-circle');
    $(tabs_button[id+2]).find(".formula_state").addClass('blink');

    formula_intervals[id] = setInterval(() => {
        if(t > duration) {
          clearInterval(formula_intervals[id]);
          $(tabs_button[id+2]).find(".formula_state").removeClass('blink');

          return;
        } else {
            // Convert to percentage
            let perc = 100*(user_func(t, duration, step)-instrument_controls[control].range[0])/(instrument_controls[control].range[1]-instrument_controls[control].range[0])
            perc = Math.max(Math.min(perc, 100), 0);
            instrument_controls[control].setValue(perc)
        }
        t += step;
      }, step*1000);

}

window.stop_formula = function(id){
    clearInterval(formula_intervals[id]);
    $(tabs_button[id+2]).find(".formula_state").removeClass('blink');

}
export { init }
