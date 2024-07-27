# no-rollback-java

[![Java CI](https://github.com/sombriks/no-rollback-from-here/actions/workflows/java.yml/badge.svg)](https://github.com/sombriks/no-rollback-from-here/actions/workflows/java.yml)

Simple, trimmed, java library for database migrations. It's up to you to do most
of the job.

## Minimum requirements

- java 17

## Features

This come out of the box:

- Changelog table
- Lock table (avoid concurrent migrators)
- Native SQL migrations expected

This is your problem to deal with:

- Some up/down strategy
- From where to get the migrations
- Check for contexts, environment variables or something to decide to run or not
- Run specially tailored scripts for a specific database engine

But boy it's fast!

## Installing

Maven:

Gradle/others:

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

_TODO_ add more examples of the expected usage of it

See [tests][tests] for more

## Noteworthy

- db2 and oracle can be tricky.
- i was temped to add a logging library but the challenge is to bear zero deps.
- bld is cool but i had to customize the project because this weird layout.

## Roadmap

- [X] tests and coverage
- [ ] set up library at github registry
- [ ] set up library at nexus sonatype registry
- [ ] postgresql support
- [ ] mysql support
- [ ] oracle support
- [ ] db2 support
- [ ] sql server support

## Contributing

Fork and open PRs, willing to receive them :sunglasses:

[tests]: ./src/test/java/norollback/NoRollbackTest.java
