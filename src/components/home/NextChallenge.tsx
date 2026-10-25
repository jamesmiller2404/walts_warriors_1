// Hard-coded for now — content will be wired from the admin panel eventually.
const NEXT_CHALLENGE = {
  heading: 'Next challenge',
  title: 'November challenge group',
  detail: 'Starts Nov 2 · Strength and balance focus',
  signupUrl: '#',
};

const fontSans3 = { fontFamily: 'var(--font-source-sans-3), sans-serif' };

export function NextChallenge() {
  return (
    <div className="w-full rounded-lg bg-[#3a3c4e]/50 px-6 py-6" aria-label="Next challenge">
      <p
        className="text-lg font-semibold uppercase tracking-[0.08em] text-[#c5d7e2]"
        style={fontSans3}
      >
        {NEXT_CHALLENGE.heading}
      </p>

      <p className="mt-3 text-2xl font-bold text-[#c5d7e2]" style={fontSans3}>
        {NEXT_CHALLENGE.title}
      </p>
      <p className="mt-1 text-xl text-[#c5d7e2]" style={fontSans3}>
        {NEXT_CHALLENGE.detail}
      </p>

      <a
        href={NEXT_CHALLENGE.signupUrl}
        className="mt-3 inline-block rounded-md border border-[#c5d7e2]/80 px-4 py-1 text-xl uppercase tracking-[0.08em] text-[#c5d7e2] transition hover:bg-white/10"
        style={fontSans3}
      >
        Register your spot
      </a>
    </div>
  );
}
