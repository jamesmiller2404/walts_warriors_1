'use client'

import { useEffect, useState } from 'react'

import { QuoteBlock } from '@/components/blocks/QuoteBlock'
import type { Quote } from '@/payload-types'

export type RotationMode = 'page-load' | 'session' | 'day' | 'week'

type Props = {
  quotes: Pick<Quote, 'id' | 'quote' | 'attribution'>[]
  rotationMode?: RotationMode | null
  quoteFontFamily?: string | null
  quoteFontSize?: string | null
  quoteFontColor?: string | null
  attributionFontFamily?: string | null
  attributionFontSize?: string | null
  attributionFontColor?: string | null
}

const SESSION_KEY = 'ww-quote-id'

function hashString(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i)
  }
  return Math.abs(hash)
}

function getDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getWeekKey(date: Date): string {
  const target = new Date(date)
  const day = (target.getDay() + 6) % 7
  target.setDate(target.getDate() - day)
  const week1 = new Date(target.getFullYear(), 0, 4)
  week1.setDate(week1.getDate() + ((7 - ((week1.getDay() + 6) % 7)) % 7))
  const weekNumber = 1 + Math.round((target.getTime() - week1.getTime()) / (7 * 24 * 60 * 60 * 1000))
  return `${target.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`
}

function pickQuote(
  quotes: Pick<Quote, 'id' | 'quote' | 'attribution'>[],
  rotationMode: RotationMode,
): Pick<Quote, 'id' | 'quote' | 'attribution'> {
  if (rotationMode === 'page-load') {
    return quotes[Math.floor(Math.random() * quotes.length)]
  }

  if (rotationMode === 'day') {
    return quotes[hashString(getDateKey(new Date())) % quotes.length]
  }

  if (rotationMode === 'week') {
    return quotes[hashString(getWeekKey(new Date())) % quotes.length]
  }

  const stored = window.sessionStorage.getItem(SESSION_KEY)
  const storedQuote = stored ? quotes.find((q) => String(q.id) === stored) : undefined
  if (storedQuote) return storedQuote

  const quote = quotes[Math.floor(Math.random() * quotes.length)]
  window.sessionStorage.setItem(SESSION_KEY, String(quote.id))
  return quote
}

export function DynamicQuote({
  quotes,
  rotationMode = 'day',
  quoteFontFamily,
  quoteFontSize,
  quoteFontColor,
  attributionFontFamily,
  attributionFontSize,
  attributionFontColor,
}: Props) {
  const [selected, setSelected] = useState<Pick<Quote, 'id' | 'quote' | 'attribution'> | null>(
    quotes[0] ?? null,
  )

  useEffect(() => {
    if (!quotes.length) return
    setSelected(pickQuote(quotes, rotationMode ?? 'day'))
  }, [quotes, rotationMode])

  if (!selected) return null

  return (
    <QuoteBlock
      quote={selected.quote}
      attribution={selected.attribution}
      quoteFontSize={quoteFontSize}
      quoteFontColor={quoteFontColor}
      quoteFontFamily={quoteFontFamily}
      attributionFontSize={attributionFontSize}
      attributionFontColor={attributionFontColor}
      attributionFontFamily={attributionFontFamily}
    />
  )
}
