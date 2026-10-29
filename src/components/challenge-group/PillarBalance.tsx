import { PillarBalanceChart } from './PillarBalanceChart';
import { DEFAULT_PILLAR_VALUES, PILLAR_KEYS, type PillarValues } from './pillarGeometry';

const fontSans3 = { fontFamily: 'var(--font-source-sans-3), sans-serif' };

const PILLAR_LABELS: Record<keyof PillarValues, string> = {
  move: 'Move',
  mind: 'Mind',
  fuel: 'Fuel',
};

type Props = {
  /** Pillar completion percentages. Defaults to the dummy values; the page
      will pass the challenge-period numbers once the backend calculation is
      wired up. */
  values?: PillarValues;
};

// Wide challenge-group card: "Your pillar balance for this challenge period" —
// the ternary radar triangle (PillarBalanceChart) on the left, coaching
// summary on the right. Sizing follows the fluid convention (vw at the 1440px
// design width with clamp() floors).
export function PillarBalance({ values = DEFAULT_PILLAR_VALUES }: Props) {
  // Strongest and least-observed pillars are derived from the same ratios that
  // place the triangle's vertices, so the copy can never disagree with the
  // chart. Ties keep the first pillar in chart order.
  const strongest = PILLAR_KEYS.reduce((best, key) => (values[key] > values[best] ? key : best));
  const weakest = PILLAR_KEYS.reduce((worst, key) => (values[key] < values[worst] ? key : worst));

  // Coaching lines under the heading. The first two mirror the chart's values;
  // the copy is dummy until the backend supplies the calculation.
  const summary: Array<{ label: string; strong?: string; rest: string }> = [
    {
      label: 'Strongest:',
      strong: PILLAR_LABELS[strongest],
      rest: ` ${Math.round(values[strongest])}%`,
    },
    {
      label: 'Needs work:',
      strong: PILLAR_LABELS[weakest],
      rest: ` ${Math.round(values[weakest])}%`,
    },
    { label: 'Last 7 days:', rest: 'Fuel is up 10 points' },
  ];

  return (
    <section
      aria-label="Your pillar balance for this challenge period"
      className="w-full rounded-lg bg-[#3a3c4e]"
      style={{
        paddingTop: 'clamp(18px, 2.2222vw, 32px)',
        paddingBottom: 'clamp(18px, 2.2222vw, 32px)',
        paddingLeft: 'clamp(16px, 2.4306vw, 35px)',
        paddingRight: 'clamp(16px, 2.4306vw, 35px)',
      }}
    >
      <div
        className="flex flex-col items-center lg:flex-row lg:items-center"
        style={{ gap: 'clamp(20px, 4.1667vw, 60px)' }}
      >
        {/* Chart column — graph first on mobile, left column on desktop. */}
        <div className="w-full max-w-[560px] lg:w-[58%] lg:max-w-[660px] lg:shrink-0">
          <PillarBalanceChart values={values} />
        </div>
        {/* Summary column — heading plus the three coaching lines. */}
        <div className="w-full min-w-0 lg:flex-1">
          <h2
            className="text-[#c5d7e2]"
            style={{
              ...fontSans3,
              fontSize: 'clamp(22px, 2.7778vw, 40px)',
              fontWeight: 400,
              lineHeight: 1.2,
              maxWidth: '20ch',
            }}
          >
            Your pillar balance for this challenge period
          </h2>

          <ul
            className="flex flex-col text-[#c5d7e2]"
            style={{
              ...fontSans3,
              fontSize: 'clamp(14px, 1.6667vw, 24px)',
              fontWeight: 400,
              lineHeight: 1.3,
              marginTop: 'clamp(16px, 2.4306vw, 35px)',
              gap: 'clamp(6px, 0.9028vw, 13px)',
            }}
          >
            {summary.map((line) => (
              <li key={line.label} className="break-words">
                {line.label}
                {line.strong ? <strong className="font-bold">{line.strong}</strong> : null}
                {line.rest}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
