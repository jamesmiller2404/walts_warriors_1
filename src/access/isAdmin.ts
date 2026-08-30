import type { Access, FieldAccess } from 'payload'

import type { User } from '@/payload-types'

export const isAdmin: Access = ({ req: { user } }) => {
  const u = user as (User & { collection?: string }) | null | undefined
  return Boolean(u && u.collection === 'users' && u.role === 'admin')
}

export const isAdminFieldLevel: FieldAccess = ({ req: { user } }) => {
  const u = user as (User & { collection?: string }) | null | undefined
  return Boolean(u && u.collection === 'users' && u.role === 'admin')
}
