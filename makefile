JFLAGS = -g
JC = javac
JVM= java 
FILE=
.SUFFIXES: .java .class
.java.class:
	$(JC) $(JFLAGS) $*.java

CLASSES = \
	# CTree.java \
	# Delta.java \
	# DFA.java \
	# Handler.java \
	# Head.java \
	Master.java \
	# NFA.java \
	# TM.java \
	# Tree.java
	
	

MAIN = Master

default: classes run clean

classes: $(CLASSES:.java=.class)
 

run: $(MAIN).class
	$(JVM) $(MAIN)

clean:
	$(RM) *.class *.java~

