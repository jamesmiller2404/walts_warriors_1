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
