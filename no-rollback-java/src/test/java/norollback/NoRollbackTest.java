package norollback;

import org.junit.jupiter.api.DynamicTest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestFactory;
import org.junit.jupiter.api.Timeout;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Named.named;

// https://java.testcontainers.org/modules/databases/jdbc/
public class NoRollbackTest {

    private static final String //
            DB2 = "jdbc:tc:db2:11.5.0.0a///no_rollback",
            H2 = "jdbc:h2:mem:no_rollback",
            MSSQL = "jdbc:tc:sqlserver:2017-CU12:///no_rollback",
            MYSQL = "jdbc:tc:mysql:8.0.36:///no_rollback",
            ORACLE = "jdbc:tc:oracle:23.4-slim:///no_rollback",
            POSTGRES = "jdbc:tc:postgresql:9.6.8:///no_rollback";

    @TestFactory
    Stream<DynamicTest> shouldMigrateDbs() {
        return Stream.of(named("H2", H2), named("MySQL", MYSQL), named("PostgreSQL", POSTGRES))
                .map(name -> DynamicTest.dynamicTest("Should migrate " + name.getName(), () -> {
                    try (Connection con = DriverManager.getConnection(name.getPayload())) {
                        NoRollbackFromHere noRollback = new NoRollbackFromHere(getClass());
                        noRollback.migrate(con, "/fixtures/happy-path/test1.sql");
                        assertEquals(0, noRollback.getFailed().size());
                        assertEquals(0, noRollback.getDonePrevious().size());
                        assertEquals(1, noRollback.getSuccess().size());

                        int result = con.createStatement().executeUpdate("""
                                insert into xpto(id) values(1),(2),(3)
                                """);
                        assertEquals(3, result);
                    }
                }));
    }

    @Test
    public void shouldNotRunSameResourceTwice() throws Exception {
        try (Connection con = DriverManager.getConnection(H2)) {
            NoRollbackFromHere noRollback = new NoRollbackFromHere(getClass());
            noRollback.migrate(con, "/fixtures/happy-path/test1.sql", "/fixtures/happy-path/test1.sql");
            assertEquals(0, noRollback.getFailed().size());
            assertEquals(1, noRollback.getDonePrevious().size());
            assertEquals(1, noRollback.getSuccess().size());
        }
    }

    @Test
    public void shouldNotRunResourceNotFound() throws Exception {
        try (Connection con = DriverManager.getConnection(H2)) {
            NoRollbackFromHere noRollback = new NoRollbackFromHere(getClass());
            noRollback.migrate(con, "/no-such-resource.sql");
            assertEquals(1, noRollback.getFailed().size());
            assertEquals(0, noRollback.getDonePrevious().size());
            assertEquals(0, noRollback.getSuccess().size());
        }
    }

    @Test
    public void shouldFailBadSQL() throws Exception {
        try (Connection con = DriverManager.getConnection(H2)) {
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

    @Test
    @Timeout(5)
    public void shouldAvoidConcurrentMigrators() throws Exception {
        int n = 10;
        List<NoRollbackFromHere> pods = new ArrayList<>();
        try (Connection con = DriverManager.getConnection(H2)) {
            while (n-- > 0) {
                new Thread(() -> {
                    NoRollbackFromHere pod = new NoRollbackFromHere(getClass());
                    pods.add(pod);
                    try {
                        pod.migrate(con, "/fixtures/concurrency/2024-07-27-big-migrate.sql");
                        System.out.println(pod + " " + pod.getSuccess());
                        System.out.println(pod + " " + pod.getFailed());
                        System.out.println(pod + " " + pod.getDonePrevious());
                    } catch (Exception e) {
                        System.err.println(e.getMessage());
                    }
                }).start();
            }
            Thread.sleep(3000);

            ResultSet result = con.createStatement().executeQuery("""
                    select *, count(*) over() from hello;
                    """);
            if (result.next()) {
                String hello = result.getString(1);
                Timestamp created = result.getTimestamp(2);
                int count = result.getInt(3);
                assertEquals("I'm in a place called vertigo [como estas!?]", hello);
                assertNotNull(created);
                assertEquals(100, count);
            }
        }
    }
}
