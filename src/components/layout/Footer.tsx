import Link from 'next/link'

import { Container } from '@/components/layout/Container'
import type { SiteSetting } from '@/payload-types'
import { formatPhoneHref } from '@/lib/utils'

export function Footer({ settings }: { settings: SiteSetting }) {
  const year = new Date().getFullYear()
  const name = settings.businessName || "Walt's Warriors"
  const phoneHref = formatPhoneHref(settings.phone)
  const address = settings.address
  const addressLine = [address?.street, address?.city, address?.state, address?.zip]
    .filter(Boolean)
    .join(', ')

  return (
    <footer className="mt-auto bg-[#000b17] text-stone-300">
      <Container className="grid gap-8 md:gap-12 py-12 md:grid-cols-3">
        <div>
          <p className="text-lg font-semibold text-white">{name}</p>
          {settings.tagline ? <p className="mt-2 text-sm text-stone-400">{settings.tagline}</p> : null}
        </div>

        <div className="text-sm">
          <p className="mb-3 font-semibold uppercase tracking-wide text-stone-400">Contact</p>
          {settings.phone ? (
            <p>
              {phoneHref ? (
                <a href={phoneHref} className="hover:text-white">
                  {settings.phone}
                </a>
              ) : (
                settings.phone
              )}
            </p>
          ) : null}
          {settings.email ? (
            <p className="mt-1">
              <a href={`mailto:${settings.email}`} className="hover:text-white">
                {settings.email}
              </a>
            </p>
          ) : null}
          {addressLine ? <p className="mt-1">{addressLine}</p> : null}
        </div>

        <div className="text-sm">
          <p className="mb-3 font-semibold uppercase tracking-wide text-stone-400">Explore</p>
          <ul className="space-y-1">
            <li>
              <Link href="/about" className="hover:text-white">
                About Walt
              </Link>
            </li>
            <li>
              <Link href="/programs" className="hover:text-white">
                Programs
              </Link>
            </li>
            <li>
              <Link href="/resources" className="hover:text-white">
                Resources
              </Link>
            </li>
            <li>
              <Link href="/challenges" className="hover:text-white">
                Challenges
              </Link>
            </li>
            <li>
              <Link href="/events" className="hover:text-white">
                Events
              </Link>
            </li>
            <li>
              <Link href="/gallery" className="hover:text-white">
                Gallery
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-white">
                Admin
              </Link>
            </li>
          </ul>
        </div>
      </Container>

      <div className="py-4 px-4 text-center text-xs text-stone-500">
        © {year} {name}. All rights reserved.
      </div>
    </footer>
  )
}
