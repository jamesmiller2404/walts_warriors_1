import type { CollectionBeforeDeleteHook, CollectionConfig } from 'payload';

import { isAdminOrEditor } from '@/access/isAdminOrEditor';
import { anyone } from '@/access/anyone';

// RSVPs point at the event through a required relationship, so they have to be
// removed first — the FK is ON DELETE SET NULL and would violate NOT NULL.
const beforeEventDelete: CollectionBeforeDeleteHook = async ({ req, id }) => {
  await req.payload.delete({
    collection: 'event-rsvps',
    where: { event: { equals: id } },
    overrideAccess: true,
  });
};

export const Events: CollectionConfig = {
  slug: 'events',
  labels: {
    singular: 'Event',
    plural: 'Events',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'startDate', 'rsvpEnabled', 'published', 'updatedAt'],
    description: 'Community gatherings, workshops, challenges kickoffs, and wellness events.',
    group: 'Content',
  },
  // Manual ordering: adds a hidden `_order` field and drag handles in the Events
  // list (/admin/collections/events), which is the order the "Coming up" card and
  // every other event list follow.
  orderable: true,
  // Sort the list by that manual order so dragging is enabled straight away.
  defaultSort: '_order',
  access: {
    create: isAdminOrEditor,
    delete: isAdminOrEditor,
    read: anyone,
    update: isAdminOrEditor,
  },
  hooks: {
    beforeDelete: [beforeEventDelete],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly name (e.g. spring-wellness-meetup).',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (typeof value === 'string' && value.length > 0) {
              return value
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            }
            if (data?.title && typeof data.title === 'string') {
              return data.title
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            }
            return value;
          },
        ],
      },
    },
    {
      name: 'summary',
      type: 'textarea',
      admin: {
        description: 'Short blurb for event cards.',
      },
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'endDate',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'location',
      type: 'text',
      admin: {
        description: 'Venue name, address, or “Online”.',
      },
    },
    {
      name: 'registrationUrl',
      type: 'text',
      admin: {
        description: 'Optional external signup link.',
      },
    },
    {
      name: 'rsvpEnabled',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Show an RSVP button for this event and collect RSVPs from logged-in members.',
      },
    },
    {
      name: 'rsvps',
      type: 'join',
      collection: 'event-rsvps',
      on: 'event',
      admin: {
        defaultColumns: ['member', 'createdAt'],
        description: 'Members who RSVP’d (read-only).',
      },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Uncheck to hide this event from the public site.',
      },
    },
  ],
};
