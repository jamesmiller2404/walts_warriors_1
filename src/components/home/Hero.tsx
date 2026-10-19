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
const headlineShadow = { textShadow: '3px 4px 8px rgba(0, 0, 0, 0.35)' }

function MobileMenu() {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative md:hidden">
      <button
        className="rounded-md p-2 text-[#13233a] transition hover:bg-white/10"
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
                className="block px-5 py-2 text-lg font-semibold text-[#c5d7e2] transition hover:bg-white/10"
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
    <section className="relative mx-auto flex min-h-[520px] w-full max-w-[1440px] flex-col overflow-hidden">
      {/* Static hero background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/heroBGimage_opt.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="(max-width: 1440px) 100vw, 1440px"
        />
      </div>

      {/* Header row — site title left, bell/account icons right */}
      <div className="relative z-20 flex items-start justify-between px-6 pt-5 sm:px-10 lg:px-14">
        {/* Site title (existing element, reused) */}
        <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
          {logoSrc ? (
            <Image
              src={logoSrc}
              alt={name}
              width={48}
              height={48}
              className="h-10 w-10 shrink-0 rounded-full object-cover sm:h-12 sm:w-12"
            />
          ) : null}
          <span className="-ml-4">
            <span
              className="block"
              style={{
                fontFamily: 'var(--font-archivo-black)',
                fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.9))',
              }}
            >
              <span className="text-white">Walt&apos;s</span>{' '}
              <span className="text-black" style={{ WebkitTextStroke: '0.5px rgba(190,190,190,0.7)' }}>
                WARRIORS
              </span>
            </span>
            {settings.tagline ? (
              <span className="block text-sm text-stone-300">{settings.tagline}</span>
            ) : null}
          </span>
        </Link>

        {/* Bell + account placeholder links (upper right) */}
        <div className="flex items-center gap-3 pt-1 sm:gap-4">
          <MobileMenu />
          <a href="#" aria-label="Notifications" className="transition hover:opacity-70">
            <Image src="/icons/bell-solid-full.svg" alt="" width={28} height={28} className="h-7 w-7" />
          </a>
          {authSlot ?? (
            <a href="#" aria-label="Account" className="transition hover:opacity-70">
              <Image src="/icons/circle-user-solid-full.svg" alt="" width={28} height={28} className="h-7 w-7" />
            </a>
          )}
        </div>
      </div>

      {/* Header menu row — vertically centered between title and headline on desktop */}
      <div className="relative z-10 mt-8 hidden justify-center md:flex">
        <ul className="flex items-center gap-10">
          {nav.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="text-xl font-semibold text-[#13233a] transition hover:opacity-70"
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
        className="relative z-10 mt-6 flex flex-col items-start pl-6 font-bold uppercase leading-[0.95] tracking-tight sm:mt-8 sm:pl-10 lg:pl-14"
        style={{ ...fontSans3, fontSize: 'clamp(2.75rem, 6.25vw, 5.625rem)', ...headlineShadow }}
      >
        <span className="text-[#e3a64e]">Discipline</span>
        <span className="pl-6 text-[#00d80a] sm:pl-10">Outlasts</span>
        <span className="pl-12 text-[#c5d7e2] sm:pl-20">Motivation</span>
      </h1>

      {/* Tagline — bottom left */}
      <p
        className="relative z-10 mb-10 mt-auto max-w-xl pl-6 text-xl font-semibold whitespace-pre-line text-white sm:pl-10 sm:text-2xl lg:pl-14"
        style={{ ...fontSans3, ...headlineShadow }}
      >
        {home.subheadline || 'Build lasting habits.\nGrow stronger together.'}
      </p>
    </section>
  )
}