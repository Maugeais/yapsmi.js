'use strict';

import { duduk } from "./duduk.js?version=1.02";

import { audio_start, audio_stop, add_filter, remove_filter } from "../../../js/audio.js?version=1.01";

window.audio_start = audio_start;
window.audio_stop = audio_stop;

window.add_filter = add_filter;
window.remove_filter = remove_filter;

window.inst=duduk;

console.log(window.inst)


