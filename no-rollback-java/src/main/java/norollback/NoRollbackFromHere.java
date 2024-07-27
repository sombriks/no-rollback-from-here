package norollback;

import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 * NoRollbackFromHere
 * Applies a minimal migration structure to manage database state
 */
public class NoRollbackFromHere {

    private final Class<?> loader;
    private final List<String> donePrevious = new ArrayList<>();
    private final List<String> success = new ArrayList<>();
    private final List<String> failed = new ArrayList<>();

    /**
     * Create an instance of the migration engine
     *
     * @param loader a Class type with access to the migration script files. To
     *               be more specific, resources. It's up to you to hand us the
     *               proper resources you want to apply to the database.
     */
    public NoRollbackFromHere(Class<?> loader) {
        this.loader = loader;
    }

    /**
     * migrate
     * This method applies the provided resource list into the database
     * accessible via the provided connection.
     *
     * @param con       a regular JDBC connection. it's up to you to provide a valid
     *                  connection and close it once migrate operation gets finished
     *                  or if something goes wrong.
     * @param resources list of resouces names to be recovered via classpath
     *                  accessible by the provided Class type at the constructor
     *                  method.
     * @throws SQLException
     * @throws InterruptedException
     */
    public void migrate(Connection con, String... resources) throws SQLException, InterruptedException {
        con.createStatement().execute("""
                -- resources already applied
                create table if not exists no_rollback_from_here
                (
                    no_rollback_data     timestamp    default now(),
                    no_rollback_resource varchar(765) not null,
                    primary key (no_rollback_resource)
                );
                """);

        con.createStatement().execute("""
                -- lock because there might be some horizontal scaling
                create table if not exists no_rollback_from_here_lock
                (
                    no_rollback_locked  integer   default 1     check ( no_rollback_locked = 1 ),
                    no_rollback_data    timestamp default now(),
                    primary key (no_rollback_locked)
                );
                """);

        try {
            // let's lock
            Thread.sleep((long) (1234 * Math.random())); // what if there is another instance?
            con.createStatement().execute("""
                    insert into no_rollback_from_here_lock(no_rollback_locked) values(1);
                    """);

            for (String resource : resources) {
                try {
                    // load resource
                    URL url = loader.getResource(resource);
                    if (url == null) {
                        failed.add(resource);
                        throw new RuntimeException("null resource: " + resource);
                    }

                    // check if it's already applied
                    PreparedStatement count = con.prepareStatement("""
                            select count(no_rollback_resource) 
                            from no_rollback_from_here
                            where no_rollback_resource = ?
                            """);
                    count.setString(1, resource);
                    ResultSet resultSet = count.executeQuery();
                    if (resultSet.next() && resultSet.getInt(1) == 1) {
                        donePrevious.add(resource);
                        continue;
                    }

                    // apply if not
                    String migrationData = Files.readString(Paths.get(url.toURI()));
                    con.createStatement().execute(migrationData);
                    success.add(resource);

                    // save in the changelog
                    PreparedStatement save = con.prepareStatement("""
                            insert into no_rollback_from_here (no_rollback_resource) values (?)
                            """);
                    save.setString(1, resource);
                    save.executeUpdate();
                } catch (IOException | URISyntaxException e) {
                    failed.add(resource);
                    throw new RuntimeException(e);
                }
            }
        } finally {
            // let's unlock
            con.createStatement().execute("""
                    delete from no_rollback_from_here_lock;
                    """);
        }
    }

    public List<String> getDonePrevious() {
        return donePrevious;
    }

    public List<String> getSuccess() {
        return success;
    }

    public List<String> getFailed() {
        return failed;
    }
}
