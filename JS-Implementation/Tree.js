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

// TM: compute, either till halting configs, or till maxStep
Tree.prototype.compute = function() {
	// The max steps before halting
	var maxStep = 50;
	
	// either loop till maxStep, or terminate in undefined = reject, or accept
	while (maxStep > 0) {
		maxStep--;
		// reset forefront and 
		this.forefront = [];
		// expand next depth of tree, calls halt() if reaches halting config
		this.oneStep(this.root);
		this.treeDepth++;
		// console.log("halter is: ", this.halter);

		// if found halting state, halt() called in expand(), break loop
		if ( this.halter != undefined ) {
			console.log("Computation halts: ", this.halter);
			break;
		};
		// else keep looping till limit is reached
	}

	// if stops when exceeds maxStep, then TM might be looping
	if (maxStep == 0) {
		console.log("maxSteps exceeded. TM instance probably doesn't halt");
	};
}



Tree.prototype.oneStep = function(node) {
	// travel down till the right depth to expand from the node
	if (node.depth === this.treeDepth) {
		// old state and head location
		var q = node.state;
		var h = node.head;

		// 1. Read from tape
		var s = this.Read(node);
		// If config yields valid delta, the add children by non-determinism
		// NOT executed if nd(q,s) is invalid – halt machine below.
		for (var i = 0; i < nd(q,s).length; i++) {
			// get the output triple {state, write, move}
			var ndOut = nd(q,s,i);

			// 2. Write
			var tape = this.Write(node, ndOut);
			// 3. Move. Last step: return config
			var config = this.Move(node, ndOut, tape);

			// Add child with new config to node
			this.Expand(node, config);

		};
		// 4. Finally, halt at this node if necessary
		this.TryHalt(q,s,h);
	}

	// recursive call till the correct depth
	else {
		for (var i = 0; i < node.children.length; i++) {
			this.oneStep(node.children[i]);
		}
	}
}



// 1. Read: called once even in non-determinism
Tree.prototype.Read = function(node) {
	// read tape symbol at head
	return node.tape[node.head];
}
// for PDA, simply add a write Stack method, and read from stack too

// 2. Write: can be called as many times as needed in non-determinism
Tree.prototype.Write = function(node, ndOut) {
	// explicitly copy tape
	var tape = [];
	_.each(node.tape, function(e) { tape.push(e) });
	
	var h = node.head;
	// if is epsilon, reverse one-step
	if (node.epsilon)
		h--;
		
	// then write to it at head
	tape[h] = ndOut.write;
	// return the new tape
	return tape;
}
// 3. Move: after writing on the new tape, expand it if needed, and move head
Tree.prototype.Move = function(node, ndOut, tape) {
	// the old head position
	var h = node.head;
	// if is epsilon, reverse one-step
	if (node.epsilon)
		h--;
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

	// since is the last step: return the config
	return {
		// the next state
		state: ndOut.state,
		// the (expanded) tape and new head
		tape: tape,
		head: h
	}
}

// 4. Halt the TM if necessary
Tree.prototype.TryHalt = function(q,s,h) {
	// TM halting:
	if (this.Mclass == 'TM') {
		// If this node outputs deadstate 'oe', reject 
		if (nd(q,s).state == 'oe') {
			this.halt("reject");
		} 
		// or in the forloop above, forefront has accept state, accept
		else if ( !_.isEmpty( _.intersection(defM.F, this.forefront) ) ) {
			this.halt("accept");
		}
	};

	// DFA/NFA halting: after the last tape symbol
	if (this.Mclass == 'DFA' || this.Mclass == 'NFA') {
		// if header moves past the last tape symbol
		if ( h == this.tape.length ) {
			this.halt("stop");
		}
	};
}

// Halt the TM with the result
Tree.prototype.halt = function(result) {
	this.halter = result;
}




// Add a new child with config to node, along with epsilon-expansions
Tree.prototype.Expand = function(node, config) {
	var r = config.state; var h = config.head; var t = config.tape;
	var child = node.addChild(r, h, t);
	
	// If child isn't dead state, add to forefront
	if (child != null) {
		this.forefront.push(child.state);
		// An epsilon move: expand parallel in tree
		this.expandEChild(child);
	}
}

// Not really needed by TM: Just the NFA:
// Expand the epsilon parallel branches: Add epsilon children
Tree.prototype.expandEChild = function(child) {
	// Go back to child's parent (e-child will share the same tree parent)
	var root = child.Parent;

	// old state and head location
	var q = child.state;
	var h = child.head;

	// 1. Read from tape
	var s = this.Read(child);

	// if child has epsilon transition, 
	if ( (nd(q, "/").state != 'oe' )) {
		// then expand
		for (var i = 0; i < nd(q, "/").length; i++) {
			// The output triple {state, write, move}
			var ndOut = nd(q, "/", i);
			// mark that this child has an epsilon edge: h-- in Write and Move
			child.skip();
			// 2. Write: with h = h-1 (don't go to next tape symbol yet)
			var tape = this.Write(child, ndOut);
			// 3. Move. With h = h-1. Last step: return config
			var config = this.Move(child, ndOut, tape);

			// head offset to h-1 (don't go down the tree)
			var r = config.state; var h = config.head; var t = config.tape;
			// add to same parent, push state to forefront
			var eChild = root.addChild(r, h, t);
			this.forefront.push(eChild.state);

			// recurse as needed
			this.expandEChild(eChild);
		}
	}
}


// Print the tree
Tree.prototype.printTree = function() {
	// Tell format for TM
	if (this.Mclass == 'TM') {
		console.log("Printing Tree, config: <state> <head-pos> <tape>\n");
	}
	// Format for DFA/NFA
	else if (this.Mclass == 'DFA' || this.Mclass == "NFA") {
		console.log("Printing Tree: inputsymbol> \n result-state\n");
	};
	// print according to machine class
	this.root.preOrder( this.Mclass );
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

