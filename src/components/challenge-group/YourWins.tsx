const fontSans3 = { fontFamily: 'var(--font-source-sans-3), sans-serif' };

// Dummy wins — the real entries will come from the member's check-ins for the
// current challenge group, newest first, once that is wired to the backend.
const WINS = [
  { text: 'Walked past the snack aisle without stopping', date: 'Aug 18' },
  { text: 'Took the stairs at work all week', date: 'Sep 22' },
  { text: 'Slept seven hours three nights in a row', date: 'Aug 15' },
  { text: 'Completed the 30-day challenge', date: 'Sep 10' }, // added win
  { text: 'Drank 8 glasses of water daily', date: 'Sep 5' }, // added win
];

type Props = {
  wins?: { text: string; date: string }[];
};

/** Gold sparkle shown at the start of each win row. */
function SparkleIcon() {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      className="shrink-0"
      style={{ width: 'clamp(18px, 2.3611vw, 34px)', height: 'auto' }}
    >
      <path d="M16 3l3 10 10 3-10 3-3 10-3-10-10-3 10-3z" fill="#f4a20f" />
      <path d="M6 25l1.6 4.4L12 31l-4.4 1.6L6 37l-1.6-4.4L0 31l4.4-1.6z" fill="#f4a20f" />
      <path d="M29 21l1.3 3.7 3.7 1.3-3.7 1.3L29 31l-1.3-3.7L24 26l3.7-1.3z" fill="#f4a20f" />
    </svg>
  );
}

/**
 * \"Your Recent Wins\" card: the member's latest challenge-group wins, each with
 * a gold sparkle and hairline separator, plus a link through to the full list.
 * Palette colors; charcoal card like the other sections.
 */
export function YourWins({ wins = WINS }: Props) {
  return (
    <section
      aria-label="Your recent wins"
      className="h-full w-full rounded-lg bg-[#3a3c4e]"
      style={{
        paddingTop: 'clamp(12px, 1.6667vw, 24px)',
        paddingBottom: 'clamp(12px, 1.6667vw, 24px)',
        paddingLeft: 'clamp(12px, 1.6667vw, 24px)',
        paddingRight: 'clamp(12px, 1.6667vw, 24px)',
      }}
    >
      <h2
        className="text-[#c5d7e2] uppercase"
        style={{
          ...fontSans3,
          fontSize: 'clamp(12px, 1.5278vw, 22px)',
          fontWeight: 600,
          letterSpacing: '0.08em',
          lineHeight: 1.2,
        }}
      >
        Your Recent Wins
      </h2>

      <div
        className="flex"
        style={{ gap: 'clamp(8px, 1.1111vw, 16px)', marginTop: 'clamp(8px, 1.1111vw, 16px)' }}
      >
        <div className="min-w-0 flex-1">
          <div className="h-64 overflow-y-auto">
            <ul>
              {wins.map((win, index) => (
                <li
                  key={win.text}
                  className={index > 0 ? 'border-t border-[#c5d7e2]/25' : undefined}
                  style={{ paddingBlock: 'clamp(5px, 0.8333vw, 12px)' }}
                >
                  <div className="flex items-center" style={{ gap: 'clamp(8px, 1.1111vw, 16px)' }}>
                    <SparkleIcon />
                    <p
                      className="text-[#dbe7ee]"
                      style={{
                        ...fontSans3,
                        fontSize: 'clamp(14px, 1.875vw, 27px)',
                        lineHeight: 1.25,
                      }}
                    >
                      {win.text} <span className="text-sm text-[#8892a5] ml-auto">{win.date}</span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <a
            href="#"
            className="inline-block font-semibold text-[#2489f2] transition hover:underline"
            style={{
              ...fontSans3,
              fontSize: 'clamp(13px, 1.8056vw, 26px)',
              marginTop: 'clamp(6px, 0.8333vw, 12px)',
            }}
          >
            See all your wins...
          </a>
        </div>
      </div>
    </section>
  );
}
