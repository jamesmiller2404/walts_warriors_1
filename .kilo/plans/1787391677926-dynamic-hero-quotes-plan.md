# Plan: Dynamic front-page quotes managed in Payload CMS

## Goal

Turn the front-page quote ("The impediment to action advances action. What stands in the way becomes the way." — Marcus Aurelius) into a CMS-managed, rotating quote. Admin gets a dedicated Quotes section where they can add/delete quotes and choose the rotation mode (per page load, per session, per day, per week).

## Current state (verified in code)

- The Marcus Aurelius quote is a static `quoteBlock` inside the Home Page global's `contentBlocks` (`src/globals/HomePage.ts:128`), rendered by `src/components/blocks/ContentBlocks.tsx:61` → `QuoteBlock`.
- `QuoteBlock` has styling fields (font family/size/color for quote + attribution) reused by the renderer `src/components/blocks/QuoteBlock.tsx`.
- `src/app/(frontend)/page.tsx` (server component) fetches the `home-page` and `site-settings` globals and passes blocks to `ContentBlocks`. It is the only consumer of `ContentBlocks`.
- Collections pattern: `src/collections/*.ts` with `access: { create/delete/update: isAdminOrEditor, read: anyone }`, admin group `'Content'`.
- `payload.config.ts:44` registers collections; `:58` registers globals. Types are regenerated with `npm run generate:types`.

## Decisions (confirmed with user)

1. Rotation modes available in admin: **per page load (random)**, **per session**, **per day**, **per week**. (No manual/fixed or in-order cycling.)
2. Placement: a new **"Dynamic Quote" block type** admins can insert anywhere in the home page's Content Blocks. The existing static Marcus Aurelius QuoteBlock is replaced by this block at the same position.
3. Session mode uses **browser storage** (sessionStorage).
4. Rotation mode is a **site-wide setting** in a new `quote-settings` global.
5. Database: assume a working DB is available (note: `.env` currently points to a deleted Supabase host; see Risks).

## Prerequisites

- A reachable database so Payload can push the new collection/global (run `npm run dev` once so `db.push` applies schema).
- Existing static Marcus Aurelius `QuoteBlock` remains in the Home Page content until an admin swaps it for a Dynamic Quote block (manual admin step, Section 9).

## Implementation steps

### 1. Create `src/collections/Quotes.ts`

New collection `quotes`, label `Quotes`:

- `admin`: `useAsTitle: 'quote'`, `defaultColumns: ['quote', 'attribution', 'active', 'order', 'updatedAt']`, `group: 'Content'`, description "Quotes shown on the front page."
- `access`: create/delete/update `isAdminOrEditor`, read `anyone` (match existing collections).
- Fields:
  - `quote` — `textarea`, required. The quote text.
  - `attribution` — `text`. Who said it (e.g. "Marcus Aurelius").
  - `active` — `checkbox`, `defaultValue: true`, sidebar position, description "Include this quote in the front-page rotation."
  - `order` — `number`, `defaultValue: 0`, description "Lower numbers appear first (used for deterministic day/week rotation)."

### 2. Create `src/globals/QuoteSettings.ts`

New global `quote-settings`, label `Quote Settings`:

- `admin`: group `'Content'`, description "Controls how the front-page quote is chosen."
- `access`: read `anyone`, update `isAdminOrEditor`.
- Fields:
  - `rotationMode` — `select`, `defaultValue: 'day'`, options:
    - `page-load` → "Per page load (random)"
    - `session` → "Per session"
    - `day` → "Per day"
    - `week` → "Per week"
  - Admin description: "How often a new quote appears."

### 3. Create `src/blocks/DynamicQuoteBlock.ts`

New block `dynamicQuoteBlock`, labels singular "Dynamic Quote Block" / plural "Dynamic Quote Blocks":

- Grid placement fields identical to `QuoteBlock`: `columnStart` (1–12, default 1), `columnSpan` (1–12, default 6), `rowStart` (auto/1–10), `rowSpan` (auto/1–6).
- Styling collapsibles identical to `QuoteBlock`: `quoteFontFamily`, `quoteFontSize` (text, default 28), `quoteFontColor`, `attributionFontFamily`, `attributionFontSize` (text, default 18), `attributionFontColor` — same options/labels as `src/blocks/QuoteBlock.ts`.
- NO `quote`/`attribution` text fields (content comes from the Quotes collection).

### 4. Register in `src/payload.config.ts`

- Import `Quotes` from `./collections/Quotes` and `QuoteSettings` from `./globals/QuoteSettings`.
- Add `Quotes` to the `collections` array (near `Testimonials`).
- Add `QuoteSettings` to the `globals` array.

### 5. Add block to the Home Page global

In `src/globals/HomePage.ts:128`, change `blocks: [TextBlock, QuoteBlock, ImageBlock]` to `blocks: [TextBlock, QuoteBlock, DynamicQuoteBlock, ImageBlock]` and import `DynamicQuoteBlock`.

### 6. Regenerate types

Run `npm run generate:types` to update `src/payload-types.ts` with the `Quote` type, `QuoteSettings` global, and `dynamicQuoteBlock` block shape.

### 7. Create client component `src/components/blocks/DynamicQuote.tsx`

`'use client'` component:

- Props:
  - `quotes: { id: number; quote: string; attribution?: string | null }[]` (active quotes, serializable)
  - `rotationMode: 'page-load' | 'session' | 'day' | 'week'`
  - Styling props forwarded to the existing `QuoteBlock` renderer (`quoteFontFamily`, `quoteFontSize`, `quoteFontColor`, `attributionFontFamily`, `attributionFontSize`, `attributionFontColor`).
- State: `const [selected, setSelected] = useState<typeof quotes[number] | null>(quotes[0] ?? null)` (deterministic initial render → no hydration mismatch).
- `useEffect` on `[rotationMode, quotes]` runs `pickQuote()`:
  - `page-load`: `quotes[Math.floor(Math.random() * quotes.length)]`
  - `session`: `sessionStorage.getItem('ww-quote-id')` → if the stored id still exists in `quotes`, reuse it; otherwise pick random and `sessionStorage.setItem('ww-quote-id', String(id))`.
  - `day`: deterministic — `quotes[hash(dateKey) % quotes.length]` where `dateKey = local YYYY-MM-DD` (stable across reloads/visitors on the same day).
  - `week`: deterministic — `quotes[hash(isoWeekKey) % quotes.length]` (ISO week number + year).
- Render: `null` if no quotes; otherwise `<QuoteBlock quote={selected.quote} attribution={selected.attribution} {...styling} />` (reuse `@/components/blocks/QuoteBlock`).
- Helper `hash(str)` = simple char-code sum / djb2, pure function.

### 8. Update `src/components/blocks/ContentBlocks.tsx`

- Add optional props `quotes` and `rotationMode` to `Props`.
- Add `case 'dynamicQuoteBlock':` mirroring the `quoteBlock` case (same grid wrapper div) rendering `<DynamicQuote quotes={quotes} rotationMode={rotationMode} ...styling fields />`.
- Import `DynamicQuote`.

### 9. Update `src/app/(frontend)/page.tsx`

- Fetch active quotes: `payload.find({ collection: 'quotes', where: { active: { equals: true } }, sort: 'order' })` → map docs to `{ id, quote, attribution }`.
- Fetch settings: `payload.findGlobal({ slug: 'quote-settings', depth: 0 })` → `rotationMode` (default `'day'`).
- Pass `quotes={quotes}` and `rotationMode={rotationMode}` to `<ContentBlocks>`.

### 10. Manual content setup (admin)

- In `/admin/collections/quotes`: add the Marcus Aurelius quote ("The impediment to action advances action. What stands in the way becomes the way." / attribution "Marcus Aurelius") and any other quotes.
- In `/admin/globals/home-page`: remove the static QuoteBlock from Content Blocks and add a **Dynamic Quote Block** in its place (same grid position). 
- In `/admin/globals/quote-settings`: choose the rotation mode.

## Rotation behavior summary

| Mode | Behavior | Implementation |
|---|---|---|
| Per page load | New random quote each load | client `Math.random()` on mount |
| Per session | Same quote for the browsing session | `sessionStorage` key `ww-quote-id` |
| Per day | Same quote all day for everyone | deterministic hash of local date |
| Per week | Same quote all week for everyone | deterministic hash of ISO week |

## Validation

1. `npm run generate:types` succeeds.
2. `npm run lint` passes.
3. `npm run dev` → admin shows `Quotes` collection under Content and `Quote Settings` global.
4. Front page shows a quote; test each mode in Quote Settings:
   - `day`: quote stable across reloads within the same day.
   - `week`: quote stable across the week; changes when the ISO week changes.
   - `page-load`: quote changes on each hard refresh.
   - `session`: quote stays the same across reloads; changes after closing/reopening the tab.
5. Add a new quote in admin → appears in rotation; delete all quotes → block renders nothing (no crash).
6. Deactivate the active quote via the `active` checkbox → it no longer appears.

## Risks / notes

- **DB connection**: `.env` `DATABASE_URL` currently points to a deleted Supabase project (known ENOTFOUND). User chose to assume a working DB; the implementer must confirm the app boots before testing.
- **Hydration**: DynamicQuote initializes state deterministically (`quotes[0]`) so server/client first render match; rotation logic runs in `useEffect` after mount.
- **Multiple Dynamic Quote blocks** on one page: each picks independently (acceptable; for `day`/`week` all pick the same quote).
- **Stale sessionStorage**: if a stored quote id was deleted, the component falls back to a random quote and overwrites the key.
- Do not add code comments; follow existing collection/block patterns and existing style conventions (Tailwind v4, inline styles for effects/shadow per project constraints).
