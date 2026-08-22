const legacyMap: Record<string, number> = {
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
}

export function resolvePt(value: string | null | undefined): number | undefined {
  if (!value) return undefined
  if (legacyMap[value] !== undefined) return legacyMap[value]
  const n = Number(value)
  return !Number.isNaN(n) ? n : undefined
}

export function fluidFontSize(pt: number): string {
  const px = (pt * 4) / 3
  const round = (n: number) => Math.round(n * 100) / 100
  return `clamp(${round(px * 0.6)}px, calc(100vw / 960 * ${round(px)}), ${round(px)}px)`
}
