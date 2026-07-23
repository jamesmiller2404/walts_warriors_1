import type { Access, FieldAccess } from 'payload'

import type { User } from '@/payload-types'

export const isAdmin: Access = ({ req: { user } }) => {
  return Boolean(user && (user as User).role === 'admin')
}

export const isAdminFieldLevel: FieldAccess = ({ req: { user } }) => {
  return Boolean(user && (user as User).role === 'admin')
}
