declare namespace NoRollbackNode {

    /**
     * an attempt to represent all kinds of database connections available to
     * node, so we can compromise and support most of them.
     *
     * @see
     * - https://github.com/TryGhost/node-sqlite3/wiki/API
     * - https://github.com/electric-sql/pglite?tab=readme-ov-file#methods
     * - https://sidorares.github.io/node-mysql2/docs/documentation/promise-wrapper
     * - https://node-postgres.com/features/queries
     */
    type DuckConnection = {
        exec: (statement: string) => Promise<any>;
        query: (statement: string, params?: any[]) => Promise<any>;
        all: (statement: string, callback: (err: Error, rows: any[]) => void) => Promise<any>;
    }

    /**
     * we kindly ask the developer to tell us what in the name of zombie jesus
     * are we dealing with.
     */
    type DbType = "postgres" | "sqlite" | "mysql"

    /**
     * the context to pass on to the migrator
     */
    type NoRollbackParams = {
        connection: DuckConnection
        dbType: DbType
    }

    type NoRollbackConfig = {
        donePrevious: Record<string, any>
        success: Record<string, any>
        failed: Record<string, any>
        migrate: (changesets: string[]) => Promise<void>
    }

    /**
     * Our migrator facade
     *
     * @param {NoRollbackParams} params the context so we can start to provision
     * data access and any other chore that should be transparent to the
     * developer
     *
     * @returns {NoRollbackConfig} The ready-to-run migrator. There is no rollback from here
     *
     * @constructor
     */
    export type NoRollbackFn = (params: NoRollbackParams) => NoRollbackConfig

}
