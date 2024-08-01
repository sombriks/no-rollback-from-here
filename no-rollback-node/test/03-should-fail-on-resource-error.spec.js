import {default as sqlite3} from 'sqlite3'
import test from "ava"
import {NoRollback} from "../lib/no-rollback.js"

test('Should fail on migration error', async t => {
  // given
  const connection = new (sqlite3.Database)(':memory:')
  const changesets = [
    "test/fixtures/02-migrate-error/0001-initial-schema.sql",
    "test/fixtures/02-migrate-error/0002-initial-data-but-error.sql",
    "test/fixtures/02-migrate-error/0003-extra-changeset-but-will-not-run.sql",
  ]

  // when
  const migrator = NoRollback({connection, dbType: 'sqlite'})

  try {
    await migrator.migrate(changesets)
  } catch (e) {
    console.log(e)
  }

  // then
  t.is(1, Object.keys(migrator.success).length)
  t.is(1, Object.keys(migrator.failed).length)
  t.is(0, Object.keys(migrator.donePrevious).length)
})
