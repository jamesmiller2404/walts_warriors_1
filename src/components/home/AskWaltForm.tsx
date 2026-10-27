'use client';

import Link from 'next/link';
import { useActionState, useEffect, useRef } from 'react';

import { submitAskWaltQuestionAction } from '@/lib/askWaltActions';

const fontSans3 = { fontFamily: 'var(--font-source-sans-3), sans-serif' };

type Props = {
  signedIn: boolean;
  placeholder: string;
  maxLength: number;
};

export function AskWaltForm({ signedIn, placeholder, maxLength }: Props) {
  const [state, formAction, pending] = useActionState(submitAskWaltQuestionAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the textarea once the question is saved.
  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  if (!signedIn) {
    return (
      <p className="mt-4 text-xl text-[#c5d7e2]" style={fontSans3}>
        <Link href="/login" className="underline underline-offset-2 hover:text-white">
          Log in
        </Link>{' '}
        to send Walt your question.
      </p>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="mt-4">
      <textarea
        name="question"
        rows={3}
        required
        maxLength={maxLength}
        aria-label={placeholder}
        placeholder={placeholder}
        className="w-full resize-none rounded-md bg-[#c5d7e2] px-4 py-3 text-xl text-[#2c353b] placeholder:text-[#2c353b]/60 focus:outline-none focus:ring-2 focus:ring-[#e3a64e]"
        style={fontSans3}
      />

      {state.error ? (
        <p role="status" className="mt-2 text-lg text-[#e3a64e]" style={fontSans3}>
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p role="status" className="mt-2 text-lg text-[#c5d7e2]" style={fontSans3}>
          {state.success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-3 inline-block rounded-md border border-[#c5d7e2]/80 px-4 py-1 text-xl text-[#c5d7e2] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        style={fontSans3}
      >
        {pending ? 'Sending…' : 'Send'}
      </button>
    </form>
  );
}
