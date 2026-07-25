import type { GlobalConfig } from 'payload'

import { isAdminOrEditor } from '@/access/isAdminOrEditor'
import { anyone } from '@/access/anyone'

export const CommunityStats: GlobalConfig = {
  slug: 'community-stats',
  label: 'Community Stats',
  admin: {
    description:
      'Community-wide totals shown on the home page. Kept in sync by the CheckIns hook — avoid hand-editing.',
    group: 'Community',
  },
  access: {
    read: anyone,
    // In practice this is only ever written by hooks via the local API
    // (which bypasses access control), but staff can correct it manually if needed.
    update: isAdminOrEditor,
  },
  fields: [
    {
      name: 'totalMembers',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true },
    },
    {
      name: 'totalCheckIns',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true },
    },
    {
      name: 'totalBadgesAwarded',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true },
    },
    {
      name: 'lastUpdated',
      type: 'date',
      admin: { readOnly: true },
    },
  ],
}
