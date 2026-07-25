import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionConfig } from 'payload'

// Access: any signed-in staff user (from the Users collection) can see/manage
// every member. A member can only read/update their own record.
const isSelfOrStaff = ({ req: { user } }: { req: { user: any } }) => {
  if (!user) return false
  // Staff accounts live in the `users` collection; members live in `members`.
  if (user.collection === 'users') return true
  return { id: { equals: user.id } }
}

const isStaffOnly = ({ req: { user } }: { req: { user: any } }) => {
  return Boolean(user && user.collection === 'users')
}

const afterMemberChange: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc
  const { payload } = req
  const _stats = await payload.findGlobal({ slug: 'community-stats', overrideAccess: true })
  await payload.updateGlobal({
    slug: 'community-stats',
    data: { totalMembers: (_stats.totalMembers || 0) + 1 },
    overrideAccess: true,
  })
  return doc
}

const afterMemberDelete: CollectionAfterDeleteHook = async ({ req }) => {
  const { payload } = req
  const count = await payload.count({ collection: 'members', overrideAccess: true })
  await payload.updateGlobal({
    slug: 'community-stats',
    data: { totalMembers: count.totalDocs },
    overrideAccess: true,
  })
  return {}
}

export const Members: CollectionConfig = {
  slug: 'members',
  labels: {
    singular: 'Member',
    plural: 'Members',
  },
  admin: {
    useAsTitle: 'displayName',
    defaultColumns: ['displayName', 'email', 'totalCheckIns', 'currentStreak'],
    description: 'Community members who sign in on the public site.',
    group: 'Community',
  },
  auth: {
    // Keep verification off to start; turn on once you have transactional email wired up.
    verify: false,
  },
  hooks: {
    afterChange: [afterMemberChange],
    afterDelete: [afterMemberDelete],
  },
  access: {
    // Public sign-up: anyone can create a member account.
    create: () => true,
    read: isSelfOrStaff,
    update: isSelfOrStaff,
    delete: isStaffOnly,
  },
  fields: [
    {
      name: 'displayName',
      type: 'text',
      required: true,
      admin: {
        description: 'Shown on the community feed, leaderboard, and badges.',
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'bio',
      type: 'textarea',
    },
    // --- Rollup fields, kept in sync by the CheckIns collection's afterChange hook.
    // Don't hand-edit these in the admin panel; they're derived data.
    {
      name: 'totalCheckIns',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'currentStreak',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'longestStreak',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'lastCheckInDate',
      type: 'date',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
}
