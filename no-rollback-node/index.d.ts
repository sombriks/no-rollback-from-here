declare namespace NoRollbackNode {

    type DuckConnection = {
        exec: (statement: string) => Promise<any>;
        query: (statement: string, params: any[]) => Promise<any>;
    }

    type NoRollbackConfig = {
        results: Record<string, any>
        migrate: (changesets: string[]) => Promise<void>
    }

    function NoRollback(con: DuckConnection): NoRollbackConfig

}
