/**
 * @author Wah Loon Keng
 */

import java.util.*;

/** 
 * Inner class for the transition function.
 * Consists of an array, index for input (state, symbol) is calculated by a Hash function.
 * At each index is an ArrayList of String for all outputs to an input.
 * The string is a single char (q) for DFA, of length 3 (qsm) for TM, where it's split and interpreted by the machine's internal function.
 *
 * Design:
 * The purpose is to keep overall complexity low, this is done by:
 * The transition function, which is the heart of machine complexity via read/write, is designed as a 1D array, whose index is hashed from the natural orderings of the states and symbols. The Hash function gives O(1) in accessing the Delta array.
 * Space complexity is kept to |Q||S|, the product of cardinalities of the two sets, wihtout sacrificing time complexity.
 */
public class Delta {
	// uses hash
	private ArrayList<ArrayList<String>> del;
	private int minQ, sizeQ, minS, sizeS;

	/**
	 * Constructor. Initialize delta 1D array to list of empty out string-array.
	 */
	Delta(int maxQ, int minQ, int maxS, int minS) {
		this.minQ = minQ;
		this.minS = minS;
		sizeQ = maxQ - minQ +1;
		sizeS = maxS - minS +1;
		int len = sizeQ*sizeS;
		// init list with null Output to length sizeQ*sizeS
		del = new ArrayList<ArrayList<String>>();
		for (int i = 0; i < len; i++) {
			del.add(new ArrayList<String>());
		}
	}

	// // epsilon symbol
	// System.out.println((int)'/');
	// 	// empty set
	// System.out.println((int)'.');
	// 	// tape blank symbol
	// System.out.println((int)'-');

	/**
	 * Add a delta(state, symbol) output.
	 * @param  output A general output for DFA or TM
	 * @return array of all outputs to the input.
	 */
	public ArrayList<String> add(char state, char symbol, String output) {
		getArr(state, symbol).add(output);
		return getArr(state, symbol);
	}
	/** Fill the transition table with empty set "." if not set to any. */
	public void fill() {
		for (ArrayList<String> slot : del) {
			if (slot.isEmpty()) {
				slot.add(".");
			}
		}
	}
	public boolean isEmpty(char state, char symbol) {
		ArrayList<String> arr = getArr(state, symbol);
		if (arr.get(0).charAt(0) == '.')
			return true;
		else
			return false;
	}
	/** Get the array of all outputs to input (state, symbol). */
	protected ArrayList<String> getArr(char state, char symbol) {
		if (state=='.') {
			return new ArrayList<String>(Collections.nCopies(1, "."));
		} else {
			return del.get(hash(state, symbol));
		}
	}

	/** Inverse of hash, return state from Delta index. */
	protected char unhashQ(int hash) {
		return (char)((hash)/sizeS + minQ);
	}
	/** Inverse of hash, return symbol from Delta index. */
	protected char unhashS(int hash) {
		return (char)((hash)%sizeS + minS);
	}
	/** The Hash function for calculating the 1D array index for (state, symbol) */
	protected int hash(char state, char symbol) {
		return indexQ(state)*sizeS + indexS(symbol);
	}
	/** Convert Q char to index 1 thru sizeQ */
	protected int indexQ(char state) {
		return (int)state - minQ;
	}
	/** Convert S char to index 1 thru sizeS */
	protected int indexS(char symbol) {
		return (int)symbol - minS;
	}
	/** Return the size of transition function = sizeQ*sizeS */
	public int size() {
		return del.size();
	}

	/////////////////////////////////////////////
	// Print only those who are valid Q and S //
	/////////////////////////////////////////////

	/** Print the whole delta transition function, format: del(q, s) = {out1, out2, out3} */
	public void printAll() {
		for (int i = 0; i < del.size(); i++) {
			System.out.print("d(" + unhashQ(i) + ", " + unhashS(i) + ") = {");
			printOutput(del.get(i));
			System.out.print("}\n");
		}
	}
	/** Helper method: print all outputs separated with comma. */
	private void printOutput(ArrayList<String> outs) {
		for (String out : outs) {
			System.out.print(out + ", ");
		}
	}



}