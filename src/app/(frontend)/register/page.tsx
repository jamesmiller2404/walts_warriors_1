import type { Metadata } from 'next'

import { RegisterForm } from '@/components/auth/RegisterForm'
import { Container } from '@/components/layout/Container'

export const metadata: Metadata = {
  title: 'Sign up',
}

export default function RegisterPage() {
  return (
    <Container size="narrow" className="py-12 sm:py-16">
      <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm sm:p-10">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">Join Walt&apos;s Warriors</h1>
        <p className="mt-2 text-stone-600">
          Create a free account to check in daily, build streaks, and earn badges.
        </p>

        <div className="mt-8">
          <RegisterForm />
        </div>
      </div>
    </Container>
  )
}
