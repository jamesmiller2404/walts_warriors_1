import Link from 'next/link';

import { getCurrentAccount } from '@/lib/auth';
import { LogoutButton } from './LogoutButton';

// Server-rendered account area for the hero's top-right icons. When signed in
// it shows the account's display name (member or staff/administrator) plus a
// logout button; otherwise a login link. Styled for the dark hero background.
export async function AuthArea() {
  const account = await getCurrentAccount();

  if (!account) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/login"
          className="shrink-0 whitespace-nowrap rounded-[999px] bg-white/15 px-2.5 py-1.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/25 sm:px-4"
        >
          Log in
        </Link>
        <Link
          href="/register"
          className="shrink-0 whitespace-nowrap rounded-[999px] bg-white px-2.5 py-1.5 text-sm font-semibold text-stone-900 transition hover:bg-stone-200 sm:px-4"
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <span className="max-w-[8rem] truncate text-sm font-semibold text-white">
        {account.displayName || 'Member'}
      </span>
      <LogoutButton className="shrink-0 whitespace-nowrap rounded-[999px] bg-white/15 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/25 sm:px-4" />
    </div>
  );
}
