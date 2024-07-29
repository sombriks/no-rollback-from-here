// @ts-check
/**
 * Provisions a migrator instance
 * @param {DuckConnection} con The database connection
 * @returns {NoRollbackConfig} The ready-to-run migrator. There is no rollback from here
 */
export const NoRollback = (con) => {

  const results = {}

  return {
    results,
    /**
     * The actual migration operation
     * @param {string[]} changesets list of migration files to read and apply to the database
     */
    async migrate(changesets) {
      const metadata = `
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
      `;
      await con.exec(metadata)
      // Lock table to avoid concurrent migrations
      try {
        await con.exec('insert into lock_no_rollback default values;');


      } finally {
        // always remember to unlock
        await con.exec('delete from lock_no_rollback;');
      }
    }
  }
}

