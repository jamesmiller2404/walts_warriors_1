import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { ActionsCheckOff } from '@/components/checkin/ActionsCheckOff';
import { BadgeProgress } from '@/components/checkin/BadgeProgress';
import { TodaysThoughts } from '@/components/checkin/TodaysThoughts';
import { CheckInHeader } from '@/components/checkin/CheckInHeader';
import { getCurrentAccount } from '@/lib/auth';
import { getPayloadClient } from '@/lib/payload';
import {
  resolveCheckInSections,
  type CheckInSectionKey,
  type SectionRow,
} from '@/lib/pageSections';

export const metadata: Metadata = {
  title: 'Challenge Check-In',
};

// Registry mapping each admin-selectable check-in section key to its component.
// New self-contained check-in sections join by building the component and
// adding one entry here plus one option in src/globals/PageSections.ts.
const CHECKIN_SECTION_COMPONENTS: Record<CheckInSectionKey, React.ComponentType> = {
  todaysChallengeCheckIn: ActionsCheckOff,
  badgeProgress: BadgeProgress,
  todaysThoughts: TodaysThoughts,
};

export default async function CheckInPage() {
  // Any signed-in account can view this page. Members get the full check-in
  // flow; staff/administrators are never blocked by challenge registration or
  // other member-only requirements. Unsigned-in visitors go to the login page.
  const account = await getCurrentAccount();
  if (!account) redirect('/login');

  // Section order/on-off config — falls back to the built-in defaults until
  // the admin has saved rows in the `page-sections` global.
  const payload = await getPayloadClient();
  const pageSections = (await payload.findGlobal({ slug: 'page-sections', depth: 0 })) as {
    checkInSections?: Array<SectionRow<CheckInSectionKey>> | null;
  };
  const sections = resolveCheckInSections(pageSections?.checkInSections);

  // "Maria Kozlowski" → first: "Maria", lastInitial: "K". Falls back to the
  // whole displayName as the first part when there is only one word.
  // (Same split logic as splitMemberName in Hero.tsx.)
  const parts = (account.displayName ?? '').trim().split(/\s+/);
  const firstName = parts[0] || '';
  const lastInitial = parts.length >= 2 && parts[1] ? parts[1].charAt(0).toUpperCase() : '';

  return (
    // Page background gradient — shared by the header and the sections that
    // will be added between the header and the footer.
    <div
      className="flex min-h-full flex-col"
      style={{ backgroundImage: 'linear-gradient(45deg, #0f1d2e, #182e49)' }}
    >
      <CheckInHeader
        pageName="Challenge Check-In"
        firstName={firstName}
        lastInitial={lastInitial}
      />

      {/* Admin-managed check-in sections (src/globals/PageSections.ts) — each
      renders in the admin-chosen order; disabled rows are filtered out by
      resolveCheckInSections. */}
      <main className="flex-1">
        {sections.map((s) => {
          const Component = CHECKIN_SECTION_COMPONENTS[s.key];
          return Component ? <Component key={s.key} /> : null;
        })}
      </main>
    </div>
  );
}
