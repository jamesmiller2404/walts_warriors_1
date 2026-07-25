import { CallToAction } from '@/components/home/CallToAction'
import { Hero } from '@/components/home/Hero'
import { ContentBlocks } from '@/components/blocks/ContentBlocks'
import { Container } from '@/components/layout/Container'
import { ProgramCard } from '@/components/programs/ProgramCard'
import { getPayloadClient } from '@/lib/payload'
import { RichText } from '@/lib/richText'
import { mediaUrl } from '@/lib/utils'
import type { HomePage, Media, Program, SiteSetting } from '@/payload-types'

export default async function Home() {
  const payload = await getPayloadClient()

  const [home, settings] = await Promise.all([
    payload.findGlobal({ slug: 'home-page', depth: 2 }) as Promise<HomePage>,
    payload.findGlobal({ slug: 'site-settings', depth: 1 }) as Promise<SiteSetting>,
  ])

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
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${bgSrc})`,
              backgroundSize: 'cover',
              backgroundPosition: 'top center',
              backgroundRepeat: 'no-repeat',
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
            <ContentBlocks blocks={home.contentBlocks as any} />
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
          ) : (
            <section className="rounded-xl border border-dashed border-stone-300 bg-white p-10 text-center">
              <h2 className="text-xl font-semibold text-stone-800">Programs coming soon</h2>
              <p className="mt-2 text-stone-600">
                Add programs in the{' '}
                <a href="/admin" className="font-medium text-emerald-700 underline">
                  admin panel
                </a>
                .
              </p>
            </section>
          )}

          <CallToAction cta={home.cta} />
        </Container>
      </div>
    </>
  )
}
