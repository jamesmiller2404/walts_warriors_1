// Hard-coded for now — wire up real challenge-group check-in data later.
const CHECKED_IN_INITIALS = [
  'MK',
  'TR',
  'PS',
  'JB',
  'GH',
  'TR',
  'YU',
  'CV',
  'NM',
  'OP',
  'FV',
  'ED',
]

// Hard-coded for now — wire up real challenge-group membership later.
const TOTAL_MEMBERS = 18

// Hard-coded for now — wire up the signed-in user's check-in state later.
const YOU_CHECKED_IN = false

// Members who have not checked in and are not the signed-in user
// (shown as unfilled circles without initials).
const OTHER_NOT_CHECKED_IN = TOTAL_MEMBERS - CHECKED_IN_INITIALS.length - (YOU_CHECKED_IN ? 0 : 1)

const fontSans3 = { fontFamily: 'var(--font-source-sans-3), sans-serif' }

// Standard colors (see updated_requirements.md) plus the challenge-group greens.
const COLOR_GREEN_FILL = '#8dbf21'
const COLOR_INITIALS = '#2c353b'
const COLOR_GOLD = '#e3a64e'
const COLOR_TEXT = '#c5d7e2'

function Circle({
  children,
  label,
  fill,
  gold,
}: {
  children?: string
  label: string
  fill?: boolean
  gold?: boolean
}) {
  const base = 'flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold'
  const style = fill
    ? { ...fontSans3, backgroundColor: COLOR_GREEN_FILL, color: COLOR_INITIALS }
    : gold
      ? { ...fontSans3, border: `3px solid ${COLOR_GOLD}`, color: COLOR_GOLD }
      : { ...fontSans3, border: `1.5px solid ${COLOR_TEXT}`, color: COLOR_TEXT }

  return (
    <li role="listitem" aria-label={label} className={`${base} list-none`} style={style}>
      {children}
    </li>
  )
}

export function ChallengeGroupToday() {
  const checkedInCount = CHECKED_IN_INITIALS.length + (YOU_CHECKED_IN ? 1 : 0)

  return (
    <div className="w-full" aria-label="Your challenge group today">
      <h2 className="text-3xl font-bold text-[#c5d7e2]" style={fontSans3}>
        Your challenge group today
      </h2>

            <div className="mt-4 rounded-lg bg-[#3a3c4e] px-8 py-7">
        <p className="text-[#c5d7e2]" style={fontSans3}>
          <span className="text-3xl font-bold">{checkedInCount} of {TOTAL_MEMBERS}</span>
          <span className="text-2xl"> warriors have checked in</span>
        </p>

        <ul className="mt-6 grid grid-cols-4 justify-items-start gap-x-7 gap-y-5 sm:grid-cols-6 lg:grid-cols-8">
          {CHECKED_IN_INITIALS.map((initials, index) => (
            <Circle key={`${initials}-${index}`} label={`Warrior ${initials} checked in today`} fill>
              {initials}
            </Circle>
          ))}

          <Circle
            label={YOU_CHECKED_IN ? 'You checked in today' : "You haven't checked in yet"}
            gold
          >
            You
          </Circle>

          {Array.from({ length: OTHER_NOT_CHECKED_IN }, (_, index) => (
            <Circle key={`not-checked-in-${index}`} label="Warrior has not checked in today" />
          ))}
        </ul>

        <p className="mt-7 text-xl text-[#c5d7e2]" style={fontSans3}>
          Green = checked in today · Gold outline = You
        </p>

        {/* Divider — parts 2 and 3 of this card continue below */}
        <div className="mt-8 border-t border-[#c5d7e2]/40" aria-hidden="true" />
      </div>
    </div>
  )
}