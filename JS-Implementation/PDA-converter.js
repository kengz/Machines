// import underscore.js for set/list manipulation
var _ = require("underscore");

// var defM = require('./definitions/PDA-0n1n.json');
var defM = require('./definitions/PDA-6_1_1.json');
// var mac = require('./machine.js');
// var defM = mac.defM;

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
TnB = _.union(defM.S, defM.T);
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

	_.each(_.keys(TMd), function(state) {
		_.each(_.keys(TMd[state]), function(symbol) {
			// console.log(TMd[state][symbol]);
			// var foo = _.union(TMd[state][symbol]);
			TMd[state][symbol] = unique(TMd[state][symbol]);
			// TMd[state][symbol] = 0;
			// console.log(TMd[state][symbol]);
			// console.log(foo);
		})
	})


	defM.delta = TMd;
};



var unique = function(old) {
	var fresh = [];
	_.each(old, function(o) {
		var ouniq = true;
		_.each(fresh, function(f) {
			if (same(o, f)) ouniq = false;
		})
		if (ouniq) { fresh.push(o) };
	})
	return fresh;
}

var same = function(ar1, ar2) {
	var same = true;
	for (var i = 0; i < ar1.length; i++) {
		if (ar1[i] != ar2[i]) same = false;
	};
	return same;
}

// var addRule = function(q1, a, al, q2, be) {

// 	if (a == '/') {
// 		console.log('epsilon trans');
// 	};

//     // 1. Read and mark a, move right
//     initMap(q1, a);
//     var q1a = [q1, a].join(',');
//     var aMark = [a, '.'].join(',');
//     TMd[q1][a].push([q1a, aMark, 'R']);

//     // 2. Keep moving R till stack end
//     _.each(TnB, function(t) {
//     	initMap(q1a, t);
//         // for all tape symbol in T
//         TMd[q1a][t].push([q1a, t, 'R']);
//     });

//     // reaching stack end
//     // 3.1 pop al, push be: Scan end of tape, move left
//     // pop alpha
//     initMap(q1a, B);
//     var q2a = [q2, a].join(',');

//     if (al != '/') {
//     	// meet blank, move left to stack top
//     	var q1aB = [q1a, B].join(',');
//     	TMd[q1a][B].push([q1aB, B, 'L']);
//     	// if beta is pushed
//     	if (be != '/') {
//     		initMap(q1aB, al);
//     		TMd[q1aB][al].push([q2a, be, 'L']);
//     	}
//     	// if no beta is pushed
//     	else {
//     		initMap(q1aB, al);
//     		TMd[q1aB][al].push([q2a, B, 'L']);
//     	}
//     } 
//     // 3.2 no pop al, push be
//     else if (al != '/') {
//     	// meet end, straight push beta
//     	if (be != '/') {
//     		TMd[q1a][B].push([q2a, be, 'L']);
//     	}
//     	else {
//     		TMd[q1a][B].push([q2a, B, 'L']);
//     	}
//     }

//     // 4. Then keep moving left till marked input a.
//     _.each(TnB, function(t) {
//     	initMap(q2a, t);
//         // for all tape symbol in T
//         TMd[q2a][t].push([q2a, t, 'L']);
//     });
//     initMap(q2a, aMark);
//     TMd[q2a][aMark].push([q2, a, 'R']);

// }

console.log(TnB);
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
        // past all tape symbol in T
        TMd[q1a][t].push([q1a, t, 'R']);
    });

    // reaching stack end
    // 3.1 pop al, push be: Scan end of tape, move left
    // pop alpha
    initMap(q1a, B);
    var q2a = [q2, a, 'L'].join(',');

    if (al != '/') {
    	// meet blank, move left to stack top
    	var q1aB = [q1a, B].join(',');
    	TMd[q1a][B].push([q1aB, B, 'L']);

    	initMap(q1aB, al);
    	// if no beta is pushed, i.e. al to ep
    	if (be == '/') {
    		// replace al with blank
    		TMd[q1aB][al].push([q2a, B, 'L']);
    	}
    	// if remain same stack, i.e. al to al
    	else if (be.length == 1) {
    		// just push back al - no change
    		TMd[q1aB][al].push([q2a, al, 'L']);
    	}
    	else if (be.length == 2) {
    		var q1aBal = [q1aB, al].join(',');
    		// push back al, move right to B,
    		TMd[q1aB][al].push([q1aBal, al, 'R']);
    		initMap(q1aBal, B);
    		// push other symbol to stack top, then move left
    		TMd[q1aBal][B].push([q2a, be[0], 'L']);
    	}
    } 
    // al is never empty
    // 3.2 no pop al, push be
    // else if (al != '/') {
    // 	// meet end, straight push beta
    // 	if (be != '/') {
    // 		TMd[q1a][B].push([q2a, be, 'L']);
    // 	}
    // 	else {
    // 		TMd[q1a][B].push([q2a, B, 'L']);
    // 	}
    // }

    // 4. Then keep moving left till marked input a.
    _.each(TnB, function(t) {
    	initMap(q2a, t);
        // for all tape symbol in T
        TMd[q2a][t].push([q2a, t, 'L']);
    });
    // unmark a, move right, continue with next
    initMap(q2a, aMark);
    // TMd[q2a][aMark].push([q2, a, 'R']);
    // mark as processed = 'x'
    TMd[q2a][aMark].push([q2, 'x', 'R']);

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

// console.log(S);
// convertPDAtoTM();
// console.log(TMd);
// console.log(delta);


var run = function() {
	convertPDAtoTM();
	var outFile = './definitions/newPDA.json';
	var fs = require('fs');
	fs.writeFile(outFile, JSON.stringify(defM, null, 4), function(err) {
		if (err) {
			console.log(err);
		} else {
			console.log("JSON saved to " + outFile);
		}
	});
}


// var foo = "12";
// console.log(foo[1]);

run();

exports.run = run;

