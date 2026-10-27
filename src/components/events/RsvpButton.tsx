'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';

import { cancelRsvpAction, rsvpToEventAction, type RsvpActionResult } from '@/lib/eventRsvpActions';

type Props = {
  eventId: number;
  signedIn: boolean;
  initialRsvped: boolean;
  /** `card` = dark homepage card styling, `page` = event detail page styling. */
  variant?: 'card' | 'page';
};

const STYLES = {
  card: {
    font: { fontFamily: 'var(--font-source-sans-3), sans-serif' },
    button:
      'mt-3 inline-block rounded-md border border-[#c5d7e2]/80 px-4 py-1 text-xl text-[#c5d7e2] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60',
    row: 'mt-3 flex flex-wrap items-center gap-3',
    status: 'text-xl text-[#c5d7e2]',
    secondary: 'text-lg text-[#c5d7e2] underline underline-offset-2 hover:text-white',
    link: 'mt-3 inline-block text-lg text-[#c5d7e2] underline underline-offset-2 hover:text-white',
    error: 'mt-2 text-lg text-[#e3a64e]',
  },
  page: {
    font: undefined,
    button:
      'inline-block w-full sm:w-auto text-center rounded-lg bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60',
    row: 'flex flex-wrap items-center gap-3',
    status: 'text-sm font-semibold text-emerald-800',
    secondary:
      'text-sm font-medium text-emerald-700 underline underline-offset-2 hover:text-emerald-900',
    link: 'text-sm font-medium text-emerald-700 underline underline-offset-2 hover:text-emerald-900',
    error: 'mt-2 text-sm text-red-700',
  },
} as const;

export function RsvpButton({ eventId, signedIn, initialRsvped, variant = 'card' }: Props) {
  const styles = STYLES[variant];
  const [rsvped, setRsvped] = useState(initialRsvped);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!signedIn) {
    return (
      <Link href="/login" className={styles.link} style={styles.font}>
        Log in to RSVP
      </Link>
    );
  }

  const run = (action: (id: number) => Promise<RsvpActionResult>) => {
    setError(null);
    startTransition(async () => {
      const result = await action(eventId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setRsvped(Boolean(result.rsvped));
    });
  };

  if (rsvped) {
    return (
      <div className={styles.row} style={styles.font}>
        <span className={styles.status}>You&rsquo;re in ✓</span>
        <button
          className={styles.secondary}
          disabled={pending}
          onClick={() => run(cancelRsvpAction)}
          type="button"
        >
          {pending ? 'Saving…' : 'Cancel RSVP'}
        </button>
        {error ? <p className={styles.error}>{error}</p> : null}
      </div>
    );
  }

  return (
    <>
      <button
        className={styles.button}
        disabled={pending}
        onClick={() => run(rsvpToEventAction)}
        style={styles.font}
        type="button"
      >
        {pending ? 'Saving…' : 'RSVP'}
      </button>
      {error ? (
        <p className={styles.error} style={styles.font}>
          {error}
        </p>
      ) : null}
    </>
  );
}

export default RsvpButton;
