import type { CollectionAfterDeleteHook, CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { isAdminOrEditor } from '@/access/isAdminOrEditor'
import { anyone } from '@/access/anyone'

// `{memberId}:{badgeId}` unique key — DB-level guard against duplicate awards
// (the CheckIns hook also de-dupes, but a concurrent check-in race would
// otherwise violate the unique constraint).
const beforeAwardChange: CollectionBeforeChangeHook = ({ data }) => {
  if (!data) return data
  const memberId = typeof data.member === 'object' ? data.member.id : data.member
  const badgeId = typeof data.badge === 'object' ? data.badge.id : data.badge
  if (memberId && badgeId) {
    data.awardKey = `${memberId}:${badgeId}`
  }
  return data
}

// Staff can delete badge awards directly; keep the community counter in sync.
const afterAwardDelete: CollectionAfterDeleteHook = async ({ req }) => {
  const { payload } = req
  const stats = await payload.findGlobal({ slug: 'community-stats', overrideAccess: true })
  await payload.updateGlobal({
    slug: 'community-stats',
    data: {
      totalBadgesAwarded: Math.max(0, (stats.totalBadgesAwarded || 0) - 1),
      lastUpdated: new Date().toISOString(),
    },
    overrideAccess: true,
  })
  return {}
}

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
  hooks: {
    beforeChange: [beforeAwardChange],
    afterDelete: [afterAwardDelete],
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
    {
      name: 'awardKey',
      type: 'text',
      unique: true,
      admin: {
        hidden: true,
        description: '`{memberId}:{badgeId}` — prevents duplicate badge awards.',
      },
    },
  ],
}
