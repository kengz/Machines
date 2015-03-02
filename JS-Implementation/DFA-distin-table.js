// The class that implements the algorithm for the DFA Table of Distinguishabilities.


// import underscore.js for set/list manipulation
var _ = require("underscore");

// import from the constructor in machine.js
var machine = require('./machine.js');
var nd = machine.nd;
var d = machine.d;

var Q = machine.defM.Q;
var S = machine.defM.S;
var F = machine.defM.F;



// Implemented algorithm for Table of Distinguishabilities:
// 0. Enumerate all pairs in Q lexicographically, without redundancy, and mark all value in the table(map) of distinguishabilities, "distinTable", as 0.
// 1. partition Q into F and complement Fc; mark pairs in F x Fc in the table as 1.
// 2. Do for each subset pair in F and Fc, {a,b}:
// 3. for each input symbol, check of the resultant pair from taking input symbol is distinct. If so, mark {a,b} as 1 in distinTable.
// 4. Print out the result (transposed of textbook notation).


// console.log(Q);
// console.log(F);

// The complement of F from Q
var Fc = _.difference(Q, F);

// Initialize table of distinguishabilities, set all 0
var distinTable = {};
for (var i = 0; i < Q.length - 1; i++) {
    for (var j = i + 1; j < Q.length; j++) {
        distinTable[
            // order lexicographically
            _.sortBy([Q[i], Q[j]])
        ] = 0;
    }
}

// The internal function of algorithm, check if resultant pair of states on input symbol is distinguishable
var isDistin = function(state1, state2, symbol) {
    if (distinTable[[
            _.sortBy([d(state1, symbol), d(state2, symbol)])
        ]] === 1) {
        // console.log("marked");
        return true;
    }
};

// run the algorithm function above on setP
var findDistin = function(P) {
    // take subset pair
    for (var i = 0; i < P.length - 1; i++) {
        for (var j = i + 1; j < P.length; j++) {
            // for each input symbol
            _.each(S, function(s) {
                // see the the mapped pair is distinguishable
                if (isDistin(P[i], P[j], s)) {
                    distinTable[
                        _.sortBy([P[i], P[j]])
                    ] = 1;
                }
            });
        }
    }
};
// run the algorithm
var runAlgo = function() {
    console.log("Table of distin:");
    // set all the initial distinct pairs Fc x F to map, value = 1
    _.each(Fc, function(c) {
        _.each(F, function(f) {
            distinTable[
                _.sortBy([c, f])
            ] = 1;
        });
    });
    // run for each pair in partitions F, Fc
    findDistin(F);
    findDistin(Fc);
};


// The indent function for printTable()
var indent = function(i) {
        while (i > 0) {
            i--;
            process.stdout.write("  ");
        }
    }
    // the function to print the distinTable
var printTable = function() {
    // print the horizontal axis
    indent(1);
    for (var j = 1; j < Q.length; j++) {
        process.stdout.write(Q[j] + " ");
    }
    console.log();

    for (var i = 0; i < Q.length - 1; i++) {
        // write the vertical axis
        process.stdout.write(Q[i] + " ");
        // indent
        indent(i);
        // print a row from distinTable
        for (var j = i + 1; j < Q.length; j++) {
            process.stdout.write(distinTable[
                _.sortBy([Q[i], Q[j]])
            ] + " ");
        }
        console.log();
    }
    console.log();

};



// the main function, run all above
runAlgo();
printTable();


// export the distinTable to construct the minimal DFA
exports.distinTable = distinTable;
