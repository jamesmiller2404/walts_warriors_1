import { cache } from 'react';
import { headers as nextHeaders } from 'next/headers';

import { getPayloadClient } from '@/lib/payload';
import type { Member } from '@/payload-types';

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
