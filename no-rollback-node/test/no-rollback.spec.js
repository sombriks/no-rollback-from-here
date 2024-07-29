// @ts-check
import test from 'ava';
import {NoRollback} from "../lib/no-rollback.js";
import {PGlite} from "@electric-sql/pglite";

test('should run on PGlite', async t => {

  // given
  const connection = new PGlite('memory://test-pgdata', {debug: 0});
  const changesets = [
    "test/fixtures/01-happy-path/init.sql"
  ]

  // when
  const migrator = NoRollback(connection)
  await migrator.migrate(changesets)

  // then
  t.truthy(Object.keys(migrator.results).length)
})
