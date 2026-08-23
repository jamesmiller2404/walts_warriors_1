import { CallToAction } from '@/components/home/CallToAction'
import { Hero } from '@/components/home/Hero'
import { NavCards } from '@/components/home/NavCards'
import { ContentBlocks } from '@/components/blocks/ContentBlocks'
import { Container } from '@/components/layout/Container'
import { ProgramCard } from '@/components/programs/ProgramCard'
import { getPayloadClient } from '@/lib/payload'
import { RichText } from '@/lib/richText'
import { mediaUrl } from '@/lib/utils'
import type { HomePage, Media, Program, Quote, SiteSetting } from '@/payload-types'

export default async function Home() {
  const payload = await getPayloadClient()

  const [home, settings, quoteSettings] = await Promise.all([
    payload.findGlobal({ slug: 'home-page', depth: 2 }) as Promise<HomePage>,
    payload.findGlobal({ slug: 'site-settings', depth: 1 }) as Promise<SiteSetting>,
    payload.findGlobal({ slug: 'quote-settings', depth: 0 }),
  ])

  const quotesResult = await payload.find({
    collection: 'quotes',
    where: { active: { equals: true } },
    sort: 'order',
    limit: 100,
    depth: 0,
  })
  const quotes = (quotesResult.docs as Quote[]).map((q) => ({
    id: q.id,
    quote: q.quote,
    attribution: q.attribution,
  }))
  const rotationMode = quoteSettings?.rotationMode || 'day'

  let programs: Program[] = []

  const featured = home.featuredPrograms
  if (Array.isArray(featured) && featured.length > 0 && typeof featured[0] === 'object') {
    programs = featured as Program[]
  } else {
    const result = await payload.find({
      collection: 'programs',
      where: { published: { equals: true } },
      sort: 'order',
      limit: 6,
      depth: 1,
    })
    programs = result.docs as Program[]
  }

  const bgImage = home.backgroundImage as Media | null | undefined
  const bgSrc = mediaUrl(bgImage)
  const bgOpacity = typeof home.backgroundOpacity === 'number' ? Math.max(0, Math.min(100, home.backgroundOpacity)) : 100

  return (
    <>
      <Hero home={home} settings={settings} />

      <div className="relative">
        {bgSrc && (
          <div
            className="absolute inset-0 z-0 bg-contain bg-top bg-no-repeat md:bg-auto"
            style={{
              backgroundImage: `url(${bgSrc})`,
              opacity: bgOpacity / 100,
            }}
          />
        )}
        <Container className="relative z-10 space-y-16 py-10">
          {home.introduction ? (
            <Container size="narrow" className="text-center">
              <RichText
                data={home.introduction as Parameters<typeof RichText>[0]['data']}
                className="text-lg leading-relaxed text-stone-700"
              />
            </Container>
          ) : null}

          {home.contentBlocks ? (
            <ContentBlocks
              blocks={home.contentBlocks as any}
              quotes={quotes}
              rotationMode={rotationMode}
            />
          ) : null}

          {programs.length > 0 ? (
            <section>
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-stone-900">Programs & Services</h2>
                <p className="mt-2 text-stone-600">Ways we help you thrive</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {programs.map((program) => (
                  <ProgramCard key={program.id} program={program} />
                ))}
              </div>
            </section>
          ) : null}

          <NavCards />

          {/* CallToAction removed per request */}
        </Container>
      </div>
    </>
  )
}
