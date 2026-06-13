// lib/db.js
// PostgreSQL connection pool for CareerNav.
// Uses the `pg` package. A single Pool is reused across all requests
// (Next.js keeps this module cached between hot-reloads in dev).

import { Pool } from 'pg';

// ─── Build connection config ──────────────────────────────────────────────────
// Prefer DATABASE_URL (Neon, Supabase, Railway, etc.).
// Fall back to individual env vars for local dev.
function buildConfig() {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      // Most hosted Postgres providers require SSL.
      // Local Postgres usually does not — the conditional keeps both working.
      ssl: process.env.DATABASE_URL.includes('localhost')
        ? false
        : { rejectUnauthorized: false },
      max: 10,             // max pool size
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    };
  }

  return {
    host:     process.env.DB_HOST     || 'localhost',
    port:     Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME     || 'careernav',
    user:     process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    ssl:      process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  };
}

// ─── Singleton pool ───────────────────────────────────────────────────────────
// In Next.js dev, modules can be re-evaluated on hot-reload.
// We attach the pool to `globalThis` to avoid creating multiple pools.
const globalPool = globalThis.__careernavPool;

const pool = globalPool ?? new Pool(buildConfig());

if (!globalThis.__careernavPool) {
  globalThis.__careernavPool = pool;

  pool.on('error', (err) => {
    console.error('[DB] Unexpected pool error:', err.message);
  });
}

export default pool;

// ─── Convenience query helper ─────────────────────────────────────────────────
/**
 * Run a parameterised SQL query.
 * @param {string} text   - SQL string with $1, $2 … placeholders
 * @param {any[]}  params - Parameter values
 * @returns {Promise<import('pg').QueryResult>}
 */
export async function query(text, params = []) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DB] ${Date.now() - start}ms  ${text.slice(0, 80)}`);
    }
    return result;
  } catch (err) {
    console.error('[DB] Query error:', err.message, '\nSQL:', text);
    throw err;
  }
}
