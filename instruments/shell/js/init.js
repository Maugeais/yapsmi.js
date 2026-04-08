'use strict';


console.log("Init.js")
import { init_instrument } from "../../../js/shell_instrument.js?version=1.1";

window.init_instrument = init_instrument;

import { initialise_audio } from "../../../js/audio.js?version=1.2";

window.instrument_name = "shell"

initialise_audio()

