// The class that creates a minimum DFA out from the DFA Table of Distinguishabilities.

// import underscore.js for set/list manipulation
var _ = require("underscore");

// import from the constructor in machine.js
var dT = require('./DFA-distin-table.js');
var distinTable = dT.distinTable;



//////////////////////
// DFA Minimization //
//////////////////////

// check if the pair in distinTable is not-distin, = 0
var isSame = function(e) {
    // not distin
    return e[1] === 0;
};

// convert map to array
var asArray = _.pairs(distinTable);
// all that are the same, i.e. val = 0
var same = _.filter(asArray, isSame);
// the complement, all with val = 1
var sameC = _.difference(asArray, same);

// flatten and remove val, leave only pair
same = _.flatten(same);
var sameP = _.without(same, 0);

// Declare the partition of the states by distinTable
// will consist of blocks, i.e arrays within this array
var partition = [];

// Function to assign sameP into partitions
var partSame = function(e) {
    var index = _.findIndex(
        // return the index if a block in partition
        partition,
        function(block) {
            // partition contains any of the pair
            if (_.contains(block, e[0] || e[2])) {
                // true to run the findIndex
                return true;
            }
        }
    );
    // console.log("The index: " + index);

    // if exist, update the block with union
    if (index > -1) {
        // console.log("excecute union");
        partition[index] = _.union(partition[index], [e[0], e[2]]);
        // console.log(partition[index]);
    }
    // else, create a new block in partition
    else {
        partition.push([e[0], e[2]]);
    }
}

// take all that are distinguishable
var partSameC = function(e) {
    // each pair (take the letter)
    _.each([e[0][0], e[0][2]], function(f) {
        // console.log("Extract " + f);
        // if they've a block already, skip
        if (_.contains(_.flatten(partition), f)) {
            // console.log("has appeared");
        }
        // else, add as a new distinct block!
        else {
            partition.push([f]);
            // console.log("New thing!");
        }
    })
};


// partition all by distinTable; run both functions above
var part = function() {
    _.each(sameP, partSame);
    _.each(sameC, partSameC);
};



///////////////////////////////////
// Construction of Minimized DFA //
///////////////////////////////////

// import from the constructor in machine.js
var machine = require('./machine.js');
var defM = machine.defM;

// construct a new minimized DFA by changing a copy of defM and saving it
var constructMinDFA = function() {
    // for each partition block,
    _.each(partition, function(p) {
        for (var i = 1; i < p.length; i++) {
            // remove all the redundant states
            defM.Q = _.without(defM.Q, p[i]);
            defM.F = _.without(defM.F, p[i]);
            defM.delta = _.omit(defM.delta, p[i]);

            // change the innermost result state
            var distinStates = _.keys(defM.delta);
            // for each remaining distinct states in delta
            _.each(distinStates, function(state) {
                // for each input symbol
                _.each(defM.S, function(symbol) {
                    // index of the partition block the output state is in
                    var index = _.findIndex(
                        partition,
                        function(block) {
                            // if block contains the output state
                            if (_.contains(block, defM.delta[state][symbol][0])) {
                                // true to run the findIndex
                                return true;
                            }
                        }
                    );
                    // get first state in the block
                    if (index > -1) {
                        // replace the output state with it
                        defM.delta[state][symbol] = [partition[index][0]];
                    }
                });
            });
        };
    });
};





// the main function, runs all functions above
part();
console.log("The partitioned states are: ");
console.log(partition);

// the main function, run all above
constructMinDFA();

var outFile = './Definitions/minDFA.json';
// var outFile = './Definitions/minDFA_4_4_1.json';
// var outFile = './Definitions/minDFA_3_2_1.json';
var fs = require('fs');
fs.writeFile(outFile, JSON.stringify(defM, null, 4), function(err) {
    if (err) {
        console.log(err);
    } else {
        console.log("JSON saved to " + outFile);
    }
});
