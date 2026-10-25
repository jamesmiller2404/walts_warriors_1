import Image from 'next/image';

// Hard-coded for now — wins and shout-outs will be wired from the backend later.
const GROUP_FEED = [
  {
    name: 'Maria K',
    accomplishment: 'finished her first full week',
    icon: '/icons/magnet-magnetic-black-icon.svg',
  },
  {
    name: 'Tom R',
    accomplishment: 'earned the Halfway badge',
    icon: '/icons/dimension-3d-icon.svg',
  },
  {
    name: 'Pat S',
    accomplishment: 'is back after a missed day',
    icon: '/icons/hand-two-finger-icon.svg',
  },
  {
    name: 'Priya S',
    accomplishment: 'Tried roasted cauliflower and actually liked it',
    icon: '/icons/award-icon.svg',
  },
  {
    name: 'Tom R',
    accomplishment: 'Walked the dog an extra block each evening',
    icon: '/icons/sparkle-icon.svg',
  },
];

const fontSans3 = { fontFamily: 'var(--font-source-sans-3), sans-serif' };

// Monochrome smiley shown on the Encourage buttons (matches the mockup's emoji).
function SmileyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#ffffff" />
      <circle cx="8.5" cy="9.5" r="1.6" fill="#13233a" />
      <circle cx="15.5" cy="9.5" r="1.6" fill="#13233a" />
      <path
        d="M7.5 14.5c1.1 1.7 2.6 2.6 4.5 2.6s3.4-.9 4.5-2.6"
        stroke="#13233a"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function WinsFromChallengeGroup() {
  return (
    <div className="w-full rounded-lg bg-[#3a3c4e] px-8 py-8" aria-label="Group feed">
      <h2
        className="text-xl font-semibold uppercase tracking-[0.08em] text-[#c5d7e2]"
        style={fontSans3}
      >
        Group feed
      </h2>

      <p className="mt-3 text-3xl text-[#c5d7e2]" style={fontSans3}>
        Wins and shout-outs for your challenge group
      </p>

      <ul className="mt-6">
        {GROUP_FEED.map((item) => (
          <li
            key={`${item.name}-${item.accomplishment}`}
            className="flex items-center justify-between gap-6 border-t border-[#c5d7e2]/40 py-5"
          >
            <div className="flex min-w-0 items-center gap-4">
              <Image src={item.icon} alt="" width={24} height={24} className="h-6 w-6 shrink-0" />
              <p className="text-2xl text-[#c5d7e2]" style={fontSans3}>
                {item.name} · {item.accomplishment}
              </p>
            </div>

            {/* Placeholder — the emoji encouragement delivery mechanism isn't built yet */}
            <button
              type="button"
              title="Emoji encouragement coming soon"
              aria-label={`Send emoji encouragement to ${item.name}`}
              className="inline-flex shrink-0 items-center gap-3 rounded-lg border border-[#c5d7e2]/80 px-5 py-1.5 text-2xl text-[#c5d7e2] transition hover:bg-white/10"
              style={fontSans3}
            >
              Encourage
              <SmileyIcon />
            </button>
          </li>
        ))}
      </ul>

      {/* Dummy link for now — point at the community page once it exists */}
      <a
        href="#"
        className="mt-6 inline-block text-3xl font-bold text-[#2489f2] transition hover:underline"
        style={fontSans3}
      >
        See all in Community
      </a>
    </div>
  );
}
