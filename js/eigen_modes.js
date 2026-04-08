'use strict';


class eigen_modes{
    
    constructor(){
        // this.name = name;
        // this.set_geometry(params);

        // await this.load_db(name)
        // this.dim = dim;
        this.indexes = [] // ancien data
    }

    // async load_data(name){
    //     /* Reads the database of the modes : eigenvalues, moments of order 0, 1 and 2, more ???, can we load js function for evaluation
    //     as in https://stackoverflow.com/questions/36517173/how-to-store-a-javascript-function-in-json

    //     It also gives max_dim !!!, donc pas besoin de le passer en argument

    //     En part, pas besoin de séparer x et y ?? Si, pour les moments !!!!
    //     */
    //     // wait("Loading geometries...")
    //     // let data_file = './data/geometries/'+name+'.json';
    //     // let response = await fetch(data_file)
    //     // let data =  await response.json() 
    //     // console.log(data)

    //     test(name)
    //     // 
    //     //     object.strings[string_name] = data;
    //     //     console.log(data)
    //     // Pour chaque mode, l'évaluation doit être remplacée par var f = new Function(function.arguments, function.body);
    // }

    set_geometry(params){
        console.log("This function must be redefined by the user")
    }

    eigen_value(index){
        console.log("This function must be redefined by the user")
    }

    eval(index, position){
        console.log("This function must be redefined by the user")
        
    }
    
    scalar(index){
        console.log("This function must be redefined by the user")
    }

    compute_radiation_filters(){
        console.log("This function must be redefined by the user")
    }
}

class rectangular_eigen_modes extends eigen_modes{
    constructor(data){
        super()
        this.data = data["eigenmodes"]
        this.max_dim = this.data.length
    }

    eval(k, position){
        let lbdax = this.Eigen_values_x[k], lbday0 = this.Eigen_values_y[k][0], lbday1 = this.Eigen_values_y[k][1];
        let valx = Math.sin(lbdax*position[0]);
        let valy = this.data[k]['coeffs_y'][0]*Math.cos(lbday0*position[1]);
        valy += this.data[k]['coeffs_y'][1]*Math.sin(lbday0*position[1]);
        valy += this.data[k]['coeffs_y'][2]*Math.cosh(lbday1*position[1]);
        valy += this.data[k]['coeffs_y'][3]*Math.sinh(lbday1*position[1]);
        return(valx/this.data[k]['norm_x']*valy/this.data[k]['norm_y']);
    }

    Attack_coeff(k, x0, y0, r){
        let norm = 4*r**3/3;
        let lbdax = this.Eigen_values_x[k], lbday0 = this.Eigen_values_y[k][0];
        // let intx = 4/this.modes.eigen_values_x[m]**2/Math.PI*Math.sin(m*x0)*(r*Math.cos(m*Math.PI*r/Lx)-Lx/(m*Math.PI)*Math.sin(m*Math.PI*r/Lx))/norm;
        let intx = -2/lbdax**2*
        (r*Math.sin(lbdax*(x0+r))+r*Math.sin(lbdax*(x0-r))+1/lbdax*(Math.cos(lbdax*(x0+r))-Math.cos(lbdax*(x0-r))));
        let inty = -2/lbday0**2*
        (r*Math.sin(lbday0*(y0+r))+r*Math.sin(lbday0*(y0-r))+1/lbday0*(Math.cos(lbday0*(y0+r))-Math.cos(lbday0*(y0-r))));
        return(intx*inty/(norm**2))
    }

    build_list(dim, params){

        dim = Math.min(dim, this.max_dim)

        let Lx = params["length"].value, Ly = params["width"].value;
        this.Eigen_values = new Array();
        this.Eigen_values_x = new Array();
        this.Eigen_values_y = new Array();
        for (let k = 0; k < this.data.length; k++){
            this.Eigen_values_x.push(this.data[k]['value_x']/(Lx));
            this.Eigen_values_y.push([this.data[k]['value_y'][0]/(Ly), this.data[k]['value_y'][1]/(Ly)]);
            this.Eigen_values.push(((this.data[k]['value_x']/(Lx))**2+(this.data[k]['value_y'][0]/(Ly))**2)**2);
        }
        // let argsort = a=>a.map(d).toSorted(function(a, b){return a - b}).map(u);d=(v,i)=>[v,i];u=i=>i[1]
        this.Flattened_indexes = argsort(this.Eigen_values).slice(0, dim);
    }
}

function argsort(a){
    let b = a.map((item, index) => [item, index]).toSorted(function(e, f){return e[0] - f[0]}).map(([, index]) => index);
    return(b)
}
class circular_eigen_modes extends eigen_modes{
    build_list(dim){
        this.indexes = new Array();

        // Indice (n, m, k) (theta, zero de bessel), k correspond à cos ou sin

        for (m=1; m < this.dim; m++){
            for (n = 1; n < this.dim; n++){

                if ((m/Lx)**2+(n/Ly)**2 < max_freq)                {               
                    let omega = (this.Dx/(this.rho))**0.5*((m*Math.PI/Lx)**2+(n*Math.PI/Ly)**2)
                    // console.log(m, n, omega/(2*Math.PI))
                    this.indexes.push([m, n])
                }
            }
            
        }
    }
}

export { rectangular_eigen_modes, circular_eigen_modes };
