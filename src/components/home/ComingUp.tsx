import Link from 'next/link';

import { RsvpButton } from '@/components/events/RsvpButton';
import { getCurrentAccount } from '@/lib/auth';
import {
  MAX_AUTOMATIC_EVENTS,
  eventBlurb,
  selectedEventIds,
  sortByCollectionOrder,
} from '@/lib/comingUp';
import { getPayloadClient } from '@/lib/payload';
import type { Event, HomePage } from '@/payload-types';

const fontSans3 = { fontFamily: 'var(--font-source-sans-3), sans-serif' };

function formatWhen(startDate?: string | null): string | null {
  if (!startDate) return null;
  const date = new Date(startDate);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export async function ComingUp({ home }: { home?: HomePage }) {
  const payload = await getPayloadClient();
  const ids = selectedEventIds(home);

  let events: Event[] = [];

  if (ids.length > 0) {
    const result = await payload.find({
      collection: 'events',
      where: { id: { in: ids } },
      limit: 0,
      depth: 0,
    });
    // The admin picks *which* events appear here; the order always comes from
    // Content → Events → drag the rows.
    events = sortByCollectionOrder(
      (result.docs as Event[]).filter((event) => Boolean(event.published)),
    );
  } else {
    const result = await payload.find({
      collection: 'events',
      where: {
        and: [
          { published: { equals: true } },
          { startDate: { greater_than_equal: new Date().toISOString() } },
        ],
      },
      limit: 0,
      depth: 0,
    });

    // Admin-ordered events first (Content → Events → drag the rows); anything
    // never dragged keeps its date order after them. Then show the first few.
    events = sortByCollectionOrder(result.docs as Event[]).slice(0, MAX_AUTOMATIC_EVENTS);
  }

  if (events.length === 0) return null;

  const account = await getCurrentAccount();

  // Which of these events the signed-in member already RSVP'd to.
  const rsvpedIds = new Set<number>();
  if (account?.kind === 'member') {
    const rsvps = await payload.find({
      collection: 'event-rsvps',
      where: {
        and: [
          { member: { equals: account.member.id } },
          { event: { in: events.map((event) => event.id) } },
        ],
      },
      depth: 0,
      limit: 0,
      overrideAccess: true,
    });

    for (const rsvp of rsvps.docs) {
      const eventId = typeof rsvp.event === 'object' ? rsvp.event.id : rsvp.event;
      if (typeof eventId === 'number') rsvpedIds.add(eventId);
    }
  }

  return (
    <div className="w-full rounded-lg bg-[#3a3c4e]/50 px-6 py-6" aria-label="Coming up events">
      <p
        className="text-lg font-semibold uppercase tracking-[0.08em] text-[#c5d7e2]"
        style={fontSans3}
      >
        Coming up
      </p>

      <ul>
        {events.map((event, index) => {
          const when = formatWhen(event.startDate);
          const blurb = eventBlurb(event);

          return (
            <li
              key={event.id}
              className={index > 0 ? 'mt-5 border-t border-[#c5d7e2]/40 pt-5' : 'mt-4'}
            >
              <p className="text-2xl font-bold text-[#c5d7e2]" style={fontSans3}>
                {event.title}
              </p>
              {when ? (
                <p className="mt-1 text-xl text-[#c5d7e2]" style={fontSans3}>
                  {when}
                </p>
              ) : null}
              {event.location ? (
                <p className="mt-1 text-xl text-[#c5d7e2]" style={fontSans3}>
                  {event.location}
                </p>
              ) : null}
              {blurb ? (
                <p className="mt-2 text-lg leading-snug text-[#c5d7e2]" style={fontSans3}>
                  {blurb}
                </p>
              ) : null}

              {event.rsvpEnabled ? (
                <RsvpButton
                  eventId={event.id}
                  initialRsvped={rsvpedIds.has(event.id)}
                  signedIn={Boolean(account)}
                  variant="card"
                />
              ) : (
                <Link
                  href={`/events/${event.slug}`}
                  className="mt-3 inline-block rounded-md border border-[#c5d7e2]/80 px-4 py-1 text-xl text-[#c5d7e2] transition hover:bg-white/10"
                  style={fontSans3}
                >
                  Details →
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
