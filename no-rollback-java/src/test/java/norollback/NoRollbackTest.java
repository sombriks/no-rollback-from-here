package norollback;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class NoRollbackTest {
    @Test
    void verifyHello() {
        assertEquals("Hello World!", new NoRollbackFromHere().migrate());
    }
}
