/**
 * @author Wah Loon Keng
 */

import java.util.*;

/**
 * The machine DFA, is kept as simple as possible.
 * The machine definition is done by Handler, the head and tape and Head, the transition function by Delta.
 * This DFA class simply puts the together and does only: 
 * 1. Construction from given definition,
 * 2. Run and decide a given input string.
 *
 * The DFA is a 5-tuple (Q, S, d, q0, F),
 * Q = the set of states
 * S = the alphabet = set of symbols
 * d = the transition function
 * q0 = the start state
 * F = the set of accept states
 */
public class DFA {
	/** Definition: The list for Q, S, F, and q0, d */
	private ArrayList<Character> listQ, listS, listF;
	private char q0;
	private Delta d;

	/** Run: The machine head and current state */
	private Head head;
	private char state, symbol, red;

	///////////////////
	// Construction //
	///////////////////
	/**
	 * The short DFA constructor.
	 * Takes in a whole 5-tuple list verified and given by Handler
	 * Tuple order: {'Q', 'S', 'F', 'q', 'd'};
	 */
	DFA(ArrayList<Object> tuple) {
		this.listQ = (ArrayList<Character>)tuple.get(0);
		this.listS = (ArrayList<Character>)tuple.get(1);
		this.listF = (ArrayList<Character>)tuple.get(2);
		this.q0 = (char)tuple.get(3);
		this.d = (Delta)tuple.get(4);
		System.out.println("Construction successful.");
		System.out.println("=======================\n");
	};
	/**
	 * The long DFA constructor.
	 * Construct machine from the 5-tuple verified and provided by Handler.
	 */
	DFA(
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

	/**
	 * Reset machine for new input string.
	 * @param input A new input string.
	 */
	public void initMachine(ArrayList<Character> input) {
		state = q0;
		head = new Head(input);
		// head.addToTape(input);
		head.printTape();
	}
	/** Run oneStep() until it halts, then decide if accept or reject. */
	protected boolean runAndHalt() {
		boolean end = false;
		while (!end) 
			end = oneStep();
		if (inF(state)) {
			System.out.println("=======================\nAccept.\n=======================");
			return true;
		}
		else {
			System.out.println("=======================\nReject.\n=======================");
			return false;
		}
	}
	/** Helper method: Check if o is in F */
	private boolean inF(char o) {
		return listF.contains(o);
	}

	/**
	 * Execute one cycle, 
	 * see if NFA should halt – if input empty, or reach end of tape.
	 * @return true If NFA should halt.
	 */
	protected boolean oneStep() {
		boolean halt = cycle();
		return halt;
	}
	/** 
	 * A cycle of tasks:
	 * Read tape symbol, if not blank:
	 * fetch from Delta, replace state, move.
	 * @return true If tape in empty string, false otherwise.
	 */
	private boolean cycle() {
		boolean blank = read();
		if (!blank) {
			preReport();
			fetchDel();
			move();
			postReport();
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
	/** Fetch output to input state, symbol, if tape not empty. */
	private void fetchDel() {
		String out = d.getArr(state, red).get(0);
		state = out.charAt(0);
	}
	/** Move head accordingly. */
	private void move() {
		head.moveRight();
	}
	
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










