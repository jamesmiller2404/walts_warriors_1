import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Container } from '@/components/layout/Container'
import { getPayloadClient } from '@/lib/payload'
import { RichText } from '@/lib/richText'
import { mediaUrl } from '@/lib/utils'
import type { Event, Media } from '@/payload-types'

type Props = {
  params: Promise<{ slug: string }>
}

async function getEvent(slug: string): Promise<Event | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'events',
    where: {
      and: [{ slug: { equals: slug } }, { published: { equals: true } }],
    },
    limit: 1,
    depth: 1,
  })
  return (result.docs[0] as Event | undefined) ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const event = await getEvent(slug)
  if (!event) return { title: 'Event' }
  return { title: event.title, description: event.summary || undefined }
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params
  const event = await getEvent(slug)
  if (!event) notFound()

  const image = event.image as Media | null | undefined
  const src = mediaUrl(image, 'hero')
  const start = event.startDate
    ? new Date(event.startDate).toLocaleString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : null

  return (
    <Container size="narrow" className="py-6 sm:py-8 lg:py-12">
      <Link href="/events" className="text-sm font-medium text-emerald-700 hover:text-emerald-900">
        ← All events
      </Link>
      <h1 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-stone-900 break-words">{event.title}</h1>
      {start ? <p className="mt-3 text-sm font-medium text-emerald-700">{start}</p> : null}
      {event.location ? <p className="mt-1 text-stone-600">{event.location}</p> : null}
      {event.summary ? <p className="mt-4 text-lg text-stone-600">{event.summary}</p> : null}

      {src ? (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl bg-stone-100">
          <Image
            src={src}
            alt={image?.alt || event.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        </div>
      ) : null}

      {event.description ? (
        <div className="prose prose-stone prose-sm md:prose-base mt-10 max-w-none">
          <RichText data={event.description as Parameters<typeof RichText>[0]['data']} />
        </div>
      ) : null}

      {event.registrationUrl ? (
        <div className="mt-10">
          <a
            href={event.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full sm:w-auto text-center rounded-lg bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            Register
          </a>
        </div>
      ) : null}
    </Container>
  )
}
