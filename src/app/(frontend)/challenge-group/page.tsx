import type { Metadata } from 'next';

import { PillarBalance } from '@/components/challenge-group/PillarBalance';
import { ChallengeGroupBanner } from '@/components/challenge-group/ChallengeGroupBanner';
import { CheckInBalance } from '@/components/challenge-group/CheckInBalance';
import { LeaderboardButton } from '@/components/challenge-group/LeaderboardButton';
import { PointsSummary } from '@/components/challenge-group/PointsSummary';
import { YourWins } from '@/components/challenge-group/YourWins';
import { CheckInHeader } from '@/components/checkin/CheckInHeader';

export const metadata: Metadata = {
  title: 'Challenge Group',
};

export default function ChallengeGroupPage() {
  return (
    // Page background gradient — shared by the header and the sections that
    // will be added between the header and the footer.
    <div
      className="flex min-h-full flex-col"
      style={{ backgroundImage: 'linear-gradient(45deg, #132640, #183a64)' }}
    >
      {/* Shared site header used by every page except the home page — the
      artwork rotates with the viewer's local time. */}
      <CheckInHeader pageName="Challenge Group" />

      {/* Challenge-group sections are built out here. The site footer is
      rendered by the frontend layout below this page. */}
      <main className="flex-1">
        {/* Banner spans the full display width, directly under the header. */}
        <ChallengeGroupBanner />

        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 pb-10 pt-3 sm:px-8 lg:px-10">
          {/* Two-column row — points summary (1/3) beside the current or most
              recent check-in balance (2/3). The right column previously held the
              whole row on its own. */}
          <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <PointsSummary />
            <CheckInBalance />
          </div>

          <PillarBalance />

          {/* Two-column row below the balance triangle — recent wins (2/3) on
              the left; the right column is reserved for the next section. */}
          <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <YourWins />
          </div>

          {/* Leader Board — page action at the lower left; opens the modal. */}
          <div className="flex w-full justify-start pt-2">
            <LeaderboardButton />
          </div>
        </div>
      </main>
    </div>
  );
}
