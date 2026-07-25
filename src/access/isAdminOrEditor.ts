import type { Access, PayloadRequest } from 'payload'

import type { User } from '@/payload-types'

export const isAdminOrEditor: Access = ({ req: { user } }) => {
  if (!user) return false
  const role = (user as User).role
  return role === 'admin' || role === 'editor'
}

// Boolean-only function for CollectionConfig `admin` access (must not return Where).
export const canAccessAdmin = ({ req }: { req: PayloadRequest }): boolean => {
  const u = req.user as (User & { collection?: string }) | null | undefined
  if (!u) return false
  // Dual auth: only 'users' collection (staff) can access admin UI; members cannot.
  if (u.collection && u.collection !== 'users') return false
  return u.role === 'admin' || u.role === 'editor'
}
