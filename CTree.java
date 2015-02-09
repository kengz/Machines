/**
 * @author Wah Loon Keng
 */

import java.util.*;

public class CTree {
	private Node root;
	private int treeDepth;
	private Delta d;
	private ArrayList<Node> forefront;

	public CTree(Delta d, char state) { 
		this.d = d;
		this.root = new Node(state); 
		this.treeDepth = 0;
		forefront = new ArrayList<Node>();
	}

	public int height() { return treeDepth; }

	public int size() { return Node.size(root); }

	public Node getRoot() { return root; }


	public void printTree() { root.preOrder(); }


	public ArrayList<Character> getForefrontWave() {
		return forefrontToState();
	}
	protected ArrayList<Character> forefrontToState() {
		ArrayList<Character> wave = new ArrayList<Character>();
		for (Node q : forefront) {
			wave.add(q.getState());
		}
		return wave;
	}
	// call from the final expansion??
	public ArrayList<Node> nextInput(char symbol) {
		forefront = new ArrayList<Node>();
		expand(symbol, root);
		treeDepth++;
		return forefront;
	}


	// preOrder traverse till leaf, check depth if proper, fetch delta and add child/sibling
	protected void expand(char symbol, Node root) {
		// if at right depth = position of symbol in input , then expand
		if (root.getDepth() == treeDepth) {
			char oldState = root.getState();
			ArrayList<String> arr = d.getArr(oldState, symbol);
			for (String output : arr) {
				// get each output from this state and symbol
				char outState = output.charAt(0);
				// add child, and expand epsilon from the child
				Node child = root.addChild(outState, symbol);
				// add child to current level of forefront
				if (child != null) {
					forefront.add(child);
					expandEChild(child);
				}
			}
		}
		else {
			// for each child of the children, recurse
			for (Node c : root.getChildren()) {
				expand(symbol, c);
			}
		}
	}

	

	/** From the root, expand a child by epsilon */
	protected void expandEChild(Node child) {
		// get state of child, check if needs epsilon expansion
		Node root = child.getParent();
		char state = child.getState();
		if (!(d.isEmpty(state, '/'))) {
			ArrayList<String> arr = d.getArr(state, '/');
			// get array of outputs, for each:
			for (String output : arr) {
				char outState = output.charAt(0);
				Node eChild = root.addChild(outState, '/');
				// add expanded child to current level of forefront
				forefront.add(eChild);
				expandEChild(eChild);
			}
		}
	}






}


class Node {
	private Node parent;
	// set parent when add children via this
	private LinkedList<Node> children;
	private int depth;
	private boolean epsilon;
	// if is epsilon, parent is the sibling

	private char state, symbol;
	// extra for TM, store comp history: head contains position and tape content
	private Head head;

	/** 
	 * Default DFA node constructor for root. Set only state; others to default.
	 */
	Node(char state) {
		children = new LinkedList<Node>();
		parent = null;
		depth = 0;
		this.state = state;
		this.symbol = '\u0000';
		this.epsilon = false;
	}
	/** 
	 * DFA node constructor for non-root node.
	 * Calls the default constructor.
	 * @param state The state of this node.
	 * @param symbol = symbol, i.e. the symbol read from parent to give this node.
	 */
	Node(char state, char symbol) {
		this(state);
		this.symbol = symbol;
	}

	public static int size(Node c) {
		int s = c.getChildren().size();
		for (Node tmp : c.getChildren()) {
			s += size(tmp);
		}
		return s;
	}


	public boolean isLeaf() {
		return !(children.size() > 0);
	}
	/** Indent space of (depth)x" " in front of element at tree level (depth). */
	private void indent() {
		int count = depth;
		while (count > 0) {
			count--;
			System.out.print(" ");
		}
	}
	/** Debugging method */
	public void printHere() {
		indent();
		System.out.println(state);
	}
	/** Debugging method */
	public void preOrder() {
		printHere();
		if (!isLeaf()) {
			for (Node tmp : children) {
				tmp.preOrder();
			}
		}
	}
	

	/** Set the parent of this node, and depth = 1 + parent's */
	public void setParent(Node parent) {
		this.parent = parent;
		this.depth = parent.getDepth() + 1;
	}
	/**
	 * Add a child node from a state due to a symbol read (not-epsilon).
	 * Create a new node to add to children;
	 * set the parent of the child, with depth = 1 + parent's
	 * @param state  The resulting state after reading a symbol
	 * @param symbol Read by machine to give the state.
	 * @return child Just added, null If this node is dead, no child added.
	 */
	/////////////////////////////
	// how to set dead state? //
	/////////////////////////////
	///Ensure no '.' state is every created, 
	public Node addChild(char state, char symbol) {
		// check if is dead state, do nothing
		if (state == '.') {
			return null;
		}
		else {
			Node child = new Node(state, symbol);
			child.setParent(this);
			children.add(child);
			return child;
		}
	}

	/** 
	 * Add a sibling, i.e. an epsilon-state from this, with the same depth
	 * Set the sibling as epsilon-state, and parent as this node.
	 * @param state Of the sibling
	 */
	public Node addSibling(char state) {
		// if is dead state, do nothing
		if (state == '.') {
			return null;
		}
		else {
			// set as child of this node's parent, where '/' is the epsilon symbol
			Node parent = this.getParent();
			Node sib = parent.addChild(state, '/');
			// set sibling's epsilon to true, reset its parent to this node
			sib.skip();
			sib.setParent(this);
			return sib;
		}
	}
	/** Make this node rooting from epsilon */
	public boolean skip() { return epsilon = true; }
	

	/** Return the parent of this node. */
	public Node getParent() { return parent; }
	/** Return the children of this node. */
	public LinkedList<Node> getChildren() { return children; }
	/** Return the depth of this node. */
	public int getDepth() { return depth; }
	/** Check if this is an epsilon-node. */
	public boolean isEpsilon() { return epsilon; }
	/** Return the state */
	public char getState() { return state; }
	/** Return the symbol */
	public char getSymbol() { return symbol; }
	/** Return the head */
	public Head getHead() { return head; }


	// Node(char state, Head head, char symbol, boolean epsilon) {
	// 	this(state, symbol, epsilon);
	// 	this.head = head;
	// }
}