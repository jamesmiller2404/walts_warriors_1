# AGENTS.md — Walt's Warriors

**Read this file first.** It is the orientation brief for any AI agent (or new developer)
working in this repo: what the app is, who it is for, what is in and out of scope, how the code
is organized, and the rules to follow when changing it. Deeper detail lives in the docs listed
in [§9 Doc index](#9-doc-index--which-file-answers-which-question).

> Last verified against the code: **2026-10-17**, commit `03c360c` (`npm test` = 24/24 passing).
> If you change the scope, architecture, or conventions below, update this file in the same PR.
>
> **§0 is the owner's directive and is authoritative for intent.** §0.1 reconciles that directive
> against what actually exists in the code today — read both before planning any work.

---

## 0. Project brief (owner-supplied directive — authoritative)

> Supplied by the owner. This is the target definition of the project and the rules of
> engagement. Where it conflicts with what is currently in the repo, see
> [§0.1 Reconciliation](#01-reconciliation-with-the-current-repo) — this directive wins as
> **intent**; the rest of this document describes **current reality**.

**Project:** Walt's Warriors, a habit-building site for middle-aged adults (exercise, eating, motivation).

**Stack:** Next.js, TypeScript, Tailwind, Supabase (Postgres, Auth, RLS).

**Plan:** follow `PLAN.md` one phase at a time. Stop at each "Done when" and report.

**Rules:**

- Compute derived numbers in SQL, never in the UI.
- RLS on every table. Service role key is server-side only.
- Schema changes only through migrations in `supabase/migrations/`.
- Use generated types from the database.
- "Today" comes from `app_today()`, never `new Date()` or `current_date` directly.
- Match `design/screens/*.png` and `design/tokens.md` exactly. Body text 16px minimum.
- Ask before adding libraries.

### 0.1 Reconciliation with the current repo

⚠️ **As of commit `03c360c`, most of the artifacts named above do not exist yet.** Verified by
search on 2026-10-17:

| Directive says | Repo today | Status |
|---|---|---|
| `PLAN.md` drives phased work | **No `PLAN.md`.** Phases currently live in `MEMBER_SYSTEM_AUDIT.md` §11 (0–5) and `.kilo/plans/*.md` | ❌ missing |
| Supabase (**Postgres, Auth, RLS**) | Postgres ✅ (`@payloadcms/db-postgres`, Supabase pooler host). Auth is **Payload** dual-auth (`users` + `members`), not Supabase Auth. **No RLS anywhere** — authorization is Payload `access` functions in `src/access/` | ⚠️ partial |
| `supabase/migrations/` | Migrations live in `src/migrations/` in Payload's format (`up`/`down` + `.json` snapshot) | ❌ different path & format |
| Generated types from the database | `src/payload-types.ts`, generated from the Payload config via `npm run generate:types` (not from DB introspection) | ⚠️ different source |
| Derived numbers in SQL | Computed in TS `afterChange` hooks — `computeStreak` in `src/collections/CheckIns.ts`, counters in `src/globals/CommunityStats.ts` | ⚠️ server-side, not SQL |
| `app_today()` for "today" | **Does not exist.** `new Date()` is used in `src/collections/CheckIns.ts` (check-in date, streak math), `src/components/layout/Footer.tsx` (copyright year), `src/components/blocks/DynamicQuote.tsx` (day/week rotation key) | ❌ violates rule 5 |
| `design/screens/*.png`, `design/tokens.md` | **`design/` exists on the owner's machine but is gitignored** (`/design` in `.gitignore`): `design/screens/` = 2 PNG mockups (`dashboard_main1.png`, `dashboard_challenge1.png`, ~14 MB total), `design/icons/` = 15 SVGs. **`design/tokens.md` does not exist yet.** UI conventions live in `RESPONSIVE.md` | ⚠️ exists, untracked |
| Body text ≥ 16px minimum | Tailwind `text-sm` (14px) and `text-base` (16px) are both in use; `RESPONSIVE.md` states no 16px floor | ⚠️ not guaranteed |
| Ask before adding libraries | Adopted — see §7 | ✅ in force |

**How to read this:** before building, confirm whether this repo is being **migrated** to
Supabase Auth + RLS or whether the directive describes the **target end state**. Do not
silently introduce a second auth system, a second migration system, or a `design/` folder that
was never agreed. Do not assume `app_today()` exists — grep first.

**Already aligned in spirit (keep doing this):** derived values are never computed in the UI;
trusted server-side writes go through hooks with `overrideAccess: true`; frontend reads go
through the local Payload API, not ad-hoc SQL.

---

## 1. What this app is (nature)

Walt's Warriors is the website **and** community platform for **Walt's Warriors, a health &
wellness community**. The community's four pillars are **Nutrition, Fitness, Mindset, and
Healthy Lifestyle**. The brand line is *"Nothing feels as good as feeling good feels!"*

Per the owner's directive (§0), the audience is **middle-aged adults building lasting habits
around exercise, eating, and motivation** — not elite athletes and not a general wellness
audience. Design and copy decisions should be legible, encouraging, and low-friction for that
audience (large tap targets, ≥16px body text, plain language, no jargon).

There are **three products in one Next.js codebase**:

| # | Product | Who uses it | Status |
|---|---|---|---|
| **A** | **Public content site** — Home, About, Programs, Resources, Challenges, Events, Gallery, Contact | Anonymous visitors | Largely built |
| **B** | **Member & community system** — accounts, email verification, daily check-ins, streaks, badges, leaderboard | Registered members | Data model + auth built; member-facing UI mostly **missing** |
| **C** | **Admin CMS** — Payload admin at `/admin` | Owner (`editor`) + staff (`admin`) | Built |

**Non-negotiable product constraint:** the business owner is **non-technical**. Every piece of
copy, image, quote, program, challenge, event, and contact detail must be editable in `/admin`
with no code change. Hardcoding business content in a component is a bug, not a shortcut.

### Domain vocabulary (use these words consistently)
`member` (public account) · `check-in` (one wellness activity logged per member per UTC day) ·
`streak` (consecutive UTC days with ≥1 check-in) · `badge` (criteria-based award) ·
`challenge` (time-boxed community program) · `community-stats` (site-wide denormalized counters).

---

## 2. Audiences, roles & identity

| Actor | Lives in | Can do | Notes |
|---|---|---|---|
| **Public visitor** | — | Read all published content | No auth context; all reads are anonymous |
| **Member** | `members` collection (Payload auth) | Self-register, verify email, log in, (future) check in, earn badges | Cannot reach `/admin` |
| **Editor** | `users` collection, `role: 'editor'` | Edit business content in `/admin` | Intended to be the owner's account |
| **Admin** | `users` collection, `role: 'admin'` | Everything, incl. users, member status, badges | First `users` row is force-promoted to `admin` |
| **AI agent** | — | Change code + content models | Must follow §7 Guardrails |

Two auth collections coexist (**dual auth**). Distinguish them at runtime with
`req.user.collection` (`'users'` = staff, `'members'` = public). Never treat a member as staff.

---

## 3. Scope

### In scope (v1 → launch)
- Content-managed marketing site with a mobile-first responsive UI.
- Member accounts: register → verify email → log in → reset password.
- Daily check-ins with server-enforced ownership and one-per-day uniqueness.
- Derived member stats (total check-ins, current/longest streak) and badge awards.
- Payload admin usable by a non-technical owner.
- Deploy target: Vercel (app) + Postgres (Supabase) + Vercel Blob (uploads).

### Explicitly out of scope unless a business decision says otherwise
- Payments / paid membership tiers / billing (see open question #1).
- Native mobile apps.
- Public community feed with user-generated content and moderation.
- Multi-tenant / multi-organization support.
- Event ticketing (registration currently links out via `registrationUrl`).

### Delivery phases (each independently shippable)
| Phase | Theme | Status |
|---|---|---|
| 0 | Security hardening (ownership, rollups, unique keys, cleanup, migration) | **Done** |
| 1 | Auth foundation (email adapter, verify, login/register/logout, reset, rate limiting) | **Done** |
| 2 | Member dashboard (profile, check-in button, badges, own stats) | **Not started** |
| 3 | Community features (leaderboard, challenge enrollment, notifications) | **Not started** |
| 4 | Admin UX in Payload (member management, badge previews, stat reconciliation) | **Not started** |
| 5 | Scale & ops (job queue, derived counters, recompute job, pooling) | **Not started** |

Phases 0–1 were the gate for public launch. Phases 2–5 are the current backlog; the detailed
design for them lives in `MEMBER_SYSTEM_AUDIT.md` §11–§13.

---

## 4. Current state (verified in code)

| Area | Reality |
|---|---|
| Public pages | `/` `/about` `/programs` `/programs/[slug]` `/resources` `/resources/[slug]` `/challenges` `/challenges/[slug]` `/events` `/events/[slug]` `/gallery` `/contact` |
| Auth pages | `/login` `/register` `/logout` `/forgot-password` `/reset-password` `/verify` `/verify/[token]` |
| **Missing UI** | Member dashboard, check-in button, badge display, leaderboard/community page, notifications |
| Content model | 13 collections + 6 globals (see §5) |
| Derived data | `afterChange` hooks maintain member rollups, badge awards, and `community-stats` |
| Email | `@payloadcms/email-nodemailer` when `SMTP_*` set; otherwise a dev adapter that logs the **full email incl. verify/reset link** to the server console |
| Tests | `tests/member-hardening.test.ts` — 24 tests, hermetic SQLite via `src/payload.test.config.ts` |
| Migrations | `src/migrations/20260827_054735_phase0_member_hardening.ts`, `src/migrations/20260829_120000_phase0_existing_db.ts` |
| Schema sync | `db.push` is on outside production (`src/payload.config.ts`), so dev auto-pushes schema; production needs migrations |

---

## 5. Architecture map

### Stack
| Layer | Choice |
|---|---|
| Framework | Next.js **15.5** (App Router), React **19.2**, TypeScript **5.7** |
| Styling | Tailwind CSS **v4** (`@tailwindcss/postcss`) + `@tailwindcss/typography` |
| CMS / backend | Payload **3.86** (self-hosted; admin mounted at `/admin` via `@payloadcms/next`) |
| Database | **Postgres** via `@payloadcms/db-postgres` (Supabase in practice) |
| Rich text | Lexical (`@payloadcms/richtext-lexical`) |
| Uploads | Local `/media` by default; Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set |
| Email | nodemailer adapter, with console-logging dev fallback |
| Tests | Vitest **3.2** (`npm test`) |

### Directory map
```
src/
  app/(frontend)/        Public site routes (server components) + auth pages
  app/(payload)/         Payload admin mount + /api/[...slug] REST + GraphQL
  access/                Access-control helpers: anyone, isAdmin, isAdminOrEditor, isStaff
  blocks/                Payload block configs: Text, Quote, DynamicQuote, Image
  collections/           users, media, programs, resources, testimonials, quotes, events,
                         gallery, challenges, members, check-ins, badges, member-badges
  globals/               site-settings, home-page, about-walt, contact-page,
                         community-stats, quote-settings
  components/            auth/ blocks/ home/ layout/ programs/ admin/ (client + server UI)
  lib/                   payload.ts (client), auth.ts, authActions.ts, emailTemplates.ts,
                         rateLimit.ts, fonts.ts, fontSize.ts, richText.tsx, utils.ts (mediaUrl)
  migrations/            Payload migrations (run in production)
  payload.config.ts      Payload config (collections, globals, adapters, plugins)
  payload.test.config.ts Hermetic test config (SQLite)
  payload-types.ts       GENERATED — never hand-edit
tests/                   Vitest suites
```

### Data flow rules
1. **Server components read through the local Payload API** — `getPayloadClient()` from
   `src/lib/payload.ts`, then `payload.find` / `findGlobal`. Do **not** fetch your own REST API
   from the frontend.
2. **Writes go through Payload server actions or the admin UI** — see `src/lib/authActions.ts`.
3. **Derived data is never client-writable.** Member rollups (`totalCheckIns`, `currentStreak`,
   `longestStreak`, `lastCheckInDate`) and `community-stats` are field-level staff-only and
   written by hooks with `overrideAccess: true`.
4. **Check-in ownership is forced server-side**; `checkInDay` + unique `checkInKey` enforce one
   check-in per member per UTC day; `awardKey` prevents duplicate badges.
5. Images are rendered with `next/image` + `mediaUrl(src, sizeName)` where sizes are
   `thumbnail` (400×300), `card` (768×512), `hero` (1920×1440).

---

## 6. Commands & environment

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server (site `:3000`, admin `/admin`) |
| `npm run build` / `npm run start` | Production build / serve |
| `npm test` | Vitest suite (hermetic SQLite, no live DB needed) |
| `npm run lint` | ESLint |
| `npm run generate:types` | Regenerate `src/payload-types.ts` **after any schema change** |
| `npm run generate:importmap` | Regenerate the admin import map **after adding admin components** |
| `npm run payload` | Payload CLI (e.g. `npx payload migrate:create`) |

Required env (`cp .env.example .env`): `DATABASE_URL`, `PAYLOAD_SECRET`,
`NEXT_PUBLIC_SERVER_URL`. Optional: `BLOB_READ_WRITE_TOKEN`, `SMTP_HOST`, `SMTP_PORT`,
`SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_ADDRESS`, `SMTP_FROM_NAME`.

---

## 7. Guardrails (rules for changing this codebase)

### Access control
- Always make access rules **collection-aware**. Staff-only helpers must verify
  `user.collection === 'users'`; never infer staff status from `role` alone.
- Use the existing helpers in `src/access/` (`anyone`, `isAdmin`, `isAdminOrEditor`,
  `isStaff`, `isStaffFieldLevel`). Do not inline new boolean access logic.
- Field-level `access` is required for anything derived or staff-managed (rollups, `status`).
- New staff-facing pages must respect `canAccessAdmin`; members must never reach `/admin`.

### Content model
- Business content belongs in a **collection or global**, never in a component literal.
- Follow the established collection shape: `slug`, `labels`, `admin: { useAsTitle,
  defaultColumns, description, group }`, `access: { create/delete/update: isAdminOrEditor,
  read: anyone }`.
- Auto-slug pattern: a `beforeValidate` hook that lowercases, strips non-alphanumerics, and
  falls back to the title/name field (see `Programs.ts`, `Challenges.ts`).
- Admin groups in use: `Content`, `Community`, `Site Settings`, `Pages`.
- After schema changes: run `npm run generate:types`; if you added admin components, also
  `npm run generate:importmap`.

### Frontend
- **Mobile-first Tailwind**; obey `RESPONSIVE.md` (breakpoints, `sizes` on `next/image`,
  `clamp()` for display type, `mediaUrl()` sizes, manual QA at 375/640/768/1024/1536px).
- `src/app/(frontend)/layout.tsx` owns the shell; pages are server components by default and
  only opt into `'use client'` when they need state/effects.
- Respect `prefers-reduced-motion` for animation (see `NavCards.tsx`).
- Every image needs a real `alt` (from the Media `alt` field) or `alt=""` if decorative.

### Data integrity
- Never write rollup/counter fields from client code or member-facing endpoints.
- Prefer unique keys + hooks over application-level "check then write" logic (race-safe).
- A member delete must clean up dependents (`beforeDelete` already does this — preserve it).
- Destructive schema changes need a migration (`npx payload migrate:create`), not just
  `db.push`, because production runs with push disabled.

### Working style in this repo
- Keep plans in `.kilo/plans/<timestamp>-<slug>.md` (existing convention) before large changes.
- Validate with `npm test`, `npm run lint`, and `npx tsc --noEmit` when you touch TS.
- Don't re-document the whole system in new files; extend this file or the doc index instead.
- **Ask before adding a library** (§0). If a task seems to need a new dependency, stop and ask;
  prefer what's already installed (see `package.json`) or plain platform APIs.
- **Ask before creating infrastructure that §0 assumes but the repo lacks.** `PLAN.md` and `design/` **now exist** (owner-created, untracked; `design/` is gitignored). Still missing:
  `supabase/migrations/`, an `app_today()` function, RLS policies, and Supabase Auth — none of these exist.
  Do not invent them silently or assume they exist; grep first, then ask.

### Owner directive rules (§0) — what to do today

| Rule | Behaviour now |
|---|---|
| Derived numbers in SQL, never in the UI | Never compute in the UI (already true). Computation currently lives in TS hooks; moving it to SQL is a **migration decision — ask first**. |
| RLS on every table; service role key server-side only | **No RLS exists.** Keep authorization in `src/access/` for now. Never expose a service-role/secret key to the client. |
| Schema changes via `supabase/migrations/` | Use `src/migrations/` (Payload) for now; run `npx payload migrate:create` for destructive changes. Do not create a parallel `supabase/` tree without agreement. |
| Generated types from the database | Use `src/payload-types.ts`; regenerate with `npm run generate:types` after schema changes. Never hand-edit it. |
| `app_today()` for "today" | **Does not exist.** Do not write code that calls it. If you need "today", ask whether to (a) add the helper, (b) keep `new Date()`, or (c) move it into SQL. Flag existing `new Date()` usages listed in §0.1 rather than silently changing streak/check-in semantics. |
| Match `design/screens/*.png` + `design/tokens.md`; body ≥16px | `design/` exists on this machine but `/design` is gitignored, so the mockups — and `design/tokens.md` once written — are **not in version control** and are invisible to a fresh clone, CI, or another agent. `design/tokens.md` does not exist yet (it is a task in `PLAN.md`). Follow `RESPONSIVE.md` and keep body copy at `text-base` (16px) or larger; to share a design reference, narrow the ignore to `/design/screens/` or `git add -f design/tokens.md`. Note the served icons live in `public/icons/` (15 SVGs, untracked but not ignored) — `design/icons/` is only the source copy. |
| Ask before adding libraries | In force — see above. |

---

## 8. Known drift & gotchas (fix opportunistically, don't trust blindly)

| Issue | Detail |
|---|---|
| **`README.md` is stale** | It documents **SQLite** (`file:./walts-warriors.db`) and collections named "Services / Staff / Blog-News". The config actually uses **Postgres** and the collections in §5. |
| `.env.example` is stale | `DATABASE_URL` still defaults to the SQLite file; real config needs a `postgresql://` URL. |
| `NavCards.tsx` placeholders | Home-page nav cards still link to `/TODO-programs`, `/TODO-resources`, `/TODO-challenges`, `/TODO-events`, `/TODO-contact` even though those routes now exist. |
| Dead DB host risk | `.env` points at a Supabase pooler host; prior notes warn it may be stale/deleted. Verify connectivity before assuming `db.push` will apply schema. |
| Email in dev | With no `SMTP_*` vars, verify/reset emails are **not delivered** — the full body (with link) is printed to the server console under `[DEV EMAIL]`. |
| `.kilo/` churn | `kilo.jsonc` was deleted from the working tree and replaced by an untracked `kilo.json`. |
| Rate limiting | In-memory, best-effort (per-process). Not a production-grade limiter. |
| CAPTCHA | Not implemented; registration is open. Tracked as future hardening. |

---

## 9. Doc index — which file answers which question

| Question | Read |
|---|---|
| What is the authoritative project definition and rules of engagement? | **`AGENTS.md` §0** (owner directive) + **§0.1** (reconciliation with the code) |
| What is the phase plan, and where are the "Done when" gates? | `PLAN.md` — **does not exist yet**. Today the phases are in `MEMBER_SYSTEM_AUDIT.md` §11 (0–5) and `.kilo/plans/*.md` |
| What is this app, who is it for, what's in scope, how do I work in it? | **`AGENTS.md`** (this file) |
| How do I run it, deploy it, switch databases? | `README.md` (setup sections are accurate; content model section is stale — see §8) |
| How must responsive UI be built? What do I QA? | `RESPONSIVE.md` |
| How does the member system work, what are the phases, what are the risks and open business decisions? | `MEMBER_SYSTEM_AUDIT.md` (§11 phases, §13 questions) |
| Why was a past feature built this way? | `.kilo/plans/*.md` (font theme keys, responsive overhaul, dynamic hero quotes) |
| What is the exact schema? | `src/payload-types.ts` (generated) and `src/collections/*.ts`, `src/globals/*.ts` |
| What is the current DB schema history? | `src/migrations/*.ts` |

---

## 10. Open business decisions (blockers to resolve before building more)

From `MEMBER_SYSTEM_AUDIT.md` §13 — the top ones that change architecture:

1. **Free or paid membership?** Decides whether tiers/billing collections are in scope.
2. **Is email verification mandatory before participating?** Decides whether unverified
   members may check in.
3. **Check-in semantics:** once per day globally, or once per challenge? Changes the rollup
   model (per-challenge streaks).
4. **Leaderboard privacy:** public by default or opt-in? Do suspended/former members appear?
5. **Editor permissions:** should an `editor` be able to delete members and award badges
   (current code allows it), or is that admin-only?

Full list (14 questions) in `MEMBER_SYSTEM_AUDIT.md` §13.

---

## 11. Maintaining this file

Update `AGENTS.md` whenever you: add/rename a collection or global, add a route, change the
access model, change the stack, ship a phase, or fix one of the drift items in §8. Bump the
"Last verified" line at the top with the commit hash and test count.

