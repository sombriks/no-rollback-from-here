// @ts-check
import test from 'ava';
import {NoRollback} from "../lib/no-rollback.js";
import {PGlite} from "@electric-sql/pglite";
import {default as sqlite3} from 'sqlite3';

test.before(async (t) => {})

test.after.always(async (t) => {})

const happyPath = async (t, connection) => {
  // given
  const changesets = [
    "test/fixtures/01-happy-path/init.sql"
  ]

  // when
  const migrator = NoRollback(connection)
  await migrator.migrate(changesets)

  console.log(migrator)

  // then
  t.truthy(Object.keys(migrator.success).length)
  t.falsy(Object.keys(migrator.failed).length)
  t.falsy(Object.keys(migrator.donePrevious).length)

  // verify migrate
  const result = await connection.query(`
    insert into xpto(id,foo)
    values ($1, $2) returning id;
  `,[1,'test'])

  t.truthy(result)
  t.truthy(result.rows)
  t.truthy(result.rows.length)
  const [{id}] = result.rows
  t.truthy(id)
}

test('should run on PGLite', async t => {
  const connection = new PGlite('memory://test-pgdata', {debug: 0});
  await happyPath(t, connection)
})

test('should run on SQLite', async t => {
  const connection = new sqlite3.Database('memory')
  await happyPath(t, connection)
})
