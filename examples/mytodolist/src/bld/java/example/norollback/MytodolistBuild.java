package example.norollback;

import rife.bld.Project;
import rife.bld.dependencies.Repository;

import java.util.List;

import static rife.bld.dependencies.Repository.MAVEN_CENTRAL;
import static rife.bld.dependencies.Repository.RIFE2_RELEASES;
import static rife.bld.dependencies.Scope.*;

public class MytodolistBuild extends Project {

    public MytodolistBuild() {
        pkg = "example.norollback";
        name = "Mytodolist";
        mainClass = "example.norollback.MytodolistMain";
        version = version(0, 1, 0);

        downloadSources = true;
        autoDownloadPurge = true;
        repositories = List.of(MAVEN_CENTRAL, RIFE2_RELEASES,
                new Repository("https://maven.pkg.github.com/sombriks/*",
                        System.getenv("GITHUB_ACTOR"),
                        System.getenv("GITHUB_TOKEN")
                )
        );

        scope(compile)
                .include(dependency("org.jdbi:jdbi3-core:3.45.1"))
                .include(dependency("norollback:norollback:0.1.0"))
                .include(dependency("com.fasterxml.jackson.core:jackson-databind:2.17.1"))
                .include(dependency("io.vertx:vertx-web:4.5.9"));

        scope(test)
                .include(dependency("org.junit.jupiter", "junit-jupiter", version(5, 10, 2)))
                .include(dependency("org.junit.platform", "junit-platform-console-standalone", version(1, 10, 2)));

        scope(runtime)
                .include(dependency("com.h2database:h2:2.3.230"));
    }

    public static void main(String[] args) {
        new MytodolistBuild().start(args);
    }
}
