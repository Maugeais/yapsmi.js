// const pianoKeys = document.querySelectorAll(".pianokey");

// let allKeys = [];

// pianoKeys.forEach(key => {
//     allKeys.push(key); // adding data-key value to the allKeys array
//     // calling playTune function with passing data-key value as an argument
//     key.addEventListener("click", () => keyPlayed(key));
    
// });

// function keyPlayed(evnt){
//     a = Array.prototype.indexOf.call(allKeys, evnt)
//     console.log(a)
// }

async function keyboard_init(){

    console.log("test pkeyboard");
    let { init } = await import('../../controls/keyboard.plugin/js/test.js');
    foo();
}