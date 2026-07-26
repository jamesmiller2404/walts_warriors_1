import Image from 'next/image'

import { mediaUrl } from '@/lib/utils'
import type { Media } from '@/payload-types'

type Props = {
  image: Media | number | string | null | undefined
  objectFit?: string | null
  objectPosition?: string | null
  alt?: string | null
  caption?: string | null
}

export function ImageBlock({ image, objectFit, objectPosition, alt, caption }: Props) {
  const src = mediaUrl(image)
  const resolvedAlt = alt || ((image as Media)?.alt) || ''

  if (!src) return null

  return (
    <figure className="overflow-hidden rounded-xl">
      <div className="relative w-full aspect-[16/10] bg-stone-100">
        <Image
          src={src}
          alt={resolvedAlt}
          fill
          className="object-cover"
          style={{
            objectFit: (objectFit as React.CSSProperties['objectFit']) || 'cover',
            objectPosition: objectPosition || 'center',
          }}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      {caption ? (
        <figcaption className="mt-2 px-1 text-sm text-stone-500 italic">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
