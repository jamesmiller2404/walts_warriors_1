import type { Metadata } from 'next'

import { LoginForm } from '@/components/auth/LoginForm'
import { Container } from '@/components/layout/Container'

export const metadata: Metadata = {
  title: 'Log in',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string; reset?: string }>
}) {
  const params = await searchParams

  return (
    <Container size="narrow" className="py-12 sm:py-16">
      <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm sm:p-10">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">Log in</h1>
        <p className="mt-2 text-stone-600">Welcome back, Warrior.</p>

        {params.verified === '1' ? (
          <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Your email is verified — you can log in now.
          </p>
        ) : null}
        {params.reset === '1' ? (
          <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Password updated. Log in with your new password.
          </p>
        ) : null}

        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </Container>
  )
}
