import type { Payload } from 'payload';
import { getPayload } from 'payload';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import config from '../src/payload.test.config';
import {
  MAX_STORED_QUESTIONS,
  clearAllPins,
  deleteUnpinnedQuestions,
  filterByRange,
  formatPinnedQuestions,
  getDateRange,
  pruneOldestUnpinned,
  type PinnedQuestionRow,
} from '../src/lib/pinnedQuestions';
import type { AskWaltQuestion, Member, User } from '../src/payload-types';

let payload: Payload;

beforeAll(async () => {
  payload = await getPayload({ config });
});

beforeEach(async () => {
  // Children first, then parents, so delete cleanup hooks never fight FKs.
  await payload.delete({
    collection: 'ask-walt-questions',
    where: { id: { exists: true } },
    overrideAccess: true,
  });
  await payload.delete({
    collection: 'members',
    where: { id: { exists: true } },
    overrideAccess: true,
  });
  await payload.delete({
    collection: 'users',
    where: { id: { exists: true } },
    overrideAccess: true,
  });
});

async function createMember(displayName: string, email: string): Promise<Member> {
  const doc = await payload.create({
    collection: 'members',
    data: { displayName, email, password: 'sup3rSecret!', status: 'active' },
    overrideAccess: true,
  });
  return doc as unknown as Member;
}

async function createAdmin(): Promise<User> {
  const doc = await payload.create({
    collection: 'users',
    data: { name: 'Admin', email: 'admin@test.local', password: 'sup3rSecret!', role: 'admin' },
    overrideAccess: true,
  });
  return doc as unknown as User;
}

// Mirrors what the Ask Walt card does: Local API create on behalf of a signed-in
// account, with access control and hooks enabled.
async function submitQuestion(
  user: Member | User,
  data: Record<string, unknown> & { question: string },
): Promise<AskWaltQuestion> {
  const doc = await payload.create({
    collection: 'ask-walt-questions',
    data: data as any,
    user: user as any,
    overrideAccess: false,
    depth: 0,
  });
  return doc as unknown as AskWaltQuestion;
}

describe('ask walt questions', () => {
  it('forces ownership and copies the member display name on submit', async () => {
    const a = await createMember('Member A', 'a@test.local');
    const b = await createMember('Member B', 'b@test.local');

    // A tries to submit as B and pin the question; both are staff-only.
    const doc = await submitQuestion(a, {
      question: 'How do I stay consistent?',
      member: b.id,
      memberName: 'Fake Name',
      pinned: true,
    });

    expect(doc.member).toBe(a.id);
    expect(doc.memberName).toBe('Member A');
    expect(doc.pinned).toBe(false);
  });

  it('blocks suspended members from submitting', async () => {
    const a = await createMember('Member A', 'a@test.local');
    await payload.update({
      collection: 'members',
      id: a.id,
      data: { status: 'suspended' },
      overrideAccess: true,
    });

    // Re-read so the user object carries the new status, like a fresh session.
    const suspended = (await payload.findByID({
      collection: 'members',
      id: a.id,
      overrideAccess: true,
    })) as unknown as Member;

    await expect(submitQuestion(suspended, { question: 'Can I still ask?' })).rejects.toThrow();
  });

  it("hides a member's questions from other members but not from staff", async () => {
    const a = await createMember('Member A', 'a@test.local');
    const b = await createMember('Member B', 'b@test.local');
    const admin = await createAdmin();

    await submitQuestion(a, { question: 'Question from A' });
    await submitQuestion(b, { question: 'Question from B' });

    const seenByB = await payload.find({
      collection: 'ask-walt-questions',
      user: b as any,
      overrideAccess: false,
    });
    expect(seenByB.docs).toHaveLength(1);
    expect(seenByB.docs[0].question).toBe('Question from B');

    const seenByStaff = await payload.find({
      collection: 'ask-walt-questions',
      user: admin as any,
      overrideAccess: false,
    });
    expect(seenByStaff.docs).toHaveLength(2);
  });

  it('only lets staff pin (and unpin) a question', async () => {
    const a = await createMember('Member A', 'a@test.local');
    const admin = await createAdmin();
    const doc = await submitQuestion(a, { question: 'Pin me' });

    await expect(
      payload.update({
        collection: 'ask-walt-questions',
        id: doc.id,
        data: { pinned: true },
        user: a as any,
        overrideAccess: false,
      }),
    ).rejects.toThrow();

    const pinned = await payload.update({
      collection: 'ask-walt-questions',
      id: doc.id,
      data: { pinned: true },
      user: admin as any,
      overrideAccess: false,
      depth: 0,
    });
    expect(pinned.pinned).toBe(true);

    const pinnedList = await payload.find({
      collection: 'ask-walt-questions',
      where: { pinned: { equals: true } },
      overrideAccess: true,
    });
    expect(pinnedList.docs.map((d) => d.id)).toEqual([doc.id]);
  });

  it("prevents members from deleting their or anyone else's questions", async () => {
    const a = await createMember('Member A', 'a@test.local');
    const doc = await submitQuestion(a, { question: 'Mine' });

    await expect(
      payload.delete({
        collection: 'ask-walt-questions',
        id: doc.id,
        user: a as any,
        overrideAccess: false,
      }),
    ).rejects.toThrow();
  });

  it('sorts the list by user name and by date', async () => {
    const zoe = await createMember('Zoe', 'zoe@test.local');
    const alice = await createMember('Alice', 'alice@test.local');

    await submitQuestion(zoe, { question: 'First question' });
    await new Promise((resolve) => setTimeout(resolve, 10));
    await submitQuestion(alice, { question: 'Second question' });

    const byName = await payload.find({
      collection: 'ask-walt-questions',
      sort: 'memberName',
      overrideAccess: true,
    });
    expect(byName.docs.map((d) => d.memberName)).toEqual(['Alice', 'Zoe']);

    const newestFirst = await payload.find({
      collection: 'ask-walt-questions',
      sort: '-createdAt',
      overrideAccess: true,
    });
    expect(newestFirst.docs.map((d) => d.question)).toEqual(['Second question', 'First question']);
  });
});

describe('pinned question helpers', () => {
  // Fixed "now": Monday 26 October 2026, 15:00 local time.
  const now = new Date(2026, 9, 26, 15, 0, 0);

  const row = (id: number, createdAt: Date, memberName = 'Member'): PinnedQuestionRow => ({
    id,
    memberName,
    question: `Q${id}`,
    createdAt: createdAt.toISOString(),
  });

  it('builds week ranges Monday → Sunday', () => {
    const thisWeek = getDateRange('thisWeek', now);
    const lastWeek = getDateRange('lastWeek', now);

    expect(thisWeek.start?.getDay()).toBe(1); // Monday
    expect(thisWeek.start?.getHours()).toBe(0);
    // Checked with local getters rather than a fixed 7 × 24h span, because a
    // DST change inside the week makes the absolute span an hour shorter.
    expect(thisWeek.end?.getDay()).toBe(0); // Sunday
    expect(thisWeek.end?.getHours()).toBe(23);
    expect(thisWeek.end?.getMinutes()).toBe(59);
    expect(thisWeek.end?.getSeconds()).toBe(59);
    expect(thisWeek.end?.getMilliseconds()).toBe(999);
    expect(lastWeek.end?.getTime()).toBe((thisWeek.start?.getTime() ?? 0) - 1);
    expect(thisWeek.label.startsWith('This week (')).toBe(true);
    expect(lastWeek.label.startsWith('Last week (')).toBe(true);
  });

  it('builds calendar month ranges, including the previous month', () => {
    const thisMonth = getDateRange('thisMonth', now);
    const lastMonth = getDateRange('lastMonth', now);

    expect(thisMonth.start?.getDate()).toBe(1);
    expect(thisMonth.start?.getMonth()).toBe(9); // October
    expect(thisMonth.end?.getDate()).toBe(31);

    expect(lastMonth.start?.getMonth()).toBe(8); // September
    expect(lastMonth.end?.getDate()).toBe(30);
  });

  it('filters rows by an inclusive day range', () => {
    const today = getDateRange('today', now);
    const rows = [
      row(1, new Date(2026, 9, 25, 23, 59)), // yesterday
      row(2, new Date(2026, 9, 26, 0, 0)), // first moment of today
      row(3, new Date(2026, 9, 26, 23, 59, 59)), // last moment of today
      row(4, new Date(2026, 9, 27, 0, 0)), // tomorrow
    ];

    expect(filterByRange(rows, today).map((r) => r.id)).toEqual([2, 3]);
    expect(filterByRange(rows, getDateRange('all', now))).toHaveLength(4);
  });

  it('formats the copied text with the range and count', () => {
    const rows = [row(1, now, 'Alice'), row(2, now, 'Bob')];

    expect(formatPinnedQuestions(rows, 'This week (Oct 20–26, 2026)')).toBe(
      'Questions of interest — This week (Oct 20–26, 2026) — 2 pinned\n\n1. Alice: Q1\n2. Bob: Q2',
    );
    expect(formatPinnedQuestions([], 'All time')).toContain('No pinned questions in this range.');
  });
});

describe('ask walt retention', () => {
  const pause = () => new Promise((resolve) => setTimeout(resolve, 10));

  it('prunes the oldest unpinned questions and never deletes pinned ones', async () => {
    const a = await createMember('Member A', 'a@test.local');

    const created: AskWaltQuestion[] = [];
    for (let i = 0; i < 5; i += 1) {
      created.push(await submitQuestion(a, { question: `Q${i}` }));
      await pause();
    }

    // Curate the oldest question — it must survive the prune.
    await payload.update({
      collection: 'ask-walt-questions',
      id: created[0].id,
      data: { pinned: true },
      overrideAccess: true,
    });

    const removed = await pruneOldestUnpinned(payload, { max: 3 });
    expect(removed).toBe(2);

    const remaining = await payload.find({
      collection: 'ask-walt-questions',
      sort: 'createdAt',
      depth: 0,
      overrideAccess: true,
    });
    expect(remaining.docs.map((doc) => doc.question)).toEqual(['Q0', 'Q3', 'Q4']);
  });

  it('stops pruning when everything left is pinned', async () => {
    const a = await createMember('Member A', 'a@test.local');
    const first = await submitQuestion(a, { question: 'Pinned 1' });
    await pause();
    const second = await submitQuestion(a, { question: 'Pinned 2' });

    for (const doc of [first, second]) {
      await payload.update({
        collection: 'ask-walt-questions',
        id: doc.id,
        data: { pinned: true },
        overrideAccess: true,
      });
    }

    const removed = await pruneOldestUnpinned(payload, { max: 1 });
    expect(removed).toBe(0);

    const remaining = await payload.count({
      collection: 'ask-walt-questions',
      overrideAccess: true,
    });
    expect(remaining.totalDocs).toBe(2);
  });

  it('keeps everything while under the default cap', async () => {
    const a = await createMember('Member A', 'a@test.local');
    await submitQuestion(a, { question: 'Short list' });

    expect(MAX_STORED_QUESTIONS).toBeGreaterThan(0);
    expect(await pruneOldestUnpinned(payload)).toBe(0);
  });

  it('clears every pin without deleting any question', async () => {
    const a = await createMember('Member A', 'a@test.local');
    const first = await submitQuestion(a, { question: 'Keep me' });
    const second = await submitQuestion(a, { question: 'Keep me too' });

    for (const doc of [first, second]) {
      await payload.update({
        collection: 'ask-walt-questions',
        id: doc.id,
        data: { pinned: true },
        overrideAccess: true,
      });
    }

    expect(await clearAllPins(payload)).toBe(2);

    const remaining = await payload.find({
      collection: 'ask-walt-questions',
      depth: 0,
      overrideAccess: true,
    });
    expect(remaining.totalDocs).toBe(2); // questions are kept…
    expect(remaining.docs.every((doc) => doc.pinned === false)).toBe(true); // …only the pins go
  });

  it('bulk deletes every unpinned question and keeps the pinned ones', async () => {
    const a = await createMember('Member A', 'a@test.local');
    const keep = await submitQuestion(a, { question: 'Keep (pinned)' });
    await pause();
    await submitQuestion(a, { question: 'Drop 1' });
    await pause();
    await submitQuestion(a, { question: 'Drop 2' });

    await payload.update({
      collection: 'ask-walt-questions',
      id: keep.id,
      data: { pinned: true },
      overrideAccess: true,
    });

    expect(await deleteUnpinnedQuestions(payload)).toBe(2);

    const remaining = await payload.find({
      collection: 'ask-walt-questions',
      depth: 0,
      overrideAccess: true,
    });
    expect(remaining.docs.map((doc) => doc.question)).toEqual(['Keep (pinned)']);
  });
});
