let _current_plugin_id = 0;

class plugin {
  constructor(name, entry) {
    this.name = name;
    this.entry = entry;
    this.uid = _current_plugin_id++;
    this.loaded = false;
  }

  save(){
        // Saves all the data
      return({});
    }

  load(file){
      console.log(this.name, "done");
      // loads the data from the json file filemame and add all the keys
    }
}
