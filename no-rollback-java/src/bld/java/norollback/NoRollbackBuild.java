package norollback;

import rife.bld.BuildCommand;
import rife.bld.Project;
import rife.bld.dependencies.Repository;
import rife.bld.extension.JacocoReportOperation;

import java.util.List;

import static rife.bld.dependencies.Repository.MAVEN_CENTRAL;
import static rife.bld.dependencies.Repository.RIFE2_RELEASES;
import static rife.bld.dependencies.Scope.runtime;
import static rife.bld.dependencies.Scope.test;

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
                .include(dependency("org.testcontainers:mssqlserver:1.20.0"))
                .include(dependency("org.testcontainers:mysql:1.20.0"))
                .include(dependency("org.testcontainers:oracle-free:1.20.0"))
                .include(dependency("org.testcontainers:postgresql:1.20.0"));

        scope(runtime)
                .include(dependency("com.h2database:h2:2.3.230"))
                .include(dependency("com.ibm.db2:jcc:11.5.9.0"))
                .include(dependency("com.microsoft.sqlserver:mssql-jdbc:12.6.3.jre11"))
                .include(dependency("com.mysql:mysql-connector-j:9.0.0"))
                .include(dependency("com.oracle.database.jdbc:ojdbc11:23.4.0.24.05"))
                .include(dependency("org.postgresql:postgresql:42.7.3"));

        publishOperation().repository(new Repository(
                "https://maven.pkg.github.com/sombriks/no-rollback-from-here",
                System.getenv("GITHUB_ACTOR"),
                System.getenv("GITHUB_TOKEN")
        ));
    }

    public static void main(String[] args) {
        new NoRollbackBuild().start(args);
    }

    @BuildCommand(summary = "Generates Jacoco Reports")
    public void jacoco() throws Exception {
        new JacocoReportOperation()
                .fromProject(this)
                .execute();
    }
}
