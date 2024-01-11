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
    //var equation = args.equation,  = args.initialCondition, start = args.start, stepSize = args.stepSize, steps = args.steps;
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
            X[i+1][k] = (X[i][k] + (h * (k1[k] + (2 * k2[k]) + (2 * k3[k]) + k4[k]) / 6));
        }
        t += h;
        i++;
    }
};


function rungeKutta2(f, initialCondition, start, end, stepSize) {
    //var equation = args.equation,  = args.initialCondition, start = args.start, stepSize = args.stepSize, steps = args.steps;
    var n = (end-start)/stepSize;
    var h = stepSize;
    var y = [initialCondition];
    var m = initialCondition.length;
    var t = start;
    var i = 0;
    var k1, k2, k3, k4;
    
    while (i < n) {
        let yNext = new Array(m)
        k1 = f(t, y[i]);
        k2 = f(t + (.5 * h), _vectorAdd(y[i], _scalarMult(.5 * h, k1)));
        k3 = f(t + (.5 * h), _vectorAdd(y[i], _scalarMult(.5 * h, k2)));
        k4 = f(t + h, _vectorAdd(y[i], _scalarMult(h, k3)));
        for (var k = 0; k < m; k++) {
            //yNext.push(y[i][k] + (h * (k1[k] + (2 * k2[k]) + (2 * k3[k]) + k4[k]) / 6));
            yNext[k] = (y[i][k] + (h * (k1[k] + (2 * k2[k]) + (2 * k3[k]) + k4[k]) / 6));
        }
        y.push(yNext);
        t += h;
        i++;
    }
    return y;
};


function euler (f, initialCondition, start, end, stepSize) {
    //var equation = args.equation,  = args.initialCondition, start = args.start, stepSize = args.stepSize, steps = args.steps;
    var n = (end-start)/stepSize;
    var h = stepSize;
    var y = [initialCondition];
    var m = initialCondition.length;
    var t = start;
    var i = 0;
    var k1, k2, k3, k4;
    while (i < n) {
        var yNext = new Array(y.length);
        k1 = f(t, y[i]);
        for (var k = 0; k < m; k++) {
            yNext[k] = y[i][k] + h * k1[k];
        }
        y.push(yNext);
        t += h;
        i++;
    }
    return y;
};


export { rungeKutta };
