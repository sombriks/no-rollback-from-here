import {default as sqlite3} from "sqlite3"
import {NoRollback} from 'no-rollback-node'

const connection = new sqlite3.verbose().cached.Database('./todos.db')

const migrator = NoRollback({connection, dbType: 'sqlite'});

await migrator.migrate(['my-migration.sql'])

console.log(migrator)

connection.get('select * from todos', (err, result) => {
  if (err) throw err;
  console.log(result)
})
