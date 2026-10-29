const fontSans3 = { fontFamily: 'var(--font-source-sans-3), sans-serif' };

// Dummy check-in data — the real rows (pillar, task, progress, points earned)
// will come from the member's current/most recent check-in via the backend.
// Bar colors follow the app's pillar language: Move = strips blue, Fuel = the
// orange growth accent, Mind = lilac.
const TRACK_COLOR = '#3f4d66';

type BalanceRow = {
  pillar: string;
  task: string;
  completed: number;
  goal: number;
  unit: string;
  color: string;
};

const BALANCE_ROWS: BalanceRow[] = [
  { pillar: 'Move', task: 'Walk', completed: 30, goal: 30, unit: 'min', color: '#275b99' },
  { pillar: 'Fuel', task: 'Drink water', completed: 40, goal: 64, unit: 'oz', color: '#f4a20f' },
  { pillar: 'Mind', task: 'Read', completed: 5, goal: 20, unit: 'min', color: '#8c8fd0' },
];

const DAY_NUMBER = 16;
const POINTS_EARNED = 94;
const BONUS = '1.5×';

type Props = {
  rows?: BalanceRow[];
  dayNumber?: number;
  pointsEarned?: number;
  /** Streak multiplier applied to the day's points, e.g. "1.5×". */
  bonus?: string;
};

/**
 * Pillar balance for the current or most recent check-in: one bar per pillar
 * showing the day's task progress (and a green tick once the goal is met), plus
 * the points earned at the member's streak bonus. Palette colors throughout.
 */
export function CheckInBalance({
  rows = BALANCE_ROWS,
  dayNumber = DAY_NUMBER,
  pointsEarned = POINTS_EARNED,
  bonus = BONUS,
}: Props) {
  return (
    <section
      aria-label="Pillar balance for your latest check-in"
      className="flex h-full w-full flex-col rounded-lg bg-[#3a3c4e]"
      style={{
        paddingTop: 'clamp(12px, 1.6667vw, 24px)',
        paddingBottom: 'clamp(12px, 1.6667vw, 24px)',
        paddingLeft: 'clamp(12px, 1.6667vw, 24px)',
        paddingRight: 'clamp(12px, 1.6667vw, 24px)',
      }}
    >
      <p
        className="text-[#c5d7e2] uppercase"
        style={{
          ...fontSans3,
          fontSize: 'clamp(12px, 1.5278vw, 22px)',
          fontWeight: 600,
          letterSpacing: '0.08em',
          lineHeight: 1.2,
        }}
      >
        Today / Last check-in
      </p>

      <div
        className="flex flex-1 flex-col justify-center"
        style={{ gap: 'clamp(10px, 1.3889vw, 20px)', marginTop: 'clamp(8px, 1.1111vw, 16px)' }}
      >
        {rows.map((row) => {
          const percent = Math.max(
            0,
            Math.min(100, row.goal > 0 ? (row.completed / row.goal) * 100 : 0),
          );
          const complete = row.goal > 0 && row.completed >= row.goal;

          return (
            <div
              key={row.pillar}
              className="grid items-end"
              style={{
                // Fixed value column + the always-present tick slot below keep
                // every bar track exactly the same length across rows.
                gridTemplateColumns:
                  'clamp(56px, 8.3333vw, 120px) minmax(0, 1fr) clamp(128px, 13.8889vw, 200px)',
                columnGap: 'clamp(10px, 1.3889vw, 20px)',
              }}
            >
              <p
                className="text-[#c5d7e2]"
                style={{ ...fontSans3, fontSize: 'clamp(18px, 2.0833vw, 30px)', lineHeight: 1.1 }}
              >
                {row.pillar}
              </p>

              <div>
                <p
                  className="text-[#dbe7ee]"
                  style={{
                    ...fontSans3,
                    fontSize: 'clamp(13px, 1.3889vw, 20px)',
                    lineHeight: 1.2,
                    marginBottom: 'clamp(1px, 0.2778vw, 4px)',
                  }}
                >
                  {row.task}
                </p>

                <div
                  className="w-full overflow-hidden rounded-full"
                  style={{
                    backgroundColor: TRACK_COLOR,
                    height: 'clamp(10px, 1.25vw, 18px)',
                  }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${percent}%`, backgroundColor: row.color }}
                  />
                </div>
              </div>

              <div className="flex items-center" style={{ gap: 'clamp(6px, 0.6944vw, 10px)' }}>
                <p
                  className="text-[#dbe7ee] whitespace-nowrap"
                  style={{
                    ...fontSans3,
                    fontSize: 'clamp(16px, 2.0833vw, 30px)',
                    lineHeight: 1.1,
                  }}
                >
                  {row.completed} / {row.goal} {row.unit}
                </p>

                {complete ? (
                  <span
                    className="inline-flex shrink-0 items-center justify-center"
                    style={{
                      width: 'clamp(14px, 1.5278vw, 22px)',
                      height: 'clamp(14px, 1.5278vw, 22px)',
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      aria-label="Completed"
                      role="img"
                      fill="none"
                      stroke="#00d80a"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ width: '100%', height: '100%' }}
                    >
                      <path d="M4 12.5 9.5 18 20 6.5" />
                    </svg>
                  </span>
                ) : (
                  // Empty slot of the same size, reserved so rows without a tick
                  // keep their bar track the same length as rows with one.
                  <span
                    aria-hidden="true"
                    className="inline-flex shrink-0"
                    style={{
                      width: 'clamp(14px, 1.5278vw, 22px)',
                      height: 'clamp(14px, 1.5278vw, 22px)',
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p
        className="text-[#c5d7e2]"
        style={{
          ...fontSans3,
          fontSize: 'clamp(13px, 1.3889vw, 20px)',
          lineHeight: 1.4,
          marginTop: 'clamp(10px, 1.3889vw, 18px)',
        }}
      >
        You&apos;re checked in for today. Day {dayNumber} earned{' '}
        <strong className="font-bold">{pointsEarned} pts</strong> at your {bonus} streak bonus.
      </p>
    </section>
  );
}
