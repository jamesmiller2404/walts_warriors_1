import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { Container } from '@/components/layout/Container'
import { PageHeader } from '@/components/layout/PageHeader'
import { getPayloadClient } from '@/lib/payload'
import { mediaUrl } from '@/lib/utils'
import type { Media, Resource } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Resources & Articles',
}

export default async function ResourcesPage() {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'resources',
    where: { status: { equals: 'published' } },
    sort: '-publishedAt',
    limit: 50,
    depth: 1,
  })
  const resources = result.docs as Resource[]

  return (
    <Container className="py-6 sm:py-8 lg:py-12">
      <PageHeader
        title="Resources & Articles"
        subtitle="Practical strategies and encouragement for lasting positive change."
      />

      {resources.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {resources.map((resource) => {
            const image = resource.featuredImage as Media | null | undefined
            const src = mediaUrl(image, 'card')
            const date = resource.publishedAt
              ? new Date(resource.publishedAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : null

            return (
              <article
                key={resource.id}
                className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm"
              >
                {src ? (
                  <div className="relative aspect-[16/9]">
                    <Image
                      src={src}
                      alt={image?.alt || resource.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                ) : null}
                <div className="p-5">
                  {date ? (
                    <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                      {date}
                    </p>
                  ) : null}
                  <h2 className="mt-1 text-xl font-semibold text-stone-900">
                    <Link href={`/resources/${resource.slug}`} className="hover:text-emerald-800">
                      {resource.title}
                    </Link>
                  </h2>
                  {resource.summary ? (
                    <p className="mt-2 text-sm text-stone-600">{resource.summary}</p>
                  ) : null}
                  <Link
                    href={`/resources/${resource.slug}`}
                    className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:text-emerald-900"
                  >
                    Read more →
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-stone-300 bg-white p-10 text-center text-stone-600">
          No articles yet. Create one in{' '}
          <Link href="/admin/collections/resources" className="font-medium text-emerald-700 underline">
            Admin → Resources / Articles
          </Link>
          .
        </div>
      )}
    </Container>
  )
}
