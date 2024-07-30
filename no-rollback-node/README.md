# no-rollback-node

[![Node CI](https://github.com/sombriks/no-rollback-from-here/actions/workflows/node.yml/badge.svg)](https://github.com/sombriks/no-rollback-from-here/actions/workflows/node.yml)

Simple, trimmed, node library for database migrations. It's up to you to do most
of the job.

## Minimum requirements

- node 20

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

- [X] SQLite (surprise!)
- [X] PGLite
- [X] Postgresql
- [ ] MySQL
- [ ] MSSQL
- [ ] Oracle
- [ ] DB2

## Installing

    TODO

## Usage/Examples

    TODO

## Noteworthy

- There is no such thing as jdbc for node. That means we don't have a common API
  and also needs to deal with different dialects... in prepared statements!
- Even PostgreSQL and PGLite has differences in api.
- 
