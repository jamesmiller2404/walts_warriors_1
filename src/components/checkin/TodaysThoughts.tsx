'use client';

import { useState } from 'react';
import Image from 'next/image';

const fontSans3 = { fontFamily: 'var(--font-source-sans-3), sans-serif' };

// Dummy state only — the comment will be stored in the member's DB (shared
// with their challenge group only when they tick the share box) and the
// energy value will be accumulated per day so Energy vs. Time can be charted
// later. None of that is wired up yet; Save is a visual no-op for now.
const PROMPT = "What's one small win you're proud of today?";

// Third section below the check-in-page header: the optional "Today's
// Thoughts" card. Sizing follows the page's fluid convention — vw-proportional
// at the 1440px design width with clamp() floors.
export function TodaysThoughts() {
  const [comment, setComment] = useState('');
  const [share, setShare] = useState(true); // default per the mockup
  const [energy, setEnergy] = useState<number | null>(null);

  return (
    <section
      className="rounded-lg bg-[#8c8fd0]"
      style={{
        marginTop: 'clamp(16px, 2.5vw, 36px)',
        marginLeft: '1.5%',
        marginRight: '1.5%',
        paddingTop: 'clamp(12px, 1.3889vw, 20px)',
        paddingBottom: 'clamp(14px, 1.8vw, 26px)',
        paddingLeft: 'clamp(14px, 2.0833vw, 30px)',
        paddingRight: 'clamp(14px, 2.0833vw, 30px)',
      }}
    >
      {/* Section heading — h2 style, per the other check-in sections. */}
      <h2
        className="text-[#c5d7e2]"
        style={{
          ...fontSans3,
          fontSize: 'clamp(14px, 2.0833vw, 30px)',
          fontWeight: 400,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          lineHeight: 1.2,
        }}
      >
        Optional · Before You Finish
      </h2>

      {/* Image + content columns — the portrait landscape sits alongside the
      prompt/textarea/energy block, per the mockup. */}
      <div
        className="flex"
        style={{ gap: 'clamp(10px, 1.4vw, 20px)', marginTop: 'clamp(10px, 1.1111vw, 16px)' }}
      >
        {/* Landscape image — decorative, object-cover, square corners. */}
        <div
          className="relative shrink-0"
          style={{ width: 'clamp(70px, 14.6vw, 210px)', aspectRatio: '208 / 387' }}
        >
          <Image src="/images/landscape1.webp" alt="" fill className="object-cover" sizes="210px" />
        </div>

        <div className="min-w-0 flex-1">
          {/* Prompt. */}
          <p
            className="text-[#2c353b]"
            style={{
              ...fontSans3,
              fontSize: 'clamp(15px, 2.5vw, 36px)',
              fontWeight: 700,
              lineHeight: 1.25,
            }}
          >
            {PROMPT}
          </p>

          {/* Comment textarea — dark, per the mockup. */}
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Your thoughts..."
            aria-label="Your thoughts"
            className="block w-full resize-none rounded-lg bg-[#31343f] text-[#dbe7ee] placeholder:text-[#8f959e]"
            style={{
              ...fontSans3,
              fontSize: 'clamp(13px, 2.0833vw, 30px)',
              height: 'clamp(70px, 9vw, 130px)',
              marginTop: 'clamp(6px, 0.7vw, 10px)',
              padding: 'clamp(8px, 1.1111vw, 16px)',
              lineHeight: 1.4,
            }}
          />

          {/* Share with your challenge group — dummy checkbox. */}
          <label
            className="flex cursor-pointer items-center"
            style={{ gap: 'clamp(8px, 0.8vw, 12px)', marginTop: 'clamp(10px, 1.4vw, 20px)' }}
          >
            <input
              type="checkbox"
              checked={share}
              onChange={(e) => setShare(e.target.checked)}
              className="peer sr-only"
            />
            <span
              className="flex shrink-0 items-center justify-center rounded-[4px] peer-checked:bg-[#dbe7ee] border-2 border-[#2c353b]"
              style={{ width: 'clamp(14px, 1.25vw, 18px)', height: 'clamp(14px, 1.25vw, 18px)' }}
            >
              {share ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  style={{ width: '75%', height: '75%' }}
                >
                  <path
                    d="M5 12.5 10 17.5 19 7"
                    stroke="#2c353b"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : null}
            </span>
            <span
              className="text-[#2c353b]"
              style={{ ...fontSans3, fontSize: 'clamp(13px, 2.0833vw, 30px)', lineHeight: 1.2 }}
            >
              Share with your challenge group
            </span>
          </label>

          {/* Energy card + Save — the Save button bottom-aligns with the card,
          per the mockup. */}
          <div
            className="flex items-end justify-between"
            style={{ gap: 'clamp(10px, 1.4vw, 20px)', marginTop: 'clamp(10px, 1.4vw, 20px)' }}
          >
            <div
              className="rounded-lg bg-[#5c5678]"
              style={{
                paddingTop: 'clamp(8px, 1.1111vw, 16px)',
                paddingBottom: 'clamp(8px, 1.1111vw, 16px)',
                paddingLeft: 'clamp(10px, 1.6667vw, 24px)',
                paddingRight: 'clamp(10px, 1.6667vw, 24px)',
              }}
            >
              <p
                className="text-[#dbe7ee]"
                style={{ ...fontSans3, fontSize: 'clamp(12px, 1.9444vw, 28px)', lineHeight: 1.3 }}
              >
                How&apos;s your energy today?
              </p>

              {/* 1–5 buttons — dummy selection; fills light when chosen. */}
              <div
                className="flex"
                style={{ gap: 'clamp(8px, 1.1111vw, 16px)', marginTop: 'clamp(6px, 0.8vw, 12px)' }}
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={energy === value}
                    onClick={() => setEnergy(value)}
                    className={`flex cursor-pointer items-center justify-center rounded-lg border-2 text-[#dbe7ee] transition ${
                      energy === value ? 'bg-[#dbe7ee] text-[#2c353b]' : ''
                    }`}
                    style={{
                      ...fontSans3,
                      fontSize: 'clamp(12px, 1.6667vw, 24px)',
                      width: 'clamp(22px, 2.3611vw, 34px)',
                      height: 'clamp(22px, 2.3611vw, 34px)',
                    }}
                  >
                    {value}
                  </button>
                ))}
              </div>

              <p
                className="text-[#dbe7ee]"
                style={{
                  ...fontSans3,
                  fontSize: 'clamp(11px, 1.8056vw, 26px)',
                  marginTop: 'clamp(6px, 0.8vw, 12px)',
                  lineHeight: 1.3,
                }}
              >
                1 is drained, 5 is great (Only you can see this)
              </p>
            </div>

            {/* Save — visual no-op until the back-end wiring lands. */}
            <button
              type="button"
              onClick={() => {
                /* TODO: persist comment + share flag + energy to the member's
                check-in record for today. */
              }}
              className="cursor-pointer rounded-lg border-2 border-[#2c353b] text-[#dbe7ee] transition hover:opacity-80"
              style={{
                ...fontSans3,
                fontSize: 'clamp(14px, 2.5vw, 36px)',
                fontWeight: 600,
                padding: 'clamp(6px, 0.7vw, 10px) clamp(14px, 1.9444vw, 28px)',
                lineHeight: 1.2,
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
