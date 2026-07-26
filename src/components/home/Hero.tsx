'use client'

import { useState } from 'react'
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
  { href: '/challenges', label: 'Challenges' },
  { href: '/events', label: 'Events' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact' },
]

function NavBar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="flex items-center">
      <button
        className="md:hidden rounded-md p-2 text-white hover:bg-white/10 transition"
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

      <ul
        className={`
          absolute top-full left-0 right-0 z-30 flex flex-col bg-stone-900/95 backdrop-blur-md
          md:relative md:flex md:flex-row md:bg-transparent md:backdrop-blur-none
          ${open ? 'flex' : 'hidden md:flex'}
        `}
      >
        {nav.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function Hero({ home, settings }: Props) {
  const image = home.heroImage as Media | null | undefined
  const src = mediaUrl(image, 'hero')
  const logoSrc = mediaUrl(settings.logo)
  const name = settings.businessName || "Walt's Warriors"

  return (
    <section className="relative mx-auto w-full max-w-[1920px] min-h-[90vh] bg-stone-900 text-white flex flex-col">
      {src ? (
        <div className="absolute inset-0">
          <Image
            src={src}
            alt={image?.alt || home.headline || 'Hero'}
            fill
            priority
            className="object-cover object-center"
            sizes="(max-width: 1920px) 100vw, 1920px"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-stone-900 to-stone-800" />
      )}

      {/* Logo + Nav at very top of hero */}
      <div className="relative z-20 flex items-center justify-between px-6 py-4 sm:px-12 md:pl-[calc((100%-1152px)/2)] md:pr-[calc((100%-1152px)/2)]">
        <Link href="/" className="flex items-center gap-3" style={{ marginLeft: '-3rem' }}>
          {logoSrc ? (
            <Image
              src={logoSrc}
              alt={name}
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : null}
          <span className="-ml-4">
            <span className="block" style={{ fontFamily: 'var(--font-archivo-black)', fontSize: '2.5rem', filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.9))' }}>
              <span className="text-white">Walt&apos;s</span>{' '}
              <span className="text-black" style={{ WebkitTextStroke: '0.5px rgba(190,190,190,0.7)' }}>WARRIORS</span>
            </span>
            {settings.tagline ? (
              <span className="block text-sm text-stone-300">{settings.tagline}</span>
            ) : null}
          </span>
        </Link>

        <div className="relative">
          <NavBar />
        </div>
      </div>

      {/* CTA content — left-aligned headline, pushed down */}
      <div className="relative z-10 flex flex-col items-start justify-start px-6 sm:px-12 md:pl-32 lg:pl-48 pt-32 lg:pt-54 flex-1">
        <div className="flex flex-col items-start select-none">

          {/* DISCIPLINE — orange gradient, clamp() sizing */}
          <h1
            className="font-black uppercase tracking-tight leading-[0.82] bg-gradient-to-r from-orange-300 via-orange-500 to-orange-600 bg-clip-text text-transparent"
            style={{ fontSize: 'clamp(1.75rem, 5vw, 6.25rem)', filter: 'drop-shadow(-5px 6px 3px rgba(0,0,0,0.9))' }}
          >
            Discipline
          </h1>

          {/* Orange periods */}
          <div
            aria-hidden="true"
            className="flex flex-col leading-[0.55] font-black text-orange-500"
            style={{ fontSize: 'clamp(0.75rem, 2.5vw, 2.67rem)', filter: 'drop-shadow(-3px 3px 3px rgba(0,0,0,0.9))' }}
          >
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </div>

          {/* OUTLASTS — black */}
          <h1
            className="font-black uppercase tracking-tight leading-[0.82] text-black"
            style={{ fontSize: 'clamp(1.75rem, 5vw, 6.25rem)', filter: 'drop-shadow(-5px 6px 3px rgba(0,0,0,0.9))' }}
          >
            Outlasts
          </h1>

          {/* Black periods */}
          <div
            aria-hidden="true"
            className="flex flex-col leading-[0.55] font-black text-black"
            style={{ fontSize: 'clamp(0.75rem, 2.5vw, 2.67rem)', filter: 'drop-shadow(-3px 3px 3px rgba(0,0,0,0.9))' }}
          >
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </div>

          {/* MOTIVATION — white */}
          <h1
            className="font-black uppercase tracking-tight leading-[0.82] text-white"
            style={{ fontSize: 'clamp(1.75rem, 5vw, 6.25rem)', filter: 'drop-shadow(-5px 6px 3px rgba(0,0,0,0.9))' }}
          >
            Motivation
            <span aria-hidden="true">...</span>
          </h1>
        </div>

        {home.subheadline ? (
          <p className="mt-6 max-w-xl text-base sm:text-lg text-stone-200">{home.subheadline}</p>
        ) : null}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            href="/contact"
            className="w-full sm:w-auto text-center rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            Get in touch
          </Link>
          <Link
            href="/programs"
            className="w-full sm:w-auto text-center rounded-lg border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
          >
            View programs
          </Link>
        </div>
      </div>
    </section>
  )
}