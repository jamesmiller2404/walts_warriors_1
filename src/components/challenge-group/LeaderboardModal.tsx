'use client';

import { useEffect, useRef } from 'react';

const fontSans3 = { fontFamily: 'var(--font-source-sans-3), sans-serif' };

// Dummy standings — the real rows will come from the challenge group's members
// (points and streak for the active challenge) once challenge groups are wired
// to the backend. The viewer's row carries the same numbers as the rest of the
// page (6-day streak, 1,240 points) so the two never look out of sync.
type LeaderboardEntry = {
  name: string;
  streak: number;
  points: number;
  /** One dot per pillar for today (Move · Fuel · Mind): true = done. */
  today: boolean[];
  /** Marks the viewer's own row — highlighted and bold. */
  you?: boolean;
};

const GROUP_LABEL = 'Group 2';

const ENTRIES: LeaderboardEntry[] = [
  { name: 'Maria R', streak: 11, points: 1502, today: [true, true, true] },
  { name: 'Dev P', streak: 9, points: 1377, today: [true, true, false] },
  { name: 'You', streak: 6, points: 1240, today: [true, false, true], you: true },
  { name: 'Priya S', streak: 4, points: 988, today: [false, true, true] },
  { name: 'Tom W', streak: 2, points: 658, today: [false, false, true] },
];

// Mockup measurements. The dialog sits on its own #343f54 panel (not the usual
// charcoal card), the viewer's row rides the blue highlight band, and the
// "Today" dots are black when the pillar is done and hollow when it is not.
const YOU_ROW_BG = '#4a6a96';
const COLUMN_TEMPLATE = '0.8fr 0.95fr 1.15fr 1.1fr 1.1fr';
const LABEL_FONT_SIZE = 'clamp(11px, 1.0417vw, 15px)';
const LABEL_LINE_HEIGHT = 1.2;
const LABEL_GAP = 'clamp(3px, 0.4167vw, 6px)';
const ROW_FONT_SIZE = 'clamp(12px, 1.1111vw, 16px)';
const RAIL_WIDTH = 'clamp(9px, 1.1806vw, 17px)';
const RAIL_GAP = 'clamp(6px, 0.6944vw, 10px)';
const DOT_SIZE = 'clamp(9px, 1.1111vw, 16px)';

type Props = {
  open: boolean;
  onClose: () => void;
  /** Challenge group shown in the dialog title, e.g. "Group 2". */
  groupLabel?: string;
  entries?: LeaderboardEntry[];
};

/**
 * Decorative scroll rail from the mockup (track, thumb and arrow ends) — the
 * same treatment as the rail on the "Your Recent Wins" card. The standings
 * themselves scroll natively, so this is purely visual. The top offset drops it
 * level with the table rather than the column labels above it.
 */
function ScrollRail() {
  return (
    <div
      aria-hidden="true"
      className="flex shrink-0 flex-col items-center justify-between rounded-full bg-[#c5d7e2]"
      style={{
        width: RAIL_WIDTH,
        padding: 'clamp(3px, 0.4167vw, 6px) 0',
        marginTop: `calc(${LABEL_FONT_SIZE} * ${LABEL_LINE_HEIGHT} + ${LABEL_GAP})`,
      }}
    >
      <svg viewBox="0 0 10 8" style={{ width: '70%', height: 'auto' }}>
        <path d="M5 0l5 8H0z" fill="#13233a" />
      </svg>
      <div
        className="rounded-[1px] bg-[#13233a]"
        style={{ width: '70%', height: 'clamp(8px, 1.0417vw, 15px)' }}
      />
      <svg viewBox="0 0 10 8" style={{ width: '70%', height: 'auto' }}>
        <path d="M0 0h10L5 8z" fill="#13233a" />
      </svg>
    </div>
  );
}

/** Filled triangle on the group dropdown chip. */
function CaretDownIcon() {
  return (
    <svg
      viewBox="0 0 10 8"
      aria-hidden="true"
      className="shrink-0"
      style={{ width: 'clamp(8px, 0.6944vw, 10px)', height: 'auto' }}
    >
      <path d="M0 0h10L5 8z" fill="#13233a" />
    </svg>
  );
}

/** Monochrome smiley from the mockup (white face, dark features). */
function SmileyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="shrink-0"
      style={{ width: 'clamp(12px, 1.0417vw, 15px)', height: 'clamp(12px, 1.0417vw, 15px)' }}
    >
      <circle cx="12" cy="12" r="11" fill="#ffffff" />
      <circle cx="8.5" cy="9.5" r="1.6" fill="#13233a" />
      <circle cx="15.5" cy="9.5" r="1.6" fill="#13233a" />
      <path
        d="M7.5 14.5c1.1 1.7 2.6 2.6 4.5 2.6s3.4-.9 4.5-2.6"
        stroke="#13233a"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * The three "Today" dots: black when that pillar is done, hollow when it is not.
 * Colour is the only visual difference, so the group carries a text label.
 */
function TodayDots({ done, name }: { done: boolean[]; name: string }) {
  const completed = done.filter(Boolean).length;

  return (
    <div
      role="img"
      aria-label={`${name}: ${completed} of ${done.length} pillars done today`}
      className="flex items-center justify-center"
      style={{ gap: 'clamp(5px, 0.6944vw, 10px)' }}
    >
      {done.map((isDone, index) => (
        <span
          key={`${name}-${index}`}
          aria-hidden="true"
          className="rounded-full"
          style={{
            width: DOT_SIZE,
            height: DOT_SIZE,
            backgroundColor: isDone ? '#000000' : 'transparent',
            border: isDone ? 'none' : '2px solid rgb(197 215 226 / 0.6)',
            boxSizing: 'border-box',
          }}
        />
      ))}
    </div>
  );
}

/**
 * Leader Board dialog for the challenge group ("Winter Reset") page. Lists the
 * group's standings — rank, member, streak, points and the three "Today" pillar
 * dots — on the mockup's #343f54 panel, with the viewer's own row highlighted on
 * the blue band. The dialog plumbing (focus trap, Escape/backdrop close, scroll
 * lock, focus restore) lives here too. Standings are dummy data until challenge
 * groups are wired to the backend, and the two footer controls are placeholders.
 */
export function LeaderboardModal({
  open,
  onClose,
  groupLabel = GROUP_LABEL,
  entries = ENTRIES,
}: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      // Keep Tab inside the dialog.
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        id="leaderboard-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="leaderboard-title"
        className="relative w-full max-w-[min(92vw,560px)] rounded-lg bg-[#343f54] text-[#dbe7ee] shadow-2xl"
        style={{
          ...fontSans3,
          paddingTop: 'clamp(16px, 2.0833vw, 30px)',
          paddingBottom: 'clamp(14px, 1.6667vw, 24px)',
          paddingLeft: 'clamp(12px, 2.0833vw, 30px)',
          paddingRight: 'clamp(12px, 1.5278vw, 22px)',
        }}
      >
        <button
          ref={closeRef}
          type="button"
          data-guest-hint-skip
          onClick={onClose}
          aria-label="Close leader board"
          className="absolute top-[clamp(8px,0.8333vw,12px)] right-[clamp(8px,0.8333vw,12px)] rounded-md p-1 text-[#dbe7ee] transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e3a64e]"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            style={{ width: 'clamp(16px, 1.3889vw, 20px)', height: 'clamp(16px, 1.3889vw, 20px)' }}
          >
            <path d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        <h2
          id="leaderboard-title"
          className="text-center uppercase"
          style={{
            ...fontSans3,
            fontSize: 'clamp(15px, 1.5278vw, 22px)',
            fontWeight: 600,
            letterSpacing: '0.08em',
            lineHeight: 1.2,
          }}
        >
          {groupLabel} · Leader Board
        </h2>

        {/* Standings: the rail from the mockup on the left, column labels above
            the bordered table so the labels sit over their own columns. */}
        <div className="flex" style={{ gap: RAIL_GAP, marginTop: 'clamp(10px, 1.3889vw, 20px)' }}>
          <ScrollRail />

          <div className="min-w-0 flex-1">
            <div
              className="grid text-center font-bold"
              style={{
                gridTemplateColumns: COLUMN_TEMPLATE,
                fontSize: LABEL_FONT_SIZE,
                lineHeight: LABEL_LINE_HEIGHT,
                marginBottom: LABEL_GAP,
              }}
            >
              <span>No.</span>
              <span>Member</span>
              <span>Streak</span>
              <span>Points</span>
              <span>Today</span>
            </div>

            {/* Hairline dividers run between rows except around the viewer's own
                highlighted band. Long groups scroll; the rail stays decorative. */}
            <div
              className="overflow-y-auto border border-[#c5d7e2]/40 [&::-webkit-scrollbar]:hidden"
              style={{ maxHeight: 'clamp(200px, 22.2222vw, 320px)', scrollbarWidth: 'none' }}
            >
              {entries.map((entry, index) => {
                const isYou = entry.you === true;
                const hasDivider = index > 0 && !isYou && entries[index - 1]?.you !== true;

                return (
                  <div
                    key={entry.name}
                    className="grid items-center text-center"
                    style={{
                      gridTemplateColumns: COLUMN_TEMPLATE,
                      backgroundColor: isYou ? YOU_ROW_BG : undefined,
                      borderTop: hasDivider ? '1px solid rgb(197 215 226 / 0.25)' : undefined,
                      paddingBlock: 'clamp(7px, 1.1111vw, 16px)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 'clamp(13px, 1.25vw, 18px)',
                        lineHeight: 1.1,
                      }}
                    >
                      {index + 1}
                    </span>

                    <span
                      className={isYou ? 'font-bold' : undefined}
                      style={{ fontSize: ROW_FONT_SIZE, lineHeight: 1.2 }}
                    >
                      {entry.name}
                    </span>

                    <span style={{ fontSize: ROW_FONT_SIZE, lineHeight: 1.2 }}>{entry.streak}</span>

                    <span style={{ fontSize: ROW_FONT_SIZE, lineHeight: 1.2 }}>{entry.points}</span>

                    <TodayDots done={entry.today} name={entry.name} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer controls — both placeholders: switching groups and sending
            encouragement both need the backend. */}
        <div
          className="flex flex-col sm:flex-row"
          style={{ gap: 'clamp(6px, 0.8333vw, 12px)', marginTop: 'clamp(6px, 0.8333vw, 12px)' }}
        >
          <button
            type="button"
            data-guest-hint-skip
            title="Group selection coming soon"
            aria-haspopup="listbox"
            className="inline-flex items-center justify-center rounded-[3px] bg-[#c5d7e2] font-bold text-[#13233a] transition hover:bg-[#dbe7ee] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e3a64e] sm:flex-[0.85]"
            style={{
              ...fontSans3,
              fontSize: 'clamp(12px, 1.1111vw, 16px)',
              lineHeight: 1.2,
              gap: '0.4em',
              padding: 'clamp(4px, 0.5556vw, 8px) clamp(6px, 0.6944vw, 10px)',
            }}
          >
            <span className="truncate">Your Group Members</span>
            <CaretDownIcon />
          </button>

          <button
            type="button"
            data-guest-hint-skip
            title="Emoji encouragement coming soon"
            className="inline-flex items-center justify-center rounded-[3px] border border-[#c5d7e2]/80 text-[#dbe7ee] transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e3a64e] sm:flex-1"
            style={{
              ...fontSans3,
              fontSize: 'clamp(12px, 1.1111vw, 16px)',
              lineHeight: 1.2,
              gap: '0.4em',
              padding: 'clamp(4px, 0.5556vw, 8px) clamp(6px, 0.6944vw, 10px)',
            }}
          >
            <span className="truncate">Cheer a group member on</span>
            <SmileyIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
