# Walt's Warriors — Business Website

Next.js + Payload CMS site for a non-technical business owner. Content is managed at `/admin`.

## Stack

- **Next.js 15** (App Router) + React + TypeScript
- **Tailwind CSS 4**
- **Payload CMS 3** (admin at `/admin`)
- **SQLite** for local development (`file:./walts-warriors.db`)
- **Local file storage** (`/media`) for v1; **Vercel Blob** when `BLOB_READ_WRITE_TOKEN` is set
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

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | SQLite: `file:./walts-warriors.db` |
| `PAYLOAD_SECRET` | Long random secret for auth tokens |
| `NEXT_PUBLIC_SERVER_URL` | Public URL (e.g. `http://localhost:3000`) |
| `BLOB_READ_WRITE_TOKEN` | Optional. Unset = local `/media`. Set on Vercel for Blob uploads |

## Roles

| Role | Can do |
|------|--------|
| **admin** | Manage users, all content, system-oriented fields |
| **editor** | Edit business content (services, pages, media, etc.). Cannot create/delete users or change roles |

## Content the owner can edit

**Globals (singletons)**

- Site Settings — name, logo, contact, address, social, hours
- Home Page — hero, headlines, intro, featured services, CTA

**Collections**

- Services, Gallery, Testimonials, Staff, Blog/News, Media

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run generate:types` | Regenerate `payload-types.ts` |
| `npm run generate:importmap` | Regenerate admin import map |

## File storage

| Environment | Behavior |
|-------------|----------|
| **v1 / local** | Files saved under `/media` (gitignored). No extra config. |
| **Vercel** | Add **Blob** to the project. `BLOB_READ_WRITE_TOKEN` enables `@payloadcms/storage-vercel-blob` for the `media` collection (`clientUploads` on to avoid the 4.5MB server limit). |

## Production notes

1. Set a strong unique `PAYLOAD_SECRET`.
2. Prefer **PostgreSQL** in production (`@payloadcms/db-postgres`) when ready.
3. On Vercel: external Postgres + Blob (`BLOB_READ_WRITE_TOKEN`).
4. Create an **editor** account for the business owner; keep admin credentials private.

## Switching to PostgreSQL later

1. Install `@payloadcms/db-postgres`.
2. Replace `sqliteAdapter` in `src/payload.config.ts` with `postgresAdapter`.
3. Set `DATABASE_URL=postgresql://user:pass@host:5432/walts_warriors`.
4. Run the app once so Payload creates tables.
