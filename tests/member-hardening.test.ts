import type { Payload } from 'payload'
import { getPayload } from 'payload'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import config from '../src/payload.test.config'
import type { Badge, CheckIn, Member, User } from '../src/payload-types'

let payload: Payload

beforeAll(async () => {
  payload = await getPayload({ config })
})

beforeEach(async () => {
  // Clean slate. Children first, then parents, so the delete cleanup hook is
  // never fighting the SQLite FK constraints.
  await payload.delete({ collection: 'member-badges', where: { id: { exists: true } }, overrideAccess: true })
  await payload.delete({ collection: 'check-ins', where: { id: { exists: true } }, overrideAccess: true })
  await payload.delete({ collection: 'members', where: { id: { exists: true } }, overrideAccess: true })
  await payload.delete({ collection: 'badges', where: { id: { exists: true } }, overrideAccess: true })
  await payload.delete({ collection: 'users', where: { id: { exists: true } }, overrideAccess: true })
  await payload.updateGlobal({
    slug: 'community-stats',
    data: { totalMembers: 0, totalCheckIns: 0, totalBadgesAwarded: 0, lastUpdated: new Date().toISOString() },
    overrideAccess: true,
  })
})

async function createMember(displayName: string, email: string): Promise<Member> {
  const doc = await payload.create({
    collection: 'members',
    data: { displayName, email, password: 'sup3rSecret!', status: 'active' },
    overrideAccess: true,
  })
  return doc as unknown as Member
}

async function createAdmin(): Promise<User> {
  const doc = await payload.create({
    collection: 'users',
    data: { name: 'Admin', email: 'admin@test.local', password: 'sup3rSecret!', role: 'admin' },
    overrideAccess: true,
  })
  return doc as unknown as User
}

async function createBadge(name: string, criteriaValue: number): Promise<Badge> {
  const doc = await payload.create({
    collection: 'badges',
    data: { name, criteriaType: 'checkin_count', criteriaValue },
    overrideAccess: true,
  })
  return doc as unknown as Badge
}

async function checkInFor(memberId: number, user: Member | User): Promise<CheckIn> {
  const doc = await payload.create({
    collection: 'check-ins',
    data: { member: memberId, checkInDate: new Date().toISOString() },
    user: user as any,
    overrideAccess: false,
    depth: 0,
  })
  return doc as unknown as CheckIn
}

// Staff can backfill a check-in with an explicit date; the UTC day key and
// streak math are derived from it, so tests can exercise day boundaries.
async function checkInAt(memberId: number, checkInDate: string, user: Member | User): Promise<CheckIn> {
  const doc = await payload.create({
    collection: 'check-ins',
    data: { member: memberId, checkInDate },
    user: user as any,
    overrideAccess: false,
    depth: 0,
  })
  return doc as unknown as CheckIn
}

describe('check-in ownership', () => {
  it('forces a check-in to belong to the authenticated member', async () => {
    const a = await createMember('Member A', 'a@test.local')
    const b = await createMember('Member B', 'b@test.local')

    // A tries to log a check-in "for" B.
    const checkIn = await checkInFor(b.id, a)

    expect(checkIn.member).toBe(a.id)
    expect(checkIn.member).not.toBe(b.id)
  })

  it('blocks members from updating another member\'s check-in', async () => {
    const admin = await createAdmin()
    const a = await createMember('Member A', 'a@test.local')
    const b = await createMember('Member B', 'b@test.local')
    const bCheckIn = await checkInFor(b.id, admin)

    await expect(
      payload.update({
        collection: 'check-ins',
        id: bCheckIn.id,
        data: { note: 'tampered' },
        user: a as any,
        overrideAccess: false,
      }),
    ).rejects.toThrow()

    const untouched = await payload.findByID({
      collection: 'check-ins',
      id: bCheckIn.id,
      overrideAccess: true,
    })
    expect((untouched as CheckIn).note).toBeNull()
  })

  it('blocks members from deleting another member\'s check-in', async () => {
    const admin = await createAdmin()
    const a = await createMember('Member A', 'a@test.local')
    const b = await createMember('Member B', 'b@test.local')
    const bCheckIn = await checkInFor(b.id, admin)

    await expect(
      payload.delete({
        collection: 'check-ins',
        id: bCheckIn.id,
        user: a as any,
        overrideAccess: false,
      }),
    ).rejects.toThrow()

    const stillThere = await payload.findByID({
      collection: 'check-ins',
      id: bCheckIn.id,
      overrideAccess: true,
    })
    expect(stillThere).toBeTruthy()
  })
})

describe('rollup statistics', () => {
  it('prevents members from inflating their own rollup statistics', async () => {
    const a = await createMember('Member A', 'a@test.local')

    const updated = (await payload.update({
      collection: 'members',
      id: a.id,
      data: { totalCheckIns: 999, currentStreak: 50, longestStreak: 100, lastCheckInDate: new Date().toISOString() },
      user: a as any,
      overrideAccess: false,
    })) as unknown as Member

    expect(updated.totalCheckIns).toBe(0)
    expect(updated.currentStreak).toBe(0)
    expect(updated.longestStreak).toBe(0)
    expect(updated.lastCheckInDate).toBeNull()
  })

  it('prevents members from changing their own status', async () => {
    const a = await createMember('Member A', 'a@test.local')

    const updated = (await payload.update({
      collection: 'members',
      id: a.id,
      data: { status: 'suspended' },
      user: a as any,
      overrideAccess: false,
    })) as unknown as Member

    expect(updated.status).toBe('active')
  })

  it('allows staff to correct rollup statistics', async () => {
    const admin = await createAdmin()
    const a = await createMember('Member A', 'a@test.local')

    const updated = (await payload.update({
      collection: 'members',
      id: a.id,
      data: { totalCheckIns: 7, status: 'suspended' },
      user: admin as any,
      overrideAccess: false,
    })) as unknown as Member

    expect(updated.totalCheckIns).toBe(7)
    expect(updated.status).toBe('suspended')
  })

  it('still updates rollup statistics through the check-in hook', async () => {
    const a = await createMember('Member A', 'a@test.local')

    await checkInFor(a.id, a)

    const refreshed = (await payload.findByID({
      collection: 'members',
      id: a.id,
      overrideAccess: true,
    })) as unknown as Member

    expect(refreshed.totalCheckIns).toBe(1)
    expect(refreshed.currentStreak).toBe(1)
    expect(refreshed.longestStreak).toBe(1)
  })
})

describe('duplicate check-ins', () => {
  it('rejects a second check-in by the same member on the same day', async () => {
    const a = await createMember('Member A', 'a@test.local')

    const first = await checkInFor(a.id, a)
    expect(first).toBeTruthy()

    await expect(checkInFor(a.id, a)).rejects.toThrow(/once per day/)
  })

  it('allows different members to check in on the same day', async () => {
    const a = await createMember('Member A', 'a@test.local')
    const b = await createMember('Member B', 'b@test.local')

    const ca = await checkInFor(a.id, a)
    const cb = await checkInFor(b.id, b)

    expect(ca).toBeTruthy()
    expect(cb).toBeTruthy()
  })

  it('enforces the once-per-day rule even when access control is bypassed', async () => {
    const a = await createMember('Member A', 'a@test.local')

    await payload.create({
      collection: 'check-ins',
      data: { member: a.id, checkInDate: new Date().toISOString() },
      overrideAccess: true,
    })

    await expect(
      payload.create({
        collection: 'check-ins',
        data: { member: a.id, checkInDate: new Date().toISOString() },
        overrideAccess: true,
      }),
    ).rejects.toThrow(/once per day/)
  })

  it('keys once-per-day to UTC days so dedupe and streak agree across a midnight boundary', async () => {
    const admin = await createAdmin()
    const a = await createMember('Member A', 'a@test.local')

    // Build a UTC-midnight boundary relative to today so the streak math
    // (which compares against the real clock) sees consecutive days:
    // yesterday 23:30Z and today 00:30Z are 30 minutes apart but different
    // UTC days — both allowed, and the streak stays consecutive.
    const dateAt = (dayOffset: number, hour: number, minute: number): string => {
      const d = new Date()
      d.setUTCDate(d.getUTCDate() + dayOffset)
      d.setUTCHours(hour, minute, 0, 0)
      return d.toISOString()
    }

    await checkInAt(a.id, dateAt(-1, 23, 30), admin)
    await checkInAt(a.id, dateAt(0, 0, 30), admin)

    const refreshed = (await payload.findByID({
      collection: 'members',
      id: a.id,
      overrideAccess: true,
    })) as unknown as Member

    expect(refreshed.totalCheckIns).toBe(2)
    expect(refreshed.currentStreak).toBe(2)
  })

  it('rejects two check-ins that fall on the same UTC day', async () => {
    const admin = await createAdmin()
    const a = await createMember('Member A', 'a@test.local')

    await checkInAt(a.id, '2026-01-02T00:30:00Z', admin)
    await expect(checkInAt(a.id, '2026-01-02T23:30:00Z', admin)).rejects.toThrow(/once per day/)
  })
})

describe('suspended members', () => {
  it('blocks suspended members from checking in', async () => {
    const admin = await createAdmin()
    const a = await createMember('Member A', 'a@test.local')
    await payload.update({
      collection: 'members',
      id: a.id,
      data: { status: 'suspended' },
      user: admin as any,
      overrideAccess: false,
    })
    const suspended = (await payload.findByID({
      collection: 'members',
      id: a.id,
      overrideAccess: true,
    })) as unknown as Member

    await expect(checkInFor(a.id, suspended)).rejects.toThrow()

    const checkIns = await payload.find({
      collection: 'check-ins',
      where: { member: { equals: a.id } },
      overrideAccess: true,
    })
    expect(checkIns.totalDocs).toBe(0)
  })
})

describe('community stats sync', () => {
  it('decrements the check-in total when staff deletes a check-in', async () => {
    const admin = await createAdmin()
    const a = await createMember('Member A', 'a@test.local')

    const checkIn = await checkInFor(a.id, admin)

    const after = await payload.findGlobal({ slug: 'community-stats', overrideAccess: true })
    expect(after.totalCheckIns).toBe(1)

    await payload.delete({
      collection: 'check-ins',
      id: checkIn.id,
      user: admin as any,
      overrideAccess: false,
    })

    const final = await payload.findGlobal({ slug: 'community-stats', overrideAccess: true })
    expect(final.totalCheckIns).toBe(0)
  })

  it('decrements the badge total when staff deletes a badge award', async () => {
    const admin = await createAdmin()
    const a = await createMember('Member A', 'a@test.local')
    await createBadge('First Check-In', 1)

    // The check-in hook auto-awards the badge and bumps the counter; that is
    // the only path that increments it, so delete through that same record.
    await checkInFor(a.id, admin)

    const after = await payload.findGlobal({ slug: 'community-stats', overrideAccess: true })
    expect(after.totalBadgesAwarded).toBe(1)

    const awards = await payload.find({
      collection: 'member-badges',
      where: { member: { equals: a.id } },
      overrideAccess: true,
    })
    const award = awards.docs[0]

    await payload.delete({
      collection: 'member-badges',
      id: award.id,
      user: admin as any,
      overrideAccess: false,
    })

    const final = await payload.findGlobal({ slug: 'community-stats', overrideAccess: true })
    expect(final.totalBadgesAwarded).toBe(0)
  })
})

describe('badge awards', () => {
  it('prevents members from awarding badges to themselves', async () => {
    const a = await createMember('Member A', 'a@test.local')
    const badge = await createBadge('First Check-In', 1)

    await expect(
      payload.create({
        collection: 'member-badges',
        data: { member: a.id, badge: badge.id, awardedAt: new Date().toISOString() },
        user: a as any,
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('prevents members from deleting badge awards', async () => {
    const admin = await createAdmin()
    const a = await createMember('Member A', 'a@test.local')
    const badge = await createBadge('First Check-In', 1)
    const award = await payload.create({
      collection: 'member-badges',
      data: { member: a.id, badge: badge.id, awardedAt: new Date().toISOString() },
      user: admin as any,
      overrideAccess: true,
    })

    await expect(
      payload.delete({ collection: 'member-badges', id: award.id, user: a as any, overrideAccess: false }),
    ).rejects.toThrow()
  })

  it('prevents duplicate badge awards', async () => {
    const admin = await createAdmin()
    const a = await createMember('Member A', 'a@test.local')
    const badge = await createBadge('First Check-In', 1)

    await payload.create({
      collection: 'member-badges',
      data: { member: a.id, badge: badge.id, awardedAt: new Date().toISOString() },
      user: admin as any,
      overrideAccess: false,
    })

    await expect(
      payload.create({
        collection: 'member-badges',
        data: { member: a.id, badge: badge.id, awardedAt: new Date().toISOString() },
        user: admin as any,
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('still auto-awards badges through the check-in hook', async () => {
    const a = await createMember('Member A', 'a@test.local')
    await createBadge('First Check-In', 1)

    await checkInFor(a.id, a)

    const awards = await payload.find({
      collection: 'member-badges',
      where: { member: { equals: a.id } },
      overrideAccess: true,
    })
    expect(awards.totalDocs).toBe(1)
  })
})

describe('public registration', () => {
  it('creates members with safe defaults and no control over staff fields', async () => {
    const doc = (await payload.create({
      collection: 'members',
      data: {
        displayName: 'New Member',
        email: 'new@test.local',
        password: 'sup3rSecret!',
        status: 'suspended',
        totalCheckIns: 500,
        currentStreak: 42,
      },
      overrideAccess: false,
    })) as unknown as Member

    expect(doc.status).toBe('active')
    expect(doc.totalCheckIns).toBe(0)
    expect(doc.currentStreak).toBe(0)
    expect(doc.longestStreak).toBe(0)
    expect(doc.lastCheckInDate).toBeNull()
  })
})

describe('member deletion', () => {
  it('deletes dependent check-ins and badge awards when a member is deleted', async () => {
    const admin = await createAdmin()
    const a = await createMember('Member A', 'a@test.local')
    await createBadge('First Check-In', 1)
    const milestoneBadge = await createBadge('100 Check-Ins', 100)

    // The check-in auto-awards "First Check-In"; award a different badge manually.
    await checkInFor(a.id, admin)
    await payload.create({
      collection: 'member-badges',
      data: { member: a.id, badge: milestoneBadge.id, awardedAt: new Date().toISOString() },
      user: admin as any,
    })

    await payload.delete({ collection: 'members', id: a.id, user: admin as any, overrideAccess: false })

    const checkIns = await payload.find({
      collection: 'check-ins',
      where: { member: { equals: a.id } },
      overrideAccess: true,
    })
    const awards = await payload.find({
      collection: 'member-badges',
      where: { member: { equals: a.id } },
      overrideAccess: true,
    })

    expect(checkIns.totalDocs).toBe(0)
    expect(awards.totalDocs).toBe(0)
  })
})
