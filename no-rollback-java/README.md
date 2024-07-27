# no-rollback-java

Simple, trimmed, java library for database migrations. It's up to you to do most
of the job.

## Minimum requirements

- java 17

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

See [tests][tests] for more

## Noteworthy

- db2 and oracle can be tricky.
- i was temped to add a logging library but the challenge is to bear zero deps.
- bld is cool but i had to customize the project because this weird layout.

## Roadmap

- [ ] tests and coverage
- [ ] set up library at github registry
- [ ] set up library at nexus sonatype registry
- [ ] postgresql suport
- [ ] mysql support
- [ ] oracle support
- [ ] db2 support
- [ ] sql server support

## Contributing

Fork and open PRs, willing to receive them :sunglasses: 

[tests]: ./src/test/java/norollback/NoRollbackTest.java
