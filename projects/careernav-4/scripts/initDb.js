// scripts/initDb.js
// Run once to create the CareerNav PostgreSQL schema.
// Usage:  node scripts/initDb.js
//
// Requires DATABASE_URL in your environment (or .env.local via dotenv).

// Load .env.local automatically
import { readFileSync } from 'fs';
import { resolve } from 'path';

try {
  const envPath = resolve(process.cwd(), '.env.local');
  const lines = readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
  console.log('✅ Loaded .env.local');
} catch {
  console.log('ℹ️  No .env.local found — using existing environment variables');
}

import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost')
    ? false
    : { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  console.log('✅ Connected to PostgreSQL');

  try {
    await client.query('BEGIN');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email      TEXT UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Default guest user (no auth needed to get started)
    await client.query(`
      INSERT INTO users (id, email)
      VALUES ('00000000-0000-0000-0000-000000000001', 'guest@careernav.local')
      ON CONFLICT DO NOTHING
    `);

    // Resumes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS resumes (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        file_name   TEXT NOT NULL,
        file_path   TEXT,
        file_url    TEXT,
        target_role TEXT,
        status      TEXT NOT NULL DEFAULT 'uploaded'
                      CHECK (status IN ('uploaded','analyzing','analyzed','error')),
        resume_text TEXT,
        upload_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        analyzed_at TIMESTAMPTZ
      )
    `);

    // AI feedback stored as JSONB columns for flexibility
    await client.query(`
      CREATE TABLE IF NOT EXISTS resume_feedback (
        id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        resume_id            UUID NOT NULL UNIQUE REFERENCES resumes(id) ON DELETE CASCADE,
        strengths            JSONB NOT NULL DEFAULT '[]',
        weaknesses           JSONB NOT NULL DEFAULT '[]',
        missing_keywords     JSONB NOT NULL DEFAULT '[]',
        detected_skills      JSONB NOT NULL DEFAULT '[]',
        suggestions          JSONB NOT NULL DEFAULT '[]',
        recommended_projects JSONB NOT NULL DEFAULT '[]',
        career_path          TEXT,
        roadmap              JSONB NOT NULL DEFAULT '[]',
        created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_resumes_user    ON resumes(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_resumes_date    ON resumes(upload_date DESC)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_feedback_resume ON resume_feedback(resume_id)`);

    await client.query('COMMIT');
    console.log('');
    console.log('✅ Database schema ready!');
    console.log('   Tables created: users, resumes, resume_feedback');
    console.log('   Default guest user inserted.');
    console.log('');
    console.log('Next step: npm run dev');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
