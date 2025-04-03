'use strict';

// import { guitar } from "./guitar.js";

// import { audio_start, audio_stop, add_filter, remove_filter } from "../../../js/audio.js";// , add_post_processor, remove_post_processor



// window.audio_start = audio_start;
// window.audio_stop = audio_stop;

// window.add_filter = add_filter;
// window.remove_filter = remove_filter;

// window.inst=guitar;


import { init_instrument } from "../../../js/plucked_instrument.js?version=1.1";

window.init_instrument = init_instrument;

import { initialise_audio } from "../../../js/audio.js?version=1.1";

window.instrument_name = "guitar"

initialise_audio()

