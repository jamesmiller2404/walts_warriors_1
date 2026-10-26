# Walt's Warriors — Business Website

Next.js + Payload CMS site for a non-technical business owner. Content is managed at `/admin`.

> **Working on this repo with an AI agent or as a new developer?** Start with
> [`AGENTS.md`](./AGENTS.md) — it explains the nature and scope of the app, the architecture,
> the conventions, and the current roadmap. Other docs: [`RESPONSIVE.md`](./RESPONSIVE.md)
> (UI guardrails), [`MEMBER_SYSTEM_AUDIT.md`](./MEMBER_SYSTEM_AUDIT.md) (member system audit + phases).
>
> ⚠️ Sections below describing **SQLite** and the "Services / Staff / Blog-News" collections are
> outdated — the app currently runs on **Postgres** (`@payloadcms/db-postgres`). See `AGENTS.md` §8.

## Stack

- **Next.js 15** (App Router) + React + TypeScript
- **Tailwind CSS 4**
- **Payload CMS 3** (admin at `/admin`)
- **SQLite** for local development (`file:./walts-warriors.db`)
- **Local file storage** (`/media`) for v1; **Cloudflare R2** via `@payloadcms/storage-s3` when R2 env vars are set (self-hosted, e.g. Render)
- Portable to **PostgreSQL** later for production

## Quick start

```bash
npm install
npm run dev
```

Open:

- Site: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

On first visit to `/admin`, create the first user (make this an **Administrator**).

## Environment

Copy `.env.example` to `.env`:

| Variable                 | Purpose                                                                                 |
| ------------------------ | --------------------------------------------------------------------------------------- |
| `DATABASE_URL`           | SQLite: `file:./walts-warriors.db`                                                      |
| `PAYLOAD_SECRET`         | Long random secret for auth tokens                                                      |
| `NEXT_PUBLIC_SERVER_URL` | Public URL (e.g. `http://localhost:3000`)                                               |
| `R2_BUCKET`              | Optional. Unset = local `/media`. R2 bucket name for uploads                            |
| `R2_ENDPOINT`            | R2 S3 endpoint, incl. `https://` (e.g. `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`) |
| `R2_ACCESS_KEY_ID`       | From Cloudflare → R2 → API tokens (Object Read & Write)                                 |
| `R2_SECRET_ACCESS_KEY`   | From Cloudflare → R2 → API tokens                                                       |

## Roles

| Role       | Can do                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------ |
| **admin**  | Manage users, all content, system-oriented fields                                                |
| **editor** | Edit business content (services, pages, media, etc.). Cannot create/delete users or change roles |

## Content the owner can edit

**Globals (singletons)**

- Site Settings — name, logo, contact, address, social, hours
- Home Page — hero, headlines, intro, featured services, CTA

**Collections**

- Services, Gallery, Testimonials, Staff, Blog/News, Media

## Scripts

| Command                      | Description                   |
| ---------------------------- | ----------------------------- |
| `npm run dev`                | Development server            |
| `npm run build`              | Production build              |
| `npm run start`              | Start production server       |
| `npm run generate:types`     | Regenerate `payload-types.ts` |
| `npm run generate:importmap` | Regenerate admin import map   |

## File storage

| Environment    | Behavior                                                                                                                                                                                                                                                                                                                                                                                                        |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **v1 / local** | Files saved under `/media` (gitignored). No extra config.                                                                                                                                                                                                                                                                                                                                                       |
| **R2 (prod)**  | Set `R2_BUCKET`, `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` to enable `@payloadcms/storage-s3` for the `media` collection, pointed at Cloudflare R2's S3-compatible endpoint. The bucket stays **private**: Payload keeps `/media/...` URLs and proxies bytes through the app, preserving upload access control. `sharp`-generated sizes (thumbnail/card/hero) upload to R2 alongside originals. |

## Production notes

1. Set a strong unique `PAYLOAD_SECRET`.
2. Prefer **PostgreSQL** in production (`@payloadcms/db-postgres`) when ready.
3. Self-hosted (e.g. Render): external Postgres + Cloudflare R2 (`R2_*` env vars, see File storage above).
4. Create an **editor** account for the business owner; keep admin credentials private.

## Deploying to Render (Supabase Postgres)

The app uses Supabase only as a **hosted Postgres server** (`DATABASE_URL`) — no
Supabase SDK/Auth/keys are involved. Schema changes in production come from
Payload migrations (dev uses `db.push`; prod does not).

### One-time setup

1. **Supabase project** — copy the **session-mode pooler** connection string
   (Dashboard → Connect → port **5432** on `aws-<region>.pooler.supabase.com`).
   Do **not** use port 6543 (transaction mode — breaks prepared statements and
   migrations) or the IPv6-only `db.<ref>.supabase.co` host (unreachable from Render).
2. **Migrations** — the schema is applied via `npx payload migrate` (see
   `src/migrations/`). On a fresh database just run it; it creates every table.
3. **Render → New → Web Service** — connect the GitHub repo (branch `new-ui`).
   - Runtime: Node — set env var `NODE_VERSION=24` (matches the version the
     build was verified on locally; `engines` allows `>=20.9.0`)
   - Build command: `npm ci && npm run build`
   - Start command: `npx payload migrate && npm run start`
   - Environment variables (set **before** the first build — `NEXT_PUBLIC_*`
     values are inlined at build time):
     - `DATABASE_URL` — session-mode Supabase string (above)
     - `PAYLOAD_SECRET` — long random string (keep stable across deploys)
     - `NEXT_PUBLIC_SERVER_URL` — `https://<your-app>.onrender.com` (update +
       redeploy if you later attach a custom domain)
     - `R2_BUCKET`, `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` —
       **required on Render** (its disk is ephemeral; local `/media` won't survive)
     - `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`,
       `SMTP_FROM_ADDRESS`, `SMTP_FROM_NAME` — for member verification and
       password-reset emails
4. After the first deploy, open `https://<your-app>.onrender.com/admin` and create
   the first **Administrator** user.

### Day-to-day workflow

- **Code changes**: commit → push to GitHub → Render auto-builds and deploys.
- **Schema changes** (new collection/field/global): develop locally (dev mode
  auto-pushes the schema), then run `npx payload migrate:create`, commit the
  generated migration **and** the code, and push. Render's start command applies
  the migration automatically before the server boots.
- **Env var changes**: edit in the Render dashboard, then trigger a redeploy.

### Gotchas

- Render's **free tier (512 MB) usually OOMs** during `next build` — use at least
  the Starter instance.
- Keep local dev pointed at a **separate Supabase project** (free tier allows two)
  so test data/schema experiments never touch the live database. `.env` is
  gitignored; Render gets its vars from its dashboard.
- Never change `PAYLOAD_SECRET` casually — it invalidates existing admin sessions.

## Switching to PostgreSQL later

1. Install `@payloadcms/db-postgres`.
2. Replace `sqliteAdapter` in `src/payload.config.ts` with `postgresAdapter`.
3. Set `DATABASE_URL=postgresql://user:pass@host:5432/walts_warriors`.
4. Run the app once so Payload creates tables.
