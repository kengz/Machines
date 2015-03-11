// The class for constructing machines:
// Note all other classes depend on the machine definitions here, which is instructed by the 'require()' method.
// Designed to be a restriction of Turing Machine, thus capable of constructing DFA, NFA, e-NFA, PDA, and TM.
// Currently the explicit construction is up to e-NFA, the machine head (which gives Turing-ness) is to be written in the Tree.js soon, with appropriate modifications


// import underscore.js for set/list manipulation
var _ = require("underscore");

// Import machine definitions from JSON, including inputs at the last.
// For DFA minimization algorithm:
// var rawdefM = require('./definitions/DFA_4_18.json');
// var rawdefM = require('./definitions/DFA_4_21.json');
// var rawdefM = require('./definitions/DFA_4_4_1.json');
// var rawdefM = require('./definitions/DFA_4_4_2.json');
// var rawdefM = require('./definitions/DFA_3_2_1.json');
// var rawdefM = require('./definitions/DFA_3_2_2.json');
// var rawdefM = require('./definitions/minDFA.json');
// var rawdefM = require('./definitions/minDFA_4_4_1.json');
// var rawdefM = require('./definitions/minDFA_4_4_2.json');
// var rawdefM = require('./definitions/minDFA_3_2_1.json');
// var rawdefM = require('./definitions/minDFA_3_2_2.json');
// var rawdefM = require('./definitions/NFA_1_38.json');

// var rawdefM = require('./definitions/TM_0power.json');
// var rawdefM = require('./definitions/TM_repeat.json');
// var rawdefM = require('./definitions/TM_nondeter.json');
// var rawdefM = require('./definitions/TM_palindrome.json');

// var rawdefM = require('./definitions/newPDA.json');
// var rawdefM = require('./definitions/PDA_6_1_1.json');
var rawdefM = require('./definitions/PDA_6_2_1.json');

// Export raw machine definition for converter.js, or DFA minimizer
exports.rawdefM = rawdefM;

// declare the compatible machine definition
var defM;

/////////////////////////////////////
// convert machine to TM if needed //
/////////////////////////////////////
var Mclass = rawdefM.class;
var converter = require('./converter.js');
// set defM as converted def
defM = converter.run();

////////////////////////
// Machine Definition //
////////////////////////

// Reference only: the tuples in machine definition (as necessary)
// Q: states, S: alphabet, T: tape/stack symbols, B: blank symbol, F: accept states, q0: start state, delta: transition table
var Q, S, T, B, F, q0, delta;



////////////////////
// Delta function //
////////////////////

// The delta transition function for nd, d
delta = defM.delta;

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


// Export for usage by Tree.js and DFA minimizer, distintable
exports.nd = nd;
exports.d = d;
exports.defM = defM;


/////////////////////////
// Machine computation //
/////////////////////////

// Import the tape inputs
var input = defM.inputs;
// Import the Tree
var t = require('./Tree.js');


// Main method to run: Compute all input strings
var computeAll = function() {
    // compute for all input
    for (var i = 0; i < input.length; i++) {
        compute(i);
    };
};

// Compute one input
var compute = function(i) {
    // The max depth of computation tree
    var max = 500;

    // init new tree
    var m1 = new t.Tree(input[i]);
    console.log("Tape: " + input[i]);
    console.log("Machine computing...\n");

    // compute and print tree
    m1.compute(max);
    m1.printTree();
    m1.report();

};


//////////////////////////////////////////////
// The main call to run all functions above //
// Construct and run machine on all inputs  //
//////////////////////////////////////////////

computeAll();

