const fontSizeMap: Record<string, string> = {
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
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

type Props = {
  text: string
  fontSize?: string | null
  fontColor?: string | null
}

export function TextBlock({ text, fontSize, fontColor }: Props) {
  const sizeClass = fontSize ? fontSizeMap[fontSize] : 'text-base'
  const colorClass = fontColor ? fontColorMap[fontColor] : 'text-stone-900'

  return (
    <p className={`${sizeClass} ${colorClass}`}>
      {text}
    </p>
  )
}
