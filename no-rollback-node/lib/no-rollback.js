// @ts-check
import {readFileSync} from "node:fs"


/**
 * Provisions a migrator instance
 * @param {NoRollbackParams} params connection and information about the underlying database
 * @returns {NoRollbackConfig} The ready-to-run migrator. There is no rollback from here
 */
export const NoRollback = (params) => {

  const donePrevious = {}
  const success = {}
  const failed = {}

  const {connection, dbType} = params

  async function setupMetadata() {
    await exec(`
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

  async function lock() {
    await exec(`
          -- lock table so we avoid concurrent attempts to run migrations
          insert into lock_no_rollback (locked) values (1);
        `);
  }

  async function unlock() {
    // always remember to unlock
    await exec(`
          -- release table lock
          delete from lock_no_rollback;
        `);
  }

  async function checkApplied(changeset) {
    const result = await query(`
                -- check if current changeset wasn't already executed
                select created, path from no_rollback_from_here where path = $1
            `, [changeset])
    // hacky time 2
    return Array.isArray(result) ? result : Array.isArray(result?.rows) ? result.rows : []
  }

  return {
    donePrevious,
    success,
    failed,
    /**
     * The actual migration operation
     * @param {string[]} changesets list of migration files to read and apply to the database
     */
    async migrate(changesets) {
      await setupMetadata(dbtype);

      try {
        await lock();
        for await (const changeset of changesets) {
          try {
            const skip = await checkApplied(changeset);
            if (skip.length === 0) {

              const content = readFileSync(changeset, "utf8")
              await exec(content)

              await query(`
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
        await unlock();
      }
    }
  }
}

