'use client';

import { useState } from 'react';

import { LeaderboardModal } from './LeaderboardModal';

const fontSans3 = { fontFamily: 'var(--font-source-sans-3), sans-serif' };

/**
 * "Leader Board" page action (mockup: purple button, bold gold label) that
 * opens the leader board modal. Sits in the lower-left of the page content.
 */
export function LeaderboardButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="leaderboard-dialog"
        className="bg-[#4a4560] font-bold text-[#e3a64e] transition hover:bg-[#5c5678] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e3a64e]"
        style={{
          ...fontSans3,
          fontSize: 'clamp(18px, 1.9444vw, 28px)',
          padding: 'clamp(6px, 0.8333vw, 12px) clamp(12px, 1.3889vw, 20px)',
          lineHeight: 1.1,
          borderRadius: '8px',
        }}
      >
        Leader Board
      </button>

      <LeaderboardModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
