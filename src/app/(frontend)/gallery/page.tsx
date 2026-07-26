import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { Container } from '@/components/layout/Container'
import { PageHeader } from '@/components/layout/PageHeader'
import { getPayloadClient } from '@/lib/payload'
import { mediaUrl } from '@/lib/utils'
import type { Gallery, Media } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Gallery',
}

export default async function GalleryPage() {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'gallery',
    sort: 'order',
    limit: 100,
    depth: 1,
  })
  const items = result.docs as Gallery[]

  return (
    <Container className="py-6 sm:py-8 lg:py-12">
      <PageHeader
        title="Gallery"
        subtitle="Moments from the community, events, challenges, and everyday wins."
      />

      {items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const image = item.image as Media | null | undefined
            const src = mediaUrl(image, 'card')
            if (!src) return null
            return (
              <figure
                key={item.id}
                className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={src}
                    alt={image?.alt || item.caption || 'Gallery image'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                {item.caption ? (
                  <figcaption className="px-4 py-3 text-sm text-stone-600">{item.caption}</figcaption>
                ) : null}
              </figure>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-stone-300 bg-white p-10 text-center text-stone-600">
          No gallery images yet. Upload them in{' '}
          <Link href="/admin/collections/gallery" className="font-medium text-emerald-700 underline">
            Admin → Gallery
          </Link>
          .
        </div>
      )}
    </Container>
  )
}
