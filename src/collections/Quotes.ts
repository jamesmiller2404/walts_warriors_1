import type { CollectionConfig } from 'payload'

import { isAdminOrEditor } from '@/access/isAdminOrEditor'
import { anyone } from '@/access/anyone'

export const Quotes: CollectionConfig = {
  slug: 'quotes',
  admin: {
    useAsTitle: 'quote',
    defaultColumns: ['quote', 'attribution', 'active', 'order', 'updatedAt'],
    description: 'Quotes shown on the front page.',
    group: 'Content',
  },
  access: {
    create: isAdminOrEditor,
    delete: isAdminOrEditor,
    read: anyone,
    update: isAdminOrEditor,
  },
  fields: [
    {
      name: 'quote',
      type: 'textarea',
      required: true,
    },
    {
      name: 'attribution',
      type: 'text',
      admin: {
        description: 'Who said the quote (e.g. Marcus Aurelius).',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Include this quote in the front-page rotation.',
        position: 'sidebar',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Lower numbers appear first (used for deterministic day/week rotation).',
      },
    },
  ],
}
