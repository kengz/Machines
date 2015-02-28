
// import underscore.js for set/list manipulation
var _ = require("underscore");

// A sample delta table format; will be imported from a JSON file
// A map from input pair-key (Q, S); to array of outputs values
// Keys that map to empty set are not recorded; see nd() output.
var delta = {
    // an input state
    a: {
        // an input symbol, yields general array of outputs
        0: ["a"],
        1: ["a", "b"]
    },
    b: {
    	0: ["c"],
    	"/": ["c"]
    }
}

////////////////////////
// Machine Definition //
////////////////////////

// Import machine definition from JSON
var defM = require('./machine_def.json');
// declare the tuples in machine definition
var Q, S, F, q0, delta;

// The states
Q = defM.Q;
// The alphabet, union with epsilon symbol "/"
S = _.union(defM.S, ["/"]);
// The accept states
F = defM.F;
// The start state
q0 = defM.q0;
// The delta transition function
delta = defM.delta;

// Non-deterministic delta transition function
// Return: "oe" for empty set(dead state)
var nd = function(q, s, index) {
    // get the output array
    var arr = delta[q][s];
    // if empty (dead state), return empty set "oe"
    if (arr == undefined)
    	return "oe";
    // if without index, return whole set(array)
    else if (index == undefined)
    	return arr;
    // with index, return specific entry(undefined if invalid index)
    else
    	return arr[index];
}

// Deterministic delta function, return outputs to input(q,s)
// Is a restriction of nd() - nondeterministic delta.
var d = function(q, s) {
	nd(q, s, 0);
}


// Export the delta function to be used by tree
exports.nd = nd;





/////////////////////////
// Machine computation //
/////////////////////////

// Import the tape inputs
var input = require('./input.json').strings;
// Import the Tree
var t = require('./Tree.js');
// Construct a tree with the start state of machine
var m1;

// function to compute one input
var compute = function(i) {
	// init new tree
	m1 = new t.Tree(q0);
	console.log("Tape: " + input[i]);
	console.log("Machine computing:");
	console.log("===================");
	// Compute with the tape
	for (var j = 0; j < input[i].length; j++) {
		m1.nextStep(input[i][j]);
	}
	m1.printTree();

	// Check for accept states in the lowest level of tree = forefront
	var accepts = _.intersection(m1.forefront, F);
	if (accepts.length > 0 ) {
		console.log("Forefront: " + _.uniq(m1.forefront));
		console.log("Accepted states: " + accepts);
		console.log("======Accept.======\n");
	} else {
		console.log("======Reject.======\n");
	}

};

// Compute all input strings
var computeAll = function() {
	for (var i = 0; i < input.length; i++) {
		compute(i);
	};
};


// Run machine to compute all inputs
computeAll();



