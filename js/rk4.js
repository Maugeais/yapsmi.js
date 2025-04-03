'use strict';

function _scalarMult(h, x){
    var res = new Float64Array(x.length);
    for (var k=0; k < x.length; k++){
        res[k] = h*x[k]
    }
    return(res);
}

function _vectorAdd(x, y){
    var res = new Float64Array(x.length);
    for (var k=0; k < x.length; k++){
        res[k] = x[k]+y[k]
    }
    return(res);
}


function rungeKutta(f, initialCondition, start, steps, stepSize, X) {
    var h = stepSize;
    var m = initialCondition.length;
    var t = start;
    var i = 0;
    var k1, k2, k3, k4;
    
    for (var k = 0; k < m; k++) {
        X[0][k] = initialCondition[k];
    }
    
    
    while (i < steps) {
        //let yNext = new Array(m)
        k1 = f(t, X[i]);
        k2 = f(t + (.5 * h), _vectorAdd(X[i], _scalarMult(.5 * h, k1)));
        k3 = f(t + (.5 * h), _vectorAdd(X[i], _scalarMult(.5 * h, k2)));
        k4 = f(t + h, _vectorAdd(X[i], _scalarMult(h, k3)));
        for (var k = 0; k < m; k++) {
            X[i+1][k] = X[i][k] + h * (k1[k] + 2 * k2[k] + 2 * k3[k] + k4[k]) / 6;
        }
        t += h;
        i++;
    }
};

function midPoint (f, initialCondition, start, steps, stepSize, X) {
       var h = stepSize;
       var m = initialCondition.length;
       var t = start;
       var i = 0;
       var k1, k2, k3, k4;
       
       for (var k = 0; k < m; k++) {
           X[0][k] = initialCondition[k];
       }
       
       
       while (i < steps) {
           //let yNext = new Array(m)
           k1 = f(t, X[i]);
           k2 = f(t + (.5 * h), _vectorAdd(X[i], _scalarMult(.5 * h, k1)));

    
           for (var k = 0; k < m; k++) {
               X[i+1][k] = X[i][k] + h * k2[k] ;
           }
           t += h;
           i++;
       }
};


export { rungeKutta, midPoint };
