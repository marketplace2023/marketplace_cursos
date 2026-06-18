import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

// Fallback prevents neon() from throwing at module evaluation during `next build`.
// At runtime the real DATABASE_URL is always present.
const sql = neon(process.env.DATABASE_URL ?? 'postgresql://build:build@ep-build.neon.tech/build')
export const db = drizzle(sql, { schema })

export type DB = typeof db
