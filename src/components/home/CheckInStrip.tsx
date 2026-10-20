import type { ReactNode } from 'react'

type CheckInStatus = 'not-checked-in' | 'partial' | 'complete'

// Hard-coded for now — wire up real check-in state later.
// 'not-checked-in' → CHECK IN button (gold)
// 'partial'        → CONTINUE CHECK IN button (gold)
// 'complete'       → CHECK IN COMPLETE button (green)
const CHECK_IN_STATUS: CheckInStatus = 'complete'

// Placeholder values — wire up real data later.
const STREAK_DAYS = 4
const COMPLETED_STREAK_DAYS = 5
const LEADER_POSITION = '4th'

const fontSans3 = { fontFamily: 'var(--font-source-sans-3), sans-serif' }

const statusConfig: Record<
  CheckInStatus,
  { label: string; buttonColor: string; interactive: boolean }
> = {
  'not-checked-in': { label: 'Check In', buttonColor: '#e3a64e', interactive: true },
  partial: { label: 'Continue Check In', buttonColor: '#e3a64e', interactive: true },
  complete: { label: 'Check In Complete', buttonColor: '#00d80a', interactive: false },
}

function StreakLabel({ children }: { children: ReactNode }) {
  return (
    <p
      className="text-xl font-semibold tracking-[0.08em] text-[#dbe7ee] uppercase"
      style={fontSans3}
    >
      {children}
    </p>
  )
}

function StreakCount({ children }: { children: ReactNode }) {
  return (
    <p className="text-3xl font-bold text-white" style={fontSans3}>
      {children}
    </p>
  )
}

export function CheckInStrip() {
  const { label, buttonColor, interactive } = statusConfig[CHECK_IN_STATUS]
  const streakDays = CHECK_IN_STATUS === 'complete' ? COMPLETED_STREAK_DAYS : STREAK_DAYS

  return (
    <section className="w-full bg-[#5c5678]" aria-label="Daily check-in">
      <div className="mx-auto flex max-w-[1100px] flex-wrap justify-center gap-x-16 gap-y-5 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-10">
        {/* Left — daily summary */}
        <div>
          <StreakLabel>Current Daily Summary</StreakLabel>
          <StreakCount>{streakDays}-day streak!</StreakCount>
        </div>

        {/* Right — check-in button + leader position */}
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-8">
          {interactive ? (
            <button
              type="button"
              className="rounded-lg px-8 py-3 text-2xl font-semibold text-[#13233a] transition hover:opacity-90 sm:text-3xl"
              style={{ ...fontSans3, backgroundColor: buttonColor }}
            >
              {label}
            </button>
          ) : (
            <span
              className="inline-block rounded-lg px-8 py-3 text-2xl font-semibold text-[#13233a] sm:text-3xl"
              style={{ ...fontSans3, backgroundColor: buttonColor }}
            >
              {label}
            </span>
          )}

          <p className="text-2xl font-bold text-[#dbe7ee]" style={fontSans3}>
            Leader position: <span className="text-white">{LEADER_POSITION}</span>
          </p>
        </div>
      </div>
    </section>
  )
}
