# Walt's Warriors: Dashboard Build Plan

Goal: go from the Photoshop designs to a working example with one demo user (Dana) and simulated numbers, using Supabase (Postgres) as the backend.

Two screens:

1. **Challenge dashboard** (`/challenges/[slug]`): today's tasks, progress, reflection, community.
2. **Member dashboard** (`/dashboard`): active challenge, this week, lifetime stats, pillar balance, badges, upcoming.

Work one phase at a time. Each phase ends with a **Done when** check. Commit after each phase passes.

---

## Ground rules (for the AI agent and for me)

- Derived numbers (percentages, streaks, "can miss", balance) are computed in SQL, never in the UI.
- Row-level security (RLS) is on for every table. Members read and write only their own rows.
- The Supabase service role key is server-side only. It never appears in code the browser loads.
- Schema changes are migration files in `supabase/migrations/`, never dashboard clicks.
- Use generated TypeScript types from the database. Do not invent field names.
- Ask before adding any library not listed in this plan.
- "Today" always comes from `app_today()`, which returns a dev override date when one is set, otherwise `current_date`.

---

## Phase 0: Design handoff (Photoshop)

- [ ] Export each screen as PNG at 2x into `design/screens/`.
- [ ] Export state variants as separate PNGs: task done, task not done, badge locked, badge earned, Submit disabled.
- [ ] Export every icon as SVG into `design/icons/` (heart, lock, star, sparkle, shields, flame, calendar, sun, walk, salad, wind).
- [ ] Write `design/tokens.md` with exact hex values (use the eyedropper in Photoshop), font names and sizes, spacing, and corner radius.
- [ ] Put real copy in `design/copy.md` (see Appendix A for Day 16).

**Done when:** a developer could build both screens without opening Photoshop.

---

## Phase 1: Data model

| Table | Holds |
|---|---|
| `profiles` | first name, member since, timezone (id matches Supabase Auth user) |
| `challenges` | slug, title, cohort label, start date, length (30), badge threshold (24) |
| `challenge_days` | challenge, day number, theme, tagline, Walt's note |
| `challenge_tasks` | challenge, day, pillar (`move`/`fuel`/`mind`), title, easier text, harder text |
| `enrollments` | user, challenge, status |
| `checkins` | user, challenge, day number, date (unique per user per day) |
| `task_completions` | user, task, version done (`standard`/`easier`/`harder`) |
| `point_events` | user, challenge, points, reason (a ledger, so "+6 bonus" is explainable) |
| `badges` | key, name, description, icon |
| `user_badges` | user, badge, earned date |
| `reflections` | user, challenge, day, text, shared (boolean) |
| `cheers` | from user, to user, date |
| `events` | title, starts at, kind (Q&A, group walk) |
| `energy_logs` | user, date, level 1 to 5 (private) |

### Derived values (implement as SQL views or functions)

| Value | Formula |
|---|---|
| Timeline % | current day number / challenge length (16/30 = 53%) |
| Badge % | check-ins / badge threshold (11/24 = 46%) |
| Check-ins still needed | threshold - check-ins (24 - 11 = 13) |
| Days left | challenge length - current day + 1, including today (30 - 16 + 1 = 15) |
| Days you can miss | days left - check-ins still needed (15 - 13 = 2) |
| Streak | consecutive check-in days ending today or yesterday |
| Longest streak | longest consecutive run across all check-ins |
| Pillar balance | tasks completed in that pillar / check-in days, over the last 30 days |
| Cohort "checked in today" | count of enrolled members with a check-in dated `app_today()` |

Note: if "days you can miss" ever goes negative, the badge is out of reach. Decide now what the UI says in that case (suggested: switch to an encouraging "finish strong" message, not a failure message).

**Done when:** the schema applies cleanly from a fresh database using only the migration files.

---

## Phase 2: Supabase setup

- [ ] Link the Supabase CLI to the project (`supabase link`).
- [ ] Move all schema into migrations and push them.
- [ ] Enable RLS on every table with policies:
  - Own rows only for `checkins`, `task_completions`, `point_events`, `user_badges`, `reflections`, `energy_logs`, `enrollments`, `profiles`.
  - Challenge content (`challenges`, `challenge_days`, `challenge_tasks`, `badges`, `events`) readable by any signed-in user.
  - Shared reflections readable by the cohort. Private ones are not.
  - Cohort stats come from a function that returns counts only, never other members' rows.
- [ ] Generate TypeScript types (`supabase gen types typescript`) into `src/types/database.ts`.
- [ ] Add `.env.local` (gitignored) with the project URL, anon key, and, for seed scripts only, the service role key.

**Done when:** a second test user cannot read or change Dana's rows.

---

## Phase 3: Seed the demo data

Write `supabase/seed/seed.ts`, run with the service role key. It must be re-runnable (clear and reload).

Dev override date: **Oct 16, 2026** (Day 16 of the October cohort).

| Item | Target |
|---|---|
| User | Dana, member since August |
| September challenge | Sept 1 to 30, 25 check-ins, finished, badge earned, longest streak 9, 95 points |
| October challenge | started Oct 1, 30 days, badge threshold 24 |
| October check-ins | 11 total from days 1 to 15, with days 12 to 15 consecutive (streak = 4) |
| Today (Day 16) | Mind task done; Move and Fuel not done; not yet submitted |
| October points | 50, including a +6 streak bonus |
| Lifetime | 36 check-ins, 145 points, 1 challenge finished |
| Badges | First step, Week one, Halfway, September finisher (October finisher and 14-day streak exist but are locked) |
| Pillar balance | approximately Move 78%, Fuel 55%, Mind 85% (within 3 points is fine) |
| Cohort | 18 members enrolled (Dana plus 17 fakes), 12 fakes checked in today |
| Maria | one of the fakes, first full week completed |
| Events | Live Q&A with Walt (Wed 7:00 pm), group walk (Sat 9:00 am) |
| Next cohort | November, starts Nov 2, strength and balance focus |
| Reflections | three recent wins (see Appendix B) |
| Energy log | today = 3 |

**Done when:** SQL queries return exactly the numbers above (timeline 53%, badge 46%, can miss 2, streak 4, "12 of 18").

---

## Phase 4: App scaffold

Stack (ask before changing): Next.js, TypeScript, Tailwind, Supabase JS client with the SSR helper for auth.

- [ ] Put `design/tokens.md` values into the Tailwind config and CSS variables.
- [ ] Turn `design/icons/*.svg` into small React icon components that accept a color.
- [ ] Add sign-in (email and password is fine for the demo) and middleware that protects `/dashboard` and `/challenges/[slug]`.
- [ ] Create two empty routes.

**Done when:** I can sign in as Dana and reach both empty pages. Signed out, both redirect to sign-in.

---

## Phase 5: Build the screens with fake props

Build reusable components first:

- Card, progress bar, pillar tag, task row (with Easier / Harder toggle), stat tile, badge shield (earned and locked), week strip, primary and secondary buttons, toggle chip.

Then assemble both pages using **hardcoded typed data** that matches the seed targets. No database calls yet.

- [ ] Challenge dashboard matches `design/screens/dashboard_challenge*.png`.
- [ ] Member dashboard matches `design/screens/dashboard*.png`.
- [ ] Use Playwright screenshots to compare against the PNGs and fix differences.
- [ ] Check text size (body 16px minimum), contrast, and keyboard focus.

**Done when:** both pages visually match the design with no database involved.

---

## Phase 6: Wire the reads

- [ ] `getChallengeDashboard(slug)` returns everything the challenge page needs in one call.
- [ ] `getHomeDashboard()` returns everything the member page needs.
- [ ] Replace the fake props with these loaders.
- [ ] Handle empty and loading states (new user with no check-ins, no active challenge).

**Done when:** both pages show the Phase 3 numbers straight from Supabase.

---

## Phase 7: Wire the writes

- [ ] Checking a task saves a `task_completions` row. Easier / Harder saves the version.
- [ ] Submit calls **one** Postgres function (e.g. `submit_checkin`) that:
  - requires at least one completed task,
  - records the check-in (ignores a second one on the same day),
  - awards points, including streak bonus,
  - unlocks any newly earned badges.
- [ ] Reflection save, with the share-with-cohort option.
- [ ] Cheer button saves a `cheers` row.
- [ ] Energy check-in saves an `energy_logs` row.
- [ ] Reserve-a-spot saves an `enrollments` row for the next challenge.

**Done when:** submitting Day 16 as Dana changes the streak to 5, adds points, moves the badge bar to 12 of 24 (50%), and both screens agree.

---

## Phase 8: Edge cases and cleanup

Use the dev override date to test:

- [ ] Missing a day breaks the streak.
- [ ] The 24th check-in unlocks the October finisher badge.
- [ ] A second submit on the same day does nothing.
- [ ] Day 30 closes the challenge.
- [ ] A brand-new user sees a friendly empty state.
- [ ] Repeat the privacy test: user B cannot see user A's private data.
- [ ] Remove the dev override from production builds.

**Done when:** every scenario above behaves as expected and a fresh clone can be set up using only the README.

---

## Starter instructions file for the agent

Save the following as `CLAUDE.md` (or whatever file your agent reads) in the repo root:

```
Project: Walt's Warriors, a habit-building site for middle-aged adults (exercise, eating, motivation).
Stack: Next.js, TypeScript, Tailwind, Supabase (Postgres, Auth, RLS).
Plan: follow PLAN.md one phase at a time. Stop at each "Done when" and report.
Rules:
- Compute derived numbers in SQL, never in the UI.
- RLS on every table. Service role key is server-side only.
- Schema changes only through migrations in supabase/migrations/.
- Use generated types from the database.
- "Today" comes from app_today(), never new Date() or current_date directly.
- Match design/screens/*.png and design/tokens.md exactly. Body text 16px minimum.
- Ask before adding libraries.
```

---

## Appendix A: Day 16 copy

**Theme:** Build momentum. **Tagline:** Small steps become lasting habits.

**Walt's note:** Day 16 is where a lot of people hit the middle slump. You don't need a big day today. You need a done day. Ten minutes counts.

| Pillar | Standard | Easier | Harder |
|---|---|---|---|
| Move | Walk for ten minutes | Take a five-minute stroll or do gentle stretches | Walk fifteen minutes and add a hill or a brisk three-minute stretch |
| Fuel | Add one serving of vegetables to a meal today | Swap one sugary drink for water | Add vegetables to two meals today |
| Mind | Take two quiet minutes to breathe slowly | Take three slow breaths before your next meal | Breathe for five minutes, then write one reason you are doing this |

**Reflection prompt:** What's one small win you're proud of today? Share with your cohort if you'd like.

**Footer line:** Pick the easier version any day you need to. Showing up is what counts.

## Appendix B: Seed reflections

- Walked past the snack aisle without stopping
- Took the stairs at work all week
- Slept seven hours three nights in a row

## Appendix C: Badges

| Badge | Rule |
|---|---|
| First step | First check-in |
| Week one | 7 check-ins in a challenge |
| Halfway | Reach the halfway point of a challenge with at least one check-in each week |
| Challenge finisher | 24 check-ins in a 30-day challenge (one per challenge) |
| 14-day streak | 14 consecutive check-in days |
