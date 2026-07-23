import Image from 'next/image'
import Link from 'next/link'

import type { Media, Program } from '@/payload-types'
import { mediaUrl } from '@/lib/utils'

export function ProgramCard({ program }: { program: Program }) {
  const image = program.image as Media | null | undefined
  const src = mediaUrl(image)

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative aspect-[16/10] bg-stone-100">
        {src ? (
          <Image
            src={src}
            alt={image?.alt || program.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-stone-400">
            No image
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-stone-900">
          <Link href={`/programs/${program.slug}`} className="hover:text-emerald-800">
            {program.name}
          </Link>
        </h3>
        {program.summary ? (
          <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">{program.summary}</p>
        ) : (
          <div className="flex-1" />
        )}
        {program.pricing?.showPrice && program.pricing.priceLabel ? (
          <p className="mt-3 text-sm font-semibold text-emerald-800">{program.pricing.priceLabel}</p>
        ) : null}
        <Link
          href={`/programs/${program.slug}`}
          className="mt-4 text-sm font-medium text-emerald-700 hover:text-emerald-900"
        >
          Learn more →
        </Link>
      </div>
    </article>
  )
}
