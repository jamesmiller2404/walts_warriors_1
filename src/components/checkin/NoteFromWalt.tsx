import { getPayloadClient } from '@/lib/payload';

const fontSans3 = { fontFamily: 'var(--font-source-sans-3), sans-serif' };

// Fallback note content — shown until the admin saves the `walts-note` global.
const FALLBACK_NOTE =
  "Day 16 is where a lot of people hit the middle slump. You don't need a big day today. You need a show-up day. Ten minutes counts.";

// A check-in page section: "A Note from Walt" — a dark card with a gold accent
// stripe down its left edge, a centered heading with a gold underline, and
// Walt's note below. The note text comes from the admin-managed `walts-note`
// global (src/globals/WaltsNote.ts). The card is narrower than the other
// sections: its edges are pulled in 20% on either side, which centers it on
// the page. Sizing follows the page's fluid convention — vw-proportional at
// the 1440px design width with clamp() floors.
export async function NoteFromWalt() {
  const payload = await getPayloadClient();
  const waltsNote = (await payload.findGlobal({ slug: 'walts-note', depth: 0 })) as {
    note?: string | null;
  };
  const note = waltsNote?.note || FALLBACK_NOTE;

  return (
    <section
      className="relative overflow-hidden rounded-lg bg-[#13233a]"
      style={{
        marginTop: 'clamp(16px, 2.5vw, 36px)',
        marginLeft: '20%',
        marginRight: '20%',
        paddingTop: 'clamp(14px, 1.6667vw, 24px)',
        paddingBottom: 'clamp(14px, 1.6667vw, 24px)',
      }}
    >
      {/* Gold accent stripe down the left edge of the card. */}
      <div
        className="absolute inset-y-0 left-0 bg-[#e3a64e]"
        style={{ width: 'clamp(4px, 0.5556vw, 8px)' }}
      />

      {/* Centered heading with a gold underline beneath the text, per the
      mockup. */}
      <h2
        className="text-center text-[#c5d7e2]"
        style={{
          ...fontSans3,
          fontSize: 'clamp(14px, 2.0833vw, 30px)',
          fontWeight: 400,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          lineHeight: 1.2,
        }}
      >
        <span
          className="inline-block border-b-2 border-[#e3a64e]"
          style={{ paddingBottom: 'clamp(4px, 0.4vw, 6px)' }}
        >
          A Note from Walt
        </span>
      </h2>

      {/* Walt's note — the admin-managed message; line breaks preserved. */}
      <p
        className="whitespace-pre-line text-[#c5d7e2]"
        style={{
          ...fontSans3,
          fontSize: 'clamp(13px, 2.0833vw, 30px)',
          lineHeight: 1.4,
          marginTop: 'clamp(10px, 1.1111vw, 16px)',
          paddingLeft: 'clamp(18px, 2.0833vw, 30px)',
          paddingRight: 'clamp(18px, 2.0833vw, 30px)',
        }}
      >
        {note}
      </p>
    </section>
  );
}
