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
        query: (statement: string, params: any[]) => Promise<any>;
        all: (statement: string, callback: (err: Error, rows: any[]) => void) => Promise<any>;
    }

    /**
     * we kindly ask the user to tell us what in the name of zombie jesus a we
     * dealing with.
     */
    type DbType = "postgres" | "sqlite" | "mysql"

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

    export function NoRollback(params: NoRollbackParams): NoRollbackConfig

}
