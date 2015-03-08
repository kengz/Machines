# Machines
A polymorphic implementation of the machines: `DFA, NFA, e-NFA, PDA, TM`.
The design is object-oriented to show the machine functions, and to emphasize that the other machines are restrictions of the `non-deterministic Turing Machine (N-TM)`.

`Updated Feb 27`
Added a `JS` implementation based on the original `Java` version.

`Updated Mar 7`
Now it is polymorphic: All the other machines: `DFA, NFA, e-NFA, TM` are constructed as restrictions of the `non-deterministic TM`.

##Instructions
For the `JS` implementation, simply build and run as usual: type into terminal `$ node <file>`, where *file* is:

1. `machine.js` constructing machine, and specify the `require()` path on top to machine definitions, in the `Definitions` folder. Now you can build DFA, NFA, and TM from it, simply by changing the `JSON` file path specified at its top. Yes it is polymorphic – the same code builds all these different machines.

2. `DFA-distin-table.js` to run the algorithm for constructing the table of distinguishabilities for the machine created above.

3. `DFA-minimizer.js` to construct and equivalent, minimal DFA from the table above.


The `Java` implementation is deprecated. If u insist to run it, type into terminal:
```
make < inputN1.txt
```

For documentation, refer to the `*.html` pages, generated with `Docco`.