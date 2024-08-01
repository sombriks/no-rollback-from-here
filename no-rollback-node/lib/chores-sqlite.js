import {promisify} from "node:util";

export async function hackTime(connection) {
  if (!connection.query) connection.query = promisify(connection.all);
  // the exec function is callback-style, we need makeup there too
  // https://github.com/TryGhost/node-sqlite3/wiki/API#execsql--callback
  connection.promiseExec = promisify(connection.exec);
}

export async function dbMeta(connection) {
  return await connection.promiseExec(`
        -- store script names already executed
        create table if not exists no_rollback_from_here(
          created timestamp default current_timestamp,
          path varchar(750) unique not null,
          primary key (created, path)
        );
        -- lock while applying migrates to avoid possible concurrent executions
        create table if not exists lock_no_rollback(
          locked integer not null default 1 check (locked = 1),
          created timestamp default current_timestamp,
          primary key (locked)
        );
      `)
}

export async function dbLock(connection) {
  return await connection.promiseExec(`
          -- lock table so we avoid concurrent attempts to run migrations
          insert into lock_no_rollback (locked) values (1);
        `);
}

export async function dbCheck(connection, changeset) {
  const result = await connection.query(`
                -- check if current changeset wasn't already executed
                select created, path from no_rollback_from_here where path = $1
            `, [changeset])
  return result ?? []
}

export async function dbExec(connection, content) {
  return await connection.promiseExec(content)
}

export async function dbLedger(connection, changeset) {
  return await connection.query(`
                -- save applied changeset in metadata
                insert into no_rollback_from_here(path)
                values ($1)
              `, [changeset])
}

export async function dbUnlock(connection) {
  // always remember to unlock
  return await connection.promiseExec(`
          -- release table lock
          delete from lock_no_rollback;
        `);
}
