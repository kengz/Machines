# Machines
A polymorphic implementation of the machines: DFA, NFA, e-NFA, PDA, TM.
The design is object-oriented to show the machine functions, and to emphasize that these machines are restrictions/generalizations of on another.

`Updated Feb 27`
Added a `JS` implementation based on the original `Java` version.

##Instructions
For the `JS` implementation, simply type into terminal `$ node <file>`, where *file* is:
	1. `machine.js` constructing machine, and specify the `require()` path on top to machine definitions, in the `Definitions` folder.
	2. `DFA-distin-table.js` to run the algorithm for constructing the table of distinguishabilities for the machine created above.
	3. `DFA-minimizer.js` to construct and equivalent, minimal DFA from the table above.


For the `Java` implementation, type into terminal:
```
make < inputN1.txt
```

For documentation, refer to the `*.html` pages, generated with `Docco`.