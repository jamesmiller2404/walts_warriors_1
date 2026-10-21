import type { Metadata } from 'next'
import { cookies } from 'next/headers'

import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'
import { Container } from '@/components/layout/Container'

export const metadata: Metadata = {
  title: 'Reset password',
}

export default async function ResetPasswordPage() {
  // The token arrives via the /reset-password/link Route Handler, which
  // exchanges the URL token for a short-lived httpOnly cookie. Server
  // Components cannot set cookies during render, so the exchange must not
  // happen here — we only read the cookie.
  const cookieStore = await cookies()
  const token = cookieStore.get('pw-reset-token')?.value || ''

  return (
    <Container size="narrow" className="py-12 sm:py-16">
      <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm sm:p-10">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">Choose a new password</h1>
        <p className="mt-2 text-stone-600">It must be at least 8 characters.</p>

        {token ? (
          <div className="mt-8">
            <ResetPasswordForm token={token} />
          </div>
        ) : (
          <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            This reset link is invalid or has expired. Request a new one.
          </p>
        )}
      </div>
    </Container>
  )
}
