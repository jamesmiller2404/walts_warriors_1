'use client';

import { useActionState } from 'react';

import { resetPasswordAction } from '@/lib/authActions';
import { buttonClass, fieldLabelClass, FormMessage, inputClass } from './formStyles';

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, {});

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="token" value={token} />
      <FormMessage error={state.error} success={state.success} />

      <div>
        <label htmlFor="password" className={fieldLabelClass}>
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
        <p className="mt-1 text-xs text-stone-500">At least 8 characters.</p>
      </div>

      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? 'Resetting…' : 'Set new password'}
      </button>
    </form>
  );
}
