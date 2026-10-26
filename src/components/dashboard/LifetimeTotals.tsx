import Image from 'next/image';

const fontSans3 = { fontFamily: 'var(--font-source-sans-3), sans-serif' };

// Dummy lifetime totals — the real numbers will be computed from the member's
// records and wired up to the admin later. The name comes from the signed-in
// account; everything below is placeholder data.
const STATS = [
  'Challenges Completed: 4',
  'Longest streak: 17 days (25.5 extra points)',
  'Lifetime Points: 723 pts',
  'Lifetime Checkins: 723 pts',
  'Leader Position: 4th',
];

// Badge shields earned, in the mockup's order (silver, bronze, blue, silver,
// bronze). The real badges will come from the member's badge records later.
const SHIELDS: Array<'silver' | 'bronze' | 'blue'> = [
  'silver',
  'bronze',
  'blue',
  'silver',
  'bronze',
];

// Narrow-column card: the member's lifetime totals — name, headline stats,
// and the shields earned so far. Background is the primary card color at 50%
// opacity per the design. Sizing follows the fluid convention — vw at the
// 1440px design width with clamp() floors.
export function LifetimeTotals({ firstName }: { firstName?: string | null }) {
  const name = (firstName ?? '').trim();

  return (
    <section
      aria-label="Lifetime totals"
      className="rounded-lg bg-[#3a3c4e]/50"
      style={{
        paddingTop: 'clamp(12px, 1.875vw, 27px)',
        paddingBottom: 'clamp(10px, 1.46vw, 21px)',
        paddingLeft: 'clamp(16px, 2.64vw, 38px)',
        paddingRight: 'clamp(16px, 2.64vw, 38px)',
      }}
    >
      {/* Card label. */}
      <h2
        className="text-[#c5d7e2]"
        style={{
          ...fontSans3,
          fontSize: 'clamp(13px, 1.6667vw, 24px)',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          lineHeight: 1.2,
        }}
      >
        Lifetime Totals
      </h2>

      {/* Member name — the signed-in account's first name, per the mockup. */}
      <p
        className="text-[#dbe7ee]"
        style={{
          ...fontSans3,
          fontSize: 'clamp(14px, 1.6667vw, 24px)',
          fontWeight: 600,
          lineHeight: 1.1,
          marginTop: 'clamp(8px, 1.11vw, 16px)',
          textTransform: 'uppercase',
        }}
      >
        {name || '\u00A0'}
      </p>

      {/* Headline stats — long lines wrap naturally, per the mockup. */}
      <div style={{ marginTop: 'clamp(12px, 2.29vw, 33px)' }}>
        {STATS.map((stat, index) => (
          <p
            key={stat}
            className="text-[#c5d7e2]"
            style={{
              ...fontSans3,
              fontSize: 'clamp(12px, 1.25vw, 18px)',
              fontWeight: 600,
              lineHeight: 1.25,
              marginTop: index === 0 ? 0 : 'clamp(6px, 1.25vw, 18px)',
            }}
          >
            {stat}
          </p>
        ))}
      </div>

      {/* Shields earned — 36x76 icon assets, left-aligned like the text. */}
      <div
        className="flex flex-wrap"
        style={{
          gap: 'clamp(12px, 1.94vw, 28px)',
          marginTop: 'clamp(8px, 1.25vw, 18px)',
        }}
      >
        {SHIELDS.map((shield, index) => (
          <Image
            key={`${shield}-${index}`}
            src={`/icons/shield1Icon_${shield}.png`}
            alt=""
            width={36}
            height={76}
            className="h-auto w-[clamp(24px,2.5vw,36px)]"
          />
        ))}
      </div>
    </section>
  );
}
