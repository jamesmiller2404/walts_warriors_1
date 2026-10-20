'use client'

import { useState } from 'react'

// Hard-coded for now — wire up from the admin panel later.
const NOTE_FROM = 'From Walt'
const NOTE_FOCUS = "This week's focus: Sleep"
const NOTE_BODY =
  "Good sleep makes every other habit easier. This week, pick a bedtime you can keep and protect it. I'll share my wind-down routine at Wednesday's Q&A."

const fontSans3 = { fontFamily: 'var(--font-source-sans-3), sans-serif' }

export function NoteFromWalt() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <section className="w-full" aria-label="Note from Walt">
      <div className="mx-auto max-w-[1100px] px-6 pt-6 sm:px-10">
        <div className="relative flex overflow-hidden rounded-lg bg-[#3a3c4e]">
          {/* Gold accent bar */}
          <div className="w-2 shrink-0 bg-[#e3a64e]" aria-hidden="true" />

          <div className="flex-1 py-7 pl-8 pr-14">
            <p
              className="text-lg font-semibold uppercase tracking-[0.08em] text-[#c5d7e2]"
              style={fontSans3}
            >
              {NOTE_FROM} · {NOTE_FOCUS}
            </p>

            <p className="mt-3 text-2xl font-bold leading-snug text-white" style={fontSans3}>
              {NOTE_BODY}
            </p>
          </div>

          {/* Dismiss button */}
          <button
            type="button"
            onClick={() => setVisible(false)}
            aria-label="Dismiss note from Walt"
            className="absolute top-3 right-4 p-1 text-[#9aa3b2] transition hover:text-white"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}