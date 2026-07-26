import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { Container } from '@/components/layout/Container'
import { PageHeader } from '@/components/layout/PageHeader'
import { getPayloadClient } from '@/lib/payload'
import { mediaUrl } from '@/lib/utils'
import type { Challenge, Media } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Challenges',
}

const statusLabel: Record<string, string> = {
  upcoming: 'Upcoming',
  active: 'Active',
  completed: 'Completed',
}

export default async function ChallengesPage() {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'challenges',
    where: {
      status: {
        in: ['upcoming', 'active', 'completed'],
      },
    },
    sort: '-startDate',
    limit: 50,
    depth: 1,
  })
  const challenges = result.docs as Challenge[]

  return (
    <Container className="py-6 sm:py-8 lg:py-12">
      <PageHeader
        title="Challenges"
        subtitle="Community challenges that inspire lasting positive change."
      />

      {challenges.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {challenges.map((challenge) => {
            const image = challenge.image as Media | null | undefined
            const src = mediaUrl(image, 'card')
            const label = statusLabel[challenge.status] || challenge.status

            return (
              <article
                key={challenge.id}
                className="flex h-full flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm"
              >
                <div className="relative aspect-[16/10] bg-stone-100">
                  {src ? (
                    <Image
                      src={src}
                      alt={image?.alt || challenge.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-stone-400">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    {label}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-stone-900">
                    <Link
                      href={`/challenges/${challenge.slug}`}
                      className="hover:text-emerald-800"
                    >
                      {challenge.title}
                    </Link>
                  </h2>
                  {challenge.summary ? (
                    <p className="mt-2 flex-1 text-sm text-stone-600">{challenge.summary}</p>
                  ) : (
                    <div className="flex-1" />
                  )}
                  <Link
                    href={`/challenges/${challenge.slug}`}
                    className="mt-4 text-sm font-medium text-emerald-700 hover:text-emerald-900"
                  >
                    View challenge →
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-stone-300 bg-white p-10 text-center text-stone-600">
          No challenges yet. Add them in{' '}
          <Link
            href="/admin/collections/challenges"
            className="font-medium text-emerald-700 underline"
          >
            Admin → Challenges
          </Link>
          .
        </div>
      )}
    </Container>
  )
}
