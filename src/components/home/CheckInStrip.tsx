import type { ReactNode } from 'react'

type CheckInStatus = 'not-checked-in' | 'partial' | 'complete'

// Hard-coded for now — wire up real check-in state later.
// 'not-checked-in' → CHECK IN button (gold)
// 'partial'        → CONTINUE CHECK IN button (gold)
// 'complete'       → CHECK-IN COMPLETE button (green)
const CHECK_IN_STATUS: CheckInStatus = 'partial'

// Placeholder values — wire up real data later.
const CURRENT_DAY = 4
const COMPLETED_DAY = 5
const CHALLENGE_LENGTH = 30
const STREAK_DAYS = 4
const TARGET_STREAK_DAYS = 5
const TASKS_COMPLETED = 1
const TASKS_TOTAL = 3

const fontSans3 = { fontFamily: 'var(--font-source-sans-3), sans-serif' }

const statusConfig: Record<
  CheckInStatus,
  { label: string; buttonColor: string; interactive: boolean }
> = {
  'not-checked-in': { label: 'Check In', buttonColor: '#e3a64e', interactive: true },
  partial: { label: 'Continue Check In', buttonColor: '#e3a64e', interactive: true },
  complete: { label: 'Check-In Complete', buttonColor: '#8dbf21', interactive: false },
}

function StreakLabel({ day }: { day: number }) {
  return (
    <p
      className="text-2xl font-semibold tracking-[0.08em] text-[#c5d7e2] uppercase"
      style={fontSans3}
    >
      Today, Day {day} of {CHALLENGE_LENGTH}
    </p>
  )
}

function Bold({ children }: { children: ReactNode }) {
  return <span className="font-bold">{children}</span>
}

export function CheckInStrip() {
  const { label, buttonColor, interactive } = statusConfig[CHECK_IN_STATUS]
  const day = CHECK_IN_STATUS === 'complete' ? COMPLETED_DAY : CURRENT_DAY

  return (
    <section className="w-full bg-[#5c5678]" aria-label="Daily check-in">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-x-16 gap-y-5 px-4 py-9 sm:px-8 lg:px-10">
        {/* Left — daily summary */}
        <div>
          <StreakLabel day={day} />

          {CHECK_IN_STATUS === 'not-checked-in' && (
            <p className="mt-2 text-4xl text-[#c5d7e2]" style={fontSans3}>
              <Bold>{STREAK_DAYS}-day streak</Bold> · Complete check-in to make it{' '}
              {TARGET_STREAK_DAYS} days!
            </p>
          )}

          {CHECK_IN_STATUS === 'partial' && (
            <>
              <p className="mt-2 text-4xl text-[#c5d7e2]" style={fontSans3}>
                <Bold>{TASKS_COMPLETED}</Bold> of {TASKS_TOTAL} tasks complete
              </p>
              <p className="mt-2 text-2xl text-[#c5d7e2]" style={fontSans3}>
                <Bold>{STREAK_DAYS}-day streak</Bold> · Check-in today to make it{' '}
                {TARGET_STREAK_DAYS}
              </p>
            </>
          )}

          {CHECK_IN_STATUS === 'complete' && (
            <p className="mt-2 text-4xl font-bold text-[#c5d7e2]" style={fontSans3}>
              {COMPLETED_DAY} day streak!
            </p>
          )}
        </div>

        {/* Right — check-in button */}
        {interactive ? (
          <button
            type="button"
            className="flex h-[76px] items-center justify-center rounded-lg px-8 text-4xl font-bold uppercase text-[#2c353b] transition hover:opacity-90"
            style={{ ...fontSans3, backgroundColor: buttonColor }}
          >
            {label}
          </button>
        ) : (
          <span
            className="flex h-[76px] items-center justify-center rounded-lg px-8 text-4xl font-bold uppercase text-[#2c353b]"
            style={{ ...fontSans3, backgroundColor: buttonColor }}
          >
            {label}
          </span>
        )}
      </div>
    </section>
  )
}
