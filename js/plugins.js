let _current_plugin_id = 0;

class plugin {
  constructor(name, entry) {
    this.name = name;
    this.entry = entry;
    this.uid = _current_plugin_id++;
    this.loaded = false;
  }

  save(uid){
        // Saves all the data
      return({});
    }

  load(uid, state){
      console.log(this.name, "done", state);
      // loads the data from the json file filemame and add all the keys
    }
}
