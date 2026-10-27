import type { Payload, PayloadRequest } from 'payload';

// Maximum number of Ask Walt rows kept in the database. Shown in the admin panel
// (collection description + copy modal footer) and enforced by
// `pruneOldestUnpinned`, which removes the oldest *unpinned* questions only.
export const MAX_STORED_QUESTIONS = 200;

export type DateRangePreset =
  'all' | 'today' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'custom';

export const DATE_RANGE_PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: 'all', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: 'thisWeek', label: 'This week' },
  { value: 'lastWeek', label: 'Last week' },
  { value: 'thisMonth', label: 'This month' },
  { value: 'lastMonth', label: 'Last month' },
  { value: 'custom', label: 'Custom range' },
];

export type CustomRange = {
  /** `YYYY-MM-DD` from a native date input. */
  from?: string;
  /** `YYYY-MM-DD` from a native date input. */
  to?: string;
};

export type DateRange = {
  start: Date | null;
  end: Date | null;
  /** Human label used in the modal and in the copied text. */
  label: string;
};

export type PinnedQuestionRow = {
  id: number | string;
  memberName: string;
  question: string;
  createdAt: string;
};

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

// Weeks run Monday → Sunday, matching how a "Wednesday Q&A" week is read.
function startOfWeek(date: Date): Date {
  const next = startOfDay(date);
  const mondayOffset = (next.getDay() + 6) % 7; // Sunday (0) → 6, Monday (1) → 0
  return addDays(next, -mondayOffset);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatMonth(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/** `Oct 20–26, 2026`, or `Sep 29 – Oct 5, 2026` when the range spans months. */
function formatDayRange(start: Date, end: Date): string {
  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    return `${start.toLocaleDateString('en-US', { month: 'short' })} ${start.getDate()}–${end.getDate()}, ${end.getFullYear()}`;
  }
  return `${formatDate(start)} – ${formatDate(end)}`;
}

function formatCustomLabel(start: Date | null, end: Date | null): string {
  if (start && end) return formatDayRange(start, end);
  if (start) return `From ${formatDate(start)}`;
  if (end) return `Up to ${formatDate(end)}`;
  return 'All time';
}

// Boundaries are computed in the viewer's local time because admins think in
// local days/weeks, while `createdAt` is stored in UTC.
export function getDateRange(
  preset: DateRangePreset,
  now: Date = new Date(),
  custom?: CustomRange,
): DateRange {
  switch (preset) {
    case 'today': {
      return { start: startOfDay(now), end: endOfDay(now), label: `Today (${formatDate(now)})` };
    }
    case 'thisWeek': {
      const start = startOfWeek(now);
      const end = endOfDay(addDays(start, 6));
      return { start, end, label: `This week (${formatDayRange(start, end)})` };
    }
    case 'lastWeek': {
      const start = addDays(startOfWeek(now), -7);
      const end = endOfDay(addDays(start, 6));
      return { start, end, label: `Last week (${formatDayRange(start, end)})` };
    }
    case 'thisMonth': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));
      return { start, end, label: `This month (${formatMonth(now)})` };
    }
    case 'lastMonth': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = endOfDay(new Date(now.getFullYear(), now.getMonth(), 0));
      return { start, end, label: `Last month (${formatMonth(start)})` };
    }
    case 'custom': {
      const start = custom?.from ? new Date(`${custom.from}T00:00:00`) : null;
      const end = custom?.to ? new Date(`${custom.to}T23:59:59.999`) : null;
      return { start, end, label: formatCustomLabel(start, end) };
    }
    default:
      return { start: null, end: null, label: 'All time' };
  }
}

export function filterByRange<T extends { createdAt: string }>(rows: T[], range: DateRange): T[] {
  const start = range.start?.getTime();
  const end = range.end?.getTime();

  return rows.filter((row) => {
    const created = new Date(row.createdAt).getTime();
    if (Number.isNaN(created)) return false;
    if (typeof start === 'number' && created < start) return false;
    if (typeof end === 'number' && created > end) return false;
    return true;
  });
}

/** The text the admin copies to the clipboard. */
export function formatPinnedQuestions(rows: PinnedQuestionRow[], rangeLabel: string): string {
  if (rows.length === 0) {
    return `Questions of interest — ${rangeLabel}\n\nNo pinned questions in this range.`;
  }

  const lines = rows.map((row, index) => `${index + 1}. ${row.memberName}: ${row.question}`);
  return `Questions of interest — ${rangeLabel} — ${rows.length} pinned\n\n${lines.join('\n')}`;
}

// Removes the pin from every pinned question. Nothing is deleted — the rows stay
// in the database (and keep counting toward MAX_STORED_QUESTIONS).
export async function clearAllPins(
  payload: Payload,
  { req }: { req?: PayloadRequest } = {},
): Promise<number> {
  const result = await payload.update({
    collection: 'ask-walt-questions',
    where: { pinned: { equals: true } },
    data: { pinned: false },
    depth: 0,
    overrideAccess: true,
    req,
  });

  return result.docs.length;
}

// Bulk delete of every *unpinned* question. Pinned questions are the curated
// Questions of interest list, so they are always kept — use "Clear all pins"
// first if every question should be removed.
export async function deleteUnpinnedQuestions(
  payload: Payload,
  { req }: { req?: PayloadRequest } = {},
): Promise<number> {
  const result = await payload.delete({
    collection: 'ask-walt-questions',
    where: { pinned: { not_equals: true } },
    depth: 0,
    overrideAccess: true,
    req,
  });

  return result.docs.length;
}

// Retention: keeps the table bounded without ever deleting the curated list.
// Pinned questions are exempt, so a fully pinned collection may exceed `max` —
// that is preferable to silently losing the Questions of interest list.
export async function pruneOldestUnpinned(
  payload: Payload,
  {
    max = MAX_STORED_QUESTIONS,
    keepId,
    req,
  }: { max?: number; keepId?: number | string; req?: PayloadRequest } = {},
): Promise<number> {
  const { totalDocs } = await payload.count({
    collection: 'ask-walt-questions',
    overrideAccess: true,
    req,
  });

  const overflow = totalDocs - max;
  if (overflow <= 0) return 0;

  const oldest = await payload.find({
    collection: 'ask-walt-questions',
    where: {
      pinned: { not_equals: true },
      ...(keepId === undefined ? {} : { id: { not_equals: keepId } }),
    },
    sort: 'createdAt',
    limit: overflow,
    depth: 0,
    overrideAccess: true,
    req,
  });

  if (oldest.docs.length === 0) return 0;

  await payload.delete({
    collection: 'ask-walt-questions',
    where: { id: { in: oldest.docs.map((doc) => doc.id) } },
    overrideAccess: true,
    req,
  });

  return oldest.docs.length;
}
