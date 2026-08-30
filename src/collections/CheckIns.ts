import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeChangeHook,
  CollectionConfig,
  Where,
} from 'payload'
import { APIError } from 'payload'

import { isAdminOrEditor } from '@/access/isAdminOrEditor'
import { isStaffFieldLevel } from '@/access/isStaff'

type AuthedUser = {
  id: number | string
  collection?: string
  status?: string
}

// A member can create/read their own check-ins; staff can manage all of them.
const isOwnerOrStaff = ({ req: { user } }: { req: { user: AuthedUser | null | undefined } }) => {
  if (!user) return false
  if (user.collection === 'users') return true
  return { member: { equals: user.id } }
}

// Create access: any signed-in user may attempt a check-in, but suspended
// members are rejected here so they cannot keep earning rollups/badges.
const isLoggedIn = ({ req: { user } }: { req: { user: AuthedUser | null | undefined } }) => {
  if (!user?.id) return false
  if (user.collection === 'members' && user.status !== 'active') return false
  return true
}

// `{YYYY-MM-DD}` for a date in UTC. The once-per-day rule and the streak math
// both key off UTC days so dedupe and streak never disagree at the boundary.
function utcDayKey(dateInput: string): string {
  const d = new Date(dateInput)
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}

// Members always check in for themselves on the current day. Staff may log
// check-ins on behalf of a member and can backfill a date.
const beforeCheckIn: CollectionBeforeChangeHook = async ({ data, operation, originalDoc, req }) => {
  if (!data) return data
  const { user } = req

  if (operation === 'create' && user?.collection === 'members') {
    data.member = user.id
    data.checkInDate = new Date().toISOString()
  }

  const memberId = typeof data.member === 'object' ? data.member.id : data.member
  const checkInDate = data.checkInDate as string | undefined

  // On update, beforeValidate backfills member/checkInDate from the existing
  // doc, so only recompute the day key when they actually changed.
  const originalMemberId =
    originalDoc && typeof originalDoc.member === 'object' ? originalDoc.member.id : originalDoc?.member
  const memberChanged = operation === 'create' || memberId !== originalMemberId
  const dateChanged = operation === 'create' || checkInDate !== originalDoc?.checkInDate

  if (memberId && checkInDate && (memberChanged || dateChanged)) {
    const day = utcDayKey(checkInDate)
    data.checkInDay = `${day}T00:00:00.000Z`
    const key = `${memberId}:${day}`

    const where: Where = { checkInKey: { equals: key } }
    if (operation === 'update' && originalDoc?.id) where.id = { not_equals: originalDoc.id }

    const existing = await req.payload.find({
      collection: 'check-ins',
      where,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (existing.totalDocs > 0) {
      throw new APIError('Members may only check in once per day.', 400)
    }
    data.checkInKey = key
  }
  return data
}

// Recomputes a member's streak given their last check-in date and today's check-in.
// Days are counted in UTC so this agrees with the once-per-day checkInDay key.
function computeStreak(lastCheckInISO: string | null | undefined, currentStreak: number): number {
  if (!lastCheckInISO) return 1
  const last = new Date(lastCheckInISO)
  const today = new Date()
  const oneDay = 1000 * 60 * 60 * 24
  const daysSince = Math.floor(
    (Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()) -
      Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate())) /
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
      try {
        await payload.create({
          collection: 'member-badges',
          data: { member: memberId, badge: badge.id, awardedAt: new Date().toISOString() },
          overrideAccess: true,
        })
      } catch (err) {
        // The unique awardKey constraint guards against concurrent duplicate
        // awards. If the award now exists, a concurrent check-in won the race
        // and already bumped the counter — skip this badge. Anything else is a
        // real failure and must roll the check-in back, not be swallowed.
        const awarded = await payload.find({
          collection: 'member-badges',
          where: {
            and: [{ member: { equals: memberId } }, { badge: { equals: badge.id } }],
          },
          limit: 1,
          overrideAccess: true,
        })
        if (awarded.totalDocs === 0) throw err
        continue
      }

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

// Staff can delete check-ins directly; keep the community counter in sync.
const afterCheckInDelete: CollectionAfterDeleteHook = async ({ req }) => {
  const { payload } = req
  const stats = await payload.findGlobal({ slug: 'community-stats', overrideAccess: true })
  await payload.updateGlobal({
    slug: 'community-stats',
    data: {
      totalCheckIns: Math.max(0, (stats.totalCheckIns || 0) - 1),
      lastUpdated: new Date().toISOString(),
    },
    overrideAccess: true,
  })
  return {}
}

export const CheckIns: CollectionConfig = {
  slug: 'check-ins',
  labels: {
    singular: 'Check-In',
    plural: 'Check-Ins',
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['member', 'challenge', 'checkInDate', 'checkInDay'],
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
    beforeChange: [beforeCheckIn],
    afterChange: [afterCheckIn],
    afterDelete: [afterCheckInDelete],
  },
  fields: [
    {
      name: 'member',
      type: 'relationship',
      relationTo: 'members',
      required: true,
      index: true,
      access: {
        // Only staff can pick the member. Members get their own id forced in
        // the beforeChange hook, so ownership cannot be reassigned.
        create: isStaffFieldLevel,
        update: isStaffFieldLevel,
      },
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
      access: {
        // Members check in for the current day only; the hook forces the date.
        create: isStaffFieldLevel,
        update: isStaffFieldLevel,
      },
    },
    {
      name: 'checkInDay',
      type: 'date',
      index: true,
      access: {
        create: isStaffFieldLevel,
        update: isStaffFieldLevel,
      },
      admin: {
        readOnly: true,
        date: {
          pickerAppearance: 'dayOnly',
        },
        description: 'UTC day of the check-in. Set automatically.',
      },
    },
    {
      name: 'checkInKey',
      type: 'text',
      unique: true,
      access: {
        create: isStaffFieldLevel,
        update: isStaffFieldLevel,
      },
      admin: {
        hidden: true,
        description: '`{memberId}:{YYYY-MM-DD}` — enforces one check-in per member per day.',
      },
    },
  ],
}
