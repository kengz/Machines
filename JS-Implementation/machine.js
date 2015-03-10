// The class for constructing machines:
// Note all other classes depend on the machine definitions here, which is instructed by the 'require()' method.
// Designed to be a restriction of Turing Machine, thus capable of constructing DFA, NFA, e-NFA, PDA, and TM.
// Currently the explicit construction is up to e-NFA, the machine head (which gives Turing-ness) is to be written in the Tree.js soon, with appropriate modifications


// import underscore.js for set/list manipulation
var _ = require("underscore");

// Import machine definitions from JSON, including inputs at the last.
// For DFA minimization algorithm:
// var defM = require('./definitions/DFA_4_18.json');
// var defM = require('./definitions/DFA_4_21.json');
// var defM = require('./definitions/DFA_4_4_1.json');
// var defM = require('./definitions/DFA_4_4_2.json');
// var defM = require('./definitions/DFA_3_2_1.json');
// var defM = require('./definitions/DFA_3_2_2.json');
// var defM = require('./definitions/minDFA.json');
// var defM = require('./definitions/minDFA_4_4_1.json');
// var defM = require('./definitions/minDFA_4_4_2.json');
// var defM = require('./definitions/minDFA_3_2_1.json');
// var defM = require('./definitions/minDFA_3_2_2.json');
// var defM = require('./definitions/NFA_1_38.json');

// var defM = require('./definitions/TM-0power.json');
// var defM = require('./definitions/TM-repeat.json');
// var defM = require('./definitions/TM-nondeter.json');
// var defM = require('./definitions/TM-palindrome.json');

var defM = require('./definitions/newPDA.json');
// var defM = require('./definitions/PDA-6_1_1.json');


////////////////////////
// Machine Definition //
////////////////////////

// declare the tuples in machine definition
// DFA
// var Q, S, F, q0, delta;

// TM: T = tape symbols, B = blank symbol
var Q, S, F, T, B, q0, delta;

// Note: qreject if return undefined
var Mclass = defM.class;
// The states
Q = _.union(defM.Q, [defM.q0]);
// The alphabet, union with epsilon symbol "/"
S = _.union(defM.S, ["/"]);
// The accept states
F = defM.F;
// The tape symbol, union with S
T = _.union(S, defM.T, [defM.B]);
// The blank symbol, in T
B = defM.B == undefined ? '_' : defM.B ;
// The start state
q0 = defM.q0;
// The delta transition function
delta = defM.delta;


////////////////////
// Delta function //
////////////////////

// Non-deterministic delta transition function
// Return: "oe" for empty set(dead state)
var nd = function(q, s, index) {
    // if a state is absent in delta, dead:
    if (delta[q] == undefined) {
        return { state: 'oe' }
    }
    // else if state present: get the output array
    var arr = delta[q][s];
    // if symbol absent for state, (return empty 'oe' = dead state)
    if (arr == undefined)
        return {
            // for DFA
            state: 'oe',
            move: 'R' 
        }
    // else if state, symbol present, 
    // but called without index, return whole set(array), used by iterator
    else if (index == undefined)
        return arr;
    // lastly, if with index, return specific entry(undefined if invalid index)
    else
        return {
            state: arr[index][0],
            write: arr[index][1],
            move: arr[index][2],
        }
};

// Deterministic delta function, return outputs to input(q,s)
// Is a restriction of nd() - nondeterministic delta.
var d = function(q, s) {
    return nd(q, s, 0);
};


//////////////////////
// Migrate out soon //
//////////////////////

// Convert DFA into TM, copy; don't override
// construct a new minimized DFA by changing a copy of defM and saving it
var convertDFAtoTM = function() {
    _.each(_.keys(delta), function(state) {
        _.each(_.keys(delta[state]), function(symbol) {
            // replace with TM output: state, write(same), move(right)
            for (var i = 0; i < delta[state][symbol].length; i++) {
                delta[state][symbol][i] = 
                    [ delta[state][symbol][i], symbol, "R"];
            };
        });
    });
    // replace the modified delta for TM
    defM.delta = delta;
    // and add the additional 2-tuples
    defM.B = "_";
    defM.T = _.union(T, defM.B);
};



// Export the nd for Tree, then import Tree below to compute
exports.nd = nd;
exports.d = d;
// Export the machine for usage elsewhere
exports.defM = defM;


/////////////////////////
// Machine computation //
/////////////////////////

// Import the tape inputs
var input = defM.inputs;
// Import the Tree
var t = require('./Tree.js');

// var PDAtoTM = require('./PDA-converter.js').run;

// Compute all input strings
var computeAll = function() {
    ////////////////////////////////
    // move convertion up earlier //
    ////////////////////////////////

    // if is DFA or NFA, convert to TM, then export def
    if (Mclass == 'DFA' || Mclass == 'NFA') {
        convertDFAtoTM();
    };
    // if is PDA, convert
    if (Mclass == 'PDA') {
        // include in the right sequence
        // PDAtoTM();
    };
    // compute for all input
    for (var i = 0; i < input.length; i++) {
        compute(i);
    };
};


// function to compute one input
var compute = function(i) {
    var max = 500;
    // init new tree
    var m1 = new t.Tree(Mclass, q0, input[i]);
    console.log("Tape: " + input[i]);
    console.log("Machine computing...\n");

    m1.compute(max);
    m1.printTree();
    m1.report();

};


//////////////////////////////////////////////
// The main call to run all functions above //
// Construct and run machine on all inputs  //
//////////////////////////////////////////////

computeAll();

