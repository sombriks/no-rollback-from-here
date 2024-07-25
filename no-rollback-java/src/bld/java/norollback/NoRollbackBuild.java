package norollback;

import rife.bld.Project;

import java.util.List;

import static rife.bld.dependencies.Repository.*;
import static rife.bld.dependencies.Scope.*;

public class NoRollbackBuild extends Project {

    public NoRollbackBuild() {

        pkg = "norollback";
        name = "NoRollback";
        version = version(0, 1, 0);

        downloadSources = true;
        autoDownloadPurge = true;

        repositories = List.of(MAVEN_CENTRAL, RIFE2_RELEASES);

        scope(test)
                .include(dependency("org.junit.jupiter:junit-jupiter:5.10.2"))
                .include(dependency("org.junit.platform:junit-platform-console-standalone:1.10.2"))
                .include(dependency("org.testcontainers:testcontainers:1.20.0"))
                .include(dependency("org.testcontainers:db2:1.20.0"))
                .include(dependency("org.testcontainers:mysql:1.20.0"))
                .include(dependency("org.testcontainers:oracle-free:1.20.0"))
                .include(dependency("org.testcontainers:postgresql:1.20.0"));
        scope(runtime)
                .include(dependency("com.ibm.db2:jcc:11.5.9.0"))
                .include(dependency("com.mysql:mysql-connector-j:9.0.0"))
                .include(dependency("com.oracle.database.jdbc:ojdbc11:23.4.0.24.05"))
                .include(dependency("org.postgresql:postgresql:42.7.3"));
    }

    public static void main(String[] args) {
        new NoRollbackBuild().start(args);
    }
}
