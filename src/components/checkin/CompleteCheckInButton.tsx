'use client';

import { useRouter } from 'next/navigation';

const fontSans3 = { fontFamily: 'var(--font-source-sans-3), sans-serif' };

// Last element on the check-in page: the "Complete check-in" button, aligned to
// the lower right below the "A Note from Walt" section. Per the mockup: gold
// fill, no border, dark purple text, 480x100 at the 1440px design width —
// subsequently reduced 25% in size (button and text) per stakeholder request,
// so 360x75 with a 36px cap on the text. Sizing follows the page's fluid
// convention — vw-proportional with clamp() floors. Clicking completes the
// check-in flow (persistence TODO) and navigates to the member's dashboard.
export function CompleteCheckInButton() {
  const router = useRouter();

  return (
    <div
      className="flex justify-end"
      style={{
        marginTop: 'clamp(16px, 2.5vw, 36px)',
        marginBottom: 'clamp(16px, 2.5vw, 36px)',
        marginLeft: '1.5%',
        marginRight: '1.5%',
      }}
    >
      <button
        type="button"
        onClick={() => {
          /* TODO: persist the member's check-in completion for today. */
          router.push('/dashboard');
        }}
        className="cursor-pointer rounded-lg bg-[#e3a64e] text-[#3f4066] transition hover:opacity-80"
        style={{
          ...fontSans3,
          // 75% of the original mockup sizing (text 48→36px, button 480x100→360x75
          // at the 1440px design width; floors scaled the same way).
          fontSize: 'clamp(18px, 2.5vw, 36px)',
          fontWeight: 600,
          width: 'clamp(210px, 25vw, 360px)',
          height: 'clamp(42px, 5.2083vw, 75px)',
          lineHeight: 1.2,
        }}
      >
        Complete check-in
      </button>
    </div>
  );
}
