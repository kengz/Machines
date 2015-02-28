import java.util.*;
import junit.framework.TestCase;
import org.junit.*;
import static org.junit.Assert.*;

public class TestHead extends TestCase {
  private Head head;
  private ArrayList<Character> string;
  
  public void setUp() {
    head = new Head();
    string = new ArrayList<Character>();
    string.add('0');
    string.add('1');
  }
  
//  Ensure addToTape works properly. Also tests moveLeft(), moveRight(), read()
  public void testAddToTape() {
    Assert.assertTrue(head.addToTape(string));
//    if move left out of tape, meet null char
    head.moveLeft();
    Assert.assertEquals('\u0000', head.read());
//    move back in, read to ensure content correct
    head.moveRight();
    Assert.assertEquals('0', head.read());
    head.moveRight();
    Assert.assertEquals('1', head.read());
//    move out of input string, meet null char
    head.moveRight();
    Assert.assertEquals('\u0000', head.read());
  }
  
//  test the read write of the head, general for TM
  public void testReadWrite() {
    Assert.assertTrue(head.addToTape(string));
    Assert.assertEquals('0', head.read());
//    write
    char old = head.write('1');
//    verify old content
    Assert.assertEquals('0', old);
//    and new content
    Assert.assertEquals('1', head.read());
  }
  
}
