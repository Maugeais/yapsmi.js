'use strict';

class interpolant{
    constructor(x = [], y = [], method="lagrange"){
        this.x = x;
        this.y = y;
        this.method = method;
    }

    eval(x){

        if (this.method != "lagrange") return(0)

        let res = 0;

        for (let j = 0; j < this.x.length; j++){
          let prod = 1;
          for (let k = 0; k < this.x.length; k++){
            if (k != j) prod *= (x-this.x[k])/(this.x[j]-this.x[k])
          }
          res += this.y[j]*prod;
        }
        return(res)
    }

    toString(){
        return(`{"method":"${this.method}", "x":[${this.x}], "y":[${this.y}]}`)
    }

    add_point(x, y){

        // Et on calcule le pol
    }

    
}



export { interpolant };
