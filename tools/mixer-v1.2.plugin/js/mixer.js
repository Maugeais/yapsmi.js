"use strict";

let analysers = {};

function init(uid){
    init_knobs("mixer_controls€"+uid, "medium", "LittlePhatty");
}

for (let e of document.querySelectorAll('input[type="range"]')) {
  e.style.setProperty('--value', e.value);
  e.style.setProperty('--min', e.min == '' ? '0' : e.min);
  e.style.setProperty('--max', e.max == '' ? '100' : e.max);
  e.addEventListener('input', () => e.style.setProperty('--value', e.value));
}
    
window.mixer_change_level = function(value, channel){
  let now = audioCtx.currentTime
  channel_level[channel].gain.setValueAtTime(channel_level[channel].gain.value, now);
  channel_level[channel].gain.exponentialRampToValueAtTime(10**(3*(-1+value/100)), now + 0.25)
}


window.mixer_change_panner = function(value, channel){
  let now = audioCtx.currentTime
  channel_panner[channel].pan.setValueAtTime(channel_panner[channel].pan.value, now);
  channel_panner[channel].pan.linearRampToValueAtTime(value/50-1, now + 0.25)
}

window.mixer_mute = function(value, channel){
  // let now = audioCtx.currentTime
  let now = audioCtx.currentTime

  if (value){
      channel_panner[channel].connect(main_level)
      channel_level[channel].gain.setValueAtTime(Number.EPSILON, now);
      let gain = parseFloat($("#mixer_channel_0 .mixer_volume").val())
      channel_level[channel].gain.linearRampToValueAtTime(10**(3*(-1+gain/100)), now + 0.25)
      // setTimeout(function(){
      // } , 250);
  } else {
      channel_level[channel].gain.setValueAtTime(channel_level[channel].gain.value, now);
      channel_level[channel].gain.linearRampToValueAtTime(Number.EPSILON, now + 0.25)
      setTimeout(function(){
        channel_panner[channel].disconnect(main_level)
      } , 250);
  }
  
}
export { init }
