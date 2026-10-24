import Image from 'next/image'

// Hard-coded for now — this feature will be defined in the admin panel when it goes live.
const LIBRARY_FEATURE = {
  heading: 'This week in the library · Sleep',
  title: 'A five-minute wind-down routine',
  meta: 'Read · 4 min',
  url: '#',
  icon: '/icons/crescentMoon1.svg',
}

const fontSans3 = { fontFamily: 'var(--font-source-sans-3), sans-serif' }

export function ThisWeekInLibrary() {
  return (
    <div className="w-full rounded-lg bg-[#3a3c4e]/50 px-6 py-6" aria-label="This week in the library">
      <p
        className="text-lg font-semibold uppercase tracking-[0.08em] text-[#c5d7e2]"
        style={fontSans3}
      >
        {LIBRARY_FEATURE.heading}
      </p>

      {/* Feature banner */}
      <div className="mt-4 flex h-60 items-center justify-center rounded-lg bg-[#13233a]">
        <Image src={LIBRARY_FEATURE.icon} alt="" width={240} height={240} className="h-60 w-60" />
      </div>

      <p className="mt-4 text-xl text-[#c5d7e2]" style={fontSans3}>
        {LIBRARY_FEATURE.title}
      </p>
      <p className="mt-1 text-lg text-[#c5d7e2]" style={fontSans3}>
        {LIBRARY_FEATURE.meta}
      </p>

      <a
        href={LIBRARY_FEATURE.url}
        className="mt-3 inline-block rounded-md border border-[#c5d7e2]/80 px-4 py-1 text-xl text-[#c5d7e2] transition hover:bg-white/10"
        style={fontSans3}
      >
        Open
      </a>
    </div>
  )
}