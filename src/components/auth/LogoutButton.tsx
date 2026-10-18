'use client'

import { useTransition } from 'react'

import { logoutAction } from '@/lib/authActions'

export function LogoutButton({ className }: { className?: string }) {
  const [pending, startTransition] = useTransition()

  return (
    <form action={() => startTransition(() => logoutAction())}>
      <button
        type="submit"
        disabled={pending}
        className={className}
      >
        {pending ? 'Logging out…' : 'Log out'}
      </button>
    </form>
  )
}
