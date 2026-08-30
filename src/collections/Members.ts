import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeDeleteHook,
  CollectionBeforeLoginHook,
  CollectionConfig,
} from 'payload'
import { APIError } from 'payload'

import { isStaff, isStaffFieldLevel } from '@/access/isStaff'

type AuthedUser = {
  id: number | string
  collection?: string
}

// Access: any signed-in staff user (from the Users collection) can see/manage
// every member. A member can only read/update their own record.
const isSelfOrStaff = ({ req: { user } }: { req: { user: AuthedUser | null | undefined } }) => {
  if (!user) return false
  // Staff accounts live in the `users` collection; members live in `members`.
  if (user.collection === 'users') return true
  return { id: { equals: user.id } }
}

// Suspended members are blocked at login (lifecycle: suspended = no auth).
const beforeMemberLogin: CollectionBeforeLoginHook = async ({ user }) => {
  const status = (user as { status?: string } | null)?.status
  if (status && status !== 'active') {
    throw new APIError('This account is not active. Contact the administrator.', 401)
  }
  return user
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

// Runs before the member row is deleted so dependent rows are removed first.
// Payload relationship FKs are `ON DELETE SET NULL` and the required
// relationships here are `NOT NULL`, so deleting a member that still has
// check-ins or badge awards would fail at the database level.
const beforeMemberDelete: CollectionBeforeDeleteHook = async ({ req, id }) => {
  await req.payload.delete({
    collection: 'check-ins',
    where: { member: { equals: id } },
    overrideAccess: true,
  })
  await req.payload.delete({
    collection: 'member-badges',
    where: { member: { equals: id } },
    overrideAccess: true,
  })
}

const afterMemberDelete: CollectionAfterDeleteHook = async ({ req }) => {
  const { payload } = req
  const [members, checkIns, badges] = await Promise.all([
    payload.count({ collection: 'members', overrideAccess: true }),
    payload.count({ collection: 'check-ins', overrideAccess: true }),
    payload.count({ collection: 'member-badges', overrideAccess: true }),
  ])
  await payload.updateGlobal({
    slug: 'community-stats',
    data: {
      totalMembers: members.totalDocs,
      totalCheckIns: checkIns.totalDocs,
      totalBadgesAwarded: badges.totalDocs,
      lastUpdated: new Date().toISOString(),
    },
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
    defaultColumns: ['displayName', 'email', 'status', 'totalCheckIns', 'currentStreak'],
    description: 'Community members who sign in on the public site.',
    group: 'Community',
  },
  auth: {
    // Keep verification off to start; turn on once you have transactional email wired up.
    verify: false,
  },
  hooks: {
    afterChange: [afterMemberChange],
    beforeDelete: [beforeMemberDelete],
    afterDelete: [afterMemberDelete],
    beforeLogin: [beforeMemberLogin],
  },
  access: {
    // Public sign-up: anyone can create a member account.
    create: () => true,
    read: isSelfOrStaff,
    update: isSelfOrStaff,
    delete: isStaff,
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
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      index: true,
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Pending', value: 'pending' },
        { label: 'Suspended', value: 'suspended' },
      ],
      access: {
        create: isStaffFieldLevel,
        update: isStaffFieldLevel,
      },
      admin: {
        position: 'sidebar',
        description: 'Staff-managed account status. Members cannot change this.',
      },
    },
    // --- Rollup fields, kept in sync by the CheckIns collection's afterChange hook.
    // Don't hand-edit these in the admin panel; they're derived data. Field-level
    // access is staff-only so members cannot inflate their own stats via the API.
    {
      name: 'totalCheckIns',
      type: 'number',
      defaultValue: 0,
      access: {
        create: isStaffFieldLevel,
        update: isStaffFieldLevel,
      },
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'currentStreak',
      type: 'number',
      defaultValue: 0,
      access: {
        create: isStaffFieldLevel,
        update: isStaffFieldLevel,
      },
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'longestStreak',
      type: 'number',
      defaultValue: 0,
      access: {
        create: isStaffFieldLevel,
        update: isStaffFieldLevel,
      },
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'lastCheckInDate',
      type: 'date',
      access: {
        create: isStaffFieldLevel,
        update: isStaffFieldLevel,
      },
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
}
