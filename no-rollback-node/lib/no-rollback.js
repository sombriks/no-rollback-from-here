// @ts-check
import {readFileSync} from "node:fs"
import * as mysql from './chores-mysql.js'
import * as postgres from './chores-postgres.js'
import * as sqlite from './chores-sqlite.js'

/**
 * Provision a migrator instance
 *
 * @type {NoRollbackFn}
 *
 */
export const NoRollback = ({connection, dbType, logger}) => {

  const donePrevious = {}
  const success = {}
  const failed = {}

  const chores = {
    mysql,
    postgres,
    sqlite
  }

  // 👀
  chores[dbType].hackTime(connection)

  return {
    // results so the developer can check them, log them, anything
    donePrevious,
    success,
    failed,
    /**
     * The actual migration operation
     * @param {string[]} changesets list of migration files to read and apply to the database
     */
    async migrate(changesets) {
      try {
        await chores[dbType].dbMeta(connection)
        await chores[dbType].dbLock(connection)
        for await (const changeset of changesets) {
          try {
            const skip = await chores[dbType].dbCheck(connection, changeset);
            if (skip.length === 0) {
              // apply
              const content = readFileSync(changeset, "utf8")
              await chores[dbType].dbExec(connection, content)
              // save
              await chores[dbType].dbLedger(connection, changeset)
              success[changeset] = "success"
            } else {
              const [{created}] = skip
              donePrevious[changeset] = `already ran at ${created}`
            }
          } catch (e) {
            failed[changeset] = e
            logger?.error(e)
            break
          }
        }
      } catch (e) {
        // that's not supposed to happen
        failed["???"] = e
        logger?.error(e)
      } finally {
        await chores[dbType].dbUnlock(connection);
      }
    }
  }
}

