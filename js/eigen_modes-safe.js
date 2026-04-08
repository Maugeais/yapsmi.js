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
    /* Only for one side that is simply supported */
    constructor(data){

        super()

        this.data = data["eigenmodes"]

        let max_dim = 400

        this.ref_eigen_values_x = new Float32Array(max_dim).fill(0)
        this.ref_eigen_values_y = new Float32Array(max_dim).fill(0)

        this.eigen_values_x = new Float32Array(max_dim).fill(0)
        this.eigen_values_y = new Float32Array(max_dim).fill(0)

        for (let i = 0; i < max_dim; i++){
            this.ref_eigen_values_x[i] = Math.PI*(i+1);
            this.ref_eigen_values_y[i] = Math.PI*(i+1);
        }

        // TODO : il faut calculer les normes !
    }

    eval(k, position){
        let m = this.indexes[k][0], n = this.indexes[k][1];
        return(Math.sin(this.eigen_values_x[m]*position[0])*Math.sin(this.eigen_values_y[n]*position[1]));
    }

    attack_coeff(k, x0, y0, r){
        let m = this.indexes[k][0], n = this.indexes[k][1];
        let norm = 4*r**3/3;
        let lbdax = this.eigen_values_x[m], lbday = this.eigen_values_y[n];
        // let intx = 4/this.modes.eigen_values_x[m]**2/Math.PI*Math.sin(m*x0)*(r*Math.cos(m*Math.PI*r/Lx)-Lx/(m*Math.PI)*Math.sin(m*Math.PI*r/Lx))/norm;
        let intx = -2/lbdax**2*
        (r*Math.sin(lbdax*(x0+r))+r*Math.sin(lbdax*(x0-r))+1/lbdax*(Math.cos(lbdax*(x0+r))-Math.cos(lbdax*(x0-r))));
        let inty = -2/lbday**2*
        (r*Math.sin(lbday*(y0+r))+r*Math.sin(lbday*(y0-r))+1/lbday*(Math.cos(lbday*(y0+r))-Math.cos(lbday*(y0-r))));
        return(intx*inty/(norm**2))
    }

    // set_geometry(params){
    //     let Lx = params["length"].value, Ly = params["width"].value;
    //     for (let i = 0; i < max_dim; i++){
    //         this.eigen_values_x[i] = this.ref_eigen_values_x[i]/Lx;
    //         this.eigen_values_y[i] = this.ref_eigen_values_y[i]/Ly;
    //     }
    // }



    build_list(dim, params){

        let Lx = params["length"].value, Ly = params["width"].value;
        for (let i = 0; i < this.ref_eigen_values_x.length; i++){
            this.eigen_values_x[i] = this.ref_eigen_values_x[i]/Lx;
            this.eigen_values_y[i] = this.ref_eigen_values_y[i]/Ly;
        }

        this.indexes = new Array();
        this.flattened_indexes = new Array();
        this.eigen_values = new Array();

        let max_freq = dim*Math.PI**3/(Lx*Ly)/2;

        // console.log("Max_freq", max_freq, dim, this.ref_eigen_values_x[0])

        for (let m=0; m < dim; m++){
            for (let n = 0; n < dim; n++){

                if (this.eigen_values_x[m]**2+this.eigen_values_y[n]**2 < max_freq)                {               
                    this.indexes.push([m, n])
                    this.flattened_indexes.push(m*dim+n)
                    this.eigen_values.push(((this.eigen_values_x[m])**2+(this.eigen_values_y[n])**2)**2);
                }
            }
            
        }

        this.Eigen_values = [];
        this.Eigen_values_x = [];
        this.Eigen_values_y = [];
        for (let k = 0; k < this.data.length; k++){
            this.Eigen_values_x[k] = this.data[k]['value_x']/(Lx);
            this.Eigen_values_y[k] = this.data[k]['value_y'][0]/(Ly);
            let eig = ((this.data[k]['value_x']/(Lx))**2+(this.data[k]['value_y'][0]/(Ly))**2)**2;
            this.Eigen_values.push(eig)
        }
        let d, u;
        let argsort = a=>a.map(d).sort().map(u);d=(v,i)=>[v,i];u=i=>i[1]
        this.Flattened_indexes = argsort(this.Eigen_values)

        // console.log(this.eigen_values_x[0], this.eigen_values_y[0], this.data[0]['value_x']/(Lx), this.data[0]['value_y'][0]/(Ly))
        // console.log(this.eigen_values[0], Eigen_values[0])
    }
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
