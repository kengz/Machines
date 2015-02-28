// The Tree class for parallel machine computation. Used to create the computation history (configurations) of the machine.

// Import the delta from machine
var delta = require('./machine.js');
var nd = delta.nd;

// The Node class constructor for Tree
function Node(state, symbol) {
	this.state = state,
	this.symbol = symbol,
	this.Parent = null,
	this.depth = 0,
	this.epsilon = false,
	this.children = []
}

// Return the size of the tree under this node
Node.prototype.sizeOf = function() {
	var s = _.size(this.children);
	_.each(this.children, function(){ s += sizeOf();} );
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
	this.indent();
	console.log(this.symbol + ">");
	this.indent();
	console.log(this.state);
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
Node.prototype.addChild = function(state, symbol) {
	if (state == 'oe') { return null; }
	else {
		var child = new Node(state, symbol);
		child.setParent(this);
		this.children.push(child);
		return child;
	}
}
// Node.prototype.addSibling = function(state) {
// 	if (state == "oe") { return null; }
// 	else {
// 		var par = this.Parent;
// 		var sib = par.addChild(state, "/");
// 		sib.setParent(this);
// 		sib.skip();
// 		return sib;
// 	}
// }
// Label a node as an epsilon node
Node.prototype.skip = function() { return this.epsilon = true; }


// The Tree class constructor
function Tree(state) {
	this.root = new Node(state, "/"),
	this.treeDepth = 0,
	forefront = []
}

// Print the tree
Tree.prototype.printTree = function() {
	this.root.preOrder();
}
// Compute the next step
Tree.prototype.nextStep = function(symbol) {
	this.forefront = [];
	this.expand(symbol, this.root);
	this.treeDepth++;
	return this.forefront;
}
// Expand the tree: continue to compute, add children and epsilon children, until the end of computation
Tree.prototype.expand = function(symbol, root) {
	if (root.depth === this.treeDepth) {
		var q = root.state;
		for (var i = 0; i < nd(q, symbol).length; i++) {
			var c = nd(q, symbol, i);
			var child = root.addChild(c, symbol);
			if (child != null) {
				this.forefront.push(child.state);
				this.expandEChild(child);
			}
		}
	} 
	else {
		for (var i = 0; i < root.children.length; i++) {
			this.expand(symbol, root.children[i]);
		}
	}
}
// Expand the epsilon parallel branch: Add epsilon children
Tree.prototype.expandEChild = function(child) {
	var root = child.Parent;
	var q = child.state;
	if (! (nd(q, "/") == 'oe')) {
		for (var i = 0; i < nd(q, "/").length; i++) {
			var c = nd(q, "/", i);
			var eChild = root.addChild(c, "/");
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