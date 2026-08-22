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
  text: string
  fontSize?: string | null
  fontColor?: string | null
  fontFamily?: string | null
}

export function TextBlock({ text, fontSize, fontColor, fontFamily }: Props) {
  const colorClass = fontColor ? fontColorMap[fontColor] : 'text-stone-900'
  const pt = resolvePt(fontSize)
  const fluidSize = pt && !Number.isNaN(pt) ? fluidFontSize(pt) : undefined

  return (
    <p
      className={colorClass}
      style={{
        fontFamily: fontFamily ? fontFamilyMap[fontFamily] : undefined,
        fontSize: fluidSize,
        whiteSpace: 'pre-wrap',
      }}
    >
      {text}
    </p>
  )
}
