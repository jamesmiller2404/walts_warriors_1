'use client';

import {
  DEFAULT_PILLAR_VALUES,
  OUTER_TRIANGLE_POINTS,
  PILLAR_AXES,
  PILLAR_KEYS,
  pillarPoint,
  pillarPolygonPoints,
  starPoints,
  type PillarValues,
} from './pillarGeometry';

// Pillar-balance radar triangle. The chart is a client component driven by a
// single `values` prop so it can be animated later (e.g. stepping through
// check-in data over time with requestAnimationFrame or a state-driven
// timeline): only the numbers change, the markup above stays put. Values and
// geometry live in ./pillarGeometry so the server-rendered section can import
// them too.

const fontSans3 = { fontFamily: 'var(--font-source-sans-3), sans-serif' };

// Standard app palette.
const COLOR_GOLD = '#e3a64e';
const COLOR_TEXT = '#c5d7e2';
const COLOR_SECONDARY_TEXT = '#dbe7ee';
const COLOR_INNER_OUTLINE = '#13233a';

// 100% marker — a gold "service star" with a soft halo. Gold is the app's
// achievement accent (frame, medals, shields), so a maxed-out pillar resolves
// toward the frame instead of introducing a new colour.
const STAR_OUTER_RADIUS = 8;
const STAR_INNER_RADIUS = 3.4;
const STAR_HALO_RADIUS = 12;
const STAR_HALO_OPACITY = 0.15;
const COMPLETE_THRESHOLD = 100;

type Props = {
  /** Pillar completion percentages, 0–100. */
  values?: PillarValues;
  className?: string;
};

export function PillarBalanceChart({ values = DEFAULT_PILLAR_VALUES, className }: Props) {
  // Percent labels ride along with their vertices, so they stay attached when
  // the triangle is animated or fed live data.
  const movePoint = pillarPoint('move', values.move);
  const mindPoint = pillarPoint('mind', values.mind);
  const fuelPoint = pillarPoint('fuel', values.fuel);

  const percent = (value: number) => `${Math.round(value)}%`;

  // Maxed-out pillars are named as complete in the accessible label (the gold
  // star marker itself is decorative).
  const valueLabel = (pillar: keyof PillarValues) =>
    `${percent(values[pillar])}${values[pillar] >= COMPLETE_THRESHOLD ? ' (complete)' : ''}`;

  return (
    <svg
      viewBox="0 0 424 372"
      role="img"
      aria-label={`Pillar balance: Move ${valueLabel('move')}, Mind ${valueLabel(
        'mind',
      )}, Fuel ${valueLabel('fuel')}`}
      className={`block h-auto w-full ${className ?? ''}`}
    >
      <defs>
        {/* Inner filled triangle: the only non-standard color in this section —
            a 125° linear gradient. SVG gradients default to left-to-right
            (CSS 90deg), so rotate 35° to reach 125°. */}
        <linearGradient
          id="pillar-balance-fill"
          x1="0"
          y1="0"
          x2="1"
          y2="0"
          gradientTransform="rotate(35 0.5 0.5)"
        >
          <stop offset="0%" stopColor="#2c4d68" />
          <stop offset="100%" stopColor="#29526c" />
        </linearGradient>
      </defs>

      {/* Spider lines — each pillar axis drawn from the outer triangle's
          corner in to its inner vertex. Rendered first so the gold frame and
          the inner triangle's outline both sit on top of the spoke ends. */}
      {PILLAR_KEYS.map((pillar) => {
        const inner = pillarPoint(pillar, values[pillar]);
        const outer = PILLAR_AXES[pillar];
        return (
          <line
            key={pillar}
            x1={outer.x}
            y1={outer.y}
            x2={inner.x}
            y2={inner.y}
            stroke={COLOR_INNER_OUTLINE}
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
        );
      })}

      {/* Outer triangle — the gold frame every pillar axis runs along. Drawn on
          top of the spokes so the frame stays unbroken at its corners. */}
      <polygon
        points={OUTER_TRIANGLE_POINTS}
        fill="none"
        stroke={COLOR_GOLD}
        strokeWidth={2}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />

      {/* Inner triangle — one vertex per pillar, scaled by its percentage. */}
      <polygon
        points={pillarPolygonPoints(values)}
        fill="url(#pillar-balance-fill)"
        stroke={COLOR_INNER_OUTLINE}
        strokeWidth={2}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />

      {/* 100% markers — a gold service star with a soft halo on each pillar
          that reached the threshold, so an earned pillar is unmistakable even
          though its vertex stops short of the gold frame. */}
      {PILLAR_KEYS.filter((pillar) => values[pillar] >= COMPLETE_THRESHOLD).map((pillar) => {
        const point = pillarPoint(pillar, values[pillar]);
        return (
          <g key={`complete-${pillar}`} aria-hidden="true">
            <circle
              cx={point.x}
              cy={point.y}
              r={STAR_HALO_RADIUS}
              fill={COLOR_GOLD}
              opacity={STAR_HALO_OPACITY}
            />
            <polygon
              points={starPoints(point.x, point.y, STAR_OUTER_RADIUS, STAR_INNER_RADIUS)}
              fill={COLOR_GOLD}
              stroke={COLOR_INNER_OUTLINE}
              strokeWidth={1}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        );
      })}

      {/* Pillar names outside the triangle. */}
      <text
        x={212}
        y={24}
        textAnchor="middle"
        fill={COLOR_SECONDARY_TEXT}
        fontSize={20}
        fontWeight={600}
        letterSpacing={2}
        style={fontSans3}
      >
        MOVE
      </text>
      <text
        x={12}
        y={356}
        textAnchor="start"
        fill={COLOR_SECONDARY_TEXT}
        fontSize={20}
        fontWeight={600}
        letterSpacing={2}
        style={fontSans3}
      >
        MIND
      </text>
      <text
        x={412}
        y={356}
        textAnchor="end"
        fill={COLOR_SECONDARY_TEXT}
        fontSize={20}
        fontWeight={600}
        letterSpacing={2}
        style={fontSans3}
      >
        FUEL
      </text>

      {/* Percentages beside each inner vertex (muted, per the mockup). */}
      <text
        x={movePoint.x - 12}
        y={movePoint.y + 32}
        textAnchor="middle"
        fill={COLOR_TEXT}
        fillOpacity={0.6}
        fontSize={16}
        style={fontSans3}
      >
        {percent(values.move)}
      </text>
      <text
        x={mindPoint.x - 8}
        y={mindPoint.y + 8}
        textAnchor="end"
        fill={COLOR_TEXT}
        fillOpacity={0.6}
        fontSize={16}
        style={fontSans3}
      >
        {percent(values.mind)}
      </text>
      <text
        x={fuelPoint.x - 8}
        y={fuelPoint.y - 6}
        textAnchor="end"
        fill={COLOR_TEXT}
        fillOpacity={0.6}
        fontSize={16}
        style={fontSans3}
      >
        {percent(values.fuel)}
      </text>
    </svg>
  );
}
