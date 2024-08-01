import {default as sqlite3} from 'sqlite3'
import test from "ava"
import {NoRollback} from "../lib/no-rollback.js"

test('should NOT run same migrate twice', async t => {
  // given
  const connection = new sqlite3.verbose().cached.Database(':memory:')
  const changesets = [
    "test/fixtures/01-happy-path/init.sql",
    "test/fixtures/01-happy-path/init.sql"
  ]

  // when
  const migrator = NoRollback({connection, dbType: 'sqlite'})
  await migrator.migrate(changesets)

  // then
  t.is(1, Object.keys(migrator.success).length)
  t.is(0, Object.keys(migrator.failed).length)
  t.is(1, Object.keys(migrator.donePrevious).length)
})
