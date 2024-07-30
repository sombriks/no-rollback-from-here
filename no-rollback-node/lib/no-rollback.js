// @ts-check
import {readFileSync} from "node:fs"
import {promisify} from "node:util"

/**
 * Provisions a migrator instance
 * @param {DuckConnection} con The database connection
 * @returns {NoRollbackConfig} The ready-to-run migrator. There is no rollback from here
 */
export const NoRollback = (con) => {

  const donePrevious = {}
  const success = {}
  const failed = {}

  // hacky time
  if (!con.query && !!con.run)
    con.query = promisify(con.run)

  return {
    donePrevious,
    success,
    failed,
    /**
     * The actual migration operation
     * @param {string[]} changesets list of migration files to read and apply to the database
     */
    async migrate(changesets) {
      await con.query(`
        -- store script names already executed
        create table if not exists no_rollback_from_here(
          created timestamp default current_timestamp,
          path text unique not null,
          primary key (created, path)
        );
      `, [])
      await con.query(`
        -- lock while applying migrates to avoid possible concurrent executions
        create table if not exists lock_no_rollback(
          locked integer not null default 1 check (locked = 1),
          created timestamp default current_timestamp,
          primary key (locked)
        );
      `, [])

      try {
        await con.query(`
          -- lock table so we avoid concurrent attempts to run migrations
          insert into lock_no_rollback default values;
        `, []);
        for await (const changeset of changesets) {
          try {
            const result = await con.query(`
                -- check if current changeset wasn't already executed
                select created, path from no_rollback_from_here where path = $1
            `, [changeset])
            // hacky time 2
            const skip = Array.isArray(result) ? result : Array.isArray(result?.rows) ? result.rows : []
            if (skip.length == 0) {
              const content = readFileSync(changeset, "utf8")
              // TODO exec could run several statements, query can't
              await con.query(content, [])
              await con.query(`
                -- save applied changeset in metadata
                insert into no_rollback_from_here(path)
                values ($1)
              `, [changeset])
              success[changeset] = "success"
            } else {
              const [{created}] = skip
              donePrevious[changeset] = `already ran at ${created}`
            }
          } catch (e) {
            failed[changeset] = e
          }
        }
      } finally {
        // always remember to unlock
        await con.query(`
          -- release table lock
          delete from lock_no_rollback;
        `, []);
      }
    }
  }
}

