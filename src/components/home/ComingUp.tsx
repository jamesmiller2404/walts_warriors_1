// Hard-coded for now — wire up from the admin panel (Events collection) later.
const COMING_UP_EVENTS = [
  {
    title: 'Live Q&A with Walt',
    detail: 'Wednesday, 7:00 pm Eastern',
    signupUrl: '#',
  },
  {
    title: 'Challenge group walk',
    detail: 'Saturday, 9:00 am Eastern, join from anywhere',
    signupUrl: '#',
  },
];

const fontSans3 = { fontFamily: 'var(--font-source-sans-3), sans-serif' };

export function ComingUp() {
  return (
    <div className="w-full rounded-lg bg-[#3a3c4e]/50 px-6 py-6" aria-label="Coming up events">
      <p
        className="text-lg font-semibold uppercase tracking-[0.08em] text-[#c5d7e2]"
        style={fontSans3}
      >
        Coming up
      </p>

      <ul>
        {COMING_UP_EVENTS.map((event, index) => (
          <li
            key={event.title}
            className={index > 0 ? 'mt-5 border-t border-[#c5d7e2]/40 pt-5' : 'mt-4'}
          >
            <p className="text-2xl font-bold text-[#c5d7e2]" style={fontSans3}>
              {event.title}
            </p>
            <p className="mt-1 text-xl text-[#c5d7e2]" style={fontSans3}>
              {event.detail}
            </p>
            <a
              href={event.signupUrl}
              className="mt-3 inline-block rounded-md border border-[#c5d7e2]/80 px-4 py-1 text-xl text-[#c5d7e2] transition hover:bg-white/10"
              style={fontSans3}
            >
              Sign up
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
