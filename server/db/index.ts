import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Lazy initialization to avoid startup errors
let _db: ReturnType<typeof drizzle> | null = null

function initDatabase() {
  if (!_db) {
    const config = useRuntimeConfig()
    const connectionString = config.databaseUrl || 'postgresql://localhost:5432/crane_beta_dev'
    
    const client = postgres(connectionString)
    _db = drizzle(client, { schema })
  }
  return _db
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    const database = initDatabase()
    return database[prop as keyof typeof database]
  }
})