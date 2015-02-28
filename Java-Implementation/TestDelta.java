import java.util.*;
import junit.framework.TestCase;
import org.junit.*;
import static org.junit.Assert.*;

public class TestDelta extends TestCase {
  private int minQ, maxQ, minS, maxS;
  private Delta d;
  
  public void setUp() {
    minQ = (int)'a';
    maxQ = (int)'c';
    minS = (int)'0';
    maxS = (int)'1';
   d = new Delta(maxQ, minQ, maxS, minS); 
  }
  
//  Ensure Delta is initialized the the right size
  public void testSize() {
   Assert.assertEquals(3*2, d.size() ); 
  }
  
//  Ensure the conversion of char to int index is correct, starting from 0
  public void testIndexQ() {
    Assert.assertEquals(0, d.indexQ('a') );
    Assert.assertEquals(1, d.indexQ('b') );
    Assert.assertEquals(2, d.indexQ('c') );
  }
  public void testIndexS() {
    Assert.assertEquals(0, d.indexS('0') );
    Assert.assertEquals(1, d.indexS('1') );
  }
//  Ensure the hash function convert pair of char to linear index, starting from 0
  public void testHash() {
    Assert.assertEquals(0, d.hash('a','0') );
    Assert.assertEquals(1, d.hash('a','1') );
    Assert.assertEquals(2, d.hash('b','0') );
    Assert.assertEquals(3, d.hash('b','1') );
    Assert.assertEquals(4, d.hash('c','0') );
    Assert.assertEquals(5, d.hash('c','1') );
  }
  
//  Ensure that the inverse works for Q and S, i.e. unhash back to (int)char
  public void testUnhashQ() {
    Assert.assertEquals((int)'a', d.unhashQ(0) );
    Assert.assertEquals((int)'a', d.unhashQ(1) );
    Assert.assertEquals((int)'b', d.unhashQ(2) );
    Assert.assertEquals((int)'b', d.unhashQ(3) );
    Assert.assertEquals((int)'c', d.unhashQ(4) );
    Assert.assertEquals((int)'c', d.unhashQ(5) );
  }
  public void testUnhashS() {
    Assert.assertEquals((int)'0', d.unhashS(0) );
    Assert.assertEquals((int)'1', d.unhashS(1) );
    Assert.assertEquals((int)'0', d.unhashS(2) );
    Assert.assertEquals((int)'1', d.unhashS(3) );
    Assert.assertEquals((int)'0', d.unhashS(4) );
    Assert.assertEquals((int)'1', d.unhashS(5) );
  }
  
  public void testAdd() {
    String o1 = "00", o2 = "11";
//    that the size of output ArrayList expands correctly when added
    ArrayList<String> out = d.add('a','0', o1);
    Assert.assertEquals(1, out.size());
//    Assert.assertEquals(d.getArr('a','0'), d.getArr('a','1'));
    out = d.add('a','0', o2);
    Assert.assertEquals(2, out.size());
    
  }
  
  public void testGetArr() {
//    output arraylist empty without addition
    ArrayList<String> out = d.getArr('a','0');
    Assert.assertEquals(0, out.size());
    
//    Adding,
   testAdd();
//   check size correct = 2
   out = d.getArr('a','0');
   Assert.assertEquals(2, out.size());
//   verify content
   Assert.assertEquals("00", out.get(0));
   Assert.assertEquals("11", out.get(1));
   
  }
  
  
  
}
