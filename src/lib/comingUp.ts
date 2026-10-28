import type { Event, HomePage } from '@/payload-types';

// How many events to show when the admin has not picked any.
export const MAX_AUTOMATIC_EVENTS = 3;

// Event ids in the exact order the admin chose on Home Page → "Coming up card",
// tolerating both populated docs (depth > 0) and plain ids (depth 0).
export function selectedEventIds(home?: HomePage | null): number[] {
  return (home?.comingUpEvents ?? [])
    .map((row) => {
      const ref = row?.event;
      if (ref === null || ref === undefined) return null;
      return typeof ref === 'object' ? ref.id : ref;
    })
    .filter((id): id is number => typeof id === 'number');
}

// Sorts events into the admin's manual order (the "Order" column in
// Content → Events), which is what the drag handles there write to.
export function sortByCollectionOrder(events: Event[]): Event[] {
  return [...events].sort((a, b) => {
    const orderA = a._order ?? '';
    const orderB = b._order ?? '';
    if (orderA !== orderB) {
      // Empty/NULL order values go last so newly created, unordered rows don't
      // jump ahead of the curated list.
      if (!orderA) return 1;
      if (!orderB) return -1;
      return orderA < orderB ? -1 : 1;
    }
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });
}

type LexicalNode = {
  text?: string;
  children?: LexicalNode[];
};

type RichTextValue = {
  root?: { children?: LexicalNode[] };
} | null;

// Plain text of a Lexical rich-text value (headings, lists, paragraphs…).
function lexicalToText(value: RichTextValue | undefined): string {
  const collect = (nodes: LexicalNode[] | undefined): string[] =>
    (nodes ?? []).flatMap((node) => {
      const own = typeof node.text === 'string' ? [node.text] : [];
      return [...own, ...collect(node.children)];
    });

  return collect(value?.root?.children).join(' ').replace(/\s+/g, ' ').trim();
}

// What the "Coming up" card shows under the event title: the admin's Summary
// (that field is described as "Short blurb for event cards"), falling back to the
// first words of the rich-text Description so the card is never blank.
export function eventBlurb(
  event: { summary?: string | null; description?: unknown },
  maxLength = 220,
): string | null {
  const summary = typeof event.summary === 'string' ? event.summary.trim() : '';
  const text = summary || lexicalToText(event.description as RichTextValue | undefined);
  if (!text) return null;
  if (text.length <= maxLength) return text;

  // Cut on a word boundary so the card never ends mid-word.
  const clipped = text.slice(0, maxLength);
  const lastSpace = clipped.lastIndexOf(' ');
  return `${(lastSpace > 40 ? clipped.slice(0, lastSpace) : clipped).trimEnd()}…`;
}
