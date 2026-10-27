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

## Known security advisory — tinypool (critical, dev-only)

`npm audit` currently reports a **critical** severity finding:

- **Package:** `tinypool` ≤ 2.1.1 (installed transitively via `vitest` 3.2.7, a devDependency)
- **Issue:** Prototype pollution gadgets that can lead to Remote Code Execution —
  [GHSA-5gmw-xhrv-c9v3](https://github.com/advisories/GHSA-5gmw-xhrv-c9v3) and
  [GHSA-85c8-ppgw-ccpr](https://github.com/advisories/GHSA-85c8-ppgw-ccpr)
- **Impact on this app: none in production.** tinypool is a test-runner worker-pool
  used only by `vitest` (the `npm test` tooling). Production (`npm run start` /
  Render) never loads it, so the deployed site is not exposed. The finding affects
  local development/test environments only.
- **Why it isn't fixed yet:** the patched tinypool (2.1.2) is a different major
  than the `^1.1.1` range that vitest 3.x declares, so plain `npm audit fix` cannot
  resolve it. npm's suggested `npm audit fix --force` would jump vitest to 5.x — a
  major breaking change. Deliberately deferred (2026-10-26) to avoid churn.
- **Planned remediation (when ready):** upgrade the devDependency to
  `vitest@^4.1.12` — vitest 4.x drops tinypool from its dependency tree entirely,
  clearing the tinypool, vitest, and `@vitest/mocker` advisories in one step with
  the smallest major jump. The app's vitest usage (a minimal `vitest.config.ts` and
  two standard-API test files) is compatible with v4. After upgrading, verify with
  `npm audit` and the full test suite (`npm test`, 33 tests) before committing.
- **Other audit findings (for the same review):** the `undici` HIGH finding (via
  `payload`) is fixable later by bumping `payload` **and all `@payloadcms/*`
  packages together** from 3.91.0 → 3.92.0 — Payload requires exact version
  matching across its packages, so never bump just one. The remaining
  moderate/high findings (`esbuild`, `drizzle-kit`, `@tailwindcss/typography`,
  `happy-dom`/`@lexical/headless`) currently have no forward fix — npm only offers
  downgrades, which are not recommended; revisit when upstream publishes patches.

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
   - Start command: `npm run start`
     (self-contained pipeline: checks required env vars, removes Payload's
     dev-mode marker that would hang migrations non-interactively, runs
     `payload migrate`, then starts Next.js on Render's `PORT`)
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
  or a local Postgres server, never the production database. Beyond test data
  appearing on the live site: every local dev-server startup writes Payload's
  "dev mode" marker into `payload_migrations`, which makes `payload migrate`
  pause for an interactive confirmation that never arrives on Render
  (deploy hangs on "No open ports detected"). `npm run start` now removes the
  marker automatically before migrating, but keeping dev/prod databases
  separate is still strongly recommended. `.env` is gitignored; Render gets its
  vars from its dashboard.
- Never change `PAYLOAD_SECRET` casually — it invalidates existing admin sessions.

## Switching to PostgreSQL later

1. Install `@payloadcms/db-postgres`.
2. Replace `sqliteAdapter` in `src/payload.config.ts` with `postgresAdapter`.
3. Set `DATABASE_URL=postgresql://user:pass@host:5432/walts_warriors`.
4. Run the app once so Payload creates tables.
