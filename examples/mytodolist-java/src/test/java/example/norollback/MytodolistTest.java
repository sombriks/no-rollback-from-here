package example.norollback;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class MytodolistTest {
    @Test
    void verifyHello() throws Exception {
        assertNotNull(new MytodolistMain());
    }
}
