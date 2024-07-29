declare namespace NoRollbackNode {

    type DuckConnection = {
        exec: (statement: string) => Promise<any>;
        query: (statement: string, params: any[]) => Promise<any>;
    }

    type NoRollbackConfig = {
        donePrevious: Record<string, any>
        success: Record<string, any>
        failed: Record<string, any>
        migrate: (changesets: string[]) => Promise<void>
    }

    function NoRollback(con: DuckConnection): NoRollbackConfig

}
