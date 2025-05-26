async function parameters_to_range(){

    $("#parameters_table tbody").empty(); 

    let content = "";
    await update_intrument_controls_details();
    // let params = await query_simulator("get_controls_details")
    // instrument_controls = await query_simulator("get_controls_details");

    
    for (let control in instrument_controls){

        console.log(control)

        content += '<tr><td>'+control+'</td>';
        content += '<td><input value="'+instrument_controls[control].value+'"></td>';
        content += '<td><input value="'+instrument_controls[control].range[0]+'"></td>';
        content += '<td><input value="'+instrument_controls[control].range[1]+'"></td>';
        content += '<td style="width:5%"><input type="checkbox" value='+instrument_controls[control].log_scale+'"></td>';
        content += '</tr>'

    }

    $("#parameters_table tbody").html(content) 
    $('#parameters_range').show()
}

async function parameters_from_range(){

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

    await query_simulator("set_controls_details", instrument_controls);
    await update_intrument_controls_details();
}

console.log("Parameters loaded")