import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { Container } from '@/components/layout/Container'
import { PageHeader } from '@/components/layout/PageHeader'
import { getPayloadClient } from '@/lib/payload'
import { RichText } from '@/lib/richText'
import { mediaUrl } from '@/lib/utils'
import type { AboutWalt, Media } from '@/payload-types'

export const metadata: Metadata = {
  title: 'About Walt',
}

export default async function AboutPage() {
  const payload = await getPayloadClient()
  const about = (await payload.findGlobal({
    slug: 'about-walt',
    depth: 1,
  })) as AboutWalt

  const hero = about.heroImage as Media | null | undefined
  const portrait = about.portrait as Media | null | undefined
  const heroSrc = mediaUrl(hero, 'hero')
  const portraitSrc = mediaUrl(portrait, 'thumbnail')

  return (
    <Container className="py-6 sm:py-8 lg:py-12">
      <PageHeader
        title={about.headline || "About Walt's Warriors"}
        subtitle={about.subheadline}
      />

      {heroSrc ? (
        <div className="relative mb-12 aspect-[1920/1440] overflow-hidden rounded-2xl bg-stone-100">
          <Image
            src={heroSrc}
            alt={hero?.alt || about.headline || 'About'}
            fill
            className="object-contain object-center"
            sizes="(max-width: 1152px) 100vw, 1152px"
            priority
          />
        </div>
      ) : null}

      <div className="grid gap-12 lg:grid-cols-[1fr_280px]">
        <div>
          {about.introduction ? (
            <div className="prose prose-stone max-w-none text-stone-700">
              <RichText data={about.introduction as Parameters<typeof RichText>[0]['data']} />
            </div>
          ) : (
            <p className="text-lg leading-relaxed text-stone-700">
              Walt&apos;s Warriors is a health and wellness community dedicated to helping people
              thrive through better nutrition, fitness, mindset, and healthy lifestyle habits.
              Members share practical strategies, encouragement, and real-world experiences that
              inspire lasting positive change.
            </p>
          )}

          {about.philosophy ? (
            <blockquote className="mt-10 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 sm:px-6 py-5 text-xl font-medium italic text-emerald-950">
              &ldquo;{about.philosophy}&rdquo;
            </blockquote>
          ) : null}

          {about.focusAreas && about.focusAreas.length > 0 ? (
            <section className="mt-12">
              <h2 className="text-2xl font-bold tracking-tight text-stone-900">How we help</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {about.focusAreas.map((area, i) => (
                  <div
                    key={area.id || i}
                    className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm"
                  >
                    <h3 className="text-lg font-semibold text-stone-900">{area.title}</h3>
                    {area.description ? (
                      <p className="mt-2 text-sm leading-relaxed text-stone-600">{area.description}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        {portraitSrc ? (
          <aside>
            <div className="sticky top-8 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <div className="relative aspect-square">
                <Image
                  src={portraitSrc}
                  alt={portrait?.alt || 'Walt'}
                  fill
                  className="object-cover"
                  sizes="280px"
                />
              </div>
            </div>
          </aside>
        ) : null}
      </div>

      {!about.introduction && !about.philosophy ? (
        <p className="mt-10 text-sm text-stone-500">
          Edit this page in{' '}
          <Link href="/admin/globals/about-walt" className="font-medium text-emerald-700 underline">
            Admin → About Walt
          </Link>
          .
        </p>
      ) : null}
    </Container>
  )
}
