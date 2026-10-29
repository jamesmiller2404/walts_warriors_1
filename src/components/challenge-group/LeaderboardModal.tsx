'use client';

import { useEffect, useRef } from 'react';

const fontSans3 = { fontFamily: 'var(--font-source-sans-3), sans-serif' };

type Props = {
  open: boolean;
  onClose: () => void;
};

/**
 * Leader Board modal shell. The standings themselves are not built yet — this
 * provides the dialog the page button opens (focus trap, Escape/backdrop close,
 * scroll lock, focus restore) so the leaderboard content can drop straight into
 * the body later.
 */
export function LeaderboardModal({ open, onClose }: Props) {
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
        aria-describedby="leaderboard-body"
        className="w-full max-w-[min(92vw,560px)] rounded-lg border border-[#e3a64e]/40 bg-[#3a3c4e] p-6 text-[#c5d7e2] shadow-2xl"
        style={fontSans3}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-[#e3a64e] uppercase">
              Challenge group
            </p>
            <h2 id="leaderboard-title" className="mt-2 text-xl font-semibold text-[#dbe7ee]">
              Leader Board
            </h2>
          </div>

          <button
            ref={closeRef}
            type="button"
            data-guest-hint-skip
            onClick={onClose}
            aria-label="Close leader board"
            className="shrink-0 rounded-md p-1 text-[#c5d7e2] transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e3a64e]"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <path d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p id="leaderboard-body" className="mt-4 text-[15px] leading-relaxed">
          Standings are coming soon. This is where the challenge group will be ranked by points
          earned during the challenge.
        </p>

        <button
          type="button"
          data-guest-hint-skip
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-[#8c8fd0] px-4 py-2.5 font-semibold text-[#0b1424] transition hover:bg-[#9a9ddb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e3a64e]"
          style={fontSans3}
        >
          Close
        </button>
      </div>
    </div>
  );
}
