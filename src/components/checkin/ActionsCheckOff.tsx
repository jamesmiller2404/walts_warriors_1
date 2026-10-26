'use client';

import { useState } from 'react';

const fontSans3 = { fontFamily: 'var(--font-source-sans-3), sans-serif' };

// Dummy daily actions — the real tasks will come from the member's active
// challenge, and the ticks will be recorded in the database for that member's
// day once the check-in flow is wired up. For now this is dummy UI only.
const TASKS = [
  { label: 'Walk for ten minutes', category: 'MOVE' },
  { label: 'Read for five minutes', category: 'MIND' },
  { label: 'Drink 750 ml of water', category: 'FUEL' },
];

// First section below the check-in-page header: the actions check-off list
// ("Today's Challenge"). Sizing follows the page's fluid convention — every
// value is vw-proportional at the 1440px design width with a clamp() floor.
export function ActionsCheckOff() {
  // Dummy local state — toggles are lost on reload; nothing is persisted.
  const [done, setDone] = useState<boolean[]>(TASKS.map(() => false));

  const toggle = (index: number) => {
    setDone((prev) => prev.map((d, i) => (i === index ? !d : d)));
  };

  return (
    <section
      className="rounded-lg bg-[#3a3c4e]"
      style={{
        marginTop: 'clamp(12px, 1.6667vw, 24px)',
        marginLeft: '1.5%',
        marginRight: '1.5%',
        paddingTop: 'clamp(12px, 1.3889vw, 20px)',
        paddingBottom: 'clamp(14px, 1.8vw, 26px)',
        paddingLeft: 'clamp(14px, 2.0833vw, 30px)',
        paddingRight: 'clamp(14px, 2.0833vw, 30px)',
      }}
    >
      {/* Section heading — h2 style per app conventions: 30px, uppercase,
      letter-spaced (rendered regular weight, per the mockup). */}
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
        Today&apos;s Challenge
      </h2>

      {/* Subtitle — "Day 16 · Build Momentum · ..." with the closing sentence
      emphasized, per the mockup. */}
      <p
        className="text-[#c5d7e2]"
        style={{
          ...fontSans3,
          fontSize: 'clamp(13px, 2.0833vw, 30px)',
          fontWeight: 600,
          lineHeight: 1.3,
        }}
      >
        Day 16 · Build Momentum ·{' '}
        <span className="font-bold">Small steps become lasting habits.</span>
      </p>

      {/* Task rows — dummy checkboxes (local state only). Clicking a row
      toggles its green check; nothing is saved to the database yet. */}
      <div
        style={{
          marginTop: 'clamp(10px, 1.1111vw, 16px)',
          marginLeft: '8.25%',
          marginRight: '9%',
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(8px, 0.9722vw, 14px)',
        }}
      >
        {TASKS.map((task, index) => {
          const checked = done[index];
          return (
            <button
              key={task.category}
              type="button"
              aria-pressed={checked}
              onClick={() => toggle(index)}
              className="flex cursor-pointer items-center rounded-lg bg-[#275b99] text-left transition hover:brightness-110"
              style={{
                height: 'clamp(44px, 4.5833vw, 66px)',
                paddingLeft: 'clamp(14px, 1.8vw, 26px)',
                paddingRight: 'clamp(14px, 1.8vw, 26px)',
              }}
            >
              {/* Checkbox circle — white outline when empty, green check when
              ticked, per the mockup. */}
              <span
                className="flex shrink-0 items-center justify-center rounded-full border-2"
                style={{
                  width: 'clamp(16px, 1.6667vw, 24px)',
                  height: 'clamp(16px, 1.6667vw, 24px)',
                  borderColor: checked ? '#00d80a' : '#c5d7e2',
                }}
              >
                {checked ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    style={{ width: '70%', height: '70%' }}
                  >
                    <path
                      d="M5 12.5 10 17.5 19 7"
                      stroke="#00d80a"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : null}
              </span>

              <span
                className="text-[#2c353b]"
                style={{
                  ...fontSans3,
                  fontSize: 'clamp(13px, 2.0833vw, 30px)',
                  fontWeight: 600,
                  marginLeft: 'clamp(10px, 1.5vw, 22px)',
                  lineHeight: 1.2,
                }}
              >
                {task.label}
              </span>

              <span
                className="ml-auto text-[#2c353b]"
                style={{ ...fontSans3, fontSize: 'clamp(13px, 2.0833vw, 30px)', lineHeight: 1 }}
              >
                {task.category}
              </span>
            </button>
          );
        })}
      </div>

      {/* Helper note under the rows, per the mockup. */}
      <p
        className="text-[#c5d7e2]"
        style={{
          ...fontSans3,
          fontSize: 'clamp(12px, 1.9444vw, 28px)',
          marginTop: 'clamp(12px, 1.3889vw, 20px)',
          lineHeight: 1.3,
        }}
      >
        A check-in counts when any 1 or all 3 tasks are done. Tasks save as you tick them.
      </p>
    </section>
  );
}
