'use strict';

import { rectangular_eigen_modes, circular_eigen_modes } from "./eigen_modes.js?version=0.1"


/* Rectangular, simply supported on all edges*/
let rectangular_SSSS = 0; //new rectangular_eigen_modes()
// await rectangular_SSSS.load_data("rectangular_SSSS")

// rectangular_SSSS.set_geometry = function (params){
//     // On calcule les vp pour cette géométrie
//     // params sont les params de l'instrument (on a tout) et on pioche ce dont on a besoin

//     console.log("test SS")
// }

// rectangular_SSSS.build_list = function (dim){
//     console.log("test SS")
// }


/* Rectangular, clamped on all edges */
// let rectangular_SSCC = new rectangular_eigen_modes()

// rectangular_SSCC.build_list = function (dim){
//     console.log("test SS")
// }


/* Circular, simply supported */
// let circular_S = new circular_eigen_modes()

// circular_S.build_list = function (dim){
//     console.log("test SS")
// }


// /* circular, clamped */
// let circular_C = new circular_eigen_modes()

// circular_C.build_list = function (dim){
//     console.log("test SS")
// }


export { rectangular_SSSS };
