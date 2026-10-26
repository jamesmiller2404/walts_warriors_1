const fontSans3 = { fontFamily: 'var(--font-source-sans-3), sans-serif' };

// Dummy balance values — the real percentages will be computed from the
// member's check-in records for the last 30 days and wired up later. Fuel is
// highlighted orange as the growth area, per the mockup.
const BALANCE_ROWS: Array<{ label: string; percent: number; color: string }> = [
  { label: 'Move', percent: 55, color: '#8c8fd0' },
  { label: 'Fuel', percent: 43, color: '#f4a20f' },
  { label: 'Mind', percent: 84, color: '#8c8fd0' },
];

const CAPTION =
  'Fuel is your growth area. Try the easier swaps this week, like one extra vegetable at dinner.';

// Wide-column card: "Your Balance" — one pill bar per pillar showing how often
// it was completed over the last 30 days, plus a coaching caption. Sizing
// follows the fluid convention — vw at the 1440px design width with clamp()
// floors (bar: 28px tall, label column: 130px, pct: 48px at 1440).
export function Balance() {
  return (
    <section
      aria-label="Your balance over the last 30 days"
      className="rounded-lg bg-[#3a3c4e]"
      style={{
        paddingTop: 'clamp(14px, 1.9444vw, 28px)',
        paddingBottom: 'clamp(16px, 2.2917vw, 33px)',
        paddingLeft: 'clamp(14px, 2.0139vw, 29px)',
        paddingRight: 'clamp(14px, 2.0139vw, 29px)',
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
        Your balance over the last 30 days
      </h2>

      <p
        className="text-[#c5d7e2]"
        style={{
          ...fontSans3,
          fontSize: 'clamp(13px, 2.0833vw, 30px)',
          fontWeight: 400,
          lineHeight: 1.2,
          marginTop: 'clamp(14px, 2.0833vw, 30px)',
        }}
      >
        How often you completed each pillar
      </p>

      {/* One bar row per pillar: centered label, pill track + fill, big pct. */}
      <div
        className="flex flex-col"
        style={{ gap: 'clamp(8px, 1.0417vw, 15px)', marginTop: 'clamp(14px, 2.2222vw, 32px)' }}
      >
        {BALANCE_ROWS.map((row) => (
          <div key={row.label} className="flex items-center">
            <span
              className="shrink-0 text-center text-[#c5d7e2]"
              style={{
                ...fontSans3,
                fontSize: 'clamp(13px, 2.0833vw, 30px)',
                fontWeight: 600,
                lineHeight: 1.2,
                width: 'clamp(60px, 9.0278vw, 130px)',
              }}
            >
              {row.label}
            </span>

            <div
              className="min-w-0 flex-1 overflow-hidden rounded-full bg-[#3f4d66]"
              style={{ height: 'clamp(14px, 1.9444vw, 28px)' }}
            >
              <div
                className="h-full rounded-full"
                style={{ width: `${row.percent}%`, backgroundColor: row.color }}
              />
            </div>

            <span
              className="shrink-0 text-[#dbe7ee]"
              style={{
                ...fontSans3,
                fontSize: 'clamp(20px, 3.3333vw, 48px)',
                fontWeight: 600,
                lineHeight: 1,
                marginLeft: 'clamp(16px, 2.4306vw, 35px)',
              }}
            >
              {row.percent}%
            </span>
          </div>
        ))}
      </div>

      <p
        className="text-[#c5d7e2]"
        style={{
          ...fontSans3,
          fontSize: 'clamp(13px, 1.6667vw, 24px)',
          fontWeight: 400,
          lineHeight: 1.3,
          marginTop: 'clamp(12px, 1.6667vw, 24px)',
        }}
      >
        {CAPTION}
      </p>
    </section>
  );
}
