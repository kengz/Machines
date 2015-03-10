// import underscore.js for set/list manipulation
var _ = require("underscore");

var defM = require('./definitions/PDA-0n1n.json');


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
// the input and stack symbols, without B
TnB = _.union(S, defM.T);
// The blank symbol, in T
B = defM.B == undefined ? '_' : defM.B ;
// The start state
q0 = defM.q0;
// The delta transition function
delta = defM.delta;



// Convert DFA into TM, copy; don't override
// construct a new minimized DFA by changing a copy of defM and saving it
var TMd = {};

var convertPDAtoTM = function() {
	_.each(_.keys(delta), function(state) {
        // console.log("Input state", state);
        _.each(_.keys(delta[state]), function(symbol) {
            // console.log("Input symbol", symbol);
            _.each(_.keys(delta[state][symbol]), function(stack) {
                // console.log("Read stack", stack);
                // console.log("Read stack", delta[state][symbol][stack]);
                _.each(delta[state][symbol][stack], function(out) {

                	var q1, a, al, q2, be;
                	q1 = state; a = symbol; al = stack;
                	q2 = out[0]; be = out[1];
                	console.log("parsed: ", q1, a, al, q2, be);

                	addRule(q1, a, al, q2, be);

                })
            });
        });
    });
    defM.delta = TMd;
};


var addRule = function(q1, a, al, q2, be) {

	if (a == '/') {
		console.log('epsilon trans');
	};

    // 1. Read and mark a, move right
    initMap(q1, a);
    var q1a = [q1, a].join(',');
    var aMark = [a, '.'].join(',');
    TMd[q1][a].push([q1a, aMark, 'R']);

    // 2. Keep moving R till stack end
    _.each(TnB, function(t) {
    	initMap(q1a, t);
        // for all tape symbol in T
        TMd[q1a][t].push([q1a, t, 'R']);
    });

    // 3.1 pop al, push be: Scan end of tape, move left
    // pop alpha
    // 
    initMap(q1a, B);
    var q2a = [q2, a].join(',');
    if (al != '/') {
    	var q1aB = [q1a, B].join(',');
    	// meet blank, move left to stack top
    	TMd[q1a][B].push([q1aB, B, 'L']);
    	// if beta is pushed
    	if (be != '/') {
    		initMap(q1aB, al);
    		TMd[q1aB][al].push([q2a, be, 'L']);
    	}
    	// if no beta is pushed
    	else {
    		initMap(q1aB, al);
    		TMd[q1aB][al].push([q2a, B, 'L']);
    	}
    } 
    // 3.2 no pop al, push be
    else if (al != '/') {
    	// meet end, straight push beta
    	if (be != '/') {
    		TMd[q1a][B].push([q2a, be, 'L']);
    	}
    	else {
    		TMd[q1a][B].push([q2a, B, 'L']);
    	}
    }

    // 4. Then keep moving left till marked input a.
    _.each(TnB, function(t) {
    	initMap(q2a, t);
        // for all tape symbol in T
        TMd[q2a][t].push([q2a, t, 'L']);
    });
    initMap(q2a, aMark);
    TMd[q2a][aMark].push([q2, a, 'R']);

}

var initMap = function(q1, a) {
	if (TMd[q1] == undefined) {
		TMd[q1] = {};
        // console.log("Added state");
    };
    if (TMd[q1][a] == undefined) {
    	TMd[q1][a] = [];
        // console.log("init output array");
    };
}

console.log(S);
convertPDAtoTM();
console.log(TMd);
// console.log(delta);


var outFile = './definitions/newPDA.json';
var fs = require('fs');
fs.writeFile(outFile, JSON.stringify(defM, null, 4), function(err) {
    if (err) {
        console.log(err);
    } else {
        console.log("JSON saved to " + outFile);
    }
});

// var q1 = "q1";
// var a = "0";
// var tmp = [q1,a].join(',');
// // (','+=a);
// console.log(tmp);
// console.log(tmp.split(','));
// console.log(q1+=a);
