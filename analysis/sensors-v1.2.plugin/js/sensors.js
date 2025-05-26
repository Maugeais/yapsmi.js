"use strict";

let available_sensors;
let connected_sensors;

function get_sensor_params(div){

  let params = {}
  $(div+ " input").attr('id',function(index,id){
    // $(this).prev()[0].htmlFor += index;
    // return id += index;

    params[id.split('_')[1]] = $(this).val()
  });

  return(params)
  
}

window.set_sensors = function(){
  $("#sensor_channel_0").val()
  get_sensor_params("#sensor_channel_0_params")

  query_simulator("set_sensors", {
      channel : 0, 
      sensor: $("#sensor_channel_0").val(),
      params: get_sensor_params("#sensor_channel_0_params")
  }) //.then(function(data){

   query_simulator("set_sensors", {
      channel : 1, 
      sensor: $("#sensor_channel_1").val(),
      params: get_sensor_params("#sensor_channel_1_params")
  }) //.then(function(data){
}

window.set_sensors_options = function(div, sensor_type, id){
  // Empty div

  let result = ''

  Object.keys(available_sensors[sensor_type]).forEach(item=>{
    let value = "";
    if (sensor_type == connected_sensors[id].type){
      value = connected_sensors[id].params[item]
    }
    result += '<label for="sensor_'+item+'">'+item+'('+available_sensors[sensor_type][item]+')</label><input type="text" id="sensor_'+item+'" value="'+value+'" />';
  })

  div.html(result)


  // Add elements
}

function init(uid){   
  query_simulator("get_sensors").then(function(data){

        available_sensors = structuredClone(data["available_sensors"])
        connected_sensors = structuredClone(data["connected_sensors"])

        Object.keys(data["available_sensors"]).forEach(item=>{

          let selected = false
          if (data["connected_sensors"][0].type == item){
            selected = true;
            set_sensors_options($("#sensor_channel_0_params"), data["connected_sensors"][0].type, 0)
          }
          $('#sensor_channel_0').append($('<option>', { 
              value: item,
              text : item,
              selected: selected
          }));

          selected = false
          if ((data['connected_sensors'].length > 1) && (data["connected_sensors"][1].type == item)){
              selected = true
              set_sensors_options($("#sensor_channel_1_params"), data["connected_sensors"][1].type, 1)
            }
          $('#sensor_channel_1').append($('<option>', { 
              value: item,
              text : item,
              selected: selected
          }));
          });
        
  })

}

export { init }
