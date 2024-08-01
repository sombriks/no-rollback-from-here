# [no-rollback-node][repo]

[![Node CI](https://github.com/sombriks/no-rollback-from-here/actions/workflows/node.yml/badge.svg)](https://github.com/sombriks/no-rollback-from-here/actions/workflows/node.yml)
[![npm](https://img.shields.io/npm/v/no-rollback-node?style=plastic)](https://www.npmjs.com/no-rollback-node)

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

## Installing

```bash
npm i no-rollback-node
```

## Usage/Examples

```javascript
import { NoRollback } from "no-rollback-node"

// build your migrations list. it's your problem.
const changesets = [
  "app/configs/migrations/0001-initial-schema.sql",
  "app/configs/migrations/0002-initial-data.sql",
  "app/configs/migrations/0003-add-new-column-changeset.sql",
]
if(process.env.NODE_ENV == 'test')
  changesets.push("app/configs/migrations/9999-test-data.sql")

// provision a database connection and please point the engine. no fallback from here
const migrator = NoRollback({connection:myConnection, dbType: "postgres"})

// showtime
await migrator.migrate(changesets)
```

See [tests][tests] and [examples][examples] for details.

## Supported RDMS so far and planned

- [X] SQLite (surprise!)
- [X] PGLite
- [X] Postgresql
- [X] MySQL
- [ ] MSSQL
- [ ] Oracle
- [ ] DB2

## Noteworthy

- There is no such thing as jdbc for node. That means we don't have a common API
  and also needs to deal with different dialects... in prepared statements!
- Even PostgreSQL and PGLite has differences in api.
- MySQL needs special setup in order to allow several statements in a single
  exec call. consuming projects might not have this configured, so we compromise
  a little, but the challenge here is to be simple and as little intrusive as
  possible.
- Current design can be further improved; database engine specific helps but it
  can be better.

[repo]: https://github.com/sombriks/no-rollback-from-here
[tests]: ./test/01-should-just-run.spec.js
[examples]: ../examples/mytodolist-node/index.js
