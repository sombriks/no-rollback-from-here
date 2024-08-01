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
  await t.context.pgsql.stop({timeout: 500});
  await t.context.mysql.stop({timeout: 500});
})

const happyPath = async (t, params) => {
  // given
  const changesets = [
    "test/fixtures/01-happy-path/init.sql"
  ]

  // when
  const migrator = NoRollback(params)
  await migrator.migrate(changesets)

  console.log(migrator)

  // then
  t.is(1, Object.keys(migrator.success).length)
  t.is(0, Object.keys(migrator.failed).length)
  t.is(0, Object.keys(migrator.donePrevious).length)

  // verify if migrate created the table
  await params.connection[params.connection.exec ? 'exec' : 'query'](`
    -- now we attempt to insert a new value
    insert into xpto (id, foo) values (1, 'test');
  `)

  const result = params.connection.query(`select * from xpto where id = 1`,[])

  t.truthy(result)
}

test('should run on PGLite', async t => {
  const connection = new PGlite('memory://test-pgdata', {debug: 0});
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

test.skip('should run on MySQL', async t => {
  const connection = await mysql.createConnection(t.context.mysql.getConnectionUri())
  await happyPath(t, {connection, dbType: 'mysql'})
  await connection.end()
})

test('should run on SQLite', async t => {

  const connection = new sqlite3.verbose().cached.Database(':memory:')
  await happyPath(t, {connection, dbType: 'sqlite'})
})
