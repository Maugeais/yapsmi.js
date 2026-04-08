window.parameters_db = new Object();

function add_database(control){
    if (parameters_db.hasOwnProperty(control)){
        return(parameters_db[control])
    } 
    return("")
}

window.parameters_to_range = async function(){

    $("#parameters_table tbody").empty(); 

    let content = "";
    await update_intrument_controls_details();
    // let params = await query_simulator("get_controls_details")
    // instrument_controls = await query_simulator("get_controls_details");

    for (let control in instrument_controls){

        try{
            content += '<tr><td>'+control+' ('+instrument_controls[control].unit+')</td>';     
            content += '<td><select>'+add_database(control.split("€")[0])+'</select></td>';
            content += '<td><input type="text" value="'+ instrument_controls[control].value*instrument_controls[control].normalisation+'"></td>';
            content += '<td><input type="text" value="'+instrument_controls[control].range[0]*instrument_controls[control].normalisation+'"></td>';
            content += '<td><input type="text" value="'+instrument_controls[control].range[1]*instrument_controls[control].normalisation+'"></td>';
            content += '<td style="width:5%"><input type="checkbox" value='+instrument_controls[control].log_scale+'"></td>';
            content += '<td><button onclick="set_parameter_value(this)">Set</button></td>';
            content += '</tr>'
        } catch {
            console.log("control", control, "is not defined")
        }

    }

    $("#parameters_table tbody").html(content) 
    $('#parameters_range').show()

    $("#parameters_table input").keydown(function(e){
        console.log('test')
        $(this).css("background-color", "pink");
    })

    $("#parameters_table select").on('change', function(e){
        let tds = $(this).parent().parent().find('td')
        $(tds[2]).find('input').val(this.value).css("background-color", "pink");
        // TODO :  Il faut changer min et max !!!
    })
}


window.set_parameter_value = function(e){
    let tds = $(e).parent().parent().find('td');
    let control = $(tds[0]).text().split(' ')[0];
    let obj = new Object();
    obj[control] = parseFloat($(tds[2]).find('input').val())/instrument_controls[control].normalisation;
    $(tds[2]).find('input').css("background-color", "white");
    // Set the control without moving the knob and as an dimensioned value
    set_controls(obj, false, false)

}
window.parameters_from_range = async function (){

    await update_intrument_controls_details();    
    let trs = $("#parameters_table").find("tr")
    for (let i = 0; i < trs.length; i++){
        let tds = $(trs[i+1]).find('td');
        let control = $(tds[0]).text()
        if (control in instrument_controls){
            instrument_controls[control].value = parseFloat($($(tds[1]).find('input')[0]).val())
            instrument_controls[control].range[0] = parseFloat($($(tds[2]).find('input')[0]).val())
            instrument_controls[control].range[1] = parseFloat($($(tds[3]).find('input')[0]).val())
        }
    }

    let output = await query_simulator("set_controls_details", instrument_controls);    
    await update_intrument_controls_details();
}

async function load_parameters_db(filename){
    let control = filename.slice(0, -4);
    let string_file = './data/parameters_db/'+filename;
    let response = await fetch(string_file)
    let data =  await response.text() 

    let options = "";
    for (let line of data.split("\n")){
        let entry = line.split(";");
        let value = entry[1];;
        try {
            if (entry[1].includes('-')){
                value = entry[1].split('-');
                value = String((parseFloat(value[0])+parseFloat(value[1]))/2);
            }
        } catch {
            console.log("Error on entry")
        }
        options += '<option value="'+value+'">'+entry[0]+'</option>'
    }

    parameters_db[control] = options;

}

async function load_databases(){

    let response = await globalThis.fetch("./data/parameters_db/");
    let str = await response.text();
    let el = document.createElement('html');
    el.innerHTML = str;
    let list = el.getElementsByTagName("a");

    for (let item of list) {
        let ref = item.innerText;
        if (ref.slice(-3) == 'csv'){
            await load_parameters_db(ref);
        }   
    }
}

$( function() {
    $("#parameters_range").draggable({position:'fixed', handle: "#parameters_handle"})
  // $("#midi_automation").draggable()
  });

window.parameters_range_show = async function(){
    wait("Loading parameters dabatase")
    await load_databases();
    await parameters_to_range();
    $("#parameters_range").show()
    stop_waiting()
}
