import Link from 'next/link';

// Site title "Walt's WARRIORS" — shared by the home-page hero and the
// check-in-page header so both render the identical two-tone treatment;
// callers control only the size. Extracted verbatim from Hero.tsx.

// Text shadow cast from a light at a 225° bearing (down-left), so the shadow
// falls toward 45° (up-right) — same offset family as the hero headline, but
// the offset is pulled back 2px (5px distance vs the headline's 7px) and the
// blur is 2px tighter (4px vs 6px), compensating for the smaller glyphs.
const titleShadowCss = '2.54px -2px 3px rgba(0, 0, 0, 0.6)';

type SiteTitleTextProps = {
  /** CSS font-size. Defaults to the home-page hero's fluid size. */
  fontSize?: string;
  /** Link target. Pass null to render plain text (no link). */
  href?: string | null;
};

export function SiteTitleText({
  fontSize = 'clamp(20px, 3.75vw, 54px)',
  href = '/',
}: SiteTitleTextProps) {
  const title = (
    <span
      className="block leading-none"
      style={{
        fontFamily: 'var(--font-archivo-black)',
        // Fluid: 54px at the 1440px design width; mobile floor lowered to 20px
        // so the title + icon cluster both fit on phones.
        fontSize,
        // text-shadow (not a drop-shadow filter) so the shadow renders like
        // the headline — drop-shadow() blurs the element's whole alpha channel
        // (anti-aliasing + text-stroke edges), which reads more diffuse at the
        // same blur value.
        textShadow: titleShadowCss,
      }}
    >
      {/* "Walt's" in light blue, "WARRIORS" in charcoal with a bright silver
          outline (text-stroke) so the dark fill stays readable against the
          hero's photo background. */}
      <span className="text-[#c5d7e2]">Walt&apos;s</span>{' '}
      <span
        className="text-[#2c353b]"
        style={{ WebkitTextStroke: '0.5px rgba(225, 225, 225, 0.9)' }}
      >
        WARRIORS
      </span>
    </span>
  );

  if (href === null) {
    return title;
  }
  return (
    <Link href={href} className="inline-block min-w-0">
      {title}
    </Link>
  );
}
