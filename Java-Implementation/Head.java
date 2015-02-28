/**
 * @author Wah Loon Keng
 */

import java.util.*;

/**
 * The head of the machine, general enough for TM. Has a position and and tape, can read, write and move.
 */
public class Head {
	/** Position(index) of the head on tape */
	private int pos;
	/** The TM tape, can be expanded to left, right. */
	private LinkedList<Character> tape;

	/**
	 * Constructor. Head initialized to position 0; input string added to tape.
	 * @param  list An input string.
	 */
	Head(List<Character> tape) {
		this.pos = 0;
		this.tape = new LinkedList<Character>(tape);
	}

	/** Constructor for copier, copy the position and tape. */
	Head(int pos, List<Character> tape) {
		this.pos = pos;
		this.tape = new LinkedList<Character>(tape);
	}

	/** Duplicate a head: with the same position and tape. */
	public Head duplicate(Head ori) {
		Head copy = new Head(ori.getPos(), ori.getTape());
		return copy;
	}


	/** Read tape symbol at current head position */
	public char read() {
		return tape.get(pos);
	}
	/** 
	 * Write to tape at current head position.
	 * @return  old The content replaced.
	 */
	public char write(char c) {
		char old = read();
		tape.set(pos, c);
		return old;
	}
	/** Move the head to the left by head++, expand with null char as needed */
	public int moveLeft() {
		if (pos > 0) 
			pos--;
		else
			// at leftmost, add null char
			tape.addFirst(' ');
		return pos;
	}
	/** Move the head to the right by head--, expand with null char as needed */
	public int moveRight() {
		if (pos == tape.size()-1)
			// at the tape end, add null char
			tape.add(' ');
		return pos++;
	}
	/** Print tape */
	public void printTape() {
		System.out.print("Tape: ");
		for (char c : tape)
			System.out.print(c);
		System.out.println("\n");
	}
	/** Return the position of head. */
	public int getPos() {
		return pos;
	}
	/** Return the tape. */
	public LinkedList<Character> getTape() {
		return tape;
	}

}