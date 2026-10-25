'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { forgotPasswordAction } from '@/lib/authActions';
import { buttonClass, fieldLabelClass, FormMessage, inputClass } from './formStyles';

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, {});

  return (
    <form action={formAction} className="space-y-5">
      <FormMessage error={state.error} success={state.success} />

      <div>
        <label htmlFor="email" className={fieldLabelClass}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
        />
      </div>

      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? 'Sending…' : 'Send reset link'}
      </button>

      <p className="text-center text-sm text-stone-600">
        Remembered your password?{' '}
        <Link href="/login" className="font-medium text-emerald-700 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
