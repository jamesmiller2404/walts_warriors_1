import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Container } from '@/components/layout/Container'
import { getPayloadClient } from '@/lib/payload'
import { RichText } from '@/lib/richText'
import { mediaUrl } from '@/lib/utils'
import type { Media, Program } from '@/payload-types'

type Props = {
  params: Promise<{ slug: string }>
}

async function getProgram(slug: string): Promise<Program | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'programs',
    where: {
      and: [{ slug: { equals: slug } }, { published: { equals: true } }],
    },
    limit: 1,
    depth: 1,
  })
  return (result.docs[0] as Program | undefined) ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const program = await getProgram(slug)
  if (!program) return { title: 'Program' }
  return {
    title: program.name,
    description: program.summary || undefined,
  }
}

export default async function ProgramDetailPage({ params }: Props) {
  const { slug } = await params
  const program = await getProgram(slug)
  if (!program) notFound()

  const image = program.image as Media | null | undefined
  const src = mediaUrl(image)

  return (
    <Container size="wide" className="py-12">
      <Link href="/programs" className="text-sm font-medium text-emerald-700 hover:text-emerald-900">
        ← All programs
      </Link>

      <h1 className="mt-4 text-4xl font-bold tracking-tight text-stone-900">{program.name}</h1>
      {program.summary ? <p className="mt-3 text-lg text-stone-600">{program.summary}</p> : null}

      {src ? (
        <div className="relative mt-8 aspect-[21/9] overflow-hidden rounded-2xl bg-stone-100">
          <Image
            src={src}
            alt={image?.alt || program.name}
            fill
            className="object-cover"
            sizes="(max-width: 896px) 100vw, 896px"
            priority
          />
        </div>
      ) : null}

      {program.pricing?.showPrice && program.pricing.priceLabel ? (
        <div className="mt-8 rounded-xl border border-emerald-100 bg-emerald-50 px-5 py-4">
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-800">Details</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-900">{program.pricing.priceLabel}</p>
          {program.pricing.priceNote ? (
            <p className="mt-1 text-sm text-emerald-800/80">{program.pricing.priceNote}</p>
          ) : null}
        </div>
      ) : null}

      <div className="prose prose-stone mt-10 max-w-none">
        <RichText data={program.description as Parameters<typeof RichText>[0]['data']} />
      </div>

      <div className="mt-12">
        <Link
          href="/contact"
          className="inline-block rounded-lg bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-600"
        >
          Learn more
        </Link>
      </div>
    </Container>
  )
}
