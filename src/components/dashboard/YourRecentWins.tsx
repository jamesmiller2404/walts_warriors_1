const fontSans3 = { fontFamily: 'var(--font-source-sans-3), sans-serif' };

// Dummy wins — the real entries will come from the member's recent check-in
// wins and be wired up to the admin later.
const WINS = [
  'Walked past the snack aisle without stopping',
  'Took the stairs at work all week',
  'Slept seven hours three nights in a row',
];

// Gold twinkle glyph that opens each win row — matches the mockup's sparkle
// emoji (one big four-point star flanked by two small ones). Drawn inline (not
// an image) so it renders identically everywhere, like SmileyIcon in
// WinsFromChallengeGroup.
function SparkleIcon() {
  return (
    <svg
      viewBox="0 0 26 22"
      fill="#f5a623"
      aria-hidden="true"
      style={{ height: 'clamp(16px, 1.5278vw, 22px)', width: 'auto' }}
    >
      <path d="M15 0 Q16.5 9.5 26 11 Q16.5 12.5 15 22 Q13.5 12.5 4 11 Q13.5 9.5 15 0 Z" />
      <path d="M4 0 Q4.7 3.4 8 4 Q4.7 4.6 4 8 Q3.3 4.6 0 4 Q3.3 3.4 4 0 Z" />
      <path d="M23 13 Q23.5 15.6 26 16 Q23.5 16.4 23 19 Q22.5 16.4 20 16 Q22.5 15.6 23 13 Z" />
    </svg>
  );
}

// Wide-column card: "Your Recent Wins" — a short list of the member's recent
// wins, each opened by the gold sparkle glyph. Sizing follows the fluid
// convention — vw at the 1440px design width with clamp() floors.
export function YourRecentWins() {
  return (
    <section
      aria-label="Your recent wins"
      className="rounded-lg bg-[#3a3c4e]"
      style={{
        paddingTop: 'clamp(12px, 1.7361vw, 25px)',
        paddingBottom: 'clamp(12px, 1.5278vw, 22px)',
        paddingLeft: 'clamp(10px, 1.5278vw, 22px)',
        paddingRight: 'clamp(10px, 1.5278vw, 22px)',
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
        Your Recent Wins
      </h2>

      <ul
        className="flex flex-col"
        style={{ gap: 'clamp(9px, 1.25vw, 18px)', marginTop: 'clamp(10px, 1.3889vw, 20px)' }}
      >
        {WINS.map((win) => (
          <li key={win} className="flex items-center" style={{ gap: 'clamp(8px, 1.0417vw, 15px)' }}>
            <SparkleIcon />
            <p
              className="min-w-0 text-[#c5d7e2]"
              style={{
                ...fontSans3,
                fontSize: 'clamp(13px, 1.6667vw, 24px)',
                fontWeight: 400,
                lineHeight: 1.25,
              }}
            >
              {win}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
