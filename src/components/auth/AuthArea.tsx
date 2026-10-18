import Link from 'next/link'

import { getCurrentMember } from '@/lib/auth'
import { LogoutButton } from './LogoutButton'

// Server-rendered account area for the hero's top-right icons. When signed in
// it shows the member's display name plus a logout button; otherwise a login
// link. Styled for the dark hero background.
export async function AuthArea() {
  const member = await getCurrentMember()

  if (!member) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="rounded-[999px] bg-white/15 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/25"
        >
          Log in
        </Link>
        <Link
          href="/register"
          className="rounded-[999px] bg-white px-4 py-1.5 text-sm font-semibold text-stone-900 transition hover:bg-stone-200"
        >
          Sign up
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <span className="max-w-[8rem] truncate text-sm font-semibold text-white">
        {member.displayName || 'Member'}
      </span>
      <LogoutButton className="rounded-[999px] bg-white/15 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/25" />
    </div>
  )
}
