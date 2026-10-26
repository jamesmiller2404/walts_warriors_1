'use client';

import { useEffect, useState } from 'react';

const fontSans3 = { fontFamily: 'var(--font-source-sans-3), sans-serif' };

// Greeting word by the viewer's LOCAL hour (the server cannot know it). The
// server-rendered default matches the mockup text ("Good morning"); the
// client swaps it after mount — same SSR-safe pattern as the header clock.
function greetingForHour(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

type Props = {
  /** Signed-in account's first name, addressed by the greeting. */
  firstName?: string | null;
};

// Dummy member line under the greeting — the real join date and check-in
// count will be computed from the member's records and wired up later.
const MEMBER_LINE = 'Member since August \u201826 \u00B7 36 check-ins and counting';

// Dashboard greeting band — the centered block between the header and the
// two-column body: "Good morning, Lisa!" over "Member since August '26 ·
// 36 check-ins and counting" (both from the mockup). Greeting 48px / member
// line 30px semibold at the 1440px design width with clamp floors. The
// band's spacing is half the mockup's, per the tightened design.
export function Greeting({ firstName = null }: Props) {
  const [greeting, setGreeting] = useState('Good morning');

  useEffect(() => {
    const update = () => setGreeting(greetingForHour(new Date().getHours()));
    update();
    // Minute-level display; refresh every 30s so an open tab rolls over on time.
    const timer = setInterval(update, 30_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center">
      <h1
        className="text-[#c5d7e2]"
        style={{
          ...fontSans3,
          fontSize: 'clamp(24px, 3.33vw, 48px)',
          fontWeight: 600,
          lineHeight: 1.2,
          marginTop: 'clamp(2px, 0.25vw, 4px)',
          marginBottom: 'clamp(8px, 0.97vw, 14px)',
        }}
      >
        {greeting}
        {firstName ? `, ${firstName}!` : '!'}
      </h1>

      <p
        className="text-[#c5d7e2]"
        style={{
          ...fontSans3,
          fontSize: 'clamp(13px, 2.0833vw, 30px)',
          fontWeight: 600,
          lineHeight: 1.2,
          marginBottom: 'clamp(12px, 1.74vw, 25px)',
        }}
      >
        {MEMBER_LINE}
      </p>
    </div>
  );
}
