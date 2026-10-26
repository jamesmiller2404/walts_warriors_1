import { beforeAll, describe, expect, it } from 'vitest';

import type { Payload } from 'payload';
import { getPayload } from 'payload';

import config from '../src/payload.test.config';
import {
  DEFAULT_CHECKIN_SECTIONS,
  DEFAULT_HOME_SECTIONS,
  resolveCheckInSections,
  resolveHomeSections,
} from '../src/lib/pageSections';

let payload: Payload;

beforeAll(async () => {
  payload = await getPayload({ config });
});

describe('resolveHomeSections (pure logic)', () => {
  it('falls back to the built-in defaults when nothing is saved', () => {
    expect(resolveHomeSections(null)).toEqual(
      DEFAULT_HOME_SECTIONS.map((row) => ({ key: row.section, column: row.column })),
    );
    expect(resolveHomeSections(undefined)).toEqual(resolveHomeSections([]));
  });

  it('returns saved rows in saved order, dropping disabled rows', () => {
    const resolved = resolveHomeSections([
      { section: 'nextChallenge', enabled: true, column: 'narrow' },
      { section: 'askWalt', enabled: false, column: 'narrow' },
      { section: 'comingUp', enabled: true, column: 'narrow' },
    ]);
    expect(resolved.map((s) => s.key)).toEqual(['nextChallenge', 'comingUp']);
  });

  it('falls back to the default column for rows with a missing column', () => {
    const resolved = resolveHomeSections([{ section: 'challengeGroupToday', enabled: true }]);
    expect(resolved).toEqual([{ key: 'challengeGroupToday', column: 'wide' }]);
  });

  it('drops duplicate rows, keeping the first enabled occurrence', () => {
    const resolved = resolveHomeSections([
      { section: 'groupFeed', enabled: true, column: 'wide' },
      { section: 'groupFeed', enabled: true, column: 'narrow' },
    ]);
    expect(resolved).toEqual([{ key: 'groupFeed', column: 'wide' }]);
  });

  it('ignores rows with no section selected', () => {
    expect(resolveHomeSections([{ section: null, enabled: true }])).toEqual([]);
  });
});

describe('resolveCheckInSections (pure logic)', () => {
  it('falls back to the default when nothing is saved', () => {
    expect(resolveCheckInSections(null)).toEqual(
      DEFAULT_CHECKIN_SECTIONS.map((row) => ({ key: row.section })),
    );
  });

  it('drops disabled rows', () => {
    expect(resolveCheckInSections([{ section: 'todaysChallengeCheckIn', enabled: false }])).toEqual(
      [],
    );
  });

  it('includes the note-from-Walt section in the defaults', () => {
    expect(resolveCheckInSections(null).map((s) => s.key)).toContain('noteFromWalt');
  });
});

describe('page-sections global (round trip through the test DB)', () => {
  it('saves and reads back reordered/disabled rows', async () => {
    await payload.updateGlobal({
      slug: 'page-sections',
      data: {
        homeSections: [
          { section: 'comingUp', enabled: true, column: 'wide' },
          { section: 'groupFeed', enabled: false, column: 'wide' },
          { section: 'challengeGroupToday', enabled: true, column: 'wide' },
        ],
        checkInSections: [{ section: 'todaysChallengeCheckIn', enabled: false }],
      },
      overrideAccess: true,
    });

    const global = await payload.findGlobal({ slug: 'page-sections', depth: 0 });

    const home = resolveHomeSections(global.homeSections);
    expect(home.map((s) => s.key)).toEqual(['comingUp', 'challengeGroupToday']);
    expect(home.every((s) => s.column === 'wide')).toBe(true);

    // The disabled check-in row hides the only check-in section.
    expect(resolveCheckInSections(global.checkInSections)).toEqual([]);

    // Restore the empty state so the frontend fallback defaults apply again.
    await payload.updateGlobal({
      slug: 'page-sections',
      data: { homeSections: [], checkInSections: [] },
      overrideAccess: true,
    });
  });
});
