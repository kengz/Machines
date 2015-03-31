// The class to convert a grammar into Chomsky Normal Form (CNF)

// Dependencies
var _ = require('../node_modules/underscore');
var fs = require('fs');

// Import the grammar to convert to Chomsky Normal Form
// var G = require('./CFG/CFG_G6.json');
var G = require('./CFG/CFG_7_1_3.json');

// The primary function to convert a grammar to CNF
function toCNF() {
	// removeUseless();
	console.log("1. elim useless");
	console.log(G);

	elimEp();
	console.log("2. elim epsilon");
	console.log(G);

	removeUnit();
	console.log("3. remove unit");
	console.log(G);

	convertForm();
	console.log("4. convert form");
	console.log(G);

	// write CNF to file
	// var outFile = './CFG/converted-CNF.json';
	// var outFile = './CFG/CNF_G6.json';
	var outFile = './CFG/CNF_7_1_3.json';
	fs.writeFileSync(outFile, JSON.stringify(G, null, 4));
}


// Calling primary function
toCNF();


// 0. remove useless rules
// 1. elim epsilon, replace uAv as uv, w/ uv can be empty
// 2. remove unit rule, short circuit.
// 3. convert all remainder, keep first, var rest

// Remove useless rules
function removeUseless() {
	// call: elim nongenerating, then nonreachables
	elimNonGen();
	elimNonReach();

	// for each key, recursively replace (nonself) 
	function subbing(akey, d) {
		var keys = _.keys(G);
		var depth = d+1;
		var newcpy = [];
		// for one key, its rules
		_.each(G[akey], function(r) {
			// ifisn't terminal, sub
			if (!isTerminal(r)) {
				// get first symbol in r
				var ind = r.search(/[A-Z]/);
				var key = r[ind];
				var re = new RegExp(key, 'g');
				// sub if can
				if (_.contains(keys, key)) {
					// sub all the rules
					_.each(G[key], function(rep) {
						// except self-reference and epsilon
						if (key != akey && rep != '/') {
							newcpy.push(r.replace(re, rep));
						};
					})
				}
				// push to newcpy if no sub
				else {
					newcpy.push(r);
				}
			}
			// or push if is terminal
			else {
				newcpy.push(r);
			}
		})
		if (depth < keys.length) {
			newcpy = _.union(newcpy, subbing(newcpy, depth));
		}
		return _.union(newcpy, G[akey]);
	}

	// helper: try to elim key if it's nongenerating
	function tryNonGen(key) {
		var ind = _.find(subbing(key, 0), function(r) {
			return isTerminal(r);
		});
		if (ind == undefined) {
			// delete symbol
			delete G[key];
			// delete all occurence
			_.each(_.keys(G), function(k) {
				var newcpy = [];
				// only those without key survive
				_.each(G[k], function(r) {
					if (! _.contains(r.split(""), key)) {
						newcpy.push(r);
					}
				})
				// reset G[k]
				G[k] = newcpy;
			})
		};
		// console.log('term is', ind);
	}

	// elim all nongen keys
	function elimNonGen() {
		_.each(_.without(_.keys(G), 'S'), function(key) {
			tryNonGen(key);
		})
	}

	// Then, eliminate all nonreachable symbols
	// by subbing from S height times
	function elimNonReach() {
		// get all the reachable things from S
		var reach = subbing(_.first(_.keys(G)), 0);
		// get all the single symbols/terminals by splitting reach
		var allSingles = _.map(reach, function(r) { 
			return r.split(""); 
		})
		// uniq copy without '/'
		allSingles = _.without(_.uniq(_.flatten(allSingles)), '/');

		// all the nonreachable symbols
		var nonReachSym = _.without(_.difference(_.keys(G), allSingles), 'S');
		_.each(nonReachSym, function(key) {
			// delete symbol
			delete G[key];
			// delete all occurences
			_.each(_.keys(G), function(k) {
				var newcpy = [];
				// only those without key survive
				_.each(G[k], function(r) {
					if (! _.contains(r.split(""), key)) {
						newcpy.push(r);
					}
				})
				// reset G[k]
				G[k] = newcpy;
			})
		})
	}

}


// Eliminate epsilon rules from G and update
function elimEp() {
	// the symbol that produces epsilon rule
	var eSym = undefined;

	// run while there's still epsilon rule in G (dyn updated)
	while (findNextEp() != undefined) {
		// change the object G, remove epsilon rule at eSym
		G[eSym] = _.without(G[eSym], '/');
		if (G[eSym].length == 0) { delete G[eSym]; };

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


// Remove unit rules
function removeUnit() {
	// the left symbol
	var uSym = undefined;
	// the right symbol it its rule
	var rSym = undefined;

	// run while there's still unit rule
	while (findNextUnit() != undefined) {
		// console.log(uSym, rSym);
		replaceUnit();
	}

	// find the next symbol producing unit rule
	function findNextUnit() {
		uSym = _.find(_.keys(G), function(key) {
			return _.find(G[key], function(r) {
				// if is singlet and uppercase
				var isUnit = r.length == 1 && isUpperCase(r);
				// set rSym too, or failsafe
				if (isUnit) rSym = r;
				else rSym = undefined;
				return isUnit;
			})
		})
		return uSym;
	}

	// replace rSym in uSym with rules of rSym \ rSym
	function replaceUnit() {
		// first elim rSym from uSym
		G[uSym] = _.without(G[uSym], rSym);
		// then in place of rSym, add its rules (without rSym itself)
		G[uSym] = _.union(G[uSym], _.without(G[rSym], rSym));

	}

}

function convertForm() {

	// replace non-lone terminal
	var hybridKey = undefined;
	var hybridRule = undefined;

	// Find the next hybridkey/rule, i.e. has mix of terminal n symbols
	function findNextHybrid() {
		hybridKey = _.find(_.keys(G), function(key) {
			return _.find(G[key], function(r) {
				var isHybrid = r.length > 1 && !isUpperCase(r);
				if (isHybrid) { hybridRule = r; }
				else hybridRule = undefined;
				return isHybrid;
			})
		})
		return hybridKey;
	}

	// Replace the hybrid: one terminal at a time, with its symbol from terminal rule (new or existing)
	function replaceHybrid() {
		// find the first terminal
		var ind = hybridRule.search(/[a-z]/);
		var term = hybridRule[ind];
		// get the key if a terminal rule exist for term
		var termKey = terminalRuleKey(term);
		// if none exists, 
		if (termKey == undefined) {
			// create one with new symbol
			var newSym = nextNewSymbol();
			G[newSym] = [ term ];
			// and replace throughout G term with newSym
			replaceAllTerm(term, newSym);
		}
		// if exist, replace term with its key
		else {
			// if already has key, replace with key
			replaceAllTerm(term, termKey);
		}
	}


	// replace all terminal char c with its symbol A throughout G's nonterminal rules
	function replaceAllTerm(c, A) {
		// for each key
		_.each(_.keys(G), function(key) {
			var newcpy = [];
			_.each(G[key], function(r) {
				// if is terminal, simply push
				if (isTerminalRule(r)) { newcpy.push(r); }
				else {
					// replace c with A. Create regex global
					var re = new RegExp(c, 'g');
					// replace r: find regex re, replace global c for A
					newcpy.push(r.replace(re, A));
				}
			})
			// finally reset G[key] to newcpy
			G[key] = newcpy;
		})
	}

	// the long rules ABCD, split to AE, E->BCD
	var longKey = undefined;
	var longRule = undefined;

	// now that all is capped/ terminal rule, 
	// find a long rule, i.e. len > 2
	function findNextLong() {
		longKey = _.find(_.keys(G), function(key) {
			return _.find(G[key], function(r) {
				// if is singlet and uppercase
				var isLong = r.length > 2 && isUpperCase(r);
				if (isLong) longRule = r;
				else longRule = undefined;
				return isLong;
			})
		})
		return longKey;
	}

	// replace the long rules with vars
	function replaceLong() {
		// get the tail for replacement
		var tail = longRule.slice(1);
		// get the key if singlet rule exists for tail rule
		var ruleKey = longRuleKey(tail);
		if (ruleKey == undefined) {
			// create new key if needed
			var newSym = nextNewSymbol();
			G[newSym] = [tail];
			replaceAllLong(tail, newSym);
		}
		else {
			// else use existing symbol for longrule
			replaceAllLong(tail, ruleKey);
		}
	}


	// Replace all long rules with its symbols in G
	function replaceAllLong(c, A) {
		// for each key
		_.each(_.keys(G), function(key) {
			var newcpy = [];
			_.each(G[key], function(r) {
				// if is terminal, simply push
				if (r.slice(1) != c) { newcpy.push(r); }
				else {
					var newr = r[0] + A;
					newcpy.push(newr);
				}
			})
			// finally reset G[key] to newcpy
			G[key] = newcpy;
		})
	}


	// Check if there exists a key only for long rule r
	function longRuleKey(r) {
		var longKey = undefined;
		longKey = _.find(_.keys(G), function(key) {
			return G[key].length == 1 && isUpperCase(G[key][0]) && G[key][0]	 == r;
		})
		// return the key that has the terminal rule only
		return longKey;
	}

	// replace the hybrid of terminal/symbol
	while (findNextHybrid() != undefined) {
		replaceHybrid();
	}
	// replace the long rules
	while (findNextLong() != undefined) {
		replaceLong();
	}

}


// helper to check upper/lower case
function isUpperCase(str) {
	if (str == str.toUpperCase())
		return true;
	else 
		return false;
}
// check if a str is terminal
function isTerminal(str) {
	if (str == str.toLowerCase())
		return true;
	else 
		return false;
}

// check if a a rule r is terminal, i.e. singler char, lower case a-z
function isTerminalRule(r) {
	return (r.length == 1 & r.charCodeAt(0) >= 'a'.charCodeAt(0) && r.charCodeAt(0) <= 'z'.charCodeAt(0));
}

// check if there exists a sole terminal rule C->c for terminal c in G
// need be C->c and nothing else
function terminalRuleKey(c) {
	// the key which has a terminal rule only
	var termKey = undefined;
	termKey = _.find(_.keys(G), function(key) {
		return G[key].length == 1 && isTerminalRule(G[key][0]) && G[key][0] == c;
	})
	// return the key that has the terminal rule only
	return termKey;
}


// Function to get next usable symbol, starts from A, B.., skips S
function nextNewSymbol() {
	// get the int char code of all symbols except 'S'
	var charCode = _.map(_.without(_.keys(G), 'S'), function(key) {
		return key.charCodeAt(0);
	})
	// next available letter is max + 1, or skip around
	var newCode = _.max(charCode) + 1;
	// if conflict with S, skip to next value
	if (newCode == 'S'.charCodeAt(0) ) { newCode++; }
	// return next new symbol, capped char
	return String.fromCharCode(newCode);
}


