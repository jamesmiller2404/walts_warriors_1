import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload';
import { APIError } from 'payload';

import { isAdminOrEditor } from '@/access/isAdminOrEditor';
import { isStaffFieldLevel } from '@/access/isStaff';

type AuthedUser = {
  id: number | string;
  collection?: string;
  status?: string;
};

// Any signed-in active member may RSVP; suspended members are blocked. Staff can
// also create rows (e.g. logging a phone RSVP), mirroring CheckIns.
const isLoggedIn = ({ req: { user } }: { req: { user: AuthedUser | null | undefined } }) => {
  if (!user?.id) return false;
  if (user.collection === 'members' && user.status !== 'active') return false;
  return true;
};

// A member only sees/deletes their own RSVPs; staff see every RSVP.
const isOwnerOrStaff = ({ req: { user } }: { req: { user: AuthedUser | null | undefined } }) => {
  if (!user) return false;
  if (user.collection === 'users') return true;
  return { member: { equals: user.id } };
};

// Runs before validation so the required key is always set:
// - a member's RSVP always belongs to the signed-in member (no spoofing),
// - `{eventId}:{memberId}` is the unique key that blocks double RSVPs,
// - duplicates return a readable message instead of a raw constraint error.
const beforeRsvpValidate: CollectionBeforeValidateHook = async ({ data, operation, req }) => {
  if (!data) return data;
  const { user } = req;

  if (operation === 'create' && user?.collection === 'members') {
    data.member = user.id;
  }

  const eventRef = data.event;
  const eventId = eventRef && typeof eventRef === 'object' ? eventRef.id : eventRef;
  const memberRef = data.member;
  const memberId = memberRef && typeof memberRef === 'object' ? memberRef.id : memberRef;

  if (!eventId || !memberId) return data;

  const rsvpKey = `${eventId}:${memberId}`;
  data.rsvpKey = rsvpKey;

  if (operation === 'create') {
    const existing = await req.payload.find({
      collection: 'event-rsvps',
      where: { rsvpKey: { equals: rsvpKey } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });
    if (existing.totalDocs > 0) {
      throw new APIError('You are already on the list for this event.', 400);
    }
  }

  return data;
};

export const EventRsvps: CollectionConfig = {
  slug: 'event-rsvps',
  labels: {
    singular: 'Event RSVP',
    plural: 'Event RSVPs',
  },
  admin: {
    useAsTitle: 'rsvpKey',
    defaultColumns: ['event', 'member', 'createdAt'],
    description:
      'Members who have RSVP’d to events. Created when a member clicks “RSVP” on the site.',
    group: 'Community',
  },
  access: {
    create: isLoggedIn,
    read: isOwnerOrStaff,
    update: isAdminOrEditor,
    delete: isOwnerOrStaff,
  },
  hooks: {
    beforeValidate: [beforeRsvpValidate],
  },
  fields: [
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      required: true,
      index: true,
      admin: {
        description: 'The event being RSVP’d to.',
      },
    },
    {
      name: 'member',
      type: 'relationship',
      relationTo: 'members',
      required: true,
      index: true,
      access: {
        // Members get their own id forced in the hook; only staff can attach a
        // different member, so ownership cannot be spoofed.
        create: isStaffFieldLevel,
        update: isStaffFieldLevel,
      },
      admin: {
        description: 'Member who is coming. Set automatically for member RSVPs.',
      },
    },
    {
      name: 'rsvpKey',
      type: 'text',
      unique: true,
      access: {
        create: isStaffFieldLevel,
        update: isStaffFieldLevel,
      },
      admin: {
        hidden: true,
        description: '`{eventId}:{memberId}` — prevents duplicate RSVPs.',
      },
    },
  ],
};
