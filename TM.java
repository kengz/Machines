/**
 * @author Wah Loon Keng
 */

import java.util.*;

/**
 * The machine TM, is kept as simple as possible.
 * The machine definition is done by Handler, the head and tape and Head, the transition function by Delta.
 * This TM class simply puts the together and does only: 
 * 1. Construction from given definition,
 * 2. Run and decide a given input string.
 *
 * The TM is a 7-tuple (Q, S, F, d, q0, qA, qR)
 * Q = the set of states
 * S = the alphabet = set of symbols
 * F = S union the set of tape symbols
 * d = the transition function
 * q0 = the start state
 * qA = the accept state
 * qR = the rejct state
 */
public class TM {
	/** Definition: The list for Q, S, F, d, q0, qA, qR */
	private ArrayList<Character> listQ, listS, listF;
	private char q0, qA, qR;
	private Delta d;

	/** Run: The machine head and current state */
	private Head head;
	/** The machine state, symbol to write, move, and symbol read. */
	private char state, symbol, move, red;

	///////////////////
	// Construction //
	///////////////////
	/**
	 * The short TM constructor.
	 * Takes in a whole 5-tuple list verified and given by Handler
	 * Tuple order: {'Q', 'S', 'F', 'q', 'd'};
	 */
	TM(ArrayList<Object> tuple) {
		this.listQ = (ArrayList<Character>)tuple.get(0);
		this.listS = (ArrayList<Character>)tuple.get(1);
		this.listF = (ArrayList<Character>)tuple.get(2);
		this.q0 = (char)tuple.get(3);
		this.qA = (char)tuple.get(4);
		this.qR = (char)tuple.get(5);
		this.d = (Delta)tuple.get(6);
		System.out.println("Construction successful.");
		System.out.println("=======================\n");
	};
	/**
	 * The long TM constructor.
	 * Construct machine from the 5-tuple verified and provided by Handler.
	 */
	TM(
		ArrayList<Character> listQ, 
		ArrayList<Character> listS, 
		ArrayList<Character> listF,
		char q0,
		char qA,
		char qR,
		Delta d
		) {
		this.listQ = listQ;
		this.listS = listS;
		this.listF = listF;
		this.q0 = q0;
		this.qA = qA;
		this.qR = qR;
		this.d = d;
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
	/** Run oneStep() until TM halts, then decide if accept or reject, or loop on empty input */
	protected boolean runAndHalt() {
		boolean end = false;
		while (!end) 
			end = oneStep();

		if (state == qA) {
			System.out.println("=======================\nAccept.\n=======================");
			return true;
		}
		else if (state == qR) {
			System.out.println("=======================\nReject.\n=======================");
			return false;
		}
		// if state not in qA or qR but TM stops (only on empty input)
		else {
			System.out.println("=======================\nUndecided empty input.\n=======================");
			return false;
		}
	}

	/**
	 * Execute one cycle, 
	 * see if TM should halt - state = qA/qR, or not run – input empty.
	 * @return true If TM should halt.
	 */
	protected boolean oneStep() {
		boolean halt = cycle();
		if (!halt)
			return (state == qA || state == qR);
		else
			return halt;
	}
	/** 
	 * A cycle of tasks:
	 * Read tape symbol, if not blank:
	 * fetch from Delta, replace state, symbol(write), move.
	 * @return true If tape in empty string, false otherwise.
	 */
	private boolean cycle() {
		boolean blank = read();
		if (!blank) {
			preReport();
			fetchDel();
			write();
			move();
			postReport();
			return false;
		}
		else
			return true;
	}

	/** 
	 * Read tape symbol and update red
	 * @return true if tape(input string) is empty.
	 */
	private boolean read() {
		red = head.read();
		return (red == ' ');
	}
	/** Fetch output to input state, symbol, if tape not empty. */
	private void fetchDel() {
		String out = d.getArr(state, red).get(0);
		state = out.charAt(0);
		symbol = out.charAt(1);
		move = out.charAt(2);
	}
	/** Write to tape. */
	private void write() {
		head.write(symbol);
	}
	/** Move head accordingly. */
	private void move() {
		switch (move) {
			case 'L': head.moveLeft(); break;
			case 'R': head.moveRight(); break;
			default: System.out.println("Invalid move"); break;
		}
	}
	
	/** Report input state, symbol */
	private void preReport() {
		System.out.print("State: " + state);
		System.out.print("  Read: " + red);
	}
	/** Report output state, symbol, move */
	private void postReport() {
		System.out.print("  →  State: " + state);
		System.out.print("  Wrote: " + symbol);
		System.out.print("  Moved: " + move + "\n");
	}

}






