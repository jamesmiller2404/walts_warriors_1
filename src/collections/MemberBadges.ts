import type { CollectionConfig } from 'payload'

import { isAdminOrEditor } from '@/access/isAdminOrEditor'
import { anyone } from '@/access/anyone'

export const MemberBadges: CollectionConfig = {
  slug: 'member-badges',
  labels: {
    singular: 'Awarded Badge',
    plural: 'Awarded Badges',
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['member', 'badge', 'awardedAt'],
    description: 'Records of badges members have earned. Created automatically by the check-in hook.',
    group: 'Community',
  },
  access: {
    // These are only ever written by the CheckIns afterChange hook (which uses
    // the local API and bypasses access control), so REST/GraphQL create stays
    // staff-only to prevent members from awarding themselves badges directly.
    create: isAdminOrEditor,
    delete: isAdminOrEditor,
    read: anyone,
    update: isAdminOrEditor,
  },
  fields: [
    {
      name: 'member',
      type: 'relationship',
      relationTo: 'members',
      required: true,
      index: true,
    },
    {
      name: 'badge',
      type: 'relationship',
      relationTo: 'badges',
      required: true,
      index: true,
    },
    {
      name: 'awardedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
    },
  ],
}
