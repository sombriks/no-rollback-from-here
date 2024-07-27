package norollback;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import static org.junit.jupiter.api.Assertions.*;

// https://java.testcontainers.org/modules/databases/jdbc/
public class NoRollbackTest {

    @Test
    @Disabled
    void shouldMigrateDB2() throws Exception {
        try (Connection con = DriverManager.getConnection("jdbc:tc:db2:11.5.0.0a///no_rollback")) {
            shouldMigrate(con);
        }
    }

    @Test
    void shouldMigrateMySQL() throws Exception {
        try (Connection con = DriverManager.getConnection("jdbc:tc:mysql:8.0.36:///no_rollback")) {
            shouldMigrate(con);
        }
    }

    @Test
    @Disabled
    void shouldMigrateOracle() throws Exception {
        try (Connection con = DriverManager.getConnection("jdbc:tc:oracle:23.4-slim:///no_rollback")) {
            shouldMigrate(con);
        }
    }

    @Test
    void shouldMigratePostgreSQL() throws Exception {
        try (Connection con = DriverManager.getConnection("jdbc:tc:postgresql:9.6.8:///no_rollback")) {
            shouldMigrate(con);
        }
    }

    private void shouldMigrate(Connection con) throws SQLException, InterruptedException {
        NoRollbackFromHere noRollback = new NoRollbackFromHere(getClass());
        noRollback.migrate(con,"/test1.sql");
        assertEquals(0, noRollback.getFailed().size());
        assertEquals(1, noRollback.getSuccess().size());
        assertEquals(0, noRollback.getDonePrevious().size());

        int result = con.createStatement().executeUpdate("""
            insert into xpto(id) values(1),(2),(3)
            """);
        assertEquals(3, result);
    }

    public void shouldNotRunSameResourceTwice()  {

    }
}
