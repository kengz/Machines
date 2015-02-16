/**
 * @author Wah Loon Keng
 */

import java.util.*;

// Change of design:
// Machine: only store def and run, has head
// head: pasrse input and check def:, parse input string for passing to string.
// Master: call handler, pass to machine
// call handler for input string, pass to tape, init and run
// Tree
// States by arraylist 
// Transition function separated by ; then parse each into array, allocated first two, the rest into state array 
// Save machine description into .txt 
public class Master {
	private Handler handle;
	private NFA2 m1;
	private TM m2;
	private CTree tree;

	public static void main(String[] args) {
		Master doctor = new Master();

		// doctor.makeTM();
		doctor.makeNFA2();

		// for (int i = 30 ; i < 100; i++) {
		// 	System.out.println((char)i);	
		// }
		// System.out.println("Special symbols");

		// // epsilon symbol
		// System.out.println((int)'/');
		// // empty set
		// System.out.println((int)'.');
		// // tape blank symbol
		// System.out.println((int)'-');

		// System.out.println((int)'\u0000');
	}

	Master() {
		handle = new Handler();
	}

	// Make NFA2
	public void makeNFA2() {
		constructNFA2();
		runNFA2();
	}

	protected void constructNFA2() {
		boolean defined = handle.defineMachine('D');
		if (defined) {
			handle.printDef('D');
			m1 = new NFA2(handle.pass());
		} else {
			System.out.println("Error in definition");
		}
	}
	protected void runNFA2() {
		while (handle.hasNext()) {
			ArrayList<Character> tmp = handle.getInput();
			if (tmp != null) {
				m1.decide(tmp);
			}
		}
	}

	// Make TM
	public void makeTM() {
		constructTM();
		runTM();
	}
	protected void constructTM() {
		handle.defineMachine('T');
		handle.printDef('T');
		m2 = new TM(handle.pass());
	}
	protected void runTM() {
		while (handle.hasNext()) {
			m2.decide(handle.getInput());
		}
	}



}