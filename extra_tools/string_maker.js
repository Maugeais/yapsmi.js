console.log("houla") 

let materials = {};
let core_material = $("#core_material_string_maker");
let winding_material = $("#winding_material_string_maker");

$.getJSON("data/materials.json", function(data) {
    materials = data;
    $.each(data, function(key, value) {
        core_material.append($("<option />").val(key).text(key));
        winding_material.append($("<option />").val(key).text(key));
      });
});



function string_maker_compute(){
    let F = parseFloat($("#fundamental_string_maker").val())
    let T = 9.81*parseFloat($("#tension_string_maker").val())
    let D = 1e-3*25.4*parseFloat($("#outer_diameter_string_maker").val())
    let L = parseFloat($("#length_string_maker").val())
    let rho_a = 1e3*materials[core_material.val()]["density"];
    let rho_c = 1e3*materials[winding_material.val()]["density"];
    let E = 1e9*materials[core_material.val()]["Young modulus"];

    let mu = T/(4*L**2*F**2); 
    let d = ((mu-rho_c*(D*Math.PI/4)**2)/(rho_a*Math.PI/4-rho_c*(Math.PI/4)**2))**0.5;
    $("#inner_diameter_string_maker").val(1e3*d);
    let B = Math.PI**3*E*d**4/(64*T*L**2);
    $("#inharmonicity_string_maker").val(B);
   
   
}

function compute_losses(){
    let dim = 10;
    let eta_air= 1.8e-5;
    let rho_air = 1.2;

    let delta_ve = 4.5e-3; 
    Qm1te = 2.03e-4;
// B = 1.78 × 10−5
    let c0 = (T/mu)**0.5;
    nu = new Array(dim+1); 
    sigma = new Array(dim+1); 
    Y_j = 0;

    for (let j = 1; j <= dim; j++){
        nu[j] = j*c0/(2*L)*(1+B*j**2/2+mu*c0/(2*j*Math.PI)*Y_j)
        R  = 2*Math.PI*(eta_air+D*(Math.PI*eta_air*rho_air*nu[j])**0.5);
        sigma[j] = j*c0/(2*L*nu[j])*R/(2*Math.PI*mu);
        sigma[j] += 4*Math.PI**3*mu*E*d**4*delta_ve/64/T**2*(j*c0/(2*L))**3;
        sigma[j] += Qm1te;
        sigma[j] *= Math.PI;
    }

} 