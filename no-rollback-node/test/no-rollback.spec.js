// @ts-check
import test from 'ava';
import {NoRollback} from "../lib/no-rollback.js";

test('no-rollback', t => {

  const migrator = NoRollback()

  t.truthy(migrator)
})
