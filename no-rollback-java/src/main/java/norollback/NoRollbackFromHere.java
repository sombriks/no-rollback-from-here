package norollback;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class NoRollbackFromHere {
    public String migrate(Connection con) throws SQLException {
        try (PreparedStatement prep = con.prepareStatement("""
                create table if not exists no_rollback_from_here(
                    data timestamp not null default now(), 
                    path text not null
                );
                """)) {
            prep.execute();
        }
        return "success";
    }
}
