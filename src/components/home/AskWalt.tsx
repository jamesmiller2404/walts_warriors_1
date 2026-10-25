// Hard-coded for now — capturing the user's entered question will be wired up later.
const ASK_WALT = {
  heading: "Ask Walt · For Wednesday's Q&A",
  placeholder: 'What would you like Walt to talk about...?',
};

const fontSans3 = { fontFamily: 'var(--font-source-sans-3), sans-serif' };

export function AskWalt() {
  return (
    <div className="w-full rounded-lg bg-[#3a3c4e]/50 px-6 py-6" aria-label="Ask Walt">
      <p
        className="text-lg font-semibold uppercase tracking-[0.08em] text-[#c5d7e2]"
        style={fontSans3}
      >
        {ASK_WALT.heading}
      </p>

      <textarea
        rows={3}
        aria-label={ASK_WALT.placeholder}
        placeholder={ASK_WALT.placeholder}
        className="mt-4 w-full resize-none rounded-md bg-[#c5d7e2] px-4 py-3 text-xl text-[#2c353b] placeholder:text-[#2c353b]/60 focus:outline-none focus:ring-2 focus:ring-[#e3a64e]"
        style={fontSans3}
      />

      {/* Placeholder — capturing the entered question will be wired up later */}
      <button
        type="button"
        className="mt-3 inline-block rounded-md border border-[#c5d7e2]/80 px-4 py-1 text-xl text-[#c5d7e2] transition hover:bg-white/10"
        style={fontSans3}
      >
        Send
      </button>
    </div>
  );
}
