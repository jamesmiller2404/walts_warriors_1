'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  GUEST_HINT_HOLD_EVENT,
  GUEST_HINT_RELEASE_EVENT,
  GUEST_HINT_SESSION_KEY,
} from '@/components/layout/guestHintConfig';

const fontSans3 = { fontFamily: 'var(--font-source-sans-3), sans-serif' };

/**
 * Home-page explainer for the guest-preview green outlines. Mounted only for
 * the demo identity (the same gate as the outlines themselves), so real
 * members and a gated site never see it. Opens after mount — the server render
 * stays clean — and closes via "Got it", Escape, or a backdrop click.
 */
export function GuestHintModal() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Reading storage/focus state must happen on the client, after hydration.
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(GUEST_HINT_SESSION_KEY) === '1';
    } catch {
      // Storage can be unavailable (private mode) — still show the explainer.
      seen = false;
    }
    if (!seen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(true);
    }
  }, []);

  const dismiss = useCallback(() => {
    setOpen(false);
    try {
      window.sessionStorage.setItem(GUEST_HINT_SESSION_KEY, '1');
    } catch {
      // Dismissing works even when storage is unavailable.
    }
  }, []);

  // While open: pause the green link hints, lock scrolling, move focus to the
  // CTA, keep Tab inside the dialog, close on Escape, and restore focus/scroll
  // when it closes (which also releases the hints).
  useEffect(() => {
    if (!open) return;

    window.dispatchEvent(new Event(GUEST_HINT_HOLD_EVENT));

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    buttonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        dismiss();
        return;
      }
      if (event.key === 'Tab') {
        // The dialog has a single focusable control — keep focus on it.
        event.preventDefault();
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
      // Dismissed (or unmounted): let the hints start.
      window.dispatchEvent(new Event(GUEST_HINT_RELEASE_EVENT));
    };
  }, [open, dismiss]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-hint-modal-title"
        aria-describedby="guest-hint-modal-body"
        className="w-full max-w-[min(92vw,420px)] rounded-lg border border-[#e3a64e]/40 bg-[#3a3c4e] p-6 text-[#c5d7e2] shadow-2xl"
        style={fontSans3}
      >
        <p className="text-[11px] font-semibold tracking-[0.18em] text-[#e3a64e] uppercase">
          Preview mode
        </p>

        <h2 id="guest-hint-modal-title" className="mt-2 text-xl font-semibold text-[#dbe7ee]">
          Green outlines are a preview aid
        </h2>

        <p id="guest-hint-modal-body" className="mt-3 text-[15px] leading-relaxed">
          The flashing green outlines mark links and buttons that are active while the site is open
          for review; placeholder links stay dark; it is not part of the normal website interface.
        </p>

        {/* Sample of the real hint styling, so the explanation is visual. */}
        <div className="mt-5 flex items-center gap-3">
          <span
            aria-hidden="true"
            className="inline-flex items-center rounded-md px-3 py-1 text-[13px] font-semibold text-[#c5d7e2]"
            style={{
              outline: '2px solid rgba(0, 216, 10, 0.85)',
              outlineOffset: '2px',
              backgroundColor: 'rgba(0, 216, 10, 0.12)',
              boxShadow: '0 0 18px 3px rgba(0, 216, 10, 0.35)',
            }}
          >
            Live link or button
          </span>
        </div>

        <button
          ref={buttonRef}
          type="button"
          data-guest-hint-skip
          onClick={dismiss}
          className="mt-6 w-full rounded-lg bg-[#8c8fd0] px-4 py-2.5 font-semibold text-[#0b1424] transition hover:bg-[#9a9ddb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e3a64e]"
          style={fontSans3}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
