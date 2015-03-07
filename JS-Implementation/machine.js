// The class for constructing machines:
// Note all other classes depend on the machine definitions here, which is instructed by the 'require()' method.
// Designed to be a restriction of Turing Machine, thus capable of constructing DFA, NFA, e-NFA, PDA, and TM.
// Currently the explicit construction is up to e-NFA, the machine head (which gives Turing-ness) is to be written in the Tree.js soon, with appropriate modifications


// import underscore.js for set/list manipulation
var _ = require("underscore");

// Import machine definitions from JSON, including inputs at the last.
// A sample DFA:
var defM = require('./Definitions/machine_def.json');
// For DFA minimization algorithm:
// var defM = require('./Definitions/DFAtoMin1.json');
// var defM = require('./Definitions/DFAtoMin2.json');
// ex 4.4.1
// var defM = require('./Definitions/DFAtoMin3.json');
// ex 4.4.2
// var defM = require('./Definitions/DFAtoMin4.json');
// ex 3.2.1
// var defM = require('./Definitions/machine_3_2_1.json');
// ex 3.2.2
// var defM = require('./Definitions/machine_3_2_2.json');
// var defM = require('./Definitions/minDFA.json');
// var defM = require('./Definitions/minDFA_4_4_1.json');
// var defM = require('./Definitions/minDFA_4_4_2.json');
// var defM = require('./Definitions/minDFA_3_2_1.json');
// var defM = require('./Definitions/minDFA_3_2_2.json');

// var defM = require('./Definitions/tm-def.json');
// var defM = require('./Definitions/tm-def2.json');
// var defM = require('./Definitions/tm-def3.json');


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
B = defM.B;
// The start state
q0 = defM.q0;
// The delta transition function
delta = defM.delta;


///////////////////
// modifications //
///////////////////
///Change DFA parsing to wrap delta more like TM: [["a"]]


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


// console.log(delta);
// defM.delta = delta;
// console.log(defM.delta);
// console.log(delta['a']['0'][0]);


// Export the nd for Tree, then import Tree below to compute
exports.nd = nd;
exports.d = d;
// Export the machine for usage elsewhere
exports.defM = defM;


/////////////////////////
// Machine computation //
/////////////////////////

// Gotta offset head and index for leftmoves

// Import the tape inputs
var input = defM.inputs;
// Import the Tree
var t = require('./Tree.js');

// Compute all input strings
var computeAll = function() {
    // if is DFA or NFA, convert to TM, then export def
    if (Mclass == 'DFA' || Mclass == 'NFA') {
        convertDFAtoTM();
    }

    for (var i = 0; i < input.length; i++) {
        compute(i);
    };
};


// function to compute one input
var compute = function(i) {
    // init new tree
    var m1 = new t.Tree(Mclass, q0, input[i]);
    console.log("Tape: " + input[i]);
    console.log("Machine computing:");
    console.log("===================");

    m1.compute();
    m1.printTree();

    // Check for accept states in the lowest level of tree = forefront
    var accepts = _.intersection(m1.forefront, F);
    if (accepts.length > 0) {
        console.log("Forefront: " + _.uniq(m1.forefront));
        console.log("Accepted states: " + accepts);
        console.log("======Accept.======\n\n");
    } else {
        console.log("======Reject.======\n\n");
    }

};


//////////////////////////////////////////////
// The main call to run all functions above //
// Construct and run machine on all inputs  //
//////////////////////////////////////////////

computeAll();

// convertDFAtoTM();
// compute(1);
// compute(3);

// var arr = [1,2,3];

// console.log(arr);
// console.log(arr.unshift(defM.B));
// console.log(arr);
