// The class to convert machines to TM

// import underscore.js for set/list manipulation
var _ = require("underscore");

// var defM = require('./definitions/PDA-0n1n.json');
// var defM = require('./definitions/PDA-6_1_1.json');

// get raw machine definition
var defM = require('./machine.js').rawdefM;

// Machine class
var Mclass = defM.class;
// console.log("machine class: ", Mclass);

// Define the tuples, as appropriate for TM
var Q, S, T, B, F, q0, delta;
// The tape symbols without the blank symbol B
var TnB;

// The states
Q = _.union(defM.Q, [defM.q0]);
// The alphabet, union with epsilon symbol "/"
S = _.union(defM.S, ["/"]);
// The blank symbol, in T
B = defM.B == undefined ? '_' : defM.B;
// The tape symbol, union with S and B
T = _.union(S, defM.T, [B]);
// the input and stack symbols, without B
TnB = _.union(defM.S, defM.T);
// The accept states
F = defM.F;
// The start state
q0 = defM.q0;
// The delta transition function
delta = defM.delta;


// The new delta function
var newD;


// Convert DFA into TM, copy; don't override
// construct a new minimized DFA by changing a copy of defM and saving it
var convertDFAtoTM = function() {
    newD = {};
    console.log("Converting DFA/NFA");
    _.each(_.keys(delta), function(state) {
        _.each(_.keys(delta[state]), function(symbol) {
            // init new entry
            initMap(state, symbol);
            // replace with TM output: state, write(same), move(right)
            for (var i = 0; i < delta[state][symbol].length; i++) {
                // push to newD: write original, move 'R'
                newD[state][symbol].push(
                    [delta[state][symbol][i], symbol, "R"]
                );
            };
        });
    });
};



var convertPDAtoTM = function() {
    newD = {};
    console.log("Converting PDA");
    _.each(_.keys(delta), function(state) {
        _.each(_.keys(delta[state]), function(symbol) {
            _.each(_.keys(delta[state][symbol]), function(stack) {
                // for each output
                _.each(delta[state][symbol][stack], function(out) {

                    var q1, a, al, q2, be;
                    q1 = state;
                    a = symbol;
                    al = stack;
                    q2 = out[0];
                    be = out[1];
                    // console.log("parsed: ", q1, a, al, q2, be);
                    // add rule according to the PDAtoTM algorithm
                    addPDARule(q1, a, al, q2, be);

                })
            });
        });
    });

    // delete duplicates in newD output
    _.each(_.keys(newD), function(state) {
        _.each(_.keys(newD[state]), function(symbol) {
            newD[state][symbol] = unique(newD[state][symbol]);
        });
    });
};


// Helper method: detemine if old is a uniq output
var unique = function(old) {
        // open up fresh outputs
        var fresh = [];
        _.each(old, function(o) {
            var ouniq = true;
            // check if old is present in fresh
            _.each(fresh, function(f) {
                    if (same(o, f)) ouniq = false;
                })
                // if not, add to fresh
            if (ouniq) {
                fresh.push(o);
            };
        })
        return fresh;
    }
    // Helper: determine if two arrays are the same
var same = function(ar1, ar2) {
    var same = true;
    for (var i = 0; i < ar1.length; i++) {
        if (ar1[i] != ar2[i]) same = false;
    };
    return same;
}

// The PDA to TM algorithm: add TM rules for each PDA rule,
// i.e. d(q1, a, al) = (q2, be), do:
var addPDARule = function(q1, a, al, q2, be) {

    // 1. Read and mark a, move right
    initMap(q1, a);
    var q1a = [q1, a].join(',');
    var aMark = [a, '.'].join(',');
    newD[q1][a].push([q1a, aMark, 'R']);

    // 2. Keep moving R till stack end
    _.each(TnB, function(t) {
        initMap(q1a, t);
        // past all tape symbol in T
        newD[q1a][t].push([q1a, t, 'R']);
    });

    // reaching stack end
    initMap(q1a, B);
    // state for when moving back from tape's right end
    var q2a = [q2, a, 'L'].join(',');
    // ensure alpha non-empty
    if (al != '/') {
        // meet blank, move left a step to top of stack
        var q1aB = [q1a, B].join(',');
        newD[q1a][B].push([q1aB, B, 'L']);

        initMap(q1aB, al);
        // if no beta is pushed, i.e. al to ep
        if (be == '/') {
            // replace al with blank, keep moving left
            newD[q1aB][al].push([q2a, B, 'L']);
        }
        // if remain same stack, i.e. al to al
        else if (be.length == 1) {
            // just push back al - write same, move left
            newD[q1aB][al].push([q2a, al, 'L']);
        }
        // if push new,
        else if (be.length == 2) {
            var q1aBal = [q1aB, al].join(',');
            // push back al, move right to B,
            newD[q1aB][al].push([q1aBal, al, 'R']);
            initMap(q1aBal, B);
            // push other symbol to stack top, then move left
            newD[q1aBal][B].push([q2a, be[0], 'L']);
        }
    }

    // al is never empty as of now
    else {

    }


    // 4. Then keep moving left till marked input a.
    _.each(TnB, function(t) {
        initMap(q2a, t);
        // for all tape symbol in T
        newD[q2a][t].push([q2a, t, 'L']);
    });
    // unmark a, move right, continue with next
    initMap(q2a, aMark);
    // and cross out a as processed
    newD[q2a][aMark].push([q2, 'x', 'R']);
}

// Initialize delta map, if not already
var initMap = function(q1, a) {
    if (newD[q1] == undefined) {
        newD[q1] = {};
        // console.log("Added state");
    }
    if (newD[q1][a] == undefined) {
        newD[q1][a] = [];
        // console.log("init output array");
    }
}


///////////////////////
// the main function //
///////////////////////
var run = function() {

    if (Mclass == 'TM') {
        // dont convert anything
        newD = delta;
    } 
    else if (Mclass == 'DFA' || Mclass == 'NFA') {
        convertDFAtoTM();
    } 
    else if (Mclass == 'PDA') {
        convertPDAtoTM();
    }

    // reset defM before returning
    defM.Q = Q;
    defM.S = S;
    defM.B = B;
    defM.T = T;
    defM.F = F;
    defM.q0 = q0;
    defM.delta = newD;

    // write to output
    var outFile = './definitions/converted.json';
    var fs = require('fs');
    fs.writeFile(outFile, JSON.stringify(defM, null, 4), function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("JSON saved to " + outFile);
        }
    });

    // return for usage
    return defM;
}



// run();

exports.run = run;
