import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { ThisWeek } from '@/components/dashboard/ThisWeek';
import { YourJourney } from '@/components/dashboard/YourJourney';
import { Balance } from '@/components/dashboard/Balance';
import { YourRecentWins } from '@/components/dashboard/YourRecentWins';
import { Greeting } from '@/components/dashboard/Greeting';
import { LifetimeTotals } from '@/components/dashboard/LifetimeTotals';
import { CheckInHeader } from '@/components/checkin/CheckInHeader';
import { getCurrentAccount } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Dashboard',
};

// Vertical gap between stacked cards inside a column — 30px at the 1440px
// design width (mockup-measured gap between dashboard cards).
const COLUMN_GAP = 'clamp(16px, 2.0833vw, 30px)';

export default async function DashboardPage() {
  // Member-only page: unsigned-in visitors go to the login page (same gate
  // as the check-in page).
  const account = await getCurrentAccount();
  if (!account) redirect('/login');

  // "Maria Kozlowski" → first: "Maria", lastInitial: "K". Falls back to the
  // whole displayName as the first part when there is only one word.
  // (Same split logic as the check-in page.)
  const parts = (account.displayName ?? '').trim().split(/\s+/);
  const firstName = parts[0] || '';
  const lastInitial = parts.length >= 2 && parts[1] ? parts[1].charAt(0).toUpperCase() : '';

  return (
    // Page background gradient — shared with the check-in page.
    <div
      className="flex min-h-full flex-col"
      style={{ backgroundImage: 'linear-gradient(45deg, #132640, #183a64)' }}
    >
      <CheckInHeader pageName="Dashboard" firstName={firstName} lastInitial={lastInitial} />

      {/* Greeting band — "Good {morning|afternoon|evening}, {firstName}!"
      addressed to the signed-in account (client component: the greeting word
      follows the viewer's local time). */}
      <main className="flex-1">
        <Greeting firstName={firstName} />

        {/* Two-column dashboard body — the same wide/narrow column treatment
        as the home page: wide (left) column up to 1020px for the large cards,
        narrow (right) column 340px for the small ones, with the same 28px lg
        gap and container padding. */}
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 pb-10 pt-3 sm:px-8 lg:flex-row lg:items-start lg:gap-7 lg:px-10">
          {/* Left (wide) column — This Week is the first section; later
          dashboard sections stack below it in admin order. */}
          <div
            className="flex w-full min-w-0 flex-col lg:max-w-[1020px]"
            style={{ gap: COLUMN_GAP }}
          >
            <ThisWeek />
            <YourJourney />
            <Balance />
            <YourRecentWins />
          </div>

          {/* Right (narrow) column — small cards stack here in order. */}
          <div
            className="flex w-full flex-col lg:w-[340px] lg:shrink-0"
            style={{ gap: COLUMN_GAP }}
          >
            <LifetimeTotals firstName={firstName} />
          </div>
        </div>
      </main>
    </div>
  );
}
