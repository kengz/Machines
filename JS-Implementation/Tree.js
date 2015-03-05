// The Tree class for parallel machine computation. Used to create the computation history (configurations) of the machine.

// for array manipulation
var _ = require('underscore');
// Import the delta and definitions from machine
var delta = require('./machine.js');
var nd = delta.nd;
var defM = delta.defM;

// // The Node class constructor for Tree
// function Node(state, symbol) {
// 	this.state = state,
// 	this.symbol = symbol,
// 	this.Parent = null,
// 	this.depth = 0,
// 	this.epsilon = false,
// 	this.children = []
// }
// Node for TM
function Node(state, head, tape) {
	// the triple in a TM config
	this.state = state,
	this.head = head,
	this.tape = tape,
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
// Print an input and its resulting state
Node.prototype.printHere = function() {
	// this.indent();
	// console.log(this.symbol + ">");
	this.indent();
	// console.log(this.state);
	console.log(this.state, this.head, this.tape);
}
// Print the tree breadth-first
Node.prototype.preOrder = function() {
	this.printHere();
	if (!(this.isLeaf())) {
		for (var i = 0; i < this.children.length; i++) {
			this.children[i].preOrder();
		}
	}
}
// Set the parent of this node (Epsilon nodes' parents are its sibling)
Node.prototype.setParent = function(Parent) {
	this.Parent = Parent;
	this.depth = Parent.depth + 1;
}
// Add a child to this node due to an input
// Node.prototype.addChild = function(state, symbol) {
// 	// if this node is empty = dead, can't have children
// 	if (state == 'oe') { return null; }
// 	else {
// 		var child = new Node(state, symbol);
// 		child.setParent(this);
// 		this.children.push(child);
// 		return child;
// 	}
// }
// TM: Add a child to this node due to an input
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


// The Tree class constructor
// function Tree(state) {
// 	this.root = new Node(state, "/"),
// 	this.treeDepth = 0,
// 	forefront = []
// }

// TM: construct tree with root. reset machine, new tape = starting config
function Tree(state, tapeinput) {
	// the sentinel for halting compute()
	this.halter = undefined;
	// parse the tape input into array
	var tape = this.parseTape(tapeinput);
	// initialize tree
	this.root = new Node(state, 0, tape),
	this.treeDepth = 0,
	forefront = []
}

// parse the tape input into array
Tree.prototype.parseTape = function(tapeinput) {
	var realtape = [];
	// convert tape to array, then push each to realtape
	_.each(tapeinput, function(s) {
		realtape.push(s);
	});
	return realtape;
}

// Print the tree
Tree.prototype.printTree = function() {
	console.log("Printing Tree, config: <state> <head-pos> <tape>");
	this.root.preOrder();
}
// TM: compute, either till halting configs, or till maxStep
Tree.prototype.compute = function() {
	var maxStep = 10;
	
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
	// if stops when exceeds maxStep, then maybe is looping
	if (maxStep == 0) {
		console.log("maxSteps exceeded. TM instance probably doesn't halt");
	};
}

// Compute the next step
// Tree.prototype.nextStep = function(symbol) {
// 	this.forefront = [];
// 	this.expand(symbol, this.root);
// 	this.treeDepth++;
// 	return this.forefront;
// }
// Expand the tree: continue to compute, add children and epsilon children, until the end of computation
// Tree.prototype.expand = function(symbol, root) {
// 	// travel down till the right depth to expand
// 	if (root.depth === this.treeDepth) {
// 		var q = root.state;

// 		// for all non-deterministic options from delta, do
// 		for (var i = 0; i < nd(q, symbol).length; i++) {
// 			var c = nd(q, symbol, i);
// 			var child = root.addChild(c, symbol);

// 			// if child isn't dead state, add to forefront, expand epsilon
// 			if (child != null) {
// 				this.forefront.push(child.state);
// 				this.expandEChild(child);
// 			}
// 		}
// 	} 
// 	else {
// 		for (var i = 0; i < root.children.length; i++) {
// 			this.expand(symbol, root.children[i]);
// 		}
// 	}
// }
// the halt function called upon state: undefined = reject, or accept
Tree.prototype.halt = function(finalstate) {
	this.halter = finalstate;
}

// If DFA, TM-restriction = restriction of this
// write a control loop depending on type from defM,
// or a super method that calls writeMoveHead and other methods

// Moving head on the TM tape, handles boundary conditions
Tree.prototype.writeMoveHead = function(oritape, write, h, move) {
	// explicitly copy tape
	var tape = [];
	_.each(oritape, function(e) { tape.push(e)});
	// first write at h,
	tape[h] = write;
	// then move h: move right
	if (move == 'R') {
		// if reach tape boundary, add blank symbol
		if (tape[h+1] == undefined) {
			tape.push(defM.B);
		}
		// move right anyway
		h++;
	}
	// else if move left
	else if (move == 'L') {
		// if currently at leftmost, add blank symbol to front
		if (h == 0)
			tape.unshift(defM.B);
		// else can move to left
		else
			h--;
	}
	// else {}
	return {
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
			// get the triple {state, write, move}
			var c = nd(q, s, i);
			// get next state
			var r = c.state;
			// copy, write to tape, then move head;
			var moved = this.writeMoveHead(rt, c.write, h, c.move);
			h = moved.head; t = moved.tape;
			
			// create a child with new state, moved head, new tape
			var child = root.addChild(r, h, t);

			// Then check for halting: reject (c=='oe' dead),
			if (c == 'oe') {
				this.halt("reject");
				break;
			} 
			// or accept state
			else if ( _.contains(defM.F, r) ) {
				// add the accepting state to forefront
				this.forefront.push(child.state);
				this.halt(r);
				break;
			}

			// None halting: continue to expand epsilon
			// if child isn't dead state, add to forefront, expand epsilon
			if (child != null) {
				this.forefront.push(child.state);
				this.expandEChild(child);
			}

		}
	} 
	// recursive call till the correct depth
	else {
		for (var i = 0; i < root.children.length; i++) {
			this.expand(root.children[i]);
		}
	}
}
// TM: Expand the epsilon parallel branches: Add epsilon children
Tree.prototype.expandEChild = function(child) {
	var root = child.Parent;

	// config triple
	var q = child.state;
	var h = child.head;
	var rt = child.tape;
	// read tape
	var s = child.tape[h];

	// if has epsilon transition, then expand
	if (! (nd(q, "/") == 'oe' )) {
		for (var i = 0; i < nd(q, "/").length; i++) {
			// The triple {state, write, move}
			var c = nd(q, "/", i);
			// get next state
			var r = c.state;
			// copy, write to tape, then move head;
			var moved = this.writeMoveHead(rt, c.write, h, c.move);
			t = moved.tape; h = moved.head;

			// add to tree, push state to forefront
			var eChild = root.addChild(r, h, t);
			this.forefront.push(eChild.state);
			this.expandEChild(eChild);
		}
	}
}
// // Expand the epsilon parallel branch: Add epsilon children
// Tree.prototype.expandEChild = function(child) {
// 	var root = child.Parent;
// 	var q = child.state;
// 	if (! (nd(q, "/") == 'oe')) {
// 		for (var i = 0; i < nd(q, "/").length; i++) {
// 			var c = nd(q, "/", i);
// 			var eChild = root.addChild(c, "/");
// 			this.forefront.push(eChild.state);
// 			this.expandEChild(eChild);
// 		}
// 	}
// }
// Print all states resulting from the last computation step
Tree.prototype.printForefront = function() {
	console.log("Printing forefront states");
	for (var i = 0; i < this.forefront.length; i++) {
		console.log(this.forefront[i].state);
	}
}




// Export the Tree module
exports.Tree = Tree;