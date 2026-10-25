import { Hero } from '@/components/home/Hero';
import { CheckInStrip } from '@/components/home/CheckInStrip';
import { ChallengeGroupToday } from '@/components/home/ChallengeGroupToday';
import { ComingUp } from '@/components/home/ComingUp';
import { ThisWeekInLibrary } from '@/components/home/ThisWeekInLibrary';
import { AskWalt } from '@/components/home/AskWalt';
import { NextChallenge } from '@/components/home/NextChallenge';
import { WinsFromChallengeGroup } from '@/components/home/WinsFromChallengeGroup';
import { getPayloadClient } from '@/lib/payload';
import { getCurrentMember } from '@/lib/auth';
import { mediaUrl } from '@/lib/utils';
import Image from 'next/image';
import type { HomePage, Media, Program, SiteSetting } from '@/payload-types';

export default async function Home() {
  const payload = await getPayloadClient();

  const [home, settings, member] = await Promise.all([
    payload.findGlobal({ slug: 'home-page', depth: 2 }) as Promise<HomePage>,
    payload.findGlobal({ slug: 'site-settings', depth: 1 }) as Promise<SiteSetting>,
    getCurrentMember(),
  ]);

  let programs: Program[] = [];

  const featured = home.featuredPrograms;
  if (Array.isArray(featured) && featured.length > 0 && typeof featured[0] === 'object') {
    programs = featured as Program[];
  } else {
    const result = await payload.find({
      collection: 'programs',
      where: { published: { equals: true } },
      sort: 'order',
      limit: 6,
      depth: 1,
    });
    programs = result.docs as Program[];
  }

  const bgImage = home.backgroundImage as Media | null | undefined;
  const bgSrc = mediaUrl(bgImage);
  const bgOpacity =
    typeof home.backgroundOpacity === 'number'
      ? Math.max(0, Math.min(100, home.backgroundOpacity))
      : 100;

  return (
    <>
      {/* Preload the LCP hero image so the browser starts fetching before the
      Hero component renders. The media queries mirror the <picture> markup in
      Hero.tsx, so only the correct crop + resolution variant is fetched. */}
      <link
        rel="preload"
        as="image"
        media="(max-width: 767px)"
        imageSrcSet="/images/hero/hero-mobile_1x.webp 1x, /images/hero/hero-mobile_2x.webp 2x"
        imageSizes="100vw"
      />
      <link
        rel="preload"
        as="image"
        media="(min-width: 768px)"
        imageSrcSet="/images/hero/hero_1x.webp 1x, /images/hero/hero_2x.webp 2x"
        imageSizes="100vw"
      />
      <Hero home={home} settings={settings} member={member} />

      <CheckInStrip />

      <div
        className="relative pb-10"
        style={{ backgroundImage: 'linear-gradient(45deg, #0f1d2e, #182e49)' }}
      >
        <section className="w-full" aria-label="Home updates">
          {/* 1440px design canvas — cards right-aligned, with the challenge-group
          column on the left. On mobile the columns stack with the challenge-group
          cards first. */}
          <div className="mx-auto max-w-[1440px] px-4 pt-6 sm:px-8 lg:px-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-end lg:gap-7">
              {/* Left column — challenge group cards (wide) */}
              <div className="flex w-full flex-col gap-6 lg:max-w-[1020px]">
                <ChallengeGroupToday />
                <WinsFromChallengeGroup />
              </div>

              {/* Right column — smaller cards (narrow) */}
              <div className="flex w-full flex-col gap-6 lg:w-[340px] lg:shrink-0">
                <ThisWeekInLibrary />
                <ComingUp />
                <AskWalt />
                <NextChallenge />
              </div>
            </div>
          </div>
        </section>

        {/* Soldier background image disabled per request — kept for possible later use
        {bgSrc && (
          <div className="absolute inset-0 z-0 bg-[#0b0c0f]">
            <Image
              src={bgSrc}
              alt=""
              fill
              priority
              className="object-contain object-top"
              sizes="100vw"
              style={{ opacity: bgOpacity / 100 }}
            />
          </div>
        )}
        */}

        {/* Content blocks, program cards, and navigation cards disabled per request — kept for possible later use
        <Container className="relative z-10 space-y-16 py-10">
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
        </Container>
        */}
      </div>
    </>
  );
}
