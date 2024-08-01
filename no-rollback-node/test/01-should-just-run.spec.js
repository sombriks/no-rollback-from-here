// @ts-check
import test from 'ava'
import {NoRollback} from "../lib/no-rollback.js"
import mysql from 'mysql2/promise'
import {PGlite} from "@electric-sql/pglite"
import pg from 'pg'
import {default as sqlite3} from 'sqlite3'
import {PostgreSqlContainer} from '@testcontainers/postgresql'
import {MySqlContainer} from "@testcontainers/mysql"

test.before(async (t) => {
  t.context.pgsql = await new PostgreSqlContainer('postgres:16.3-alpine3.20').start()
  t.context.mysql = await new MySqlContainer("mysql:9.0.1-oraclelinux9").start()
})

test.after.always(async (t) => {
  await t.context.pgsql.stop({timeout: 500})
  await t.context.mysql.stop({timeout: 500})
})

/**
 * common handle for every supported database engine
 * @param t ava assertions
 * @param {NoRollbackParams} params to prepare a migrator
 * @returns {Promise<void>}
 */
const happyPath = async (t, params) => {
  // given
  const changesets = [
    "test/fixtures/01-happy-path/init.sql"
  ]

  // when
  const migrator = NoRollback({...params, logger: {error: console.log}})
  await migrator.migrate(changesets)

  // then
  t.is(1, Object.keys(migrator.success).length)
  t.is(0, Object.keys(migrator.failed).length)
  t.is(0, Object.keys(migrator.donePrevious).length)

  // verify if migrate really created the table
  await params.connection.exec(`
    -- now we attempt to insert a new value
    insert into xpto (id, foo) values (1, 'test');
  `)

  // this one puts our duck connection on trial, query function should be there
  const result = await params.connection.query(`
    -- let's verify if the value is there, just in case!    
    select * from xpto where id = 1
  `)

  // XXX but we don't touch return types for the sake of whatever the developer
  // is using. even force exec/query is too risky, let's change it in future.
  t.truthy(result)
  if (params.dbType === 'sqlite') {
    t.is(1, result.length)
  } else if (params.dbType === 'postgres') {
    t.is(1, result.rows.length)
  }
}

test('should run on PGLite', async t => {
  const connection = new PGlite('memory://test-pgdata', {debug: 0})
  await happyPath(t, {connection, dbType: 'postgres'})
  // await connection.end()
})


test('should run on PostgreSQL', async t => {
  const connection = new pg.Client({
    connectionString: t.context.pgsql.getConnectionUri()
  })
  await connection.connect()
  await happyPath(t, {connection, dbType: 'postgres'})
  await connection.end()
})

test('should run on MySQL', async t => {
  // mysql driver should be more explicit about the multipleStatements config
  const connection = await mysql.createConnection({
    password: t.context.mysql.getRootPassword(),
    database: t.context.mysql.getDatabase(),
    user: t.context.mysql.getUsername(),
    port: t.context.mysql.getPort(),
    multipleStatements: true,
    // debug: true
  })
  await happyPath(t, {connection, dbType: 'mysql'})
  await connection.end()
})

test('should run on SQLite', async t => {

  const connection = new sqlite3.verbose().cached.Database(':memory:')
  await happyPath(t, {connection, dbType: 'sqlite'})
})
