import type { Payload } from 'payload';
import { getPayload } from 'payload';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import config from '../src/payload.test.config';
import { eventBlurb, selectedEventIds, sortByCollectionOrder } from '../src/lib/comingUp';
import type { Event, EventRsvp, HomePage, Member, User } from '../src/payload-types';

let payload: Payload;

beforeAll(async () => {
  payload = await getPayload({ config });
});

beforeEach(async () => {
  // Children first, then parents, so required FKs never block the cleanup.
  await payload.delete({
    collection: 'event-rsvps',
    where: { id: { exists: true } },
    overrideAccess: true,
  });
  await payload.delete({
    collection: 'events',
    where: { id: { exists: true } },
    overrideAccess: true,
  });
  await payload.delete({
    collection: 'members',
    where: { id: { exists: true } },
    overrideAccess: true,
  });
  await payload.delete({
    collection: 'users',
    where: { id: { exists: true } },
    overrideAccess: true,
  });
});

async function createMember(
  displayName: string,
  email: string,
  status: 'active' | 'suspended' = 'active',
): Promise<Member> {
  const doc = await payload.create({
    collection: 'members',
    data: { displayName, email, password: 'sup3rSecret!', status },
    overrideAccess: true,
  });
  return doc as unknown as Member;
}

async function createAdmin(): Promise<User> {
  const doc = await payload.create({
    collection: 'users',
    data: { name: 'Admin', email: 'admin@test.local', password: 'sup3rSecret!', role: 'admin' },
    overrideAccess: true,
  });
  return doc as unknown as User;
}

async function createEvent(title: string, data: Partial<Event> = {}): Promise<Event> {
  const doc = await payload.create({
    collection: 'events',
    data: {
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      startDate: new Date(Date.now() + 86_400_000).toISOString(),
      rsvpEnabled: true,
      ...data,
    } as any,
    overrideAccess: true,
  });
  return doc as unknown as Event;
}

// Mirrors the RSVP button: Local API create for the signed-in account with
// access control and hooks enabled.
async function rsvp(
  user: Member | User,
  eventId: number,
  extra: Record<string, unknown> = {},
): Promise<EventRsvp> {
  const doc = await payload.create({
    collection: 'event-rsvps',
    data: { event: eventId, member: (user as any).id, ...extra } as any,
    user: user as any,
    overrideAccess: false,
    depth: 0,
  });
  return doc as unknown as EventRsvp;
}

describe('event rsvps', () => {
  it('records one RSVP per member per event and rejects duplicates', async () => {
    const member = await createMember('Member A', 'a@test.local');
    const event = await createEvent('Group walk');

    const doc = await rsvp(member, event.id);

    expect(doc.member).toBe(member.id);
    expect(doc.event).toBe(event.id);
    expect(doc.rsvpKey).toBe(`${event.id}:${member.id}`);

    await expect(rsvp(member, event.id)).rejects.toThrow(/already on the list/i);
  });

  it('forces ownership so a member cannot RSVP as someone else', async () => {
    const a = await createMember('Member A', 'a@test.local');
    const b = await createMember('Member B', 'b@test.local');
    const event = await createEvent('Q&A');

    const doc = await rsvp(a, event.id, { member: b.id });
    expect(doc.member).toBe(a.id);
  });

  it('blocks suspended members from RSVPing', async () => {
    const suspended = await createMember('Suspended', 's@test.local', 'suspended');
    const event = await createEvent('Walk');

    await expect(rsvp(suspended, event.id)).rejects.toThrow();
  });

  it('shows a member only their own RSVPs, and staff every RSVP', async () => {
    const a = await createMember('Member A', 'a@test.local');
    const b = await createMember('Member B', 'b@test.local');
    const admin = await createAdmin();
    const eventA = await createEvent('Event A');
    const eventB = await createEvent('Event B');

    await rsvp(a, eventA.id);
    await rsvp(b, eventB.id);

    const seenByA = await payload.find({
      collection: 'event-rsvps',
      user: a as any,
      overrideAccess: false,
      depth: 0,
    });
    expect(seenByA.docs).toHaveLength(1);
    expect(seenByA.docs[0].event).toBe(eventA.id);

    const seenByStaff = await payload.find({
      collection: 'event-rsvps',
      user: admin as any,
      overrideAccess: false,
      depth: 0,
    });
    expect(seenByStaff.docs).toHaveLength(2);
  });

  it("lets a member cancel their own RSVP but not someone else's", async () => {
    const a = await createMember('Member A', 'a@test.local');
    const b = await createMember('Member B', 'b@test.local');
    const event = await createEvent('Walk');

    const aRsvp = await rsvp(a, event.id);
    const bRsvp = await rsvp(b, event.id);

    await expect(
      payload.delete({
        collection: 'event-rsvps',
        id: bRsvp.id,
        user: a as any,
        overrideAccess: false,
      }),
    ).rejects.toThrow();

    const deleted = await payload.delete({
      collection: 'event-rsvps',
      id: aRsvp.id,
      user: a as any,
      overrideAccess: false,
    });
    expect(deleted.id).toBe(aRsvp.id);
  });

  it('removes RSVPs when the event is deleted', async () => {
    const member = await createMember('Member A', 'a@test.local');
    const event = await createEvent('Doomed event');
    await rsvp(member, event.id);

    await payload.delete({ collection: 'events', id: event.id, overrideAccess: true });

    const remaining = await payload.count({ collection: 'event-rsvps', overrideAccess: true });
    expect(remaining.totalDocs).toBe(0);
  });

  it('removes RSVPs when the member is deleted', async () => {
    const member = await createMember('Member A', 'a@test.local');
    const event = await createEvent('Event');
    await rsvp(member, event.id);

    await payload.delete({ collection: 'members', id: member.id, overrideAccess: true });

    const remaining = await payload.count({ collection: 'event-rsvps', overrideAccess: true });
    expect(remaining.totalDocs).toBe(0);
  });
});

describe('coming up card ordering', () => {
  const asHome = (eventIds: number[]) =>
    ({
      comingUpEvents: eventIds.map((id) => ({ event: id })),
    }) as unknown as HomePage;

  it('reads the selected event ids in admin order', () => {
    expect(selectedEventIds(asHome([3, 1, 2]))).toEqual([3, 1, 2]);
    expect(selectedEventIds(undefined)).toEqual([]);
    expect(selectedEventIds({ comingUpEvents: null } as unknown as HomePage)).toEqual([]);
  });

  it('sorts events by the manual order set in the Events list', () => {
    const asEvent = (id: number, order: string | null, startDate = '2026-10-01T12:00:00.000Z') =>
      ({ id, _order: order, startDate }) as Event;

    // Order column wins over the order the rows happen to be fetched in.
    expect(
      sortByCollectionOrder([asEvent(1, 'a2'), asEvent(2, 'a0'), asEvent(3, 'a1')]).map(
        (event) => event.id,
      ),
    ).toEqual([2, 3, 1]);

    // Rows without an order value go last rather than jumping the queue.
    expect(sortByCollectionOrder([asEvent(1, null), asEvent(2, 'a0')]).map((e) => e.id)).toEqual([
      2, 1,
    ]);

    // Same order value → soonest start date first.
    expect(
      sortByCollectionOrder([
        asEvent(1, 'a0', '2026-02-01T12:00:00.000Z'),
        asEvent(2, 'a0', '2026-01-01T12:00:00.000Z'),
      ]).map((event) => event.id),
    ).toEqual([2, 1]);
  });

  it('keeps the admin selection in the order it was picked', () => {
    const home = {
      comingUpEvents: [{ event: 3 }, { event: 1 }, { event: 2 }],
    } as unknown as HomePage;

    expect(selectedEventIds(home)).toEqual([3, 1, 2]);
  });
});

describe('coming up card blurb', () => {
  const richText = (...paragraphs: string[]) => ({
    root: {
      type: 'root',
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        children: [{ type: 'text', text }],
      })),
    },
  });

  it('prefers the admin Summary (the "short blurb for event cards" field)', () => {
    expect(eventBlurb({ summary: 'Short blurb', description: richText('Longer text') })).toBe(
      'Short blurb',
    );
  });

  it('falls back to the plain text of the Description', () => {
    expect(
      eventBlurb({ summary: null, description: richText('Bring water.', 'Meet at the park.') }),
    ).toBe('Bring water. Meet at the park.');
  });

  it('returns null when neither field has text', () => {
    expect(eventBlurb({ summary: '   ', description: null })).toBeNull();
    expect(eventBlurb({})).toBeNull();
  });

  it('truncates long text on a word boundary', () => {
    const long = Array.from({ length: 80 }, (_, index) => `word${index}`).join(' ');
    const blurb = eventBlurb({ summary: long });

    expect(blurb?.endsWith('…')).toBe(true);
    expect((blurb ?? '').length).toBeLessThanOrEqual(221);
    expect(blurb?.startsWith('word0 word1')).toBe(true);
  });
});
