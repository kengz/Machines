/**
 * @author Wah Loon Keng
 */
import java.util.*;

public class Tree {
	private String fringe;

	/**
	 * Constructor.
	 * @param fringe A properly delimited string of fringe, to recover into a tree.
	 */
	Tree(String fringe) {
		this.fringe = fringe;
	}

	/** Inorder reconstruction of the state tree from a delimited fringe. */
	public void printTree() {
		inOrder(0, 0);
	}
	/** 
	 * Inorder reconstruction of the state tree from a delimited fringe.
	 * printed Depth-first, fringe was constructed breath-first.
	 * @param lvl   The tree level of root (start from 0 here)
	 * @param which Batch of the batches at lvl.
	 */
	public void inOrder(int lvl, int which) {
		// given this batch, for each state at i:
		for (int i = 0; i < batch(lvl, which).length(); i++) {
			// proper indentation and print the state char at i
			indent(lvl);
			System.out.println(batch(lvl, which).charAt(i));
			// if has children, find them at properly-offset indices, recurse
			if (!ladderIsEmpty(lvl+1)) {
				// child on lvl+1 is at batch offset + i
				inOrder(lvl+1, offset(lvl, which) + i);
			}
		}
	}

	/** Offset to get child index of a parent batch(lvl, which) */
	protected int offset(int lvl, int which) {
		int off = 0;
		for (int j = 0; j < which; j++) {
			off += batch(lvl, j).length();
		}
		return off;
	}
	/** Indent space of (lvl)x" " in front of element at tree level (lvl). */
	private void indent(int lvl) {
		int count = lvl;
		while (lvl > 0) {
			lvl--;
			System.out.print(" ");
		}
	}
	/** Ladder = split a tree into array by its levels, delimited by ";" */
	public String[] ladder() {
		return fringe.split(";");
	}
	/** Print the whole ladder */
	public void printLadder() {
		for (String s : ladder()) {
			System.out.println(s);
		}
	}
	/** Check if ladder is empty at a level, i.e. if the index is valid */
	private boolean ladderIsEmpty(int lvl) {
		return !(lvl < ladder().length);
	}
	/**
	 * a batch = a part of a tree on the same level with the same parent
	 * @param  lvl   which Level of tree/ladder
	 * @param  which batch of the tree = index of the parent on upper level.
	 * @return batch At the index specified
	 */
	public String batch(int lvl, int which) {
		// at this lvl, the batches 12:123:123 is
		String batches = ladder()[lvl];
		// which-batch via splitting by the delimiter
		return batches.split(":")[which];
	}



}