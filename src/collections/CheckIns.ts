import type { CollectionAfterChangeHook, CollectionConfig } from 'payload'

import { isAdminOrEditor } from '@/access/isAdminOrEditor'

// A member can create/read their own check-ins; staff can manage all of them.
const isOwnerOrStaff = ({ req: { user } }: { req: { user: any } }) => {
  if (!user) return false
  if (user.collection === 'users') return true
  return { member: { equals: user.id } }
}

const isLoggedIn = ({ req: { user } }: { req: { user: any } }) => Boolean(user)

// Recomputes a member's streak given their last check-in date and today's check-in.
function computeStreak(lastCheckInISO: string | null | undefined, currentStreak: number): number {
  if (!lastCheckInISO) return 1
  const last = new Date(lastCheckInISO)
  const today = new Date()
  const oneDay = 1000 * 60 * 60 * 24
  const daysSince = Math.floor(
    (Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) -
      Date.UTC(last.getFullYear(), last.getMonth(), last.getDate())) /
      oneDay,
  )
  if (daysSince === 0) return currentStreak // already checked in today, no change
  if (daysSince === 1) return currentStreak + 1 // consecutive day
  return 1 // streak broken, restart
}

const afterCheckIn: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc

  const { payload } = req
  const memberId = typeof doc.member === 'object' ? doc.member.id : doc.member

  // 1. Update the member's rollup stats.
  const member = await payload.findByID({ collection: 'members', id: memberId })
  const newStreak = computeStreak(member.lastCheckInDate, member.currentStreak || 0)
  const newTotal = (member.totalCheckIns || 0) + 1
  const newLongest = Math.max(member.longestStreak || 0, newStreak)

  await payload.update({
    collection: 'members',
    id: memberId,
    data: {
      totalCheckIns: newTotal,
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastCheckInDate: doc.checkInDate || new Date().toISOString(),
    },
    overrideAccess: true,
  })

  // 2. Check badge criteria against the updated stats, award any newly-earned badges.
  const badges = await payload.find({
    collection: 'badges',
    limit: 0,
    overrideAccess: true,
  })

  for (const badge of badges.docs) {
    const statValue =
      badge.criteriaType === 'checkin_count'
        ? newTotal
        : badge.criteriaType === 'streak_length'
          ? newStreak
          : null

    if (statValue === null || statValue < badge.criteriaValue) continue

    const alreadyAwarded = await payload.find({
      collection: 'member-badges',
      where: {
        and: [{ member: { equals: memberId } }, { badge: { equals: badge.id } }],
      },
      limit: 1,
      overrideAccess: true,
    })

    if (alreadyAwarded.totalDocs === 0) {
      await payload.create({
        collection: 'member-badges',
        data: { member: memberId, badge: badge.id, awardedAt: new Date().toISOString() },
        overrideAccess: true,
      })

      const stats = await payload.findGlobal({ slug: 'community-stats', overrideAccess: true })
      await payload.updateGlobal({
        slug: 'community-stats',
        data: { totalBadgesAwarded: (stats.totalBadgesAwarded || 0) + 1 },
        overrideAccess: true,
      })
    }
  }

  // 3. Update the community-wide check-in total.
  const stats = await payload.findGlobal({ slug: 'community-stats', overrideAccess: true })
  await payload.updateGlobal({
    slug: 'community-stats',
    data: {
      totalCheckIns: (stats.totalCheckIns || 0) + 1,
      lastUpdated: new Date().toISOString(),
    },
    overrideAccess: true,
  })

  return doc
}

export const CheckIns: CollectionConfig = {
  slug: 'check-ins',
  labels: {
    singular: 'Check-In',
    plural: 'Check-Ins',
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['member', 'challenge', 'checkInDate'],
    description: 'Member check-ins. Creating one updates member stats and badge progress automatically.',
    group: 'Community',
  },
  access: {
    create: isLoggedIn,
    read: isOwnerOrStaff,
    update: isOwnerOrStaff,
    delete: isAdminOrEditor,
  },
  hooks: {
    afterChange: [afterCheckIn],
  },
  fields: [
    {
      name: 'member',
      type: 'relationship',
      relationTo: 'members',
      required: true,
      index: true,
      admin: {
        description: 'Defaults to the logged-in member; staff can log check-ins on behalf of a member.',
      },
    },
    {
      name: 'challenge',
      type: 'relationship',
      relationTo: 'challenges',
      admin: {
        description: 'Optional — link this check-in to a specific challenge.',
      },
    },
    {
      name: 'note',
      type: 'textarea',
    },
    {
      name: 'checkInDate',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
    },
  ],
}
