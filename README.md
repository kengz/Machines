# Machines
A polymorphic implementation of the machines: `DFA, NFA, e-NFA, PDA, TM, N-TM`, in `Javascript`.
The design is object-oriented to show the machine functions, and to emphasize that the other machines are restrictions of the `non-deterministic Turing Machine (N-TM)`.


## Instructions
For the `JS` implementation:

Note that the machine definition (as `JSON` files, refer examples for format) is specified at the top in `machine.js`. This is where the machine is built, and exported for usage elsewhere.

Simply build and run as usual: type into terminal `node <file>`, where *<file>* is:

1. `machine.js` to construct a machine and compute input strings from the specified `JSON`. All machines: `DFA, NFA, e-NFA, PDA, TM` are polymorphic restrictions of a `nondeterministic Turing Machine`.

2. `DFA-distin-table.js` to run the algorithm for constructing the table of distinguishabilities for DFA.

3. `DFA-minimizer.js` to construct an equivalent, minimal DFA from the table above.


`converter.js` and `Tree.js` are helper classes for `machine.js`, and will be called within it. The former converts `DFA, NFA, e-NFA, PDA` into restrictions of `TM`; the latter gives the nondeterministic structure of `TM`.

For detailed documentation, refer to the `*.html` pages, generated with `Docco`.


## JSON format

For sample machine definitions, refer to the sample json files in the `definitions` folder. The format is designed to reflect the restrictive-polymorphic nature among the machines.


## Versions
`updated Mar 11`

**`v0.3`**: Complete implementation of all machines: `DFA, NFA, e-NFA, PDA, TM` as restrictions of a `non-deterministic Turing Machine`.

**`v0.2`**: Implemented `N-TM`, and then `DFA` and `NFA` as its restrictions.

**`v0.1`**: Implemented `DFA` and `NFA`, with DFA minimizer and distin-table algorithm.

