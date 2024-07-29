# no-rollback-java

[![Java CI](https://github.com/sombriks/no-rollback-from-here/actions/workflows/java.yml/badge.svg)](https://github.com/sombriks/no-rollback-from-here/actions/workflows/java.yml)

Simple, trimmed, java library for database migrations. It's up to you to do most
of the job.

## Minimum requirements

- java 17

## Features

This come out of the box:

- Changelog table.
- Lock table (avoid concurrent migrators).
- Native SQL migrations expected.

This is your problem to deal with:

- Some up/down strategy.
- From where to get the migrations.
- Check for contexts, environment variables or something to help decide to run
  or not a migration file.
- Run specially tailored scripts for a specific database engine.

But boy it's fast!

## Supported RDMS

- [X] H2 (surprise!)
- [X] Postgresql
- [X] MySQL
- [ ] MSSQL 
- [ ] Oracle
- [ ] DB2

## Installing

Bld:

Add the github maven registry configuration:

     repositories = List.of(MAVEN_CENTRAL, RIFE2_RELEASES,
            new Repository("https://maven.pkg.github.com/sombriks/*",
                    System.getenv("GITHUB_ACTOR"),
                    System.getenv("GITHUB_TOKEN")
            )
     );

Then the dependency:

     scope(compile)
        .include(dependency("norollback:norollback:0.1.0"))

Maven:

    // TODO

Gradle/others:

    // TODO

## Usage/Examples

```java
// ...
        NoRollbackFromHere noRollback = new NoRollbackFromHere(getClass());
        noRollback.migrate(con,"/test1.sql");
        assertEquals(0, noRollback.getFailed().size());
        assertEquals(1, noRollback.getSuccess().size());
        assertEquals(0, noRollback.getDonePrevious().size());
// ...
```

See [tests][tests] and [example project][example] for more examples.

## Noteworthy

- The h2 database is the only one not depending on testcontainers.
- Big tech engines like db2, mssql and oracle can be tricky. They shouldn't, any
  software architect will choose anything else if they can't easily attest the
  engine capabilities.
- I was temped to add a logging library but the challenge is to bear zero deps.
- ~~Bld is cool but i had to customize the project because this weird layout~~.
  Ok skill issue, fixed, bld is fantastic.
- Publish maven packages on github is dead simple, just have the proper
  authentication credentials and you're good. The docs should have a TL;DR; with
  just that.
- Consume the package, however, will demand similar setup, people not acquainted
  with private repos might get trouble on that part.

## Roadmap

- [X] tests and coverage
- [X] set up library at github registry
- [ ] set up library at nexus sonatype registry
- [X] postgresql support
- [X] mysql support
- [X] h2 support
- [ ] oracle support
- [ ] db2 support
- [ ] sql server support

## Contributing

Fork and open PRs, willing to receive them :sunglasses:

[tests]: ./src/test/java/norollback/NoRollbackTest.java
[example]: ../examples/mytodolist/README.md
