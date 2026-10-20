import Image from 'next/image'

// Hard-coded for now — wins will be wired from the admin panel eventually.
const WINS = [
  {
    icon: '/icons/award-icon.svg',
    text: 'Tried roasted cauliflower and actually liked it · Priya S.',
  },
  {
    icon: '/icons/trophy-icon.svg',
    text: 'Walked the dog an extra block each evening · Tom R.',
  },
  {
    icon: '/icons/fire-icon.svg',
    text: '1 of 3 tasks done · 4-day streak · you can miss 2 more days',
  },
]

const fontSans3 = { fontFamily: 'var(--font-source-sans-3), sans-serif' }

export function WinsFromChallengeGroup() {
  return (
    <div
      className="w-full rounded-lg bg-[#3a3c4e] px-8 py-7"
      aria-label="Wins from your challenge group"
    >
      <p
        className="text-lg font-semibold uppercase tracking-[0.08em] text-[#c5d7e2]"
        style={fontSans3}
      >
        Wins from your challenge group
      </p>

      <ul className="mt-4 space-y-3">
        {WINS.map((win) => (
          <li key={win.text} className="flex items-center gap-3">
            <Image src={win.icon} alt="" width={24} height={24} className="h-6 w-6 shrink-0" />
            <p className="text-xl text-[#c5d7e2]" style={fontSans3}>
              {win.text}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}