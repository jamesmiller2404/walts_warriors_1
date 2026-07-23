import Image from 'next/image'
import Link from 'next/link'

import type { HomePage, Media, SiteSetting } from '@/payload-types'
import { mediaUrl } from '@/lib/utils'

type Props = {
  home: HomePage
  settings: SiteSetting
}

const nav = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Walt' },
  { href: '/programs', label: 'Programs' },
  { href: '/resources', label: 'Resources' },
  { href: '/challenges', label: 'Challenges' },
  { href: '/events', label: 'Events' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact' },
]

export function Hero({ home, settings }: Props) {
  const image = home.heroImage as Media | null | undefined
  const src = mediaUrl(image)
  const logoSrc = mediaUrl(settings.logo)
  const name = settings.businessName || "Walt's Warriors"

  return (
    <section className="relative mx-auto w-full max-w-[1920px] overflow-hidden bg-stone-900 text-white">
      {src ? (
        <div className="relative w-full aspect-[1920/1440]">
          <Image
            src={src}
            alt={image?.alt || home.headline || 'Hero'}
            fill
            priority
            className="object-contain object-center"
            sizes="(max-width: 1920px) 100vw, 1920px"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      ) : (
        <div className="relative w-full aspect-[1920/1440]">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-stone-900 to-stone-800" />
        </div>
      )}

      {/* Logo + Nav at very top of hero */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 sm:px-12 md:pl-[calc((100%-1152px)/2)] md:pr-[calc((100%-1152px)/2)]">
        <Link href="/" className="flex items-center gap-3">
          {logoSrc ? (
            <Image
              src={logoSrc}
              alt={name}
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white">
              WW
            </span>
          )}
          <span>
            <span className="block text-lg font-semibold tracking-tight text-white">{name}</span>
            {settings.tagline ? (
              <span className="block text-sm text-stone-300">{settings.tagline}</span>
            ) : null}
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-1 text-sm font-medium text-white">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 transition hover:bg-white/10"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="absolute inset-0 z-10 flex flex-col justify-center px-6 pt-20 pb-16 sm:px-12 md:pl-[calc((100%-1152px)/2)] md:pr-[calc((100%-1152px)/2)]">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
          Health · Wellness · Community
        </p>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          {home.headline || "Walt's Warriors"}
        </h1>
        {home.subheadline ? (
          <p className="mt-4 max-w-xl text-lg text-stone-200">{home.subheadline}</p>
        ) : null}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/contact"
            className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            Get in touch
          </Link>
          <Link
            href="/programs"
            className="rounded-lg border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
          >
            View programs
          </Link>
        </div>
      </div>
    </section>
  )
}
