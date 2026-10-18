'use client'

import Link from 'next/link'
import { useActionState } from 'react'

import { registerAction } from '@/lib/authActions'
import { buttonClass, fieldLabelClass, FormMessage, inputClass } from './formStyles'

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, {})

  return (
    <form action={formAction} className="space-y-5">
      <FormMessage error={state.error} success={state.success} />

      <div>
        <label htmlFor="displayName" className={fieldLabelClass}>
          Display name
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          required
          maxLength={60}
          autoComplete="name"
          className={inputClass}
        />
      </div>

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

      <div>
        <label htmlFor="password" className={fieldLabelClass}>
          Password
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
        {pending ? 'Creating account…' : 'Sign up'}
      </button>

      <p className="text-center text-sm text-stone-600">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-emerald-700 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  )
}
