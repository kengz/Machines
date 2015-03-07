// The Tree class for parallel machine computation. Used to create the computation history (configurations) of the machine.

// for array manipulation
var _ = require('underscore');
// Import the delta and definitions from machine
var delta = require('./machine.js');
var nd = delta.nd;
var defM = delta.defM;


////////////////////
// The Node class //
////////////////////
function Node(state, head, tape) {
	// the triple in a TM config
	this.state = state,
	this.head = head,
	this.tape = tape,
	// other fields for Tree
	this.Parent = null,
	this.depth = 0,
	this.epsilon = false,
	this.children = []
}

// Return the size of the tree under this node
Node.prototype.sizeOf = function() {
	var s = _.size(this.children);
	_.each(this.children, function(){ s += sizeOf(); } );
	return s;
}
// Check if this node is a leaf
Node.prototype.isLeaf = function() {
	return !((this.children.length) > 0);
}
// Indentation for printing out the tree depth
Node.prototype.indent = function() {
	var count = this.depth;
	while (count > 0) {
		count--;
		process.stdout.write("  ");
	}
}
// Print an input and its resulting state, with Mclass = machine class
Node.prototype.printHere = function(Mclass) {
	// format for TM: config triple
	if (Mclass == 'TM') {
		this.indent();
		console.log(this.state, this.head, this.tape);
	}

	// format for DFA/NFA
	else if (Mclass == 'DFA' || Mclass == "NFA") {
		// print tape symbol for non-starting states
		if (this.head > 0) {
			this.indent();
			console.log(this.tape[this.head-1] + ">");
		};
		// then the state
		this.indent();
		console.log(this.state);
	} 

}
// Print the tree breadth-first. Mclass = machine class, to choose format
Node.prototype.preOrder = function(Mclass) {
	this.printHere(Mclass);
	if (!(this.isLeaf())) {
		for (var i = 0; i < this.children.length; i++) {
			this.children[i].preOrder(Mclass);
		}
	}
}
// Set the parent of this node (Epsilon nodes' parents are its sibling)
Node.prototype.setParent = function(Parent) {
	this.Parent = Parent;
	this.depth = Parent.depth + 1;
}
// Add a child to this node due to an input
Node.prototype.addChild = function(state, head, tape) {
	// if this node is empty = dead, can't have children
	if (state == 'oe') { return null; }
	// else proceeed normally
	else {
		var child = new Node(state, head, tape);
		child.setParent(this);
		this.children.push(child);
		return child;
	}
}
// Label a node as an epsilon node
Node.prototype.skip = function() { return this.epsilon = true; }




////////////////////
// The Tree class //
////////////////////

// Construct tree with root. reset machine, new tape = starting config
function Tree(Mclass, state, tapeinput) {
	// The machine class: TM or DFA or etc
	this.Mclass = Mclass;
	console.log("Constructed machine: ", Mclass);

	// the sentinel for halting compute()
	this.halter = undefined;

	// parse the tape input into array
	this.tape = this.parseTape(tapeinput);

	// initialize tree
	this.root = new Node(state, 0, this.tape),
	this.treeDepth = 0,
	forefront = []
}

// parse the tape input into array
Tree.prototype.parseTape = function(tapeinput) {
	var tape = [];
	// convert tape to array, then push each to realtape
	_.each(tapeinput, function(s) {
		tape.push(s);
	});
	return tape;
}

// Print the tree
Tree.prototype.printTree = function() {
	// Tell format for TM
	if (this.Mclass == 'TM') {
		console.log("Printing Tree, config: <state> <head-pos> <tape>");
	}
	// Format for DFA/NFA
	else if (this.Mclass == 'DFA' || this.Mclass == "NFA") {
		console.log("Printing Tree: inputsymbol> \n result-state");
	};
	// print according to machine class
	this.root.preOrder( this.Mclass );
}
// TM: compute, either till halting configs, or till maxStep
Tree.prototype.compute = function() {
	// The max steps before halting
	var maxStep = 30;
	
	// either loop till maxStep, or terminate in undefined = reject, or accept
	while (maxStep > 0) {
		maxStep--;
		// reset forefront and 
		this.forefront = [];
		// expand next depth of tree, calls halt() if reaches halting config
		this.expand(this.root);
		this.treeDepth++;
		// console.log("halter is: ", this.halter);

		// if found halting state, halt() called in expand(), break loop
		if ( this.halter != undefined ) {
			console.log("Computation halts.");
			break;
		};
		// else keep looping till limit is reached
	}

	// if stops when exceeds maxStep, then TM might be looping
	if (maxStep == 0) {
		console.log("maxSteps exceeded. TM instance probably doesn't halt");
	};
}
// the halt function called upon state: undefined = reject, or accept
Tree.prototype.halt = function(finalstate) {
	this.halter = finalstate;
}

Tree.prototype.Read = function(node) {
	// at the right depth
	var q = node.state;

	// read state, read stack
	var s = node.tape[h];
	// get delta (whole array)
	// var ndOut = nd(q, s);
	// if Mclass == 'PDA', read stack by popping
	return nd(q, s);
}
Tree.prototype.Write = function(node) {
	// get head and tape, ready to write
	var h = node.head;
	var rt = node.tape;
	// copy tape
	var tape = [];
	_.each(oritape, function(e) { tape.push(e)});

	// careful, is an array
	var ndOut = Read(node);

	var state = ndOut.state;
	if (this.Mclass == 'TM') {
		tape[h] = ndOut.write;
	};
	
	return {
		state: state,
		tape: tape,
		head: h
	}
}
Tree.prototype.Move = function() {

}






// If DFA, TM-restriction = restriction of this
// write a control loop depending on type from defM,
// or a super method that calls writeMoveHead and other methods
Tree.prototype.GenMove = function() {
	switch (this.Mclass) {
		case 'TM': {
			console.log("This is a TM");
			break;
		}
		case 'DFA': {
			console.log("This is a DFA");
			break;
		}
		default: break;
	}
}






// TM move: Moves head on the TM tape, handles boundary conditions
Tree.prototype.writeMoveHead = function(oritape, h, ndOut) {
	// the state
	var state = ndOut.state;

	// explicitly copy tape (required)
	var tape = [];
	_.each(oritape, function(e) { tape.push(e)});

	// first write at h,
	tape[h] = ndOut.write;
	
	// then move h: 
	// move right
	if (ndOut.move == 'R') {
		// if reach tape boundary, add blank symbol
		if (tape[h+1] == undefined) {
			tape.push(defM.B);
		}
		// move right anyway
		h++;
	}
	// or move left
	else if (ndOut.move == 'L') {
		// if currently at leftmost, add blank symbol to front
		if (h == 0)
			tape.unshift(defM.B);
		// else can move to left
		else
			h--;
	}
	
	// return config
	return {
		state: state,
		tape: tape,
		head: h
	}
}
// TM: Expand the tree: continue to compute, add children and epsilon children, until the end of computation
Tree.prototype.expand = function(root) {
	// travel down till the right depth to expand from this node as root
	if (root.depth === this.treeDepth) {

		// config triple for root.
		var q = root.state;
		var h = root.head;
		var rt = root.tape;
		// read tape
		var s = root.tape[h];

		// for all non-deterministic options from delta, do
		for (var i = 0; i < nd(q, s).length; i++) {
			// reset the head: required since will be altered
			h = root.head;
			// get the output triple {state, write, move}
			var ndOut = nd(q, s, i);

			// copy, write to tape, then move head;
			var next = this.writeMoveHead(rt, h, ndOut);
			var r = next.state; var h = next.head; var t = next.tape;
			
			// create a child with new state, moved head, new tape
			var child = root.addChild(r, h, t);

			// TM halting:
			if (this.Mclass == 'TM') {
				// Then check for halting: reject (c=='oe' dead),
				if (ndOut.state == 'oe') {
					this.halt("reject");
					break;
				} 
				// or accept state
				else if ( _.contains(defM.F, r) ) {
					// add the accepting state to forefront and halt
					this.forefront.push(child.state);
					this.halt(r);
					break;
				}
			};
			
			// None-halting: if child isn't dead state, add to forefront
			if (child != null) {
				this.forefront.push(child.state);
				// A e-NFA-only move: expand parallel epsilon children
				this.expandEChild(child);
			}

		}

		// DFA/NFA halting: after the last tape symbol
		if (this.Mclass == 'DFA' || this.Mclass == 'NFA') {
			if ( h == this.tape.length ) {
				this.halt("stop");
			}
		};

	} 

	// recursive call till the correct depth
	else {
		for (var i = 0; i < root.children.length; i++) {
			this.expand(root.children[i]);
		}
	}
}

// Not really needed by TM: Just the NFA:
// Expand the epsilon parallel branches: Add epsilon children
Tree.prototype.expandEChild = function(child) {
	var root = child.Parent;

	// config triple
	var q = child.state;
	var h = child.head;
	var rt = child.tape;

	// if has epsilon transition, then expand
	if (! (nd(q, "/").state == 'oe' )) {
		for (var i = 0; i < nd(q, "/").length; i++) {
			// The output triple {state, write, move}
			var ndOut = nd(q, "/", i);
			// copy, write to tape, then move head;

			// move with head offset to h-1 (don't go down the tree)
			var next = this.writeMoveHead(rt, h-1, ndOut);
			var r = next.state; var h = next.head; var t = next.tape;

			// add to tree, push state to forefront
			var eChild = root.addChild(r, h, t);
			this.forefront.push(eChild.state);
			this.expandEChild(eChild);
		}
	}
}
// Print all states resulting from the last computation step
Tree.prototype.printForefront = function() {
	console.log("Printing forefront states");
	for (var i = 0; i < this.forefront.length; i++) {
		console.log(this.forefront[i].state);
	}
}



// Export the Tree module
exports.Tree = Tree;

