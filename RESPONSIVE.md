# Responsive Design Guardrails

This document captures the responsive design conventions, breakpoint values, and required patterns for all new components in this project.

---

## Tailwind v4 Default Breakpoints

| Name | Min-width |
|------|-----------|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1536px |

These are the Tailwind v4 defaults. Do not add custom breakpoints without documented justification.

---

## Required Patterns for New Components

### Mobile-First Tailwind Classes
- Start with the mobile layout (no breakpoint prefix), then layer larger layouts with `sm:`, `md:`, `lg:` etc.
- Example: `text-sm md:text-base lg:text-lg`
- Example: `flex flex-col md:grid md:grid-cols-12`

### Layout / Spacing
- Use `px-4 sm:px-6 lg:px-8` for container edge padding
- Use `py-6 sm:py-8 lg:py-12` for section vertical padding
- Use `gap-4 sm:gap-6 lg:gap-8` for grid gaps where appropriate

### Font Sizing
- Major headings: use `clamp()` via inline style for responsive scaling
- Body/prose text: use Tailwind's `text-sm`, `text-base`, `text-lg` classes
- Avoid raw `pt` values outside the `resolvePt()` helper in `src/lib/fontSize.ts`

### Images (next/image)
- Always provide a `sizes` attribute matching the layout's max display width
- Use the `mediaUrl(src, sizeName)` helper with the correct Payload image size:
  - List cards: `mediaUrl(image, 'card')` (768x512)
  - Detail / hero: `mediaUrl(image, 'hero')` (1920x1440)
  - Thumbnails / sidebars: `mediaUrl(image, 'thumbnail')` (400x300)

### Content Blocks
- Each Payload block component must be independently responsive — it must work as full-width on mobile even if the desktop layout places it in a multi-column grid
- ContentBlocks container uses `flex flex-col gap-6 md:grid md:grid-cols-12 md:gap-6` — blocks stack on mobile, grid on `md+`

### ImageBlock
- The `ImageBlock` content block type places images (like the soldier image) in the 12-column grid alongside text/quote blocks
- Default `aspect-[16/10]` with configurable `objectFit` and `objectPosition`
- The `objectPosition` field (e.g. `center 20%`) is how you keep specific areas of the image visible at different viewports
- On mobile, ImageBlock stacks full-width like all other ContentBlocks

### Prose / Typography
- RichText wrappers should use `prose prose-stone prose-sm md:prose-base` for responsive typography scaling
- The `@tailwindcss/typography` plugin is registered in `globals.css` via `@plugin '@tailwindcss/typography'`

---

## Manual QA Checklist

Test all pages at these viewport widths:
- **375px** (typical mobile)
- **640px** (`sm` breakpoint)
- **768px** (`md` breakpoint)
- **1024px** (`lg` breakpoint)
- **1536px** (`2xl` max-content)

For each viewport, check:
- No horizontal scrollbar
- Navigation: hamburger on mobile (≤767px), inline links on `md+`
- Images load at correct size (check DevTools Network tab for oversized downloads)
- RichText content (long words, tables) does not overflow
- All CTAs / links are tappable (no overlapping elements)
- Footer columns stack correctly on mobile

### Worst-case CMS content test
Create a resource/article with:
- A 200-character title
- A very large uploaded image (e.g., 4000px wide)
- RichText containing a wide table or long unbroken string

Verify no layout overflow.

---

## Linting

The `eslint-plugin-tailwindcss` package is optional but recommended. If installed, consider enabling:
- `no-arbitrary-value` — discourages arbitrary `[]` values in favor of standard Tailwind classes
- `no-custom-classname` — ensures all custom classes are registered in the `@theme` block

---

## PR Template

If adding a PR template (`.github/PULL_REQUEST_TEMPLATE.md`), include a responsive QA checkbox:

```markdown
- [ ] Responsive: tested at 375px, 768px, 1024px — no overflow, no layout breakage
```
