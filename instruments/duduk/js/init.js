'use strict';

import { duduk } from "./duduk.js";

import { audio_start, audio_stop, add_filter, remove_filter, add_post_processor, remove_post_processor } from "../../../js/audio.js";

// import { updatePad } from "../../../js/pad.js";


// let guitare = new duduk("Guitare", "light", 10000, 1e4);

//import { updatePad } from "./pad.js";

window.audio_start = audio_start;
window.audio_stop = audio_stop;
window.add_post_processor = add_post_processor;
window.remove_post_processor = remove_post_processor;
window.add_filter = add_filter;
window.remove_filter = remove_filter;

window.inst=duduk;

console.log(window.inst)
/*
window.addEventListener('load', function () {
            $("#waiting").hide()
          })*/

