# My Todos 

simple application showing how to consume the no-rollback library in java projects

## Requirements

- java 17+
- bld 1.9+

## Setup

Add the GitHub maven repository configuration into your project setup:

### bld

```java
// src/bld/java/example.norollback.MytodolistBuild.java
// ...
public class MytodolistBuild extends Project {
    public MytodolistBuild() {
//...
        repositories = List.of(MAVEN_CENTRAL, RIFE2_RELEASES,
                new Repository("https://maven.pkg.github.com/sombriks/*",
                        System.getenv("GITHUB_ACTOR"),
                        System.getenv("GITHUB_TOKEN")
                )
        );
// ..

        scope(compile)
                .include(dependency("norollback:norollback:0.1.0"))
                
                .include(dependency("org.jdbi:jdbi3-core:3.45.1"))
                .include(dependency("io.vertx:vertx-web:4.5.9"));
        // ...
    }
    // ...
}
```

### maven

    TODO

### gradle

    TODO

## Noteworthy

You need to provide the `GITHUB_ACTOR` and `GITHUB_TOKEN` environment variables
so you can authenticate with github maven registry and consume packages from it.

Check [this run configuration][config] if you want to easily set up this in a
.env.local file using intellij.

[config]: ./.idea/runConfigurations/Run%20Build.xml
