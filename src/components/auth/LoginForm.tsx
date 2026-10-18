'use client'

import Link from 'next/link'
import { useActionState } from 'react'

import { loginAction } from '@/lib/authActions'
import { buttonClass, fieldLabelClass, FormMessage, inputClass } from './formStyles'

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, {})

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

      <div>
        <label htmlFor="password" className={fieldLabelClass}>
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </div>

      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? 'Logging in…' : 'Log in'}
      </button>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <Link href="/forgot-password" className="font-medium text-emerald-700 hover:underline">
          Forgot password?
        </Link>
        <Link href="/register" className="font-medium text-emerald-700 hover:underline">
          Create an account
        </Link>
      </div>
    </form>
  )
}
