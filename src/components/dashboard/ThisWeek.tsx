const fontSans3 = { fontFamily: 'var(--font-source-sans-3), sans-serif' };

// Dummy week state — the real values will be derived from the member's
// check-in records for the current week and wired up on the back end later.
// 'done' = checked in (green circle + check), 'today' = today's circle
// (gold ring), 'upcoming' = day has not arrived yet (gray ring).
type DayStatus = 'done' | 'today' | 'upcoming';

const DAYS: Array<{ label: string; status: DayStatus }> = [
  { label: 'Mon', status: 'done' },
  { label: 'Tue', status: 'done' },
  { label: 'Wed', status: 'done' },
  { label: 'Thu', status: 'done' },
  { label: 'Fri', status: 'today' },
  { label: 'Sat', status: 'upcoming' },
  { label: 'Sun', status: 'upcoming' },
];

const STREAK_TEXT = '4-day streak. Check in today to make it 5.';

// One day circle. The card is a CSS container (container-type: inline-size on
// the section), so the circles scale with the CARD's width via cqw units —
// not the viewport — keeping all seven on one line at any display width
// (reference: 92px circle / 31px gap / 30px label on the 928px card content
// box at the 1440px design width).
function DayCircle({ label, status }: { label: string; status: DayStatus }) {
  const circleSize = 'clamp(26px, 9.914cqw, 92px)';
  const ringWidth = 'clamp(2px, 0.431cqw, 4px)';
  const textSize = 'clamp(10px, 3.233cqw, 30px)';

  const circle =
    status === 'done' ? (
      <div
        className="flex items-center justify-center rounded-full bg-[#00d80a]"
        style={{ width: circleSize, height: circleSize }}
      >
        {/* Check mark knocked out in the card background color, per the mockup. */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#3a3c4e"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            width: 'clamp(10px, 4.31cqw, 40px)',
            height: 'clamp(10px, 4.31cqw, 40px)',
            strokeWidth: 'clamp(2px, 0.539cqw, 5px)',
          }}
          aria-hidden="true"
        >
          <path d="M4.5 12.5l5 5L20 6.5" />
        </svg>
      </div>
    ) : (
      <div
        className={`flex items-center justify-center rounded-full ${
          status === 'today' ? 'border-[#e3a64e] text-[#e3a64e]' : 'border-[#c5d7e2] text-[#c5d7e2]'
        }`}
        style={{
          width: circleSize,
          height: circleSize,
          borderWidth: ringWidth,
          borderStyle: 'solid',
        }}
      >
        <span style={{ ...fontSans3, fontSize: textSize, fontWeight: 600, lineHeight: 1 }}>
          {label}
        </span>
      </div>
    );

  return (
    <div className="flex flex-col items-center">
      {circle}
      <span
        className={status === 'today' ? 'text-[#e3a64e]' : 'text-[#c5d7e2]'}
        style={{
          ...fontSans3,
          fontSize: textSize,
          fontWeight: 600,
          lineHeight: 1.2,
          marginTop: 'clamp(3px, 1.078cqw, 10px)',
        }}
      >
        {status === 'today' ? 'Today' : label}
      </span>
    </div>
  );
}

// First section of the dashboard's wide (left) column: the "This Week"
// summary — one circle per weekday showing which days the member checked in,
// plus the current streak line.
export function ThisWeek() {
  return (
    <section
      aria-label="This week"
      className="rounded-lg bg-[#3a3c4e]"
      style={{
        // Size container so the day circles scale with the card (cqw units
        // inside), keeping the row on one line at any display width.
        containerType: 'inline-size',
        paddingTop: 'clamp(6px, 0.83vw, 12px)',
        paddingBottom: 'clamp(12px, 1.67vw, 24px)',
        paddingLeft: 'clamp(14px, 2.22vw, 32px)',
        paddingRight: 'clamp(14px, 2.22vw, 32px)',
      }}
    >
      <h2
        className="text-[#dbe7ee]"
        style={{
          ...fontSans3,
          fontSize: 'clamp(14px, 2.0833vw, 30px)',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          lineHeight: 1.2,
        }}
      >
        This Week
      </h2>

      <div
        className="flex flex-wrap justify-center"
        style={{
          gap: 'clamp(6px, 3.34cqw, 31px)',
          marginTop: 'clamp(12px, 1.67vw, 24px)',
        }}
      >
        {DAYS.map((day) => (
          <DayCircle key={day.label} label={day.label} status={day.status} />
        ))}
      </div>

      <p
        className="text-[#c5d7e2]"
        style={{
          ...fontSans3,
          fontSize: 'clamp(13px, 2.0833vw, 30px)',
          fontWeight: 400,
          lineHeight: 1.3,
          marginTop: 'clamp(6px, 0.83vw, 12px)',
        }}
      >
        {STREAK_TEXT}
      </p>
    </section>
  );
}
