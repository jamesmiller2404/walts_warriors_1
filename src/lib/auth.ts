import { cache } from 'react';
import { headers as nextHeaders } from 'next/headers';

import { getPayloadClient } from '@/lib/payload';
import { DEMO_MEMBER_DISPLAY_NAME, OPEN_SITE_TO_GUESTS, getDemoMember } from '@/lib/siteAccess';
import type { Member, User } from '@/payload-types';

// Server-side "who is logged in" helper for the App Router. Reads the
// `payload-token` cookie from the request headers and resolves the member via
// Payload's auth strategies (the same session the REST API trusts).
// Wrapped in React.cache so multiple calls in the same request are deduped.
export const getCurrentMember = cache(async (): Promise<Member | null> => {
  try {
    const payload = await getPayloadClient();
    const headers = await nextHeaders();
    const { user } = await payload.auth({ headers: headers as unknown as Headers });
    if (user && user.collection === 'members') return user as unknown as Member;
    return null;
  } catch {
    return null;
  }
});

// What any signed-in account looks like to the public pages. Members are the
// community accounts; staff (administrators/editors) live in the `users`
// collection. Staff accounts are never gated by member-only requirements
// (challenge registration, enrollment, etc.) — a logged-in administrator can
// visit every page — so member-only gates must check `isStaff` first.
export type CurrentAccount =
  | {
      kind: 'member';
      isStaff: false;
      /** True when this is the hard-coded demo identity, not a real session. */
      isDemo: boolean;
      displayName: string;
      member: Member;
    }
  | {
      kind: 'staff';
      isStaff: true;
      /** True when this is the hard-coded demo identity, not a real session. */
      isDemo: boolean;
      displayName: string;
      user: User;
    };

// Resolves the real Payload session (member or staff). Returns null for guests,
// for auth failures, and whenever the database/auth layer is unavailable.
async function resolveSessionAccount(): Promise<CurrentAccount | null> {
  try {
    const payload = await getPayloadClient();
    const headers = await nextHeaders();
    const { user } = await payload.auth({ headers: headers as unknown as Headers });
    if (!user) return null;
    if (user.collection === 'members') {
      const member = user as unknown as Member;
      return {
        kind: 'member',
        isStaff: false,
        isDemo: false,
        displayName: member.displayName || 'Member',
        member,
      };
    }
    if (user.collection === 'users') {
      const staff = user as unknown as User;
      return {
        kind: 'staff',
        isStaff: true,
        isDemo: false,
        displayName: staff.name || 'Staff',
        user: staff,
      };
    }
    return null;
  } catch {
    return null;
  }
}

// Server-side "who is logged in" for pages that accept any account. Resolves
// the session the same way getCurrentMember does, but accepts both auth
// collections, then falls back to the hard-coded demo identity while
// OPEN_SITE_TO_GUESTS is on (src/lib/siteAccess.ts) so guests can browse the
// full member experience. Wrapped in React.cache so multiple calls in one
// request dedupe.
export const getCurrentAccount = cache(async (): Promise<CurrentAccount | null> => {
  const account = await resolveSessionAccount();
  if (account) return account;

  if (!OPEN_SITE_TO_GUESTS) return null;

  return {
    kind: 'member',
    isStaff: false,
    isDemo: true,
    displayName: DEMO_MEMBER_DISPLAY_NAME,
    member: getDemoMember(),
  };
});
