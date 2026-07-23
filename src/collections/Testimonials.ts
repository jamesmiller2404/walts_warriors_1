import type { CollectionConfig } from 'payload'

import { isAdminOrEditor } from '@/access/isAdminOrEditor'
import { anyone } from '@/access/anyone'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    useAsTitle: 'memberName',
    defaultColumns: ['memberName', 'featured', 'updatedAt'],
    description: 'Member stories and quotes that inspire lasting positive change.',
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
      name: 'memberName',
      type: 'text',
      required: true,
      label: 'Name',
    },
    {
      name: 'quote',
      type: 'textarea',
      required: true,
    },
    {
      name: 'role',
      type: 'text',
      admin: {
        description: 'Optional role or context (e.g. Community member, Challenge graduate).',
      },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Featured testimonials may appear on the home page.',
        position: 'sidebar',
      },
    },
  ],
}
