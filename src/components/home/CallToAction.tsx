import Link from 'next/link'

import type { HomePage } from '@/payload-types'

export function CallToAction({ cta }: { cta: HomePage['cta'] }) {
  if (!cta?.heading && !cta?.text && !cta?.buttonLabel) return null

  const href = cta.buttonLink || '/contact'

  return (
    <section className="rounded-2xl bg-emerald-800 px-6 py-12 text-center text-white shadow-md sm:px-12">
      {cta.heading ? <h2 className="text-3xl font-bold tracking-tight">{cta.heading}</h2> : null}
      {cta.text ? <p className="mx-auto mt-3 max-w-2xl text-emerald-50">{cta.text}</p> : null}
      {cta.buttonLabel ? (
        <Link
          href={href}
          className="mt-6 inline-block rounded-lg bg-white px-6 py-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
        >
          {cta.buttonLabel}
        </Link>
      ) : null}
    </section>
  )
}
