import type { Member } from '@/payload-types';

// ═══════════════════════════════════════════════════════════════════════════
//  ACCESS SWITCH
//
//  OPEN_SITE_TO_GUESTS is read from the environment, so the client's site can
//  be opened or gated per deployment without a code change:
//
//    OPEN_SITE_TO_GUESTS=true   → whole site viewable without logging in;
//                                 guests are treated as the demo member below.
//    OPEN_SITE_TO_GUESTS=false  → pages are gated again: guests hitting
//                                 member-only pages are sent to /login by the
//                                 existing redirects in those pages.
//    (unset)                    → falls back to DEFAULT_OPEN_SITE_TO_GUESTS.
//
//  A real signed-in member or staff account always takes precedence over the
//  demo identity, so toggling this never changes what a logged-in user sees.
// ═══════════════════════════════════════════════════════════════════════════

/** Fallback used when OPEN_SITE_TO_GUESTS is not set in the environment. */
const DEFAULT_OPEN_SITE_TO_GUESTS = true;

// Accepts the common truthy/falsy spellings. An unrecognized value keeps the
// fallback rather than guessing, so a typo can't silently change site access.
function parseAccessFlag(raw: string | undefined): boolean {
  if (!raw) return DEFAULT_OPEN_SITE_TO_GUESTS;

  const value = raw.trim().toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(value)) return true;
  if (['false', '0', 'no', 'off'].includes(value)) return false;
  return DEFAULT_OPEN_SITE_TO_GUESTS;
}

export const OPEN_SITE_TO_GUESTS = parseAccessFlag(process.env.OPEN_SITE_TO_GUESTS);

/** Display name shown for the demo identity (header, hero, greetings). */
export const DEMO_MEMBER_DISPLAY_NAME = 'Maria Kozlowski';

// The demo identity, laid out as a complete `Member` record so components and
// type checks treat it exactly like a real signed-in member. The id is
// negative on purpose: it can never collide with a real row, so any query that
// accidentally filters on it (RSVP lists, etc.) simply returns nothing.
const DEMO_MEMBER: Member = {
  id: -1,
  collection: 'members',
  displayName: DEMO_MEMBER_DISPLAY_NAME,
  email: 'demo@example.invalid',
  status: 'active',
  _verified: true,
  avatar: null,
  bio: null,
  totalCheckIns: 36,
  currentStreak: 12,
  longestStreak: 17,
  lastCheckInDate: null,
  createdAt: '2026-08-01T12:00:00.000Z',
  updatedAt: '2026-08-01T12:00:00.000Z',
};

/**
 * Returns a fresh copy of the demo member so callers can never mutate the
 * shared literal.
 */
export function getDemoMember(): Member {
  return { ...DEMO_MEMBER };
}
