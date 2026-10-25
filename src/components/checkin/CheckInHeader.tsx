'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { SiteTitleText } from '@/components/layout/SiteTitle'

const fontSans3 = { fontFamily: 'var(--font-source-sans-3), sans-serif' }

// Placeholder header-menu links (wire real routes later) — same list as Hero.tsx.
const nav = [
  { href: '/', label: 'Home' },
  { href: '#', label: 'Dashboard' },
  { href: '#', label: 'Challenges' },
  { href: '#', label: 'Community' },
  { href: '#', label: 'Library' },
]

// Time-of-day header artwork, per the check-in-page design: sunrise 4am–12pm,
// sun and clouds 12pm–8pm, crescent moon 8pm–4am (viewer's local time). Each
// composition uses its own purpose-built strip with the divider baked in
// (gold by day, silver at night), so no CSS divider is drawn: desktop
// 1440x133, tablet-mobile (530–767px) 768x60, phone-mobile (<530px) 375x116.
// The desktop strip has a 1x/2x pair; the mobile strips are 1x only.
function artworkForHour(hour: number) {
  if (hour >= 4 && hour < 12) {
    return {
      src: '/images/sunriseHR_1440x133px.png',
      src2x: '/images/sunriseHR_2880x266px.png',
      tabletSrc: '/images/sunriseHR_mobile_768x60px.png',
      phoneSrc: '/images/sunriseHR_mobile_375x116px.png',
    }
  }
  if (hour >= 12 && hour < 20) {
    return {
      src: '/images/sunAndCloudsHR_1440x133px.png',
      src2x: '/images/sunAndCloudsHR_2880x266px.png',
      tabletSrc: '/images/sunAndCloudsHR_mobile_768x60px.png',
      phoneSrc: '/images/sunAndCloudsHR_mobile_375x116px.png',
    }
  }
  return {
    src: '/images/crescentMoonHR_1440x133px.png',
    src2x: '/images/crescentMoonHR_2880x266px.png',
    tabletSrc: '/images/crescentMoonHR_mobile_768x60px.png',
    phoneSrc: '/images/crescentMoonHR_mobile_375x116px.png',
  }
}

type Props = {
  /** Page name shown under the site title (e.g. "Challenge Check-In"). The
  only per-page variable in this shared header — every page except the home
  page renders it with its own name. */
  pageName?: string
  /** Signed-in member's first name — shown after the page name and
  under the account icon (like the home-page hero header). */
  firstName?: string | null
  /** Signed-in member's last initial, centered under the first name. */
  lastInitial?: string | null
}

export function CheckInHeader({
  pageName = 'Challenge Check-In',
  firstName = null,
  lastInitial = null,
}: Props) {
  const [now, setNow] = useState<Date | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setNow(new Date())
    // Minute-level display; refresh every 30s so the minute never lags.
    const timer = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(timer)
  }, [])

  // The artwork choice and the clock depend on the viewer's local time, which
  // the server cannot know — render them only after mount (SSR values would
  // hydrate-mismatch). The header keeps its size either way (fixed aspect box).
  const artwork = now ? artworkForHour(now.getHours()) : null
  const dateText = now
    ? now.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : ''
  const timeText = now
    ? now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    : ''
  // "Pacific Standard Time" → "Pacific" — matches the mockup's "(Pacific)".
  const zoneLabel = now
    ? ((new Intl.DateTimeFormat(undefined, { timeZoneName: 'long' })
        .formatToParts(now)
        .find((part) => part.type === 'timeZoneName')?.value ?? '')
        .split(' ')[0] || '')
    : ''

  const displayName = (firstName ?? '').trim().toUpperCase()

  // Desktop subtitle — unchanged from the original desktop composition.
  const subtitle = (
    <>
      <span className="font-semibold">Challenge Check-In</span>
      {displayName ? (
        <>
          <span className="font-semibold">{' • '}</span>
          <span className="font-bold">{displayName}</span>
        </>
      ) : null}
    </>
  )
  // Mobile subtitle — "{pageName} · {NAME}" per the mobile mockups.
  const mobileSubtitle = (
    <>
      <span className="font-semibold">{pageName}</span>
      {displayName ? (
        <>
          <span className="font-semibold">{' · '}</span>
          <span className="font-bold">{displayName}</span>
        </>
      ) : null}
    </>
  )
  const dateLines = now ? (
    <>
      {dateText}
      <br />
      {`${timeText} (${zoneLabel})`}
    </>
  ) : null
  // Mobile date block — three right-aligned lines per the mobile mockups:
  // weekday / date / time (zone).
  const weekdayText = now ? now.toLocaleDateString(undefined, { weekday: 'long' }) : ''
  const dateShort = now
    ? now.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : ''
  const mobileDateLines = now ? (
    <>
      {weekdayText}
      <br />
      {dateShort}
      <br />
      {`${timeText} (${zoneLabel})`}
    </>
  ) : null

  // Member name under the account icon — same composition as the home-page
  // hero header: first name, last initial centered below it. Light color here
  // (the hero uses dark #0b2d41, but this header sits on the dark gradient).
  // Takes a font size because the desktop canvas is vertically constrained
  // while the mobile flow layout has room to spare.
  const memberNameBlock = (fontSize: string) => (
    <span
      className="flex max-w-full flex-col items-center gap-0.5 font-semibold leading-none text-[#c5d7e2]"
      style={{ ...fontSans3, fontSize }}
    >
      <span className="max-w-full truncate">{(firstName ?? '').trim()}</span>
      {lastInitial ? <span>{lastInitial}</span> : null}
    </span>
  )

  // Mobile hamburger — the mockups replace the nav-links row with a hamburger
  // icon below the subtitle; clicking toggles a simple dropdown of the nav
  // links. Rendered in both mobile compositions (only one is visible at a
  // time); posClass positions the button, the dropdown sits just below it.
  const hamburgerButton = (posClass: string) => (
    <button
      type="button"
      aria-label="Menu"
      aria-expanded={menuOpen}
      onClick={() => setMenuOpen((open) => !open)}
      className={`absolute z-20 flex h-[22px] w-8 flex-col justify-between ${posClass}`}
    >
      <span className="h-[2px] w-full rounded bg-[#c5d7e2]" />
      <span className="h-[2px] w-full rounded bg-[#c5d7e2]" />
      <span className="h-[2px] w-full rounded bg-[#c5d7e2]" />
    </button>
  )
  const hamburgerMenu = (posClass: string) =>
    menuOpen ? (
      <div className={`absolute z-20 rounded-md bg-[#16273d] py-1 shadow-lg ${posClass}`}>
        <ul style={{ ...fontSans3, fontSize: '14px' }}>
          {nav.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-1.5 font-bold whitespace-nowrap text-[#c5d7e2] transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    ) : null

  return (
    <header>
{/* Desktop — absolute composition on the 1440x215 design canvas (the
      check-in mockups measure 1440x215: the 1440x133 artwork top-aligns inside
      it, its baked-in divider lands at y≈115–121, and the menu row sits below).
      Every offset below is a mockup-measured percentage of the canvas and every
      font size is vw-proportional, so the composition scales as one piece. */}
      <div className="relative mx-auto hidden w-full max-w-[1440px] aspect-[1440/215] md:block">
        {artwork ? (
          <img
            src={artwork.src}
            srcSet={`${artwork.src} 1x, ${artwork.src2x} 2x`}
            alt=""
            decoding="async"
            className="pointer-events-none absolute left-0 top-0 z-0 w-full"
          />
        ) : null}

        {/* Site title — the home-page hero title downsized to the mockup's
        ~326x27 box (~36px Archivo Black; cap top at y≈21 of 215). */}
        <div className="absolute left-[1.6%] top-[7.2%] z-10">
          <SiteTitleText fontSize="clamp(13px, 2.5vw, 36px)" />
        </div>

        {/* Subtitle — "Challenge Check-In • LISA": 48px light blue (cap top at
        y≈63). The member name reads slightly bolder, per the mockup. */}
        <p
          className="absolute left-[1.6%] top-[25.9%] z-10 leading-none text-[#c5d7e2]"
          style={{ ...fontSans3, fontSize: 'clamp(17px, 3.3333vw, 48px)' }}
        >
          {subtitle}
        </p>

        {/* Gear / bell / account — same dark icons as the hero header, dummy
        links for now (per the mockup: no sign-up/login pills on this page).
        Fluid sizes so the cluster scales with the canvas like everything else —
        otherwise the fixed-size icons collide with the date/time block at
        widths below 1440. Floors keep them clear of the date text at md (768px).
        Raised from the mockup's y≈26 to make room for the member name under the
        account icon (same composition as the hero header) and the date below. */}
        <div
          className="absolute right-[3.3%] top-[8%] z-10 flex items-start"
          style={{ gap: 'clamp(6px, 0.9722vw, 14px)' }}
        >
          <a href="#" aria-label="Settings" className="transition hover:opacity-70">
            <Image
              src="/icons/gears-icon.svg"
              alt=""
              width={58}
              height={44}
              style={{ width: 'clamp(20px, 3.1944vw, 46px)', height: 'auto' }}
            />
          </a>
          <a href="#" aria-label="Notifications" className="transition hover:opacity-70">
            <Image
              src="/icons/bell-solid-full.svg"
              alt=""
              width={40}
              height={40}
              style={{ width: 'clamp(15px, 2.2222vw, 32px)', height: 'auto' }}
            />
          </a>
          {/* Account icon + member name — hero-header composition: name below
          the icon, last initial centered under the name. */}
          <div className="flex max-w-[10rem] shrink-0 flex-col items-center gap-0.5">
            <a href="#" aria-label="Account" className="transition hover:opacity-70">
              <Image
                src="/icons/circle-user-solid-full.svg"
                alt=""
                width={32}
                height={32}
                style={{ width: 'clamp(15px, 2.2222vw, 32px)', height: 'auto' }}
              />
            </a>
            {firstName ? memberNameBlock('clamp(9px, 0.9028vw, 13px)') : null}
          </div>
        </div>

        {/* Live local date/time — right of the artwork's sun/moon (which ends
        by x≈1254) and above its divider (y≈118). Stepped down to 15px max so
        both lines clear the divider at every width. */}
        {dateLines ? (
          <p
            className="absolute right-[1.6%] top-[36%] z-10 text-right leading-[1.28] text-[#c5d7e2]"
            style={{ ...fontSans3, fontSize: 'clamp(7px, 1.0417vw, 15px)' }}
          >
            {dateLines}
          </p>
        ) : null}

        {/* Menu row — centered below the artwork's baked-in divider. Dummy
        links; hover darkens to the spec color. */}
        <ul
          className="absolute inset-x-0 top-[64.8%] z-10 flex items-center justify-center"
          style={{
            ...fontSans3,
            fontSize: 'clamp(11px, 2.1528vw, 31px)',
            gap: 'clamp(14px, 2.5vw, 36px)',
          }}
        >
          {nav.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="font-bold text-[#c5d7e2] transition-colors hover:text-[#2c353b]"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Mobile — two fixed compositions modeled on the designer mockups: the
      768px cutoff renders 530–767px and the 375px cutoff renders below 530px
      (the narrowest width at which the 768 composition's fixed-size title and
      icon cluster no longer collide). Both are edge-anchored absolute layouts
      with the artwork strip bottom-anchored full-width; its baked-in divider
      is the visual bottom edge, with a small gradient gap below it per the
      mockups (9px tablet / 7px phone). */}
      <div className="md:hidden">
        {/* 768 cutoff (530–767px) — fixed 768x174 design, no scaling. The
        strip is height-locked at 60px and cropped from the empty left sky via
        object-right, so the sun/moon and the divider always survive. */}
        <div className="relative hidden h-[174px] min-[530px]:block">
          {artwork ? (
            <img
              src={artwork.tabletSrc}
              alt=""
              decoding="async"
              className="pointer-events-none absolute inset-x-0 bottom-[9px] h-[60px] w-full object-cover object-right-bottom"
            />
          ) : null}

          <div className="absolute left-6 top-[12px] z-10">
            <SiteTitleText fontSize="36px" />
          </div>
          <p
            className="absolute left-6 top-[59px] z-10 leading-none text-[#c5d7e2]"
            style={{ ...fontSans3, fontSize: '20px' }}
          >
            {mobileSubtitle}
          </p>

          {hamburgerButton('left-6 top-[95px]')}
          {hamburgerMenu('left-6 top-[122px]')}

          {/* Gear / bell / account + member name — mockup sizes. */}
          <div className="absolute right-4 top-[12px] z-10 flex items-start gap-4">
            <a href="#" aria-label="Settings" className="transition hover:opacity-70">
              <Image
                src="/icons/gears-icon.svg"
                alt=""
                width={58}
                height={44}
                className="h-[23px] w-[30px]"
              />
            </a>
            <a href="#" aria-label="Notifications" className="transition hover:opacity-70">
              <Image
                src="/icons/bell-solid-full.svg"
                alt=""
                width={40}
                height={40}
                className="h-[26px] w-[26px]"
              />
            </a>
            <div className="flex max-w-[5rem] shrink-0 flex-col items-center gap-0.5">
              <a href="#" aria-label="Account" className="transition hover:opacity-70">
                <Image
                  src="/icons/circle-user-solid-full.svg"
                  alt=""
                  width={32}
                  height={32}
                  className="h-[24px] w-[24px]"
                />
              </a>
              {firstName ? memberNameBlock('11px') : null}
            </div>
          </div>

          {/* Live local date/time — three lines above the divider. */}
          {mobileDateLines ? (
            <p
              className="absolute right-4 bottom-[24px] z-10 text-right leading-[1.35] text-[#c5d7e2]"
              style={{ ...fontSans3, fontSize: '13px' }}
            >
              {mobileDateLines}
            </p>
          ) : null}
        </div>

        {/* 375 cutoff (<530px) — fixed 375-native text over the strip, which
        stays in flow at its natural aspect so the big sun/moon scales with
        the viewport (exact mockup at 375px, stretched above it). */}
        <div className="relative min-[530px]:hidden pt-[24px]">
          {artwork ? (
            <img
              src={artwork.phoneSrc}
              alt=""
              decoding="async"
              className="pointer-events-none block w-full"
            />
          ) : null}

          <div className="absolute left-3 top-[6px] z-10">
            <SiteTitleText fontSize="24px" />
          </div>
          <p
            className="absolute left-3 top-[34px] z-10 leading-none text-[#c5d7e2]"
            style={{ ...fontSans3, fontSize: '16px' }}
          >
            {mobileSubtitle}
          </p>

          {hamburgerButton('left-3 top-[64px]')}
          {hamburgerMenu('left-3 top-[92px]')}

          <div className="absolute right-4 top-[8px] z-10 flex items-start gap-2.5">
            <a href="#" aria-label="Settings" className="transition hover:opacity-70">
              <Image
                src="/icons/gears-icon.svg"
                alt=""
                width={58}
                height={44}
                className="h-[17px] w-[22px]"
              />
            </a>
            <a href="#" aria-label="Notifications" className="transition hover:opacity-70">
              <Image
                src="/icons/bell-solid-full.svg"
                alt=""
                width={40}
                height={40}
                className="h-[18px] w-[18px]"
              />
            </a>
            <div className="flex max-w-[4rem] shrink-0 flex-col items-center gap-0.5">
              <a href="#" aria-label="Account" className="transition hover:opacity-70">
                <Image
                  src="/icons/circle-user-solid-full.svg"
                  alt=""
                  width={32}
                  height={32}
                  className="h-[18px] w-[18px]"
                />
              </a>
              {firstName ? memberNameBlock('10px') : null}
            </div>
          </div>

          {mobileDateLines ? (
            <p
              className="absolute right-4 bottom-4 z-10 text-right leading-[1.3] text-[#c5d7e2]"
              style={{ ...fontSans3, fontSize: '12px' }}
            >
              {mobileDateLines}
            </p>
          ) : null}
        </div>
      </div>
    </header>
  )
}