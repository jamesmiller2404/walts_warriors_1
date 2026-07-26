'use client'

import Link from 'next/link'

type NavCardData = {
  heading: string
  description: string
  icon: string
  href: string
  variant?: 'maroon'
}

const navCards: NavCardData[] = [
  // TODO: Replace href values with real routes when destination pages exist
  {
    heading: 'Programs',
    description: 'Explore our structured programs designed to build discipline, resilience, and community.',
    icon: '🏋️',
    href: '/TODO-programs',
  },
  {
    heading: 'Resources',
    description: 'Access guides, worksheets, and tools to support your wellness journey.',
    icon: '📚',
    href: '/TODO-resources',
  },
  {
    heading: 'Challenges',
    description: 'Take part in community challenges that push you to grow stronger every day.',
    icon: '🏆',
    href: '/TODO-challenges',
  },
  {
    heading: 'Events',
    description: 'See upcoming workshops, meetups, and events hosted by Walt\'s Warriors.',
    icon: '📅',
    href: '/TODO-events',
  },
  {
    heading: 'Contact Us',
    description: 'Reach out — we\'d love to hear from you and help you get started.',
    icon: '💪',
    href: '/TODO-contact',
    variant: 'maroon',
  },
]

function NavCard({ card }: { card: NavCardData }) {
  const isMaroon = card.variant === 'maroon'

  return (
    <Link
      href={card.href}
      className={`
        nav-card relative flex flex-col rounded-xl border-1 p-6
        transition-all duration-200 ease-out
        ${isMaroon
          ? 'text-red-50 border-white/10'
          : 'text-white border-white/10'
        }
        focus-visible:outline-none
      `}
      style={{
        boxShadow: '0 10px 15px 2px rgba(0,0,0,0.9)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 15px 15px -5px rgba(0,0,0,0.9), 0 0 30px rgba(255, 153, 0, 0.9)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 10px 15px -5px rgba(0,0,0,0.9)'
      }}
      onFocus={(e) => {
        e.currentTarget.style.boxShadow = '0 10px 15px -5px rgba(0,0,0,0.9), 0 0 30px rgba(143,126,100,0.5)'
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = '0 10px 15px -5px rgba(0,0,0,0.9)'
        e.currentTarget.style.outline = 'none'
      }}
    >
      <div
        className="absolute inset-0 rounded-xl"
        style={{
          background: isMaroon
            ? 'linear-gradient(135deg, rgba(26,19,35, 0.86), rgba(74,40,53, 0.55))'
            : 'linear-gradient(135deg, rgba(44,51,64, 0.75), rgba(17,24,39, 0.95))',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
      />
      <div className="relative z-10 flex flex-col">
        <span className="mb-3 inline-block text-3xl" aria-hidden="true">
          {card.icon}
        </span>

        <h3 className="text-lg font-semibold tracking-tight">{card.heading}</h3>

        <p className={`mt-1 text-sm leading-relaxed ${isMaroon ? 'text-red-200' : 'text-stone-300'}`}>
          {card.description}
        </p>

        <span
          className={`mt-3 text-sm font-medium ${isMaroon ? 'text-red-300' : 'text-orange-400'}`}
        >
          Learn more →
        </span>
      </div>
    </Link>
  )
}

export function NavCards() {
  const firstRow = navCards.slice(0, 3)
  const secondRow = navCards.slice(3)

  return (
    <section className="space-y-6 mt-32 lg:mt-[200px]">
      <style>{`
@media (prefers-reduced-motion: reduce) {
  .nav-card { transition: none !important; transform: none !important; }
}
      `}</style>
      <div className="grid gap-6 sm:grid-cols-3">
        {firstRow.map((card) => (
          <NavCard key={card.heading} card={card} />
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {secondRow.map((card) => (
          <NavCard key={card.heading} card={card} />
        ))}
      </div>
    </section>
  )
}
