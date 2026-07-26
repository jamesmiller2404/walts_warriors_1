# Responsive Overhaul Plan

## Confirmed Decisions

| Topic | Decision |
|---|---|
| Breakpoints | Keep Tailwind v4 defaults (`sm:640px md:768px lg:1024px xl:1280px 2xl:1536px`). No changes to `@theme {}`. |
| `prose` classes | Install `@tailwindcss/typography`, register in `globals.css`, use `prose-sm` / `prose-base` responsive scaling |
| Payload `imageSizes` | Review dimensions on Media collection; add frontend URL param usage via `mediaUrl(src, sizeName)` |
| ContentBlocks | Rewrite to single-column on mobile, 12-col grid only at `md+` |
| Hero nav | Replace inline nav links with hamburger toggle on mobile |
| Font sizing | Use `clamp()` for hero/title/heading sizes; convert existing `pt` values to rem as part of clamp migration |
| Title overflow | Add `overflow-wrap: break-word` + smaller default size on mobile for detail page h1s |
| Image strategy | Keep `fill` + `object-cover` / `object-contain` pattern; add `sizes` improvements where needed |
| Testing | Manual QA checklist only (no Playwright infra set up) |
| Linting | Document conventions in RESPONSIVE.md; note `eslint-plugin-tailwindcss` as optional addition |
| **Soldier image** | **New `ImageBlock` content block type** — standalone `<Image>` in the 12-column grid alongside TextBlock/QuoteBlock, replacing reliance on CSS `background-image` for the primary soldier placement. Existing `backgroundImage` / `backgroundOpacity` fields kept as secondary backdrop. |

---

## Order of Implementation

### Step 1 — Install `@tailwindcss/typography` + register in `globals.css`

- `npm install @tailwindcss/typography`
- Add `@plugin '@tailwindcss/typography';` to `globals.css` after `@import 'tailwindcss'`
- Remove any now-redundant manual styling on RichText wrappers

### Step 2 — Review & update Payload Media `imageSizes` dimensions

- Check `src/collections/Media.ts` — current sizes: `thumbnail` 400x300, `card` 768x512, `hero` 1920x1440
- Review against actual frontend layout widths:
  - `card`: used in list grids (max ~384px card width at `lg:grid-cols-3` with 6col gap) — 768px is reasonable
  - `hero`: 1920px is fine for full-width hero
  - `thumbnail`: 400px — fine for admin thumbnails
- Add a `mediaUrl(src, sizeName)` overload or separate helper in `src/lib/utils.ts` that appends `?size=` to reference specific sizes
- Update all frontend image components to use the appropriate size:
  - List pages (programs, resources, events, challenges, gallery): `card` size
  - Detail pages (featured image): `hero` size
  - About sidebar portrait: `thumbnail` size
  - Home hero image: `hero` size

### Step 3 — `globals.css` additions (theme + responsive baseline)

- Add `@plugin '@tailwindcss/typography'`
- Add any custom `@theme` tokens if needed (likely none needed)
- Add global `overflow-wrap: break-word` on `body` or on content containers

### Step 4 — `Container.tsx`

- Already mostly fine (`mx-auto px-4 sm:px-6`). Add `lg:px-8` for larger screens. Ensure `max-w-*` values are adequate.

### Step 5 — Hero.tsx (nav + headline)

- **Nav**: Convert inline nav links (`<div className="hidden md:flex gap-8">` + hamburger toggle for mobile). Add client-state toggle for mobile menu.
- **Headline**: Convert `text-[26pt] sm:text-[45pt] lg:text-[75pt]` to `clamp()` — e.g. `clamp(1.75rem, 5vw, 3rem)` for "Discipline" and `clamp(1rem, 2.5vw, 1.5rem)` for periods. Remove hardcoded `pt` classes, inline style for the clamp value.
- **Subheadline**: Add smaller default size.
- **CTA buttons**: Add `w-full` on mobile, `w-auto` at `sm+`.

### Step 6 — PageHeader.tsx

- Convert `text-4xl` to responsive: `text-2xl md:text-4xl` or clamp-based heading.
- Add `overflow-wrap: break-word` on the h1.
- Ensure `max-w-2xl` responds with smaller max on mobile.

### Step 7 — All detail pages (`[slug]/page.tsx`)

- **Title**: Apply `text-2xl sm:text-3xl lg:text-4xl` (progressive scaling) + `break-words`
- **RichText wrapper**: Replace inert `<div className="prose prose-stone mt-10 max-w-none">` with active `prose prose-stone prose-sm md:prose-base` — this gives mobile-sm typography, desktop-base typography
- **Images**: Use `hero` size from Payload
- **Padding/spacing**: Ensure `py-12` is `py-6 sm:py-8 lg:py-12` for tighter mobile edges
- **Back link**: Already fine
- **CTA buttons**: `w-full sm:w-auto`

### Step 8 — List pages (programs, resources, events, challenges, gallery)

- Already have `sm:grid-cols-2 lg:grid-cols-3` — mostly good
- Ensure grid gap reduces on mobile (`gap-6` → `gap-4` via `sm:gap-6`)
- Card images: use `card` size from Payload
- Gallery: `gap-4` already, `sm:grid-cols-2 lg:grid-cols-3` — fine
- Empty state (`border-dashed`, centered text): ensure padding doesn't overflow

### Step 9 — ProgramCard.tsx

- No responsive classes currently. Add mobile-safe font sizes: h3 stays `text-lg` (OK), summary `text-sm` (OK)
- Add `w-full` on image container (already relative w/fill — OK)
- Ensure `flex flex-col` with `h-full` doesn't cause squishing on narrow viewports — add `min-w-0`

### Step 10 — ImageBlock (NEW — soldier image as grid-positioned content block)

This is the core change for the soldier image. It adds a new Payload block type and frontend component that allows the soldier (or any image) to be positioned in the 12-column grid alongside text/quote blocks.

#### 10a — Create Payload block definition: `src/blocks/ImageBlock.ts`

- `slug: 'imageBlock'`
- Labels: `'Image Block'`
- Fields:
  - `image` — `type: 'upload'`, `relationTo: 'media'`, required
  - `columnStart` — select, 1-12, default `1`
  - `columnSpan` — select, 1-12, default `6`
  - `rowStart` — select, Auto + 1-10, default `auto`
  - `rowSpan` — select, Auto + 1-6, default `auto`
  - `objectFit` — select, options: `cover`, `contain`, `fill`, `none`, `scale-down`; default `cover`
  - `objectPosition` — text field, default `'center'`; admin description: "CSS object-position value (e.g. center, top, 50% 20%)"
  - `alt` — text, optional; overrides the media's alt text for this placement
  - `caption` — textarea, optional; displayed below the image

#### 10b — Create frontend component: `src/components/blocks/ImageBlock.tsx`

- Accept `image` (Media), `objectFit`, `objectPosition`, `alt`, `caption`
- Render using `next/image` with explicit `width`/`height` and `sizes` based on column span
- Apply `object-fit` and `object-position` as inline styles
- Render `caption` in a `<figcaption>` if provided, with Tailwind text styling
- Wrap in `<figure>` for semantic markup
- If no image is set, render nothing (null check)

#### 10c — Register block in HomePage schema

- Import `ImageBlock` into `src/globals/HomePage.ts`
- Add it to the `blocks` array: `blocks: [TextBlock, QuoteBlock, ImageBlock]`

#### 10d — Update `src/components/blocks/ContentBlocks.tsx`

- Add `import { ImageBlock as ImageBlockComponent } from '@/components/blocks/ImageBlock'`
- Add `case 'imageBlock'` to the switch statement
- Pass the image block fields (image, objectFit, objectPosition, alt, caption) to the component
- Wrap in the same grid-position div pattern as TextBlock/QuoteBlock

#### 10e — Update `src/app/(frontend)/page.tsx`

- The existing `backgroundImage` div remains as-is (kept for optional backdrop)
- No structural changes needed — the ImageBlock just appears in the `ContentBlocks` render loop
- The admin can now place the soldier image at an exact grid position (e.g., columns 1-6, row 1) with text blocks alongside

#### 10f — Update Payload types

- Run `npm run generate:types` (or Payload's type generation command) to regenerate `src/payload-types.ts`
- The new `imageBlock` type will appear in the `contentBlocks` union type

### Step 11 — ContentBlocks.tsx (responsive 12-column grid)

- **Strategy**: Change from `grid grid-cols-12 gap-6` to:
  - Mobile (default): `flex flex-col gap-6` — blocks stack full-width
  - `md+`: `grid grid-cols-12 gap-6` — use 12-column layout
- Inline `gridColumn`/`gridRow` styles become no-ops on mobile (flex context). On `md+` they activate.
- Each block (TextBlock, QuoteBlock, ImageBlock) inherits the layout

### Step 12 — Footer.tsx

- Already has `md:grid-cols-3` — single-col on mobile is fine
- Add `gap-8 md:gap-12` for better spacing
- Add `px-4 sm:px-6` for edge padding
- Copyright row: `py-4` is fine; add `px-4`

### Step 13 — Contact page

- `space-y-6` inside the card — fine on mobile (full-width card with `mx-4` equivalent margin)
- Hours list `flex justify-between gap-4` — ensure no overflow on narrow screens. Already `border-b py-2` with flex — OK if content is short.
- Add `overflow-x-auto` on the hours list to be safe.

### Step 14 — About page

- Sidebar `lg:grid-cols-[1fr_280px]` — single-column on mobile is fine (auto-fallback)
- Portrait image: `aspect-square` with `sizes="280px"` — fine; ensure parent aside doesn't take full width on mobile (OK since grid collapses)
- Focus areas grid: `sm:grid-cols-2` — single-col on mobile, fine
- Philosophy blockquote: `px-6 py-5` on mobile is cramped → `px-4 sm:px-6`

### Step 15 — Home page (`page.tsx`)

- Background image div: `backgroundSize: 'cover'` stays (already correct for the optional backdrop)
- Introduction RichText: apply `prose prose-stone prose-sm md:prose-base`
- Featured programs grid (already has `sm:grid-cols-2 lg:grid-cols-3` — good)

### Step 16 — NavCards.tsx

- Already has `sm:grid-cols-3` / `sm:grid-cols-2` — single col on mobile
- Card text: ensure font sizes don't overflow on narrow screens. Padding is `p-6` — OK
- The `backdropFilter: blur(4px)` div approach remains unchanged
- Hover glow is an inline style — unaffected

### Step 17 — Section.tsx

- `py-12` → `py-6 sm:py-8 lg:py-12` for progressive spacing

---

## Phase 4 — Guardrails

### Step 18 — Create `RESPONSIVE.md`

Create at repo root documenting:

1. **Screens values** (Tailwind v4 defaults — list them explicitly)
2. **Required pattern for new components**: mobile-first Tailwind classes, no arbitrary fixed-px layout widths without documented reason, `next/image` with correct `sizes`, always use Payload image sizes via `mediaUrl(src, sizeName)`
3. **Payload Block component rule**: each block's frontend component must be independently responsive — must work as full-width on mobile even if the desktop layout places it in a multi-column grid
4. **Font sizing convention**: use `clamp()` for major headings; use Tailwind's `text-{size}` classes for body/prose; avoid raw `pt` values outside the `resolvePt()` helper

### Step 19 — Update `eslint.config.mjs` with Tailwind CSS plugin rules (optional, note)

- Add `eslint-plugin-tailwindcss` if desired (document in RESPONSIVE.md as optional)
- Rules to consider: `no-arbitrary-value`, `no-custom-classname`

### Step 20 — Manual QA checklist

Document in `RESPONSIVE.md`:

- Test at: **375px** (mobile), **640px** (sm breakpoint), **768px** (md), **1024px** (lg), **1536px** (2xl)
- For each viewport, check:
  - No horizontal scrollbar
  - Nav visibility (hamburger on mobile, inline on desktop)
  - Images load at correct size (no oversized downloads)
  - RichText content (especially long words, tables) doesn't overflow
  - All CTAs/links are tappable (no overlapping elements)
  - Footer columns stack correctly
- Worst-case CMS content test: create a resource with a 200-character title, a very large uploaded image (e.g. 4000px wide), and rich text containing a wide table — verify no overflow
- **ImageBlock-specific**: Test the soldier image at each breakpoint — verify object-position keeps the head/torso visible. Test with cover vs contain. Test with a caption.

### Step 21 — PR template note

If `.github/PULL_REQUEST_TEMPLATE.md` exists, add a responsive QA checkbox. If not, note in `RESPONSIVE.md` to include it.

---

## Files touched (summary)

| File | Change |
|---|---|
| `package.json` | Add `@tailwindcss/typography` |
| `src/app/(frontend)/globals.css` | Add `@plugin '@tailwindcss/typography'` |
| `src/lib/utils.ts` | Add `mediaUrl(src, sizeName)` overload |
| `src/collections/Media.ts` | Review `imageSizes` dimensions |
| `src/blocks/ImageBlock.ts` | **NEW** — Payload block definition |
| `src/components/blocks/ImageBlock.tsx` | **NEW** — frontend component |
| `src/components/blocks/ContentBlocks.tsx` | Add `ImageBlock` case + responsive flex/grid switch |
| `src/globals/HomePage.ts` | Import + register ImageBlock in `blocks` array |
| `src/payload-types.ts` | Regenerated via `npm run generate:types` |
| `src/components/layout/Container.tsx` | Add `lg:px-8` |
| `src/components/home/Hero.tsx` | Hamburger nav, clamp() font sizes, mobile CTA |
| `src/components/layout/PageHeader.tsx` | Responsive h1 + break-word |
| `src/app/(frontend)/**/[slug]/page.tsx` (4 files) | Responsive titles, prose-sm/md, image sizes |
| `src/app/(frontend)/**/page.tsx` (7 list pages) | Image sizes, minor spacing |
| `src/components/programs/ProgramCard.tsx` | `min-w-0` |
| `src/components/layout/Footer.tsx` | Spacing + edge padding |
| `src/components/layout/Section.tsx` | Progressive py |
| `src/app/(frontend)/contact/page.tsx` | Overflow-safe hours |
| `src/app/(frontend)/about/page.tsx` | Minor spacing fixes |
| `src/app/(frontend)/page.tsx` | bg size, prose-sm/md, image sizes |
| `RESPONSIVE.md` (new) | Guardrails doc |

---

## How the soldier image layout works after ImageBlock

Before (current):
```
<div class="relative">
  <div class="absolute inset-0 z-0" style="background-image: url(...)">  ← soldier as CSS bg
  <Container class="relative z-10">
    <TextBlock columnStart=1 columnSpan=6 />
    <QuoteBlock columnStart=7 columnSpan=6 />
  </Container>
</div>
```

After (with ImageBlock):
```
<div class="relative">
  <div class="absolute inset-0 z-0" style="background-image: url(...)">  ← optional backdrop (low opacity)
  <Container class="relative z-10">
    <!-- Admin places ImageBlock first in CMS -->
    <ImageBlock image={soldier} columnStart=1 columnSpan=6 objectFit="cover" objectPosition="center 20%" />
    <!-- Text alongside or below the image -->
    <TextBlock columnStart=7 columnSpan=6 />
    <QuoteBlock columnStart=1 columnSpan=12 />
  </Container>
</div>
```

The admin configures the grid position in CMS. On mobile, all blocks stack full-width. The `objectPosition` field lets you fine-tune which part of the soldier is visible (e.g., `center 20%` keeps the helmet and torso in frame).

---

## Risks & open questions

- **Hero nav hamburger**: Requires converting Hero to a client component (or extracting nav into a separate client component) since the toggle state is client-side. Hero currently handles nav links directly. Plan: extract `<NavBar />` client component from Hero.
- **clamp() conversion of pt values**: The Hero's `text-[26pt]` etc. need conversion to a clamp expression. Example: `26pt ≈ 34.7px ≈ 2.17rem`. The clamp range would be something like `clamp(1.25rem, 3.5vw, 2.17rem)` for the sub-mobile-to-desktop range. Exact values tuned during implementation.
- **Payload image sizes URL**: Need to verify how Payload's API exposes image sizes. Typically available as `image.sizes.card.url` in the response. The `mediaUrl` helper will need to handle the nested `sizes` object. Verify with Payload's response shape before implementation.
- **The `prose` plugin + custom RichText renderer**: The custom renderer outputs Tailwind classes (e.g., headings with `text-2xl font-semibold`) which may conflict with `prose` styling. Plan: remove manual heading/paragraph sizing classes from `src/lib/richText.tsx` and rely entirely on `prose` for typography scale and spacing. This simplifies the renderer and avoids double-styling.
- **ImageBlock & the existing backgroundImage**: Since both are kept, the admin could set both a low-opacity backgroundImage as a subtle backdrop AND place the same soldier image as an ImageBlock at a precise grid position for the primary visual. This gives maximum flexibility. The admin documentation should clarify this dual-purpose design.
