import type { Metadata } from 'next'

import { Container } from '@/components/layout/Container'
import { getPayloadClient } from '@/lib/payload'
import { formatPhoneHref } from '@/lib/utils'
import type { ContactPage, SiteSetting } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Contact',
}

export default async function ContactRoute() {
  const payload = await getPayloadClient()
  const [settings, page] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings' }) as Promise<SiteSetting>,
    payload.findGlobal({ slug: 'contact-page' }) as Promise<ContactPage>,
  ])

  const phoneHref = formatPhoneHref(settings.phone)
  const address = settings.address
  const addressLine = [address?.street, address?.city, address?.state, address?.zip]
    .filter(Boolean)
    .join(', ')

  return (
    <Container size="narrow" className="py-12">
      <h1 className="text-4xl font-bold tracking-tight text-stone-900">
        {page.headline || 'Contact'}
      </h1>
      {page.intro ? <p className="mt-3 text-lg text-stone-600">{page.intro}</p> : null}

      <div className="mt-10 space-y-6 rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        {settings.phone ? (
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">Phone</p>
            <p className="mt-1 text-xl">
              {phoneHref ? (
                <a href={phoneHref} className="font-medium text-emerald-800 hover:underline">
                  {settings.phone}
                </a>
              ) : (
                settings.phone
              )}
            </p>
          </div>
        ) : null}

        {settings.email ? (
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">Email</p>
            <p className="mt-1 text-xl">
              <a
                href={`mailto:${settings.email}`}
                className="font-medium text-emerald-800 hover:underline"
              >
                {settings.email}
              </a>
            </p>
          </div>
        ) : null}

        {addressLine ? (
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">Address</p>
            <p className="mt-1 text-xl text-stone-800">{addressLine}</p>
          </div>
        ) : null}

        {settings.hours && settings.hours.length > 0 ? (
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">Hours</p>
            <ul className="mt-2 space-y-1 text-stone-800">
              {settings.hours.map((row, i) => (
                <li
                  key={i}
                  className="flex justify-between gap-4 border-b border-stone-100 py-2 last:border-0"
                >
                  <span>{row.day}</span>
                  <span className="text-stone-600">{row.hours}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {page.formNote ? <p className="text-sm text-stone-600">{page.formNote}</p> : null}

        {!settings.phone && !settings.email && !addressLine ? (
          <p className="text-stone-600">
            Contact details are not set yet. Add them in{' '}
            <a
              href="/admin/globals/site-settings"
              className="font-medium text-emerald-700 underline"
            >
              Admin → Site Settings
            </a>
            .
          </p>
        ) : null}
      </div>
    </Container>
  )
}
