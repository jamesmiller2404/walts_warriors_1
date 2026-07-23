import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function mediaUrl(
  media: { url?: string | null } | number | string | null | undefined,
): string | null {
  if (!media || typeof media === 'number' || typeof media === 'string') return null
  return media.url ?? null
}

export function formatPhoneHref(phone?: string | null): string | undefined {
  if (!phone) return undefined
  const digits = phone.replace(/[^\d+]/g, '')
  return digits ? `tel:${digits}` : undefined
}
