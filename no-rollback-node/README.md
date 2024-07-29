# no-rollback-node

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

## Usage

