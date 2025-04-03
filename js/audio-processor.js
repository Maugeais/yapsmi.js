import { duduk } from "../instruments/duduk/js/duduk.js?version=1.1";
import  { violin } from "../instruments/violin/js/violin.js?version=1.1";
import  { guitar } from "../instruments/guitar/js/guitar.js?version=1.04";


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
          default : console.log("Error !!!")

        }

        this.buffer_size = options.processorOptions.buffer_size;
        // Initialisation des objets de l'instrument : il faut donc une fonction init de l'instrument
        // console.log("option",  options.processorOptions);       
        
        this.dt = 1/sampleRate;

        this.inst.set_geometry(options.processorOptions.data)
        this.inst.init_audio(options.processorOptions.buffer_size, this.dt)
        this.t = 0;
        this.inst.port = this.port;

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
                this.inst.set_controls(event.data.params, event.data.knob)
                let key = Object.keys(event.data.params)[0]  
                let knobs = new Object();
                knobs[key] = {"string" : this.inst.params[key].to_string(), percentage: -1};
                this.port.postMessage({
                                        property:"set_html_knob", 
                                        knobs: knobs
                                      });
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
      let outputData = outputs[0][0];
      
      this.inst.next_chunk(this.t, this.buffer_size, this.dt)
      this.inst.output(outputData)

      let i = 0, last_finite_value = 0, overflow = false;
      while (i < outputData.length){
        
        if (isNaN(outputData[i])) {

          if (i > 0) {
            last_finite_value = outputData[i-1];
          }
          console.log(i, last_finite_value)
          while (i < outputData.length){
            outputData[i] = last_finite_value;
            last_finite_value /= 1.1;
            i++;
          }
          
          this.inst.reset_chunk();
          this.port.postMessage({property:"computation_state", state :"NaN"})
        } else if (outputData[i] > this.inst.limiter.value){
          outputData[i] = this.inst.limiter.value;
          overflow = true;
        } else if (outputData[i] < -this.inst.limiter.value){
          outputData[i] = -this.inst.limiter.value;
          overflow = true;
        }
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