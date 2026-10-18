import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Container } from '@/components/layout/Container'
import { getPayloadClient } from '@/lib/payload'

export const metadata: Metadata = {
  title: 'Verify your email',
}

export default async function VerifyEmailPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  try {
    const payload = await getPayloadClient()
    await payload.verifyEmail({ collection: 'members', token })
  } catch {
    // Invalid or expired token — render the failure state below.
    return (
      <Container size="narrow" className="py-12 sm:py-16">
        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm sm:p-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">Verification failed</h1>
          <p className="mt-3 text-stone-600">
            This verification link is invalid or has already been used.
          </p>
          <p className="mt-6">
            <Link
              href="/login"
              className="inline-block rounded-[999px] bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Back to log in
            </Link>
          </p>
        </div>
      </Container>
    )
  }

  redirect('/login?verified=1')
}
