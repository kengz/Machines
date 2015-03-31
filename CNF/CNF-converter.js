var _ = require('../node_modules/underscore');
var G = require('./CFG/CFG_G6.json');

console.log(G);

// 0. remove useless rules
// 1.elim epsilon, replace uAv as uv, w/ uv can be empty
// 2. unit rule, short circuit.
// 3. convert all remainder, keep first, var rest

function elimEp() {
	// the symbol that produces epsilon rule
	var eSym = undefined;

	// run while there's still epsilon rule
	while (findNextEp() != undefined) {
		// change the object G, remove epsilon rule at eSym
		G[eSym] = _.without(G[eSym], '/');

		// for each key in G
		_.each(_.keys(G), function(key) {
			// call the helper function
			var eReplaced = stripOne(G[key]);
			// replace the rule object
			G[key] = _.union(G[key], eReplaced);
		})

	};

	// find the next symbol for epsilon rule in the updated G
	// update the sSym
	function findNextEp() {
		// var eSym = undefined;
		eSym = _.find(_.keys(G), function(key) {
			return _.find(G[key], function(r) {
				return (r == '/');
			})
		})
		return eSym;
	}

	// strips one occurence of eSym from each rule and add to wave
	// e.g. ASA, strip A -> AS, SA, then recurse this wave -> S
	function stripOne(rulesOfOneKey) {
		// a new wave of epsilon replacements for eSym
		var wave = [];
		// for each rule
		_.each(rulesOfOneKey, function(r) {
			var indices = [];
			// check if eSym occurs
			for (var i = 0; i < r.length; i++) {
				// log the indices
				if (r[i] == eSym) { indices.push(i); };
			};
			// say, r = ASA, wanna elim A
			// for each index of occurence of eSym,
			_.each(indices, function(i) {
				// slice and rejoin, without letter at index i of r
				var newr = r.slice(0,i) + r.slice(i+1);
				// if results in empty symbol, use '/' instead of ''
				if (newr == '') { newr = '/'; }
				// add to wave
				wave.push(newr);
			})
			// recurse for wave before appending			
		})
		// recurse with the wave while it's not empty, i.e. further reduce
		if (wave.length != 0) {
			wave = _.union(wave, stripOne(wave));
		}
		// finally return
		return wave;
	}

}

elimEp();
console.log(G);
var r = 'ASDFG';
var r1 = r.slice(0, 1) + r.slice(1+1);
console.log("slice joined", r1);
// var ie = 'ASD'.indexOf('S');
// var front = 'ASD'.slice(0,ie);
// var end = 'ASD'.slice(ie+1);
// console.log("joined", front+end);
// console.log('ASD'.slice(0,ie));
// console.log('ASD'.slice(ie+1));