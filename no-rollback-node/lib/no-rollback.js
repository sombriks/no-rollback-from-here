// @ts-check
import {readFileSync} from "node:fs";

/**
 * Provisions a migrator instance
 * @param {DuckConnection} con The database connection
 * @returns {NoRollbackConfig} The ready-to-run migrator. There is no rollback from here
 */
export const NoRollback = (con) => {

  const donePrevious = {}
  const success = {}
  const failed = {}

  return {
    donePrevious,
    success,
    failed,
    /**
     * The actual migration operation
     * @param {string[]} changesets list of migration files to read and apply to the database
     */
    async migrate(changesets) {
      await con.exec(`
        -- store script names already executed
        create table if not exists no_rollback_from_here(
          created timestamp default now(),
          path text unique not null,
          primary key (created, path)
        );
        -- lock while applying migrates to avoid possible concurrent executions
        create table if not exists lock_no_rollback(
          locked integer not null default 1 check (locked = 1),
          created timestamp default now(),
          primary key (locked)
        );
      `)

      try {
        await con.exec('insert into lock_no_rollback default values;');
        for await (const changeset of changesets) {
          try {
            const skip = await con.query(`
                select created, path
                from no_rollback_from_here
                where path = $1
            `, [changeset])
            if (skip.rows.length == 0) {
              const content = readFileSync(changeset, "utf8")
              await con.exec(content)
              await con.query(`
                  insert into no_rollback_from_here(path)
                  values ($1)
              `, [changeset])
              success[changeset] = "success"
            } else {
              const [{created}] = skip.rows
              donePrevious[changeset] = `already ran at ${created}`
            }
          } catch (e) {
            failed[changeset] = e
          }
        }
      } finally {
        // always remember to unlock
        await con.exec('delete from lock_no_rollback;');
      }
    }
  }
}

