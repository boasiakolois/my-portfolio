# CareerNav — AI-Powered Career Development Platform

CareerNav is a full-stack Next.js application powered by **Claude AI** and **PostgreSQL**.

---

## ⚠️ IMPORTANT — Rotate Your Anthropic API Key

If you shared your API key in any chat or public place, **revoke it immediately**:

1. Go to → https://console.anthropic.com → API Keys
2. **Delete** the exposed key
3. Click **Create Key** → generate a fresh one
4. Paste the new key into `.env.local` only — never in code or chat

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
cd careernav
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Anthropic Claude AI (KEEP THIS SECRET)
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_NEW_KEY_HERE

# PostgreSQL — choose one:
# Local:    postgres://postgres:postgres@localhost:5432/careernav
# Neon:     postgres://user:pass@ep-xxx.neon.tech/careernav?sslmode=require
# Supabase: postgres://postgres:pass@db.xxx.supabase.co:5432/postgres
# Railway:  (copy the connection string from your Railway dashboard)
DATABASE_URL=postgres://postgres:postgres@localhost:5432/careernav
```

### 3. Create the database (local PostgreSQL)

```bash
# Create the database (run once)
psql -U postgres -c "CREATE DATABASE careernav;"

# Run the schema migration
npm run db:init
```

### 4. Start the dev server

```bash
npm run dev
```

Open http://localhost:3000

---

## 🐘 PostgreSQL Setup Options

### Option A — Local PostgreSQL

1. Install PostgreSQL: https://www.postgresql.org/download/
2. Start the service: `brew services start postgresql` (macOS) or `sudo service postgresql start` (Linux)
3. Create DB: `psql -U postgres -c "CREATE DATABASE careernav;"`
4. Set `DATABASE_URL=postgres://postgres:YOUR_PG_PASSWORD@localhost:5432/careernav`
5. Run `npm run db:init`

### Option B — Neon (free hosted Postgres, recommended)

1. Go to https://neon.tech → sign up → create project "careernav"
2. Copy the connection string from the dashboard
3. Set `DATABASE_URL=postgres://...@ep-xxx.neon.tech/careernav?sslmode=require`
4. Run `npm run db:init`

### Option C — Supabase (free hosted Postgres)

1. Go to https://supabase.com → new project
2. Settings → Database → Connection string → URI mode
3. Set `DATABASE_URL=postgres://postgres:PASS@db.XXX.supabase.co:5432/postgres`
4. Run `npm run db:init`

---

## 📁 Project Structure

```
careernav/
├── app/
│   ├── layout.jsx              # Root layout (Navbar + Footer)
│   ├── page.jsx                # Home page
│   ├── skills/page.jsx         # Skills analyzer
│   ├── resume/page.jsx         # Resume upload + AI analysis
│   ├── roadmap/page.jsx        # Career roadmap
│   ├── dashboard/page.jsx      # User dashboard
│   └── api/
│       ├── analyze-resume/route.js   ← Claude AI (server-side only)
│       ├── resumes/route.js          ← GET list / POST upload
│       ├── resumes/[id]/route.js     ← GET single / DELETE
│       └── files/[filename]/route.js ← Serve uploaded files
├── components/                 # Reusable React components
├── lib/
│   ├── db.js                   # PostgreSQL connection pool (pg)
│   └── resumeService.js        # All DB CRUD operations
├── scripts/
│   └── initDb.js               # Schema migration (npm run db:init)
├── styles/globals.css          # Design system
└── uploads/                    # Resume files stored here (gitignored)
```

---

## 🗄️ Database Schema

```sql
-- Users (guest user pre-inserted; add auth later)
CREATE TABLE users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resumes
CREATE TABLE resumes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  file_name   TEXT NOT NULL,
  file_path   TEXT,          -- local disk path
  target_role TEXT,
  status      TEXT DEFAULT 'uploaded',  -- uploaded|analyzing|analyzed|error
  resume_text TEXT,          -- plain text for AI
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  analyzed_at TIMESTAMPTZ
);

-- AI Feedback (JSONB for flexibility)
CREATE TABLE resume_feedback (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id            UUID UNIQUE REFERENCES resumes(id),
  strengths            JSONB DEFAULT '[]',
  weaknesses           JSONB DEFAULT '[]',
  missing_keywords     JSONB DEFAULT '[]',
  detected_skills      JSONB DEFAULT '[]',
  suggestions          JSONB DEFAULT '[]',
  recommended_projects JSONB DEFAULT '[]',
  career_path          TEXT,
  roadmap              JSONB DEFAULT '[]',
  created_at           TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🤖 Claude AI Integration

- **Route**: `POST /api/analyze-resume`
- **Model**: `claude-sonnet-4-20250514`
- **Key rule**: `ANTHROPIC_API_KEY` is server-side only — never in any React component
- Results are saved to the `resume_feedback` table via an `UPSERT`

To switch Claude models, edit one line in `app/api/analyze-resume/route.js`:
```js
model: 'claude-sonnet-4-20250514', // change to claude-opus-4-6 or claude-haiku-4-5-20251001
```

---

## 🔒 Security Checklist

- [x] API key is server-side only (`process.env.ANTHROPIC_API_KEY`, never `NEXT_PUBLIC_`)
- [x] `.env.local` is git-ignored
- [x] File serving route sanitises filenames (prevents path traversal)
- [ ] Add rate limiting to `/api/analyze-resume` before public launch
- [ ] Tighten PostgreSQL user permissions for production
- [ ] Add `next-auth` or Clerk for real user accounts

---

## 🛠️ Troubleshooting

| Error | Fix |
|-------|-----|
| `ECONNREFUSED` / `ETIMEDOUT` | PostgreSQL isn't running, or `DATABASE_URL` is wrong |
| `relation "resumes" does not exist` | Run `npm run db:init` |
| `Invalid API key` | Rotate your Anthropic key and update `.env.local` |
| File not found (404 on view) | The `uploads/` folder may have been cleared; re-upload |
| `AI returned invalid response` | Claude rate-limited or response truncated — try again |
