// Pure data + geometry for the pillar-balance triangle.
//
// Deliberately outside the chart's `'use client'` module: Next.js only exposes
// component references when a server component imports from a client module,
// so value exports imported that way arrive as `undefined`. The section
// wrapper (a server component) needs the defaults and helpers too, so they
// live here and both sides import them normally.

export type PillarValues = {
  move: number;
  mind: number;
  fuel: number;
};

/** Pillar keys in chart order: Move top, Mind bottom-left, Fuel bottom-right. */
export const PILLAR_KEYS = ['move', 'mind', 'fuel'] as const;

// Dummy values — the real percentages are calculated as
// (pillar-days completed / challenge day number) * 100 and wired up from the
// backend. Each percentage is mapped radially: it sets how far the pillar's
// vertex sits along the line from the outer triangle's center out to that
// pillar's corner (100% = MAX_SPOKE_RATIO of the way out, 0% = at the center),
// so the inner triangle visually shows which pillar is most and least observed.
export const DEFAULT_PILLAR_VALUES: PillarValues = { move: 100, mind: 45, fuel: 60 };

export type Point = { x: number; y: number };

// Chart geometry in SVG user units. The triangle keeps the mockup's
// proportions (base slightly wider than tall, apex top-center) but now sits
// close to the viewBox edges — the only side space is a standard margin around
// the outer vertices. MIND / FUEL are drawn under the base inside the
// triangle's horizontal span, so they no longer need side gutters.
export const PILLAR_AXES: Record<keyof PillarValues, Point> = {
  move: { x: 212, y: 32 },
  mind: { x: 12, y: 332 },
  fuel: { x: 412, y: 332 },
};

// Centroid of the outer triangle — every pillar value scales its axis vertex
// toward this point along that pillar's center→corner line, so 0% sits at the
// center and 100% sits MAX_SPOKE_RATIO of the way to the corner.
const CENTROID: Point = { x: 212, y: 232 };

// Furthest a vertex may travel along its spoke (90% of the full radius). 100%
// therefore draws just short of the gold frame instead of touching the outer
// vertex, which reads as clipped/awkward at the triangle's points.
export const MAX_SPOKE_RATIO = 0.9;

// Two-decimal rounding keeps the generated markup stable and diff-friendly
// (and avoids float noise while the triangle animates).
const round = (value: number) => Math.round(value * 100) / 100;

/** Chart position of one pillar at a given percentage (0–100). */
export function pillarPoint(pillar: keyof PillarValues, percent: number): Point {
  const axis = PILLAR_AXES[pillar];
  const t = (Math.max(0, Math.min(100, percent)) / 100) * MAX_SPOKE_RATIO;
  return {
    x: round(CENTROID.x + (axis.x - CENTROID.x) * t),
    y: round(CENTROID.y + (axis.y - CENTROID.y) * t),
  };
}

/** SVG `points` string for the inner triangle at the given pillar values. */
export function pillarPolygonPoints(values: PillarValues): string {
  return PILLAR_KEYS.map((pillar) => {
    const point = pillarPoint(pillar, values[pillar]);
    return `${point.x},${point.y}`;
  }).join(' ');
}

/**
 * SVG `points` string for an n-pointed star centred on (cx, cy), first point at
 * 12 o'clock. Used by the chart's 100% completion marker.
 */
export function starPoints(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  points = 5,
): string {
  const coords: string[] = [];
  for (let i = 0; i < points * 2; i += 1) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (Math.PI * i) / points - Math.PI / 2;
    coords.push(`${round(cx + Math.cos(angle) * radius)},${round(cy + Math.sin(angle) * radius)}`);
  }
  return coords.join(' ');
}

/** SVG `points` string for the fixed outer triangle. */
export const OUTER_TRIANGLE_POINTS = PILLAR_KEYS.map(
  (pillar) => `${PILLAR_AXES[pillar].x},${PILLAR_AXES[pillar].y}`,
).join(' ');
