import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Container } from '@/components/layout/Container'
import { getPayloadClient } from '@/lib/payload'
import { RichText } from '@/lib/richText'
import { mediaUrl } from '@/lib/utils'
import type { Challenge, Media } from '@/payload-types'

type Props = {
  params: Promise<{ slug: string }>
}

async function getChallenge(slug: string): Promise<Challenge | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'challenges',
    where: {
      and: [
        { slug: { equals: slug } },
        { status: { in: ['upcoming', 'active', 'completed'] } },
      ],
    },
    limit: 1,
    depth: 1,
  })
  return (result.docs[0] as Challenge | undefined) ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const challenge = await getChallenge(slug)
  if (!challenge) return { title: 'Challenge' }
  return { title: challenge.title, description: challenge.summary || undefined }
}

export default async function ChallengeDetailPage({ params }: Props) {
  const { slug } = await params
  const challenge = await getChallenge(slug)
  if (!challenge) notFound()

  const image = challenge.image as Media | null | undefined
  const src = mediaUrl(image)
  const range =
    challenge.startDate || challenge.endDate
      ? [
          challenge.startDate
            ? new Date(challenge.startDate).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : null,
          challenge.endDate
            ? new Date(challenge.endDate).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : null,
        ]
          .filter(Boolean)
          .join(' – ')
      : null

  return (
    <Container as="article" size="narrow" className="py-12">
      <Link
        href="/challenges"
        className="text-sm font-medium text-emerald-700 hover:text-emerald-900"
      >
        ← All challenges
      </Link>
      <h1 className="mt-4 text-4xl font-bold tracking-tight text-stone-900">{challenge.title}</h1>
      {range ? <p className="mt-3 text-sm font-medium text-emerald-700">{range}</p> : null}
      {challenge.summary ? <p className="mt-4 text-lg text-stone-600">{challenge.summary}</p> : null}

      {src ? (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl bg-stone-100">
          <Image
            src={src}
            alt={image?.alt || challenge.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        </div>
      ) : null}

      <div className="prose prose-stone mt-10 max-w-none">
        <RichText data={challenge.description as Parameters<typeof RichText>[0]['data']} />
      </div>

      {challenge.joinUrl ? (
        <div className="mt-10">
          <a
            href={challenge.joinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            Join this challenge
          </a>
        </div>
      ) : (
        <div className="mt-10">
          <Link
            href="/contact"
            className="inline-block rounded-lg bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            Get involved
          </Link>
        </div>
      )}
    </Container>
  )
}
