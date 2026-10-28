'use server';

import { APIError } from 'payload';

import { getCurrentAccount } from '@/lib/auth';
import { getPayloadClient } from '@/lib/payload';
import { checkRateLimit } from '@/lib/rateLimit';

export type RsvpActionResult = {
  error?: string;
  /** Set to the new state when the request succeeded. */
  rsvped?: boolean;
};

export async function rsvpToEventAction(eventId: number): Promise<RsvpActionResult> {
  const account = await getCurrentAccount();
  if (!account) return { error: 'Please log in to RSVP for this event.' };
  if (account.kind !== 'member') return { error: 'Only member accounts can RSVP for events.' };
  if (account.isDemo) return { error: 'Demo mode \u2014 RSVPs are read-only.' };
  if (account.member.status !== 'active') {
    return { error: 'This account is not active. Contact the administrator.' };
  }

  const limit = checkRateLimit(`event-rsvp:${account.member.id}`, 10, 60_000);
  if (!limit.ok) {
    return { error: `Too many requests. Try again in ${limit.retryAfterSeconds}s.` };
  }

  try {
    const payload = await getPayloadClient();
    await payload.create({
      collection: 'event-rsvps',
      // `user` + `overrideAccess: false` runs the collection's rules: the
      // beforeValidate hook stamps the member and the duplicate key.
      data: { event: eventId, member: account.member.id },
      user: account.member,
      overrideAccess: false,
    });
    return { rsvped: true };
  } catch (err) {
    // Duplicate RSVPs throw a 400 from the collection's beforeValidate hook.
    if (err instanceof APIError && err.status === 400) return { error: err.message };
    return { error: 'Could not save your RSVP. Please try again.' };
  }
}

export async function cancelRsvpAction(eventId: number): Promise<RsvpActionResult> {
  const account = await getCurrentAccount();
  if (!account) return { error: 'Please log in to manage your RSVP.' };
  if (account.kind !== 'member') return { error: 'Only member accounts can RSVP for events.' };
  if (account.isDemo) return { error: 'Demo mode \u2014 RSVPs are read-only.' };

  try {
    const payload = await getPayloadClient();
    await payload.delete({
      collection: 'event-rsvps',
      where: {
        and: [{ event: { equals: eventId } }, { member: { equals: account.member.id } }],
      },
      user: account.member,
      overrideAccess: false,
    });
    return { rsvped: false };
  } catch {
    return { error: 'Could not cancel your RSVP. Please try again.' };
  }
}
