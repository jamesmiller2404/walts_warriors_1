'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import type { HomePage, SiteSetting } from '@/payload-types'
import { mediaUrl } from '@/lib/utils'

type Props = {
  home: HomePage
  settings: SiteSetting
  authSlot?: ReactNode
}

// Placeholder header-menu links (wire real routes later).
const nav = [
  { href: '/', label: 'Home' },
  { href: '#', label: 'Dashboard' },
  { href: '#', label: 'Challenges' },
  { href: '#', label: 'Community' },
  { href: '#', label: 'Library' },
]

const fontSans3 = { fontFamily: 'var(--font-source-sans-3), sans-serif' }
// Drop shadow cast from a light positioned at a 225° bearing (down-left), so the
// shadow falls toward 45° (up-right). CSS takes x/y offsets, not angles, so the
// bearing is pre-converted: x = +sin(45°) * d, y = -cos(45°) * d — d = 7px
// distance, 6px blur, 0.6 opacity. Used by the headline (text-shadow).
const dropShadowCss = '4.95px -4.95px 6px rgba(0, 0, 0, 0.6)'
const headlineShadow = { textShadow: dropShadowCss }
// Site title — same offset and opacity as the headline, but the offset is pulled
// back 2px (5px distance vs the headline's 7px) and the blur is 2px tighter
// (4px vs 6px), compensating for the smaller glyphs.
const titleShadowCss = '2.54px -2px 3px rgba(0, 0, 0, 0.6)'
// Softer shadow kept for the tagline.
const taglineShadow = { textShadow: '3px 4px 8px rgba(0, 0, 0, 0.35)' }

function MobileMenu() {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative md:hidden">
      <button
        className="rounded-md p-1.5 text-[#13233a] transition hover:bg-white/10 sm:p-2"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {open ? (
        <ul className="absolute top-full right-0 z-30 mt-2 flex w-56 flex-col items-stretch rounded-lg bg-[#13233a]/95 py-2 shadow-xl backdrop-blur-md">
          {nav.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="block px-5 py-2 text-2xl font-bold text-[#c5d7e2] transition hover:bg-white/10"
                style={fontSans3}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export function Hero({ home, settings, authSlot }: Props) {
  const logoSrc = mediaUrl(settings.logo)
  const name = settings.businessName || "Walt's Warriors"

  return (
    <section className="relative flex aspect-square min-h-[390px] w-full flex-col overflow-hidden md:aspect-[3840/1430] md:min-h-[300px] md:max-h-[715px]">
      {/* Static hero background image — art-directed: 1:1 composition on mobile, panoramic on desktop */}
      <div className="absolute inset-0">
        <Image
          src="/images/Header_mobile_1-1_opt.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center md:hidden"
          sizes="100vw"
        />
        <Image
          src="/images/heroBGimage_opt.jpg"
          alt=""
          fill
          priority
          className="hidden object-cover object-center md:block"
          sizes="100vw"
        />
      </div>

      {/* Content wrapper — keeps the composition on the 1440px canvas while the
      background image runs full-bleed behind it */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 flex-col">
      {/* Header row — site title left, bell/account icons right */}
      <div className="relative z-20 flex items-start justify-between px-4 pt-4 sm:px-8 lg:px-10">
        {/* Site title (existing element, reused) */}
        <Link href="/" className="flex min-w-0 items-center gap-2 pl-2 sm:gap-3 sm:pl-0">
          {logoSrc ? (
            <Image
              src={logoSrc}
              alt={name}
              width={48}
              height={48}
              className="h-[30px] w-[30px] shrink-0 rounded-full object-cover sm:h-9 sm:w-9"
            />
          ) : null}
          <span className="-ml-4">
            <span
              className="block"
              style={{
                fontFamily: 'var(--font-archivo-black)',
                fontSize: 'clamp(1rem, 3vw, 1.875rem)',
                // text-shadow (not a drop-shadow filter) so the shadow renders
                // like the headline — drop-shadow() blurs the element's whole
                // alpha channel (anti-aliasing + text-stroke edges), which reads
                // more diffuse at the same blur value.
                textShadow: titleShadowCss,
              }}
            >
              <span className="text-[#c5d7e2]">Walt&apos;s</span>{' '}
              <span className="text-black" style={{ WebkitTextStroke: '0.5px rgba(190,190,190,0.7)' }}>
                WARRIORS
              </span>
            </span>
            {settings.tagline ? (
              <span className="hidden text-sm text-stone-300 sm:block">{settings.tagline}</span>
            ) : null}
          </span>
        </Link>

        {/* Bell + account placeholder links (upper right) */}
        <div className="flex items-center gap-2 pt-1 sm:gap-4">
          <MobileMenu />
          <a href="#" aria-label="Notifications" className="transition hover:opacity-70">
            <Image src="/icons/bell-solid-full.svg" alt="" width={20} height={20} className="h-5 w-5" />
          </a>
          {authSlot ?? (
            <a href="#" aria-label="Account" className="transition hover:opacity-70">
              <Image src="/icons/circle-user-solid-full.svg" alt="" width={20} height={20} className="h-5 w-5" />
            </a>
          )}
        </div>
      </div>

      {/* Header menu row — vertically centered between title and headline on desktop */}
      <div className="relative z-10 mt-6 hidden justify-center md:flex">
        <ul className="flex items-center gap-7">
          {nav.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="text-[21.3px] font-bold text-[#13233a] transition hover:opacity-70"
                style={fontSans3}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Headline block — stepped, left-aligned */}
      <h1
        className="relative z-10 mt-5 flex flex-col items-start pl-6 font-bold uppercase leading-[0.95] tracking-tight sm:mt-6 sm:pl-8 lg:pl-10"
        style={{ ...fontSans3, fontSize: 'clamp(2.75rem, 5.8594vw, 5.2734rem)', ...headlineShadow }}
      >
        <span className="text-[#e3a64e]">Discipline</span>
        <span className="pl-6 text-[#00d80a] sm:pl-10">Outlasts</span>
        <span className="pl-12 text-[#c5d7e2] sm:pl-20">Motivation</span>
      </h1>

      {/* Tagline — bottom left */}
      <p
        className="relative z-10 mb-8 mt-auto max-w-[27rem] pl-6 text-xl font-semibold whitespace-pre-line text-[#c5d7e2] sm:pl-8 sm:text-[22.5px] lg:pl-10"
        style={{ ...fontSans3, ...taglineShadow }}
      >
        {home.subheadline || 'Build lasting habits.\nGrow stronger together.'}
      </p>
      </div>
    </section>
  )
}