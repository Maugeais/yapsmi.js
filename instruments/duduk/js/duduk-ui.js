function Fl_change(a){
    console.log("Fl", a)
}

function pb_change(a){
    console.log("pb", a)
}

let holes_opened = [false, false, false, false, false, false, false, false, false, false]
let holes_names = ['Gm1', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'Ap1', 'Bp1', 'Cp1']
    // $(elmnt).parent().

let holes  = $("#duduk_control").children();

function click_hole(elmnt){
    // $(elmnt).parent().
    let index = $(elmnt).index();

    for (let i = 0; i < index; i++){
        holes_opened[i] = true;
        $(holes[i]).css("background-color", "black")
    }

    for (let i = index+1; i < holes_opened.length; i++){
        holes_opened[i] = false;
        $(holes[i]).css("background-color", "red")

    }

    if (holes_opened[index]){
        $(holes[index]).css("background-color", "red")
        holes_opened[index] = false;
        inst.change_fingering(holes_names[index])
    } else {
        $(holes[index]).css("background-color", "black")
        holes_opened[index] = true;
        inst.change_fingering(holes_names[index+1])
    }
}

// $('#duduk').mousedown(function(event) {
//     switch (event.which) {
//         case 1:
//             alert('Left Mouse button pressed.');
//             break;
//         case 2:
//             alert('Middle Mouse button pressed.');
//             break;
//         case 3:
//             alert('Right Mouse button pressed.');
//             break;
//         default:
//             alert('You have a strange Mouse!');
//     }
// });


$(document).on("contextmenu", "#duduk", function(e){
    $(".pop").hide()
    $("#duduk_menu").toggle();
    return false;
 });
