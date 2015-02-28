/**
 * @author Wah Loon Keng
 */

import java.util.*;

/**
 * The machine NFA2, is kept as simple as possible.
 * The machine definition is done by Handler, the head and tape and Head, the transition function by Delta.
 * This NFA2 class simply puts the together and does only: 
 * 1. Construction from given definition,
 * 2. Run and decide a given input string.
 *
 * The NFA2 is a 5-tuple (Q, S, d, q0, F),
 * Q = the set of states
 * S = the alphabet = set of symbols
 * d = the transition function
 * q0 = the start state
 * F = the set of accept states
 */
public class NFA2 {
	/** Definition: The list for Q, S, F, and q0, d */
	private ArrayList<Character> listQ, listS, listF;
	private char q0;
	private Delta d;

	/** Run: The machine head and current state */
	private Head head;
	private char state, symbol, red;
	// Tree 
	private String fringe;
	// private ArrayList<String> fringe;
	private int fringeIndex;
	private CTree tree;

	///////////////////
	// Construction //
	///////////////////
	/**
	 * The short NFA2 constructor.
	 * Takes in a whole 5-tuple list verified and given by Handler
	 * Tuple order: {'Q', 'S', 'F', 'q', 'd'};
	 */
	NFA2(ArrayList<Object> tuple) {
		this.listQ = (ArrayList<Character>)tuple.get(0);
		this.listS = (ArrayList<Character>)tuple.get(1);
		this.listF = (ArrayList<Character>)tuple.get(2);
		this.q0 = (char)tuple.get(3);
		this.d = (Delta)tuple.get(4);
		System.out.println("Construction successful.");
		System.out.println("=======================\n");
	};
	/**
	 * The long NFA2 constructor.
	 * Construct machine from the 5-tuple verified and provided by Handler.
	 */
	NFA2(
		ArrayList<Character> listQ, 
		ArrayList<Character> listS, 
		Delta d,
		char q0,
		ArrayList<Character> listF
		) {
		this.listQ = listQ;
		this.listS = listS;
		this.d = d;
		this.q0 = q0;
		this.listF = listF;
	};


	/////////////////
	// Initialize //
	/////////////////
	/**
	 * Reset machine for new input string.
	 * @param input A new input string.
	 */
	public void initMachine(ArrayList<Character> input) {
		state = q0;
		// resetFringe();
		resetTree();
		head = new Head(input);
		// head.addToTape(input);
		head.printTape();
	}
	public void resetTree() {
		tree = new CTree(d, q0);
	}
	// /** Reset the fringe */
	// private void resetFringe() {
	// 	fringe = "";
	// 	fringeIndex = 0;
	// 	fringe += q0;
	// 	fringe += ";";
	// }

	//////////////////
	// Run machine //
	//////////////////

	/**
	 * Decide an input string.
	 * Called by Master, with input from Handler.
	 * @param  input String verified by Handler.
	 * @return       true If machine accepts; false if rejects.
	 */
	public boolean decide(ArrayList<Character> input) {
		initMachine(input);
		System.out.println("Machine runnning:\n=======================");
		return runAndHalt();
	}

	/** Run oneStep() until it halts, then decide if accept or reject. */
	protected boolean runAndHalt() {
		boolean end = false;
		while (!end) 
			end = oneStep();
		// print the tree from the fringe
		// tree = new Tree(fringe);
		tree.printTree();

		// if accept
		if (accept()) {
			System.out.println("========Accept.========\n");
			return true;
		}
		else {
			System.out.println("========Reject.========\n");
			return false;
		}
	}
	/** 
	 * Scan the end of fringe – states from the final input symbol.
	 * @return true If any of these states are accept states, 
	 */
	// protected boolean accept() {
	// 	String[] ladder = fringe.split(";");
	// 	String fringeEnd = ladder[ladder.length-1];
	// 	System.out.println("Final states: " + fringeEnd);

	// 	boolean acc = false;
	// 	for (char c : fringeEnd.toCharArray()) {
	// 		// if any is an accept state, set true
	// 		if (inF(c))
	// 			acc = true;		
	// 	}
	// 	return acc;
	// }
	protected boolean accept() {
		boolean acc = false;
		for (char c : tree.forefrontToState()) {
			if (inF(c)) {
				acc = true;
			}
		}
		return acc;
	}
	/** Helper method: Check if o is in F */
	private boolean inF(char o) {
		return listF.contains(o);
	}

	///////////////////////
	// Elementary steps //
	///////////////////////
	/**
	 * Execute one cycle, 
	 * see if NFA2 should halt – if input empty, or reach end of tape.
	 * @return true If NFA2 should halt.
	 */
	protected boolean oneStep() {
		boolean halt = cycle();
		return halt;
	}
	/** 
	 * A cycle of tasks:
	 * Read tape symbol, if not blank:
	 * fetch from Delta, replace state, move. (non-deterministic)
	 * @return true If tape in empty string, false otherwise.
	 */
	public boolean cycle() {
		// get next symbol
		boolean blank = read();
		if (!blank) {
			// appendToFringe();
			tree.nextInput(red);
			move();
			return false;
		}
		else
			return true;
	}
	/** 
	 * Read tape symbol and update red
	 * @return true if tape(input string) is empty, or reach end of tape
	 */
	private boolean read() {
		red = head.read();
		return (red == ' ' || red == '\u0000');
	}

	/////////////////////
	// Delta function //
	/////////////////////

	// Now gotta handle:
	// epsilon shortcut
	// dead state
	// /** Fetch output to input state, symbol, if tape not empty. */
	// private void fetchDel() {
	// 	String out = d.getArr(state, red).get(0);
	// 	state = out.charAt(0);
	// }
	/** Run the machine with non-determinism, append the resultant states breath-first the fringe. */
	public void appendToFringe() {
		boolean stop = false;
		while (!stop) {
			// get next state on the same tree level, nondeterminism
			state = fringe.charAt(fringeIndex);
			// check if this state is the last on the level
			/////////////////
			// tweaking //
			/////////////////
			System.out.println("Fringe is: " + fringe);
			boolean last;
			if (! (fringeIndex < fringe.length())) {
				last = fringe.charAt(fringeIndex+1) == ';';
			} else {
				last = true;
			}
			
			
			// stop when sees a delimiter, i.e. end of same parent
			if (state == ':' || state == ';') {
				stop = true;
			}
			else {
				// concat all output to this state to fringe,
				// if empty, still separated by delimiter, will look like "::"
				fringe += concatDel();
				// end with delimiter ":", i.e. from the same parent state
				if (!last) 
					fringe += ":";
				// if it's the last, end with ";", i.e. end of a tree level
				else
					fringe += ";";
			}
			// increase index to prepare for next state
			fringeIndex++;
		}
	}
	///////////////
	// tweaking //
	///////////////
	/** Concat all non-deter outputs from a state, symbol; return it for fringe. */
	private String concatDel() {
		// get an arraylist object
		ArrayList<String> outputSet = d.getArr(state, red);
		String concatOutput = "";
		for (int i = 0; i < outputSet.size(); i++) {
			concatOutput += outputSet.get(i);
		}
		return concatOutput;
	}
	/** Move head accordingly. */
	private void move() {
		head.moveRight();
	}


	////////////////////
	// Format-report //
	////////////////////
	/** Report input state, symbol */
	private void preReport() {
		System.out.print("State: " + state);
		System.out.print("  Read: " + red);
	}
	/** Report output state, symbol */
	private void postReport() {
		System.out.print("  →  State: " + state + "\n");
	}



}


///////////////////////////////
// Use class extension later //
///////////////////////////////









