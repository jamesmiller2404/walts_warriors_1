import { cache } from 'react';
import { headers as nextHeaders } from 'next/headers';

import { getPayloadClient } from '@/lib/payload';
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
  | { kind: 'member'; isStaff: false; displayName: string; member: Member }
  | { kind: 'staff'; isStaff: true; displayName: string; user: User };

// Server-side "who is logged in" for pages that accept any account. Resolves
// the session the same way getCurrentMember does, but accepts both auth
// collections. Wrapped in React.cache so multiple calls in one request dedupe.
export const getCurrentAccount = cache(async (): Promise<CurrentAccount | null> => {
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
        displayName: member.displayName || 'Member',
        member,
      };
    }
    if (user.collection === 'users') {
      const staff = user as unknown as User;
      return { kind: 'staff', isStaff: true, displayName: staff.name || 'Staff', user: staff };
    }
    return null;
  } catch {
    return null;
  }
});
