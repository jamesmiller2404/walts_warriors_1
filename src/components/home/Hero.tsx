'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import type { HomePage, Member, SiteSetting } from '@/payload-types'
import { mediaUrl } from '@/lib/utils'
import { LogoutButton } from '@/components/auth/LogoutButton'

type Props = {
  home: HomePage
  settings: SiteSetting
  member?: Member | null
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

// "Maria Kozlowski" → first: "Maria", lastInitial: "K". Falls back to the whole
// displayName as the first part when there is only one word.
function splitMemberName(displayName: string): { first: string; lastInitial: string } {
  const parts = displayName.trim().split(/\s+/)
  if (parts.length >= 2 && parts[1]) {
    return { first: parts[0], lastInitial: parts[1].charAt(0).toUpperCase() }
  }
  return { first: parts[0] || '', lastInitial: '' }
}

function MobileMenu() {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative md:hidden">
      <button
        className="rounded-md p-1 text-[#c5d7e2] transition hover:bg-white/10 sm:p-2"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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

export function Hero({ home, settings, member = null }: Props) {
  const logoSrc = mediaUrl(settings.logo)
  const name = settings.businessName || "Walt's Warriors"
  const memberName = member ? splitMemberName(member.displayName) : null

  return (
    <section className="relative flex aspect-square min-h-[390px] w-full flex-col overflow-hidden md:aspect-[1440/377] md:min-h-[300px] md:max-h-[715px]">
      {/* Static hero background image — art-directed: 1:1 composition on mobile,
      panoramic on desktop. Plain <img> inside <picture> (not next/image) so the
      hand-optimized WebP variants are served byte-for-byte with no re-encoding.
      The media query matches Tailwind's md: breakpoint (768px), so the browser
      downloads only the correct crop, and the 1x/2x descriptors let it pick the
      right resolution by device pixel ratio. Preload hints mirror this markup
      in src/app/(frontend)/page.tsx. */}
      <div className="absolute inset-0">
        <picture>
          <source
            media="(max-width: 767px)"
            srcSet="/images/hero/hero-mobile_1x.webp 1x, /images/hero/hero-mobile_2x.webp 2x"
          />
          <img
            src="/images/hero/hero_1x.webp"
            srcSet="/images/hero/hero_1x.webp 1x, /images/hero/hero_2x.webp 2x"
            alt=""
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </picture>
      </div>

      {/* Content wrapper — keeps the composition on the 1440px canvas while the
      background image runs full-bleed behind it */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 flex-col">
      {/* Header row — site title left, bell/account icons right */}
      <div className="relative z-20 flex items-start justify-between px-2 pt-4 sm:px-8 lg:px-10">
        {/* Site title (existing element, reused) */}
        <Link href="/" className="flex min-w-0 items-center gap-2 pl-2 sm:gap-3 sm:pl-0">
          {logoSrc ? (
            <Image
              src={logoSrc}
              alt={name}
              width={48}
              height={48}
              className="h-5 w-5 shrink-0 rounded-full object-cover sm:h-9 sm:w-9"
            />
          ) : null}
          <span className="-ml-4">
            <span
              className="block leading-none"
              style={{
                fontFamily: 'var(--font-archivo-black)',
                // Fluid: 54px at the 1440px design width; mobile floor lowered
                // to 20px so the title + icon cluster both fit on phones.
                fontSize: 'clamp(20px, 3.75vw, 54px)',
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

        {/* Right cluster — Sign Up / Login pills + gear, bell, account icons
        (per design/screens/login-icons-x3.png). Dummy links for now. Visible on
        all screen sizes; the hamburger menu joins it on mobile. */}
        <div className="flex items-start gap-1 pt-1 sm:gap-4">
          <MobileMenu />

          <div className="flex items-start gap-1 sm:gap-5">
            {/* Signed out — Sign Up / Login pills linking to the real auth pages.
            Signed in — a logout pill here, plus the member's short name directly
            under the account icon. On mobile the pills shrink and never wrap. */}
            {member ? (
              <LogoutButton className="shrink-0 whitespace-nowrap self-center rounded-full bg-[#808080]/70 px-2 py-1 text-center text-[12px] font-semibold leading-normal text-[#c5d7e2] transition hover:opacity-90 sm:px-4 sm:py-1.5 sm:text-[15px]" />
            ) : (
              <div className="flex shrink-0 flex-col gap-1">
                <Link
                  href="/register"
                  className="whitespace-nowrap rounded-full bg-[#c5d7e2] px-2 py-1 text-center text-[12px] font-semibold leading-normal text-[#0b2d41] transition hover:opacity-90 sm:px-4 sm:py-1.5 sm:text-[15px]"
                  style={fontSans3}
                >
                  Sign Up
                </Link>
                <Link
                  href="/login"
                  className="whitespace-nowrap rounded-full bg-[#808080]/70 px-2 py-1 text-center text-[12px] font-semibold leading-normal text-[#c5d7e2] transition hover:opacity-90 sm:px-4 sm:py-1.5 sm:text-[15px]"
                  style={fontSans3}
                >
                  Login
                </Link>
              </div>
            )}

            <a href="#" aria-label="Settings" className="shrink-0 transition hover:opacity-70">
              <Image
                src="/icons/gears-icon.svg"
                alt=""
                width={58}
                height={44}
                className="h-[22px] w-[29px] sm:h-[35px] sm:w-[46px]"
              />
            </a>
            <a href="#" aria-label="Notifications" className="shrink-0 transition hover:opacity-70">
              <Image
                src="/icons/bell-solid-full.svg"
                alt=""
                width={40}
                height={40}
                className="h-5 w-5 sm:h-8 sm:w-8"
              />
            </a>
            <div className="flex max-w-[3.5rem] shrink-0 flex-col items-center gap-0.5 sm:max-w-[10rem]">
              <a href="#" aria-label="Account" className="shrink-0 transition hover:opacity-70">
                <Image
                  src="/icons/circle-user-solid-full.svg"
                  alt=""
                  width={32}
                  height={32}
                  className="h-4 w-4 sm:h-8 sm:w-8"
                />
              </a>
              {memberName ? (
                <span
                  className="flex max-w-full flex-col items-center gap-0.5 text-[13px] font-semibold leading-none text-[#0b2d41]"
                  style={fontSans3}
                >
                  <span className="max-w-full truncate">{memberName.first}</span>
                  {memberName.lastInitial ? <span>{memberName.lastInitial}.</span> : null}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Header menu row — its own row below the site title (per the header
      mockup), horizontally centered on the canvas. Fluid size: 21.3px at the
      1440px design width, scaling down to a 14px floor before the hamburger
      takes over below md. Each entry is an individual placeholder link. */}
      <div className="relative z-10 mt-3 hidden justify-center md:flex">
        <ul
          className="flex items-center"
          style={{
            ...fontSans3,
            fontSize: 'clamp(14px, 1.4792vw, 21.3px)',
            gap: 'clamp(14px, 1.9444vw, 28px)',
          }}
        >
          {nav.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="font-bold text-[#c5d7e2] transition hover:opacity-70"
                style={fontSans3}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Headline block — stepped, left-aligned. Mobile keeps the 44px floor.
      md–xl: safe fluid ramp (32–36px) for the short hero. xl+: steeper ramp
      that reaches the full 84.375px design size at a 1920px-maximized window
      (the hero is tall enough there: ~462px of content in ~503px of height). */}
      <h1
        className="relative z-10 mt-3 hidden flex-col items-start pl-6 text-[44px] font-bold uppercase leading-[0.95] tracking-tight sm:pl-8 md:flex md:text-[clamp(32px,2.8vw,36px)] xl:text-[clamp(36px,calc(7.56vw_-_60.7px),84.375px)] lg:pl-10"
        style={{ ...fontSans3, ...headlineShadow }}
      >
        <span className="text-[#e3a64e]">Discipline</span>
        <span className="pl-6 text-[#00d80a] sm:pl-10">Outlasts</span>
        <span className="pl-12 text-[#c5d7e2] sm:pl-20">Motivation</span>
      </h1>

      {/* Tagline — bottom left */}
      <p
        className="relative z-10 mb-6 mt-auto max-w-[27rem] pl-6 text-xl font-semibold whitespace-pre-line text-[#c5d7e2] sm:pl-8 sm:text-[22.5px] lg:pl-10"
        style={{ ...fontSans3, ...taglineShadow }}
      >
        {home.subheadline || 'Build lasting habits.\nGrow stronger together.'}
      </p>
      </div>
    </section>
  )
}