// Section layout/visibility configuration shared by the home page and the
// check-in page. The admin manages section order and on/off state in the
// `page-sections` global (src/globals/PageSections.ts); this module resolves
// that saved configuration into an ordered list of section keys, falling back
// to the built-in defaults below when nothing has been saved yet.

// Home page section keys — must match the select options in PageSections.ts.
export type HomeSectionKey =
  | 'checkInStrip'
  | 'challengeGroupToday'
  | 'groupFeed'
  | 'thisWeekInLibrary'
  | 'comingUp'
  | 'askWalt'
  | 'nextChallenge';

// Check-in page section keys — must match the select options in PageSections.ts.
export type CheckInSectionKey = 'todaysChallengeCheckIn' | 'badgeProgress' | 'todaysThoughts';

// Where a home section renders. `full` sections stack above the two columns;
// `wide` fills the left (large-card) column; `narrow` the right (small-card)
// column. Keeping placement explicit (rather than a single flat list) stops a
// wide card from accidentally landing in the narrow column.
export type HomeSectionColumn = 'full' | 'wide' | 'narrow';

// Saved row shape (mirrors the generated Payload types; declared here so this
// module has no dependency on the generated file).
export type SectionRow<K extends string = string> = {
  section: K | null | undefined;
  enabled?: boolean | null;
  column?: HomeSectionColumn | null;
};

// Built-in defaults — the current hard-coded page order. Used until the admin
// saves rows in the `page-sections` global, so the live site never regresses.
export const DEFAULT_HOME_SECTIONS: Array<{ section: HomeSectionKey; column: HomeSectionColumn }> =
  [
    { section: 'checkInStrip', column: 'full' },
    { section: 'challengeGroupToday', column: 'wide' },
    { section: 'groupFeed', column: 'wide' },
    { section: 'thisWeekInLibrary', column: 'narrow' },
    { section: 'comingUp', column: 'narrow' },
    { section: 'askWalt', column: 'narrow' },
    { section: 'nextChallenge', column: 'narrow' },
  ];

export const DEFAULT_CHECKIN_SECTIONS: Array<{ section: CheckInSectionKey }> = [
  { section: 'todaysChallengeCheckIn' },
  { section: 'badgeProgress' },
  { section: 'todaysThoughts' },
];

// What the page renderers consume: ordered enabled keys, plus the column each
// home section belongs to.
export type ResolvedHomeSection = { key: HomeSectionKey; column: HomeSectionColumn };
export type ResolvedCheckInSection = { key: CheckInSectionKey };

// Resolve the saved home-page rows into an ordered list of enabled sections.
// Missing/empty saved config → full default list; a saved config replaces the
// defaults entirely (the admin's list is the single source of truth).
export function resolveHomeSections(
  rows?: Array<SectionRow<HomeSectionKey>> | null,
): ResolvedHomeSection[] {
  if (!Array.isArray(rows) || rows.length === 0) {
    return DEFAULT_HOME_SECTIONS.map((row) => ({ key: row.section, column: row.column }));
  }

  const resolved: ResolvedHomeSection[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    const key = row?.section;
    if (!key || row.enabled === false || seen.has(key)) continue;
    seen.add(key);
    // A column of null/undefined (e.g. legacy row) falls back to the default
    // placement for that key so nothing silently disappears.
    const defaultColumn = DEFAULT_HOME_SECTIONS.find((d) => d.section === key)?.column ?? 'narrow';
    resolved.push({ key, column: row.column ?? defaultColumn });
  }
  return resolved;
}

// Same resolution for the check-in page (no columns there — a single stack).
export function resolveCheckInSections(
  rows?: Array<SectionRow<CheckInSectionKey>> | null,
): ResolvedCheckInSection[] {
  if (!Array.isArray(rows) || rows.length === 0) {
    return DEFAULT_CHECKIN_SECTIONS.map((row) => ({ key: row.section }));
  }

  const resolved: ResolvedCheckInSection[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    const key = row?.section;
    if (!key || row.enabled === false || seen.has(key)) continue;
    seen.add(key);
    resolved.push({ key });
  }
  return resolved;
}
