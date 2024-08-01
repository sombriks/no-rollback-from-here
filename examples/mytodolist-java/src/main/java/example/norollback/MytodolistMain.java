package example.norollback;

import io.vertx.core.Vertx;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.http.HttpServer;
import io.vertx.ext.web.Router;
import norollback.NoRollbackFromHere;
import org.jdbi.v3.core.Jdbi;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Timestamp;
import java.util.List;

record Todos(int id, String description, boolean done, Timestamp created) {
}

public class MytodolistMain {

    private final HttpServer server;

    public MytodolistMain() throws Exception {
        Connection con = DriverManager.getConnection("jdbc:h2:./todos");
        Vertx vertx = Vertx.vertx();
        Jdbi jdbi = Jdbi.create(con);

        NoRollbackFromHere noRollback = new NoRollbackFromHere(getClass());
        noRollback.migrate(con,
                "/migrations/202407280927-create-schema.sql",
                "/migrations/202407281141-sample-data.sql"
        );
        System.out.println(noRollback.getSuccess());
        System.out.println(noRollback.getFailed());
        System.out.println(noRollback.getDonePrevious());

        Router router = Router.router(vertx);

        router.route(HttpMethod.GET, "/todos").handler(ctx -> {

            List<Todos> todos = jdbi.withHandle(handle ->
                    handle.createQuery("select * from todos")
                            .map((rs, stmtCtx) -> new Todos(
                                    rs.getInt("id"),
                                    rs.getString("description"),
                                    rs.getBoolean("done"),
                                    rs.getTimestamp("created")
                            )).list());

            ctx.json(todos);
        });

        server = vertx.createHttpServer().requestHandler(router);
    }

    public static void main(String[] args) throws Exception {
        new MytodolistMain().server.listen(8080)
                .onSuccess(ctx -> System.out.println("HTTP server started on http://0.0.0.0:8080"));
    }
}

