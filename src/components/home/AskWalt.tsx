import { getCurrentAccount } from '@/lib/auth';

import { AskWaltForm } from './AskWaltForm';

const ASK_WALT = {
  heading: "Ask Walt · For Wednesday's Q&A",
  placeholder: 'What would you like Walt to talk about...?',
};

// Kept in sync with the server-side validation in src/lib/askWaltActions.ts.
const MAX_QUESTION_LENGTH = 1000;

const fontSans3 = { fontFamily: 'var(--font-source-sans-3), sans-serif' };

export async function AskWalt() {
  // Any signed-in account (member or staff) can submit; guests get a login link.
  const account = await getCurrentAccount();

  return (
    <div className="w-full rounded-lg bg-[#3a3c4e]/50 px-6 py-6" aria-label="Ask Walt">
      <p
        className="text-lg font-semibold uppercase tracking-[0.08em] text-[#c5d7e2]"
        style={fontSans3}
      >
        {ASK_WALT.heading}
      </p>

      <AskWaltForm
        signedIn={Boolean(account)}
        placeholder={ASK_WALT.placeholder}
        maxLength={MAX_QUESTION_LENGTH}
      />
    </div>
  );
}
