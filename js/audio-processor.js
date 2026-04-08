import { duduk } from "../instruments/duduk/js/duduk.js?version=1.2";
import  { violin } from "../instruments/violin/js/violin.js?version=1.2";
import  { guitar } from "../instruments/guitar/js/guitar.js?version=1.2";
import  { crumhorn } from "../instruments/crumhorn/js/crumhorn.js?version=1.2";
import  { saxophone } from "../instruments/saxophone/js/saxophone.js?version=1.2";
import  { trombone } from "../instruments/trombone/js/trombone.js?version=1.2";
import  { shell } from "../instruments/shell/js/shell.js?version=1.0";



class simulationProcessor extends AudioWorkletProcessor {

    constructor(options) {
        super(options);

        switch(options.processorOptions["instrument_name"]){
          case "duduk" : this.inst = duduk;
                         break;
          case "violin" : this.inst = violin;
                          break;
          case "guitar" : this.inst = guitar;
                          break;
          case "crumhorn" : this.inst = crumhorn;
                          break;  
          case "saxophone" : this.inst = saxophone;
                          break;  
          case "trombone" : this.inst = trombone;
                          break;
          case "shell" : this.inst = shell;
                          break;
          default : console.log("Error, undefined instrument !!!")

        }

        this.buffer_size = options.processorOptions.buffer_size;
        // Initialisation des objets de l'instrument : il faut donc une fonction init de l'instrument
        // console.log("option",  options.processorOptions);       
        
        this.dt = 1/sampleRate;

        this.inst.set_geometry(options.processorOptions.data)
        this.inst.init_audio(options.processorOptions.buffer_size, this.dt)
        this.t = 0;
        this.inst.port = this.port;
        this.record_position = -1;

        // Set the initial values of knobs
        let knobs = new Object();
        for (let key in this.inst.params) {
          try{
          knobs[key] = {"string" : this.inst.params[key].to_string(), percentage: this.inst.params[key].to_percentage()};
          } catch(e){
            console.log(e, key)
          }
        }
        this.port.postMessage({property:"set_html_knob", 
                              knobs: knobs
                              });
        
        // Gestionnaire de message entrant
        this.port.onmessage = (event) => {

            // Instrument event manager
            switch(event.data.property){
              case "set_controls": 
                this.inst.set_controls(event.data.params, event.data.from_percentage);
                let inst = this.inst;
                let knobs = new Object();
                Object.keys(event.data.params).forEach(function (key) {                  
                  knobs[key] = {"string" : inst.params[key].to_string(), percentage: -1, value:inst.params[key].value};
                });

                this.port.postMessage({
                  property:"set_html_knob", 
                  knobs: knobs
                });
                // let key = Object.keys(event.data.params)[0]  
                // let knobs = new Object();
                // knobs[key] = {"string" : this.inst.params[key].to_string(), percentage: -1};
                // this.port.postMessage({
                //                         property:"set_html_knob", 
                //                         knobs: knobs
                //                       });
                break;
              case "get_controls_value" : 
                let obj = {property:"get_controls_value", params:{}};
                for (let key in this.inst.params){
                  obj.params[key] = {"value" : this.inst.params[key].value}
                }
                this.port.postMessage(obj)
                break
              case "exec" :
                let result = this.inst[event.data.method](event.data.params);
                this.port.postMessage({
                  property : "return", 
                  method : event.data.method,
                  result : result
                });
                break;
              case "record" : 
                 if (event.data.method == 'start')  {
                    this.record_position = 0
                    this.record_buffer = event.data.buffer;
                 } else if  (event.data.method == 'stop'){
                    this.record_position = this.record_buffer[0].length;
                 }
                break;
              default : 
                console.log("oups")
            }
        };

      }

      // static get parameterDescriptors() {
      //   return [{ name: 'inst', defaultValue: '' }];
      // }

    process(inputs, outputs, parameters) {


      let t0 = currentTime;
      let reference_channel = 1
      let outputData = outputs[0];
      
      this.inst.next_chunk(this.t, this.buffer_size, this.dt)
      this.inst.output(outputData)

      if (this.record_position >= 0){
        if (this.record_position < this.record_buffer[0].length){

          for (let c = 0; c < 2; c++){
            for (let i = 0; i < outputData[c].length; i++){
              this.record_buffer[c][this.record_position+i] = outputData[c][i]
            }
          }
          this.record_position += outputData[0].length;
        } else {
          // Send                    
          this.port.postMessage({property: "recording_done", buffer:this.record_buffer})
          this.record_position = -1;
        }
      }

      let i = 0, last_finite_value = 0, overflow = false;
      while (i < outputData[reference_channel].length){
        
        if (isNaN(outputData[reference_channel][i])) {

          // if (i > 0) {
          //   last_finite_value = outputData[reference_channel][i-1];
          // }
          // console.log(i, last_finite_value)
          // while (i < outputData[reference_channel].length){
          //   outputData[reference_channel][i] = last_finite_value;
          //   last_finite_value /= 1.1;
          //   i++;
          // }
          
          this.inst.reset_chunk();
          this.port.postMessage({property:"computation_state", state :"NaN"})
        } /*else if (outputData[reference_channel][i] > this.inst.connected_sensors[reference_channel].output_impedance*this.inst.limiter.value){
          outputData[reference_channel][i] = this.inst.limiter.value;
          overflow = true;
        } else if (outputData[reference_channel][i] < -this.inst.limiter.value){
          outputData[reference_channel][i] = -this.inst.limiter.value;
          overflow = true;
        }*/
        i++;
      }

      if (overflow){
        this.port.postMessage({property:"computation_state", state :"overflow"})
      } else {
        this.port.postMessage({property:"computation_state", state :"Ok"})
      }
      
      this.t += this.buffer_size * this.dt;
      this.inst.loop_chunk();

    return(true)

  }
}

  registerProcessor("simulation-processor", simulationProcessor);
