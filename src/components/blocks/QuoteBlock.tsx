const fontFamilyMap: Record<string, string> = {
  manrope: 'var(--font-manrope)',
  'manrope-semibold': 'var(--font-manrope-semibold)',
  'manrope-bold': 'var(--font-manrope-bold)',
  'manrope-extrabold': 'var(--font-manrope-extrabold)',
  'archivo-black': 'var(--font-archivo-black)',
  'montserrat-bold': 'var(--font-montserrat-bold)',
  'montserrat-extrabold': 'var(--font-montserrat-extrabold)',
  'eb-garamond-italic': 'var(--font-eb-garamond-italic)',
  'eb-garamond-medium-italic': 'var(--font-eb-garamond-medium-italic)',
  'eb-garamond-semibold-italic': 'var(--font-eb-garamond-semibold-italic)',
}

const fontColorMap: Record<string, string> = {
  'stone-900': 'text-stone-900',
  'stone-800': 'text-stone-800',
  'stone-700': 'text-stone-700',
  'stone-600': 'text-stone-600',
  'brand-900': 'text-brand-900',
  'brand-800': 'text-brand-800',
  'brand-700': 'text-brand-700',
  'brand-600': 'text-brand-600',
  white: 'text-white',
}

import { fluidFontSize, resolvePt } from '@/lib/fontSize'

type Props = {
  quote: string
  attribution?: string | null
  quoteFontSize?: string | null
  quoteFontColor?: string | null
  quoteFontFamily?: string | null
  attributionFontSize?: string | null
  attributionFontColor?: string | null
  attributionFontFamily?: string | null
}

export function QuoteBlock({
  quote,
  attribution,
  quoteFontSize,
  quoteFontColor,
  quoteFontFamily,
  attributionFontSize,
  attributionFontColor,
  attributionFontFamily,
}: Props) {
  const quoteColor = quoteFontColor ? fontColorMap[quoteFontColor] : 'text-stone-900'
  const attrColor = attributionFontColor ? fontColorMap[attributionFontColor] : 'text-stone-600'
  const quotePt = resolvePt(quoteFontSize)
  const attrPt = resolvePt(attributionFontSize)
  const quoteSize = quotePt && !Number.isNaN(quotePt) ? fluidFontSize(quotePt) : undefined
  const attrSize = attrPt && !Number.isNaN(attrPt) ? fluidFontSize(attrPt) : undefined

  return (
    <figure className="space-y-3">
      <blockquote
        className={`${quoteColor} leading-relaxed`}
        style={{
          fontFamily: quoteFontFamily ? fontFamilyMap[quoteFontFamily] : 'var(--font-eb-garamond-italic)',
          fontSize: quoteSize,
          whiteSpace: 'pre-wrap',
        }}
      >
        &ldquo;{quote}&rdquo;
      </blockquote>
      {attribution ? (
        <figcaption
          className={`${attrColor} not-italic`}
          style={{
            fontFamily: attributionFontFamily ? fontFamilyMap[attributionFontFamily] : 'var(--font-manrope-semibold)',
            fontSize: attrSize,
            whiteSpace: 'pre-wrap',
          }}
        >
          &mdash; {attribution}
        </figcaption>
      ) : null}
    </figure>
  )
}
