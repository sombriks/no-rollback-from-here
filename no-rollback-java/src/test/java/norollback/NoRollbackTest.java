package norollback;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import static org.junit.jupiter.api.Assertions.assertEquals;

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
    @Disabled
    void shouldMigrateMSSQLServer() throws Exception {
        try (Connection con = DriverManager.getConnection("jdbc:tc:sqlserver:2017-CU12:///no_rollback")) {
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

    @Test
    void shouldMigrateH2() throws Exception {
        try (Connection con = DriverManager.getConnection("jdbc:h2:mem:no_rollback")) {
            shouldMigrate(con);
        }
    }

    // happy path common to all engines
    private void shouldMigrate(Connection con) throws SQLException, InterruptedException {
        NoRollbackFromHere noRollback = new NoRollbackFromHere(getClass());
        noRollback.migrate(con, "/test1.sql");
        assertEquals(0, noRollback.getFailed().size());
        assertEquals(0, noRollback.getDonePrevious().size());
        assertEquals(1, noRollback.getSuccess().size());

        int result = con.createStatement().executeUpdate("""
                insert into xpto(id) values(1),(2),(3)
                """);
        assertEquals(3, result);
    }

    @Test
    public void shouldNotRunSameResourceTwice() throws Exception {
        try (Connection con = DriverManager.getConnection("jdbc:tc:postgresql:9.6.8:///no_rollback")) {
            NoRollbackFromHere noRollback = new NoRollbackFromHere(getClass());
            noRollback.migrate(con, "/test1.sql", "/test1.sql");
            assertEquals(0, noRollback.getFailed().size());
            assertEquals(1, noRollback.getDonePrevious().size());
            assertEquals(1, noRollback.getSuccess().size());
        }
    }

    @Test
    public void shouldNotRunResourceNotFound() throws Exception {
        try (Connection con = DriverManager.getConnection("jdbc:tc:postgresql:9.6.8:///no_rollback")) {
            NoRollbackFromHere noRollback = new NoRollbackFromHere(getClass());
            noRollback.migrate(con, "/no-such-resource.sql");
            assertEquals(1, noRollback.getFailed().size());
            assertEquals(0, noRollback.getDonePrevious().size());
            assertEquals(0, noRollback.getSuccess().size());
        }
    }

    @Test
    public void shouldFailBadSQL() throws Exception {
        try (Connection con = DriverManager.getConnection("jdbc:tc:postgresql:9.6.8:///no_rollback")) {
            NoRollbackFromHere noRollback = new NoRollbackFromHere(getClass());
            String resources[] = new String[]{
                    "/fixtures/broken-migrate/0001-create-tables.sql",
                    "/fixtures/broken-migrate/0002-some-data.sql",
                    "/fixtures/broken-migrate/0003-new-column-will-fail.sql",
                    "/fixtures/broken-migrate/0004-insert-people.sql"
            };
            noRollback.migrate(con, resources);
            assertEquals(2, noRollback.getFailed().size());
            assertEquals(0, noRollback.getDonePrevious().size());
            assertEquals(2, noRollback.getSuccess().size());
        }

    }
}
