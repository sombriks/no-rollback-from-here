package norollback;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

import java.sql.Connection;
import java.sql.DriverManager;

import static org.junit.jupiter.api.Assertions.*;

// https://java.testcontainers.org/modules/databases/jdbc/
public class NoRollbackTest {

    @Test
    @Disabled
    void shouldMigrateDB2() throws Exception {
        try (Connection con = DriverManager.getConnection("jdbc:tc:db2:11.5.0.0a//localhost:5432/crate")) {
            assertEquals("success", new NoRollbackFromHere().migrate(con));
        }
    }

    @Test
    void shouldMigrateMySQL() throws Exception {
        try (Connection con = DriverManager.getConnection("jdbc:tc:mysql:8.0.36:///crate")) {
            assertEquals("success", new NoRollbackFromHere().migrate(con));
        }
    }

    @Test
    @Disabled
    void shouldMigrateOracle() throws Exception {
        try (Connection con = DriverManager.getConnection("jdbc:tc:oracle:21-slim-faststart:///crate")) {
            assertEquals("success", new NoRollbackFromHere().migrate(con));
        }
    }

    @Test
    void shouldMigratePostgreSQL() throws Exception {
        try (Connection con = DriverManager.getConnection("jdbc:tc:postgresql:9.6.8:///crate")) {
            assertEquals("success", new NoRollbackFromHere().migrate(con));
        }
    }
}
