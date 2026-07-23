import type { GlobalConfig } from 'payload'

import { isAdminOrEditor } from '@/access/isAdminOrEditor'
import { anyone } from '@/access/anyone'

export const ContactPage: GlobalConfig = {
  slug: 'contact-page',
  label: 'Contact',
  admin: {
    description: 'Copy for the public contact page. Phone, email, and address live in Site Settings.',
    group: 'Pages',
  },
  access: {
    read: anyone,
    update: isAdminOrEditor,
  },
  fields: [
    {
      name: 'headline',
      type: 'text',
      required: true,
      defaultValue: 'Contact',
    },
    {
      name: 'intro',
      type: 'textarea',
      defaultValue:
        'We would love to hear from you. Reach out with questions, encouragement, or to join the community.',
    },
    {
      name: 'formNote',
      type: 'textarea',
      admin: {
        description: 'Optional note under contact details (e.g. response times).',
      },
    },
  ],
}
