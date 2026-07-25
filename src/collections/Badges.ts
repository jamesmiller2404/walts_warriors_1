import type { CollectionConfig } from 'payload'

import { isAdminOrEditor } from '@/access/isAdminOrEditor'
import { anyone } from '@/access/anyone'

export const Badges: CollectionConfig = {
  slug: 'badges',
  labels: {
    singular: 'Badge',
    plural: 'Badges',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'criteriaType', 'criteriaValue'],
    description: 'Badge definitions. Adding a row here creates a new badge — no code change needed.',
    group: 'Community',
  },
  access: {
    create: isAdminOrEditor,
    delete: isAdminOrEditor,
    read: anyone,
    update: isAdminOrEditor,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'criteriaType',
      type: 'select',
      required: true,
      options: [
        { label: 'Total check-ins', value: 'checkin_count' },
        { label: 'Current streak (days)', value: 'streak_length' },
      ],
      admin: {
        description: 'What member stat this badge is awarded for.',
      },
    },
    {
      name: 'criteriaValue',
      type: 'number',
      required: true,
      admin: {
        description: 'Threshold the stat must reach, e.g. 7 for a 7-day streak.',
      },
    },
  ],
}
