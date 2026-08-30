import type { Access, FieldAccess } from 'payload'

type AuthedUser = {
  id: number | string
  collection?: string
}

export const isStaff: Access = ({ req: { user } }) => {
  const u = user as AuthedUser | null | undefined
  return Boolean(u && u.collection === 'users')
}

export const isStaffFieldLevel: FieldAccess = ({ req: { user } }) => {
  const u = user as AuthedUser | null | undefined
  return Boolean(u && u.collection === 'users')
}
