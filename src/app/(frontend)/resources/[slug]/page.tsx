import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Container } from '@/components/layout/Container'
import { getPayloadClient } from '@/lib/payload'
import { RichText } from '@/lib/richText'
import { mediaUrl } from '@/lib/utils'
import type { Media, Resource } from '@/payload-types'

type Props = {
  params: Promise<{ slug: string }>
}

async function getResource(slug: string): Promise<Resource | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'resources',
    where: {
      and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }],
    },
    limit: 1,
    depth: 1,
  })
  return (result.docs[0] as Resource | undefined) ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const resource = await getResource(slug)
  if (!resource) return { title: 'Resource' }
  return { title: resource.title }
}

export default async function ResourceDetailPage({ params }: Props) {
  const { slug } = await params
  const resource = await getResource(slug)
  if (!resource) notFound()

  const image = resource.featuredImage as Media | null | undefined
  const src = mediaUrl(image)
  const date = resource.publishedAt
    ? new Date(resource.publishedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <Container size="narrow" className="py-12">
      <Link href="/resources" className="text-sm font-medium text-emerald-700 hover:text-emerald-900">
        ← All resources
      </Link>
      {date ? <p className="mt-4 text-sm font-medium text-stone-500">{date}</p> : null}
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-stone-900">{resource.title}</h1>

      {src ? (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl bg-stone-100">
          <Image
            src={src}
            alt={image?.alt || resource.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        </div>
      ) : null}

      <div className="prose prose-stone mt-10 max-w-none">
        <RichText data={resource.content as Parameters<typeof RichText>[0]['data']} />
      </div>
    </Container>
  )
}
