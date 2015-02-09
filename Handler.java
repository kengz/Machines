/**
 * @author Wah Loon Keng
 */
/////////////////////////////////////////////////
// next: TM, with G, copy all n add tape chars //
/////////////////////////////////////////////////
import java.util.*;
import java.io.*;

/** 
 * Handles all user interface, I/O
 * Check all input valid for machine definition, and input string valid.
 */
public class Handler {
	/////////////////////////////////////
	// Gamma def. take in tape symbol //
	/////////////////////////////////////
	// machine halt and output result (accept/reject)
	
	private Scanner sc;

	/** The tuples and specification for DFA, TM */
	private ArrayList<Character> listQ, listS, listF;
	private char q0, qA, qR;
	private Delta d;
	/** The list of tuples for the machine, tells the order of definition input. */
	protected ArrayList<Object> tuple;
	private char[] tupleDFA = {'Q', 'S', 'F', 'q', 'd'};
	private char[] tupleTM = {'Q', 'S', 'G', 'q', 'a', 'r', 'd'};

	/** Constructor, for inputting from terminal. */
	Handler() {
		sc = new Scanner(System.in);
		tuple = new ArrayList<Object>();
		listQ = new ArrayList<Character>();
		listS = new ArrayList<Character>();
		listF = new ArrayList<Character>();
	}

	/////////////////////////////////////////
	// Construction from definition input //
	/////////////////////////////////////////
	
	/** After definition, pass the tuple for machine construction */
	public ArrayList<Object> pass() {
		return tuple;
	}

	/**
	 * The only method called to define machine, add all to tuple.
	 * @param m Type of machine: 'D' for DFA, 'T' for TM.
	 * @return  true Definition valid, ready to construct Machine.
	 */
	public boolean defineMachine(char m) {
		char[] machine = {};
		switch (m) {
			// DFA or TM
			case 'D': machine = tupleDFA; break;
			case 'T': machine = tupleTM; break;
			default: System.out.println("Input wrong char for defineMachine()"); break;
		}
		// define
		for (char c : machine) {
			System.out.println("Enter in a line, without white space,");
			prompt(c);
			getAndSet(c);
		}
		// then check
		boolean pass = false;
		switch (m) {
			case 'D': pass = checkDefDFA(); break;
			case 'T': pass = checkDefTM(); break;
			default: System.out.println("Input wrong char for defineMachine()"); break;
		}
		// if valid, then ready for machine construction
		return pass;
	} 

	/** Prompt message for input */
	private void prompt(char c) {
		String tmp;
		switch (c) {
			case 'Q': tmp = "Q, the set of states: "; break;
			case 'S': tmp = "S, the alphabet symbols: "; break;
			case 'F': tmp = "F, the set of accept states: "; break;
			case 'G': tmp = "F, with extra TM tape symbols: "; break;
			case 'q': tmp = "q0, the start state: "; break;
			case 'a': tmp = "qA, the TM accept state: "; break;
			case 'r': tmp = "qR, the TM reject state: "; break;
			case 'd': tmp = "d, the transition function: "; break;
			default: tmp = "none. Please choose again. "; break;
		}
		System.out.println(tmp);
	}

	/** Get input and set machine definition. */
	protected void getAndSet(char c) {
		String line = (String)sc.nextLine();
		switch (c) {
			case 'Q': convert(line, listQ); tuple.add(listQ); break;
			case 'S': convert(line, listS); tuple.add(listS); break;
			case 'F': convert(line, listF); tuple.add(listF); break;
			case 'G': 
			// F = Gamma for TM, add all symbols, and extra tape symbols
			listF.addAll(listS); convert(line, listF); 
			tuple.add(listF); break;
			case 'q': q0 = line.charAt(0); tuple.add(q0); break;
			case 'a': qA = line.charAt(0); tuple.add(qA); break;
			case 'r': qR = line.charAt(0); tuple.add(qR); break;
			case 'd': initDelta(); convertDelta(line); tuple.add(d); break;
			default: System.out.println("Input wrong char for getAndSet()"); break;
		}
	}

	/** Take a string and list, convert to char array, add but whitespace to list; no duplicates */
	protected void convert(String line, ArrayList<Character> list) {
		char[] tmp = line.toCharArray();
		for (char c : tmp) {
			// drop any whitespace char
			if (!Character.isWhitespace(c)) 
				list.add(c);
		}
		// delete duplicate chars
		list = new ArrayList<Character>(new LinkedHashSet<Character>(list));
	}


	/** Take all delta rules, split by ";", each is then further split to all outputs by ":" and added to Delta */
	protected LinkedList<String> convertDelta(String line) {
		// split line to rules, separated by ";", then convert to LL
		String[] all = line.split(";");
		LinkedList<String> rules = new LinkedList<String>(Arrays.asList(all));
		for (String r : rules) {
			splitAdd(r);
		}
		d.fill();
		return rules;
	}
	/** Called by convertDelta. Initialize Delta after listQ, listS have been filled. */
	protected Delta initDelta() {
		// sort the chars, get the smallest for offsetting index in Delta later
		Collections.sort(listQ);
		int minQ = (int)listQ.get(0);
		int maxQ = (int)listQ.get(listQ.size()-1);
		Collections.sort(listS);
		int minS = (int)listS.get(0);
		int maxS = (int)listS.get(listS.size()-1);
		// Init Delta matrix to proper size, to fit from min to max char
		d = new Delta(maxQ, minQ, maxS, minS);
		return d;
	}

	/** Called by convertDelta(). For a given rule, split, check and add each output to Delta */
	protected LinkedList<String> splitAdd(String rule) {
		// split a rule by regex ":"
		String[] tmp = rule.split(":");
		// get the input char q,s
		char[] input = tmp[0].toCharArray();
		char q = input[0];
		char s = input[1];

		// convert to LL for adding the output(s)
		LinkedList<String> tmp2 = new LinkedList<String>(Arrays.asList(tmp));
		// remove the input
		tmp2.removeFirst();
		// check and add all output(s) to the delta at (q,s)
		for (String output : tmp2) {
			if (checkDelta(q,s,output))
				d.add(q,s,output);
		}
		// for testing purpose
		return tmp2;
	}
	/**
	 * Called by splitAdd()
	 * Check if input/output for Delta is valid; 
	 * format is <input:output1:output2;input:output1;input:output1>
	 * DFA: <qs:q;qs:q:q;qs:q>
	 * TM: <qs:qsm;qs:qsm:qsm;qs:qsm>
	 * where q = state, s = symbol, m = move; NO whitespace allowed.
	 */
	private boolean checkDelta(char q, char s, String output) {
		boolean pass = (
			// DFA: check input state, symbol, and output state, are valid
			inQ(q) &&
			inS(s) &&
			inQ(output.charAt(0))
			);
		// If moreover is TM, check more
		if (output.length()==3) {
			pass = (
				pass && 
				// output symbol
				inS(output.charAt(1)) &&
				// move 'L' or 'R'
				(output.charAt(2) == 'L' || output.charAt(2) == 'R' )
				);
		}
		return pass;
	}


	///////////////////////////////
	// Post construction, check //
	///////////////////////////////
	
	// in TM, F is Gamma
	// null char '\u0000' is reserved for blank symbol
	
	/** Check the definition of TM */
	private boolean checkDefTM() {
		boolean pass = (
			// lists non-empty
			listQ.size() > 0 &&
			listS.size() > 0 &&
			// Gamma contains Q and blank '\u0000' more tape symbols
			listF.size() > listS.size() &&
			listF.containsAll(listS) && 
			inF('\u0000') &&
			// valid states
			inQ(q0) &&
			inQ(qA) &&
			inQ(qR)
			);
		return pass;
	}

	/** Check the definition of DFA */
	private boolean checkDefDFA() {
		boolean pass = (
			// lists non-empty
			listQ.size() > 0 &&
			listS.size() > 0 &&
			listF.size() > 0 &&
			// proper containment
			listQ.containsAll(listF) &&
			// a valid start state
			inQ(q0)
			);
		return pass;
	}

	/** Helper method: Check if o is in Q */
	private boolean inQ(char o) {
		return listQ.contains(o);
	}
	/** Helper method: Check if o is in F */
	private boolean inF(char o) {
		return listF.contains(o);
	}
	/** Helper method: Check if o is in S */
	private boolean inS(char o) {
		return listS.contains(o);
	}


	
	///////////////////
	// Input String //
	///////////////////

	/** See if there's a next input string. */
	public boolean hasNext() {
		return sc.hasNextLine();
	}	
	/** Get and verify the input string */
	public ArrayList<Character> getInput() {
		System.out.println("Enter input string: ");
		String line = sc.nextLine();
		return convertInput(line);
	}
	/** 
	 * Check if input string is valid, i.e. in S; if so, call on initMachine() to add to tape.
	 * Note: For empty input, use a single whitespace " ".
	 * @param  input An input string of symbols/tape.
	 * @return chars The valid string converted to ArrayList of char; null otherwise.
	 */
	protected ArrayList<Character> convertInput(String input) {
		boolean pass = true;
		ArrayList<Character> chars = new ArrayList<Character>();
		for (char c : input.toCharArray()) {
			chars.add(c);
			// If input string is empty, i.e. ' '
			if (!inS(c))
				pass = false;
		}
		// if input string is empty, i.e. a whitespace, accept too
		if (input.equals(" "))
			pass = true;
		// finally, return chars if string valid, null otherwise
		if (pass)
			return chars;
		else {
			System.out.println("Invalid input: " + input + ", SKIP.\n");
			return null;
		}
	}


	///////////////////////////////////
	// Printing machine description //
	///////////////////////////////////
	
	/** Print the machine definition */
	public void printDef(char m) {
		char[] machine = {};
		switch (m) {
			// DFA or TM
			case 'D': machine = tupleDFA; break;
			case 'T': machine = tupleTM; break;
			default: System.out.println("Input wrong char for printDef()"); break;
		}
		System.out.println("\n\nPrinting Machine definition");
		System.out.println("===========================");
		for (char c : machine) {
			printList(c);
			System.out.println("");
		}
		System.out.println("=======================\n");
	}
	/**
	 * Print the set Q, S or F.
	 * @param a 'Q', 'S', 'F' depending which set to be printed.
	 */
	protected void printList(char a) {
		prompt(a);
		switch (a) {
			case 'Q': printAll(listQ); break;
			case 'S': printAll(listS); break;
			case 'F': printAll(listF); break;
			case 'G': printAll(listF); break;
			case 'q': System.out.println(q0); break;
			case 'a': System.out.println(qA); break;
			case 'r': System.out.println(qR); break;
			case 'd': d.printAll(); break;
			default: break;
		}
	}

	/** Helper method: print a list to terminal */
	protected void printAll(ArrayList<Character> list) {
		for (char o : list) {
			System.out.print(o + " ");
		}
		System.out.println("");
	}
	

}
