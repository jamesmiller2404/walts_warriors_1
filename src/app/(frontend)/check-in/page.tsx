import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { ActionsCheckOff } from '@/components/checkin/ActionsCheckOff';
import { CheckInHeader } from '@/components/checkin/CheckInHeader';
import { getCurrentMember } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Challenge Check-In',
};

export default async function CheckInPage() {
  // The check-in page is member-only; unsigned-in visitors go to the login page.
  const member = await getCurrentMember();
  if (!member) redirect('/login');

  // "Maria Kozlowski" → first: "Maria", lastInitial: "K". Falls back to the
  // whole displayName as the first part when there is only one word.
  // (Same split logic as splitMemberName in Hero.tsx.)
  const parts = (member.displayName ?? '').trim().split(/\s+/);
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

      {/* Check-in sections — first is the actions check-off (dummy UI for now;
      the user's ticks will be recorded in the DB for their day once wired up). */}
      <main className="flex-1">
        <ActionsCheckOff />
      </main>
    </div>
  );
}
