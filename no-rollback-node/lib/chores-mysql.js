/**
 *
 * @param {DuckConnection} connection
 */
export function hackTime(connection) {
  if (!connection.exec) connection.exec = connection.query
}

/**
 *
 * @param {DuckConnection} connection
 */
export async function dbMeta(connection) {
  // to behave like all other RDBMS engines needs `multipleStatements: true` on
  // connection parameters. might not be available so we compromise. might also
  // affect migrations with multiple statements but then, the migration that the
  // developer wrote isn't our problem by the rules of this game.
  await connection.exec(`
      -- store script names already executed
      create table if not exists no_rollback_from_here(
        created timestamp default current_timestamp,
        path varchar(750) unique not null,
        primary key (created, path)
      );
    `)
  return await connection.exec(`
      -- lock while applying migrates to avoid possible concurrent executions
      create table if not exists lock_no_rollback(
        locked integer not null default 1 check (locked = 1),
        created timestamp default current_timestamp,
        primary key (locked)
      );
    `)
}

/**
 *
 * @param {DuckConnection} connection
 */
export async function dbLock(connection) {
  return await connection.exec(`
          -- lock table so we avoid concurrent attempts to run migrations
          insert into lock_no_rollback (locked) values (1);
        `);
}

/**
 *
 * @param {DuckConnection} connection database connection
 * @param changeset resource to verify if it's already applied
 */
export async function dbCheck(connection, changeset) {
  const result = await connection.query(`
                -- check if current changeset wasn't already executed
                select created, path from no_rollback_from_here where path = ?
            `, [changeset])
  return result.rows ?? []
}

export async function dbExec(connection, content) {
  return await connection.exec(content)
}

/**
 *
 * @param {DuckConnection} connection
 * @param changeset
 */
export async function dbLedger(connection, changeset) {
  return await connection.query(`
                -- save applied changeset in metadata
                insert into no_rollback_from_here(path)
                values (?)
              `, [changeset])
}

export async function dbUnlock(connection) {
  // always remember to unlock
  return await connection.exec(`
          -- release table lock
          delete from lock_no_rollback;
        `);
}
