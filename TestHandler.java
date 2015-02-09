import java.util.*;
import junit.framework.TestCase;
import org.junit.*;
import static org.junit.Assert.*;

public class TestHandler extends TestCase {
  private Handler handle;
  
  public void setUp() {
    handle = new Handler();
  }
  
  
//  Ensure a string is split properly into chars, whitespace is dropped.
  public void testConvert() {
    ArrayList<Character> split = new ArrayList<Character>();
    handle.convert("abc 123", split);
    Assert.assertTrue('a' == split.get(0));
    Assert.assertTrue('b' == split.get(1));
    Assert.assertTrue('c' == split.get(2));
//    and that whitespace was skipped
    Assert.assertTrue('1' == split.get(3));
    Assert.assertTrue('2' == split.get(4));
    Assert.assertTrue('3' == split.get(5));
  }
  
//  for a line of delta of many rules, ensure is split according to input, delimited by ";"
  public void testConvertDelta() {
    LinkedList<String> sarr = handle.convertDelta("a0:a;a1:a:b;a2:a");
    Assert.assertEquals("a0:a", sarr.get(0));
    Assert.assertEquals("a1:a:b", sarr.get(1));
    Assert.assertEquals("a2:a", sarr.get(2));
  }
  
//  per one output, formatted as input:out1:out2:out3
  public void testSplitAdd() {
    LinkedList<String> sarr = handle.splitAdd("a0:bb:cc:dd");
//    test all outputs to add to Delta are separated properly by ":", excluding input
    Assert.assertEquals("bb", sarr.get(0));
    Assert.assertEquals("cc", sarr.get(1));
    Assert.assertEquals("dd", sarr.get(2));
  }
  
  
  public void testConvertInput() {
//    For normal string input, method is a simple call of toCharArray and check for membership in S
//    Next we test that empty string, represented by white space " ", is considered valid
    ArrayList<Character> split = handle.convertInput(" ");
    Assert.assertTrue(' ' == split.get(0));
    
//    Next, for an invalid string, return null
    split = handle.convertInput("any");
    Assert.assertTrue(split == null);
  }
  
  
}
