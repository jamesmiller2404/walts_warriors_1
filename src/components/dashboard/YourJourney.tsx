import Image from 'next/image';

const fontSans3 = { fontFamily: 'var(--font-source-sans-3), sans-serif' };

// Dummy journey stats — the real numbers will be computed from the member's
// records and wired up to the admin later. Icons live in /public/icons.
// `extra` is the small parenthetical shown beside the big number (the mockup
// wraps it onto two lines).
const JOURNEY_STATS: Array<{
  icon: string;
  value: string;
  extra?: [string, string];
  label: string;
}> = [
  { icon: 'calendar-icon', value: '36', label: 'Check-ins' },
  { icon: 'fire-icon', value: '9', extra: ['(13.5 extra', 'points)'], label: 'Longest streak' },
  { icon: 'trophy-icon', value: '2', label: 'Challenges finished' },
  { icon: 'sparkle-icon', value: '145', label: 'Total points' },
];

// Wide-column card: "Your Journey" — four stat tiles (icon, big number,
// label) on secondary-card purple, per the mockup. Sizing follows the fluid
// convention — vw at the 1440px design width with clamp() floors.
export function YourJourney() {
  return (
    <section
      aria-label="Your journey"
      className="rounded-lg bg-[#3a3c4e]"
      style={{
        paddingTop: 'clamp(12px, 1.6667vw, 24px)',
        paddingBottom: 'clamp(16px, 2.2917vw, 33px)',
        paddingLeft: 'clamp(16px, 2.22vw, 32px)',
        paddingRight: 'clamp(16px, 2.22vw, 32px)',
      }}
    >
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
        Your Journey
      </h2>

      {/* Stat tiles — 2x2 on phones, one row of four from sm up. */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4"
        style={{
          gap: 'clamp(8px, 0.8333vw, 12px)',
          marginTop: 'clamp(10px, 1.6vw, 23px)',
        }}
      >
        {JOURNEY_STATS.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg bg-[#5c5678]"
            style={{
              paddingTop: 'clamp(5px, 0.4861vw, 7px)',
              paddingBottom: 'clamp(10px, 1.1111vw, 16px)',
              paddingLeft: 'clamp(12px, 1.5278vw, 22px)',
              paddingRight: 'clamp(12px, 1.5278vw, 22px)',
            }}
          >
            {/* Icon — black source SVG inverted to render light on the tile. */}
            <Image
              src={`/icons/${stat.icon}.svg`}
              alt=""
              width={22}
              height={22}
              className="invert"
              style={{ height: 'clamp(14px, 1.3889vw, 20px)', width: 'auto' }}
            />

            {/* Big number, with the optional small parenthetical beside it. */}
            <div
              className="flex items-center"
              style={{ gap: 'clamp(4px, 0.5556vw, 8px)', marginTop: 'clamp(4px, 0.5556vw, 8px)' }}
            >
              <span
                className="text-[#dbe7ee]"
                style={{
                  ...fontSans3,
                  fontSize: 'clamp(20px, 3.3333vw, 48px)',
                  fontWeight: 600,
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </span>
              {stat.extra ? (
                <span
                  className="text-[#dbe7ee]"
                  style={{
                    ...fontSans3,
                    fontSize: 'clamp(11px, 1.3889vw, 20px)',
                    fontWeight: 600,
                    lineHeight: 1.2,
                  }}
                >
                  {stat.extra[0]}
                  <br />
                  {stat.extra[1]}
                </span>
              ) : null}
            </div>

            <p
              className="text-[#dbe7ee]"
              style={{
                ...fontSans3,
                fontSize: 'clamp(12px, 1.5278vw, 22px)',
                fontWeight: 600,
                lineHeight: 1.1,
                marginTop: 'clamp(2px, 0.28vw, 4px)',
              }}
            >
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
