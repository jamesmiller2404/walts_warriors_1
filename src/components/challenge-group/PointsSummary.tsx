const fontSans3 = { fontFamily: 'var(--font-source-sans-3), sans-serif' };

// Dummy summary values — the real points, streak and bonus tier will be
// calculated from the member's challenge-group check-ins and wired up from the
// backend later.
const POINTS = 1240;
const STREAK_DAYS = 6;
const ACTIVE_BONUS = '1.5×';
const NEXT_BONUS_DAYS = 8;
const NEXT_BONUS = '1.75×';

type Props = {
  points?: number;
  streakDays?: number;
  /** Multiplier currently applied, e.g. "1.5×". */
  activeBonus?: string;
  /** Streak length that unlocks the next multiplier. */
  nextBonusDays?: number;
  /** The next multiplier, e.g. "1.75×". */
  nextBonus?: string;
};

/**
 * Challenge-group points summary card: a "Challenge Totals" heading over the
 * points and streak stats (stacked, so the composition holds up at one third of
 * the row) with the streak-bonus caption underneath. Charcoal card (#3a3c4e)
 * with black text.
 */
export function PointsSummary({
  points = POINTS,
  streakDays = STREAK_DAYS,
  activeBonus = ACTIVE_BONUS,
  nextBonusDays = NEXT_BONUS_DAYS,
  nextBonus = NEXT_BONUS,
}: Props) {
  const labelStyle = {
    ...fontSans3,
    fontSize: 'clamp(12px, 1.5278vw, 22px)',
    fontWeight: 600,
    letterSpacing: '0.08em',
    lineHeight: 1.2,
    textTransform: 'uppercase' as const,
  };

  const valueStyle = {
    ...fontSans3,
    fontSize: 'clamp(28px, 3.4722vw, 50px)',
    fontWeight: 700,
    lineHeight: 1.05,
    marginTop: 'clamp(1px, 0.2778vw, 4px)',
  };

  return (
    <section
      aria-label="Points and streak summary"
      className="h-full w-full rounded-lg bg-[#3a3c4e]"
      style={{
        paddingTop: 'clamp(12px, 1.6667vw, 24px)',
        paddingBottom: 'clamp(12px, 1.6667vw, 24px)',
        paddingLeft: 'clamp(12px, 1.6667vw, 24px)',
        paddingRight: 'clamp(12px, 1.6667vw, 24px)',
      }}
    >
      <h2
        className="text-[#000000] uppercase"
        style={{
          ...fontSans3,
          fontSize: 'clamp(12px, 1.5278vw, 22px)',
          fontWeight: 600,
          letterSpacing: '0.08em',
          lineHeight: 1.2,
        }}
      >
        Challenge Totals
      </h2>

      <div
        className="flex flex-col"
        style={{ gap: 'clamp(6px, 0.8333vw, 12px)', marginTop: 'clamp(8px, 1.1111vw, 16px)' }}
      >
        <div>
          <p className="text-[#000000]" style={labelStyle}>
            Points
          </p>
          <p className="text-[#000000]" style={valueStyle}>
            {points.toLocaleString('en-US')}
          </p>
        </div>

        <div>
          <p className="text-[#000000]" style={labelStyle}>
            Streak
          </p>
          <p className="text-[#000000]" style={valueStyle}>
            {streakDays} days
          </p>
        </div>
      </div>

      <p
        className="text-[#000000]"
        style={{
          ...fontSans3,
          fontSize: 'clamp(13px, 1.3889vw, 20px)',
          fontWeight: 700,
          lineHeight: 1.3,
          marginTop: 'clamp(8px, 1.1111vw, 16px)',
        }}
      >
        {activeBonus} bonus active. Reach {nextBonusDays} days to unlock {nextBonus}
      </p>
    </section>
  );
}
