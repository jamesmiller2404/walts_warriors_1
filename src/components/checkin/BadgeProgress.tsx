const fontSans3 = { fontFamily: 'var(--font-source-sans-3), sans-serif' };

// Dummy progress values — the real numbers will be computed on the back end
// (from the member's check-ins vs. the current challenge) and wired up later.
const CHECK_INS_DONE = 11;
const CHECK_IN_DAYS = 24;
const DAY_NUMBER = 16;
const CHALLENGE_DAYS = 30;
const STREAK_DAYS = 4;
const DAYS_REMAINING = 13;
const MISSES_ALLOWED = 2;

// Second section below the check-in-page header: the member's progress toward
// the current challenge's completion badge. Sizing follows the page's fluid
// convention — vw-proportional at the 1440px design width with clamp() floors.
export function BadgeProgress() {
  const percent = Math.round((CHECK_INS_DONE / CHECK_IN_DAYS) * 100);

  return (
    <section
      className="rounded-lg bg-[#5c5678]"
      style={{
        marginTop: 'clamp(16px, 2.5vw, 36px)',
        marginLeft: '1.5%',
        marginRight: '1.5%',
        paddingTop: 'clamp(12px, 1.3889vw, 20px)',
        paddingBottom: 'clamp(14px, 1.8vw, 26px)',
        paddingLeft: 'clamp(14px, 2.0833vw, 30px)',
        paddingRight: 'clamp(14px, 2.0833vw, 30px)',
      }}
    >
      {/* Heading row — h2 style on the left, challenge day / streak on the right. */}
      <div className="flex items-baseline justify-between gap-4">
        <h2
          className="text-[#dbe7ee]"
          style={{
            ...fontSans3,
            fontSize: 'clamp(14px, 2.0833vw, 30px)',
            fontWeight: 400,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            lineHeight: 1.2,
          }}
        >
          Your Badge Progress
        </h2>
        <p
          className="text-[#dbe7ee]"
          style={{ ...fontSans3, fontSize: 'clamp(13px, 2.0833vw, 30px)', lineHeight: 1.2 }}
        >
          Day {DAY_NUMBER} of {CHALLENGE_DAYS} · {STREAK_DAYS}-day streak
        </p>
      </div>

      {/* Big count line. */}
      <p
        className="text-[#dbe7ee]"
        style={{
          ...fontSans3,
          fontSize: 'clamp(16px, 2.7778vw, 40px)',
          fontWeight: 600,
          marginTop: 'clamp(6px, 0.8vw, 12px)',
          lineHeight: 1.25,
        }}
      >
        {CHECK_INS_DONE} of {CHECK_IN_DAYS} check-in days
      </p>

      {/* Progress bar — lilac fill on the dark track, percent label to its
      right, per the mockup. Fill is derived from the dummy values for now. */}
      <div
        className="flex items-center"
        style={{ gap: 'clamp(12px, 1.4vw, 20px)', marginTop: 'clamp(6px, 0.55vw, 8px)' }}
      >
        <div
          className="flex-1 overflow-hidden rounded-full bg-[#3f4d66]"
          style={{ height: 'clamp(18px, 2.0833vw, 30px)' }}
        >
          <div className="h-full rounded-full bg-[#8c8fd0]" style={{ width: `${percent}%` }} />
        </div>
        <p
          className="text-[#dbe7ee]"
          style={{
            ...fontSans3,
            fontSize: 'clamp(16px, 2.7778vw, 40px)',
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          {percent}%
        </p>
      </div>

      {/* Summary lines under the bar. */}
      <div
        className="text-[#dbe7ee]"
        style={{
          ...fontSans3,
          fontSize: 'clamp(12px, 1.9444vw, 28px)',
          marginTop: 'clamp(10px, 1.1111vw, 16px)',
          lineHeight: 1.5,
        }}
      >
        <p>{DAYS_REMAINING} more to earn your completion badge</p>
        <p>You can miss {MISSES_ALLOWED} more days</p>
      </div>
    </section>
  );
}
