import type { GlobalConfig } from 'payload'

import { isAdminOrEditor } from '@/access/isAdminOrEditor'
import { anyone } from '@/access/anyone'

export const QuoteSettings: GlobalConfig = {
  slug: 'quote-settings',
  label: 'Quote Settings',
  admin: {
    description: 'Controls how the front-page quote is chosen.',
    group: 'Content',
  },
  access: {
    read: anyone,
    update: isAdminOrEditor,
  },
  fields: [
    {
      name: 'rotationMode',
      type: 'select',
      defaultValue: 'day',
      options: [
        { label: 'Per page load (random)', value: 'page-load' },
        { label: 'Per session', value: 'session' },
        { label: 'Per day', value: 'day' },
        { label: 'Per week', value: 'week' },
      ],
      admin: {
        description: 'How often a new quote appears.',
      },
    },
  ],
}
