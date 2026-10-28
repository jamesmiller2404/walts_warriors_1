import type { Metadata } from 'next';

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
      <main className="flex-1" />
    </div>
  );
}
