import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { Container } from '@/components/layout/Container'
import { PageHeader } from '@/components/layout/PageHeader'
import { getPayloadClient } from '@/lib/payload'
import { mediaUrl } from '@/lib/utils'
import type { Event, Media } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Events',
}

function formatEventDate(start?: string | null, end?: string | null) {
  if (!start) return null
  const startDate = new Date(start)
  const startLabel = startDate.toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
  if (!end) return startLabel
  const endDate = new Date(end)
  const endLabel = endDate.toLocaleString(undefined, {
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
  return `${startLabel} – ${endLabel}`
}

export default async function EventsPage() {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'events',
    where: { published: { equals: true } },
    sort: 'startDate',
    limit: 50,
    depth: 1,
  })
  const events = result.docs as Event[]

  return (
    <Container className="py-6 sm:py-8 lg:py-12">
      <PageHeader
        title="Events"
        subtitle="Community gatherings, workshops, and wellness meetups."
      />

      {events.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {events.map((event) => {
            const image = event.image as Media | null | undefined
            const src = mediaUrl(image, 'card')
            const when = formatEventDate(event.startDate, event.endDate)

            return (
              <article
                key={event.id}
                className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm"
              >
                {src ? (
                  <div className="relative aspect-[16/9]">
                    <Image
                      src={src}
                      alt={image?.alt || event.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                ) : null}
                <div className="p-5">
                  {when ? (
                    <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                      {when}
                    </p>
                  ) : null}
                  <h2 className="mt-1 text-xl font-semibold text-stone-900">
                    <Link href={`/events/${event.slug}`} className="hover:text-emerald-800">
                      {event.title}
                    </Link>
                  </h2>
                  {event.location ? (
                    <p className="mt-1 text-sm text-stone-500">{event.location}</p>
                  ) : null}
                  {event.summary ? (
                    <p className="mt-2 text-sm text-stone-600">{event.summary}</p>
                  ) : null}
                  <Link
                    href={`/events/${event.slug}`}
                    className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:text-emerald-900"
                  >
                    Event details →
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-stone-300 bg-white p-10 text-center text-stone-600">
          No events yet. Add them in{' '}
          <Link href="/admin/collections/events" className="font-medium text-emerald-700 underline">
            Admin → Events
          </Link>
          .
        </div>
      )}
    </Container>
  )
}
