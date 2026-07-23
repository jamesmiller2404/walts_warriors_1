import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminFieldLevel } from '@/access/isAdmin'
import { isAdminOrEditor } from '@/access/isAdminOrEditor'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role'],
    description: 'People who can sign in to the admin panel.',
    group: 'Site Settings',
  },
  auth: true,
  access: {
    admin: isAdminOrEditor,
    create: isAdmin,
    delete: isAdmin,
    read: isAdminOrEditor,
    update: ({ req: { user } }) => {
      if (!user) return false
      if ((user as { role?: string }).role === 'admin') return true
      return { id: { equals: user.id } }
    },
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation === 'create' && data) {
          const existing = await req.payload.find({
            collection: 'users',
            limit: 1,
            depth: 0,
          })
          if (existing.totalDocs === 0) {
            data.role = 'admin'
          }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Display name shown in the admin panel.',
      },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Administrator', value: 'admin' },
        { label: 'Editor (Business Owner)', value: 'editor' },
      ],
      access: {
        create: isAdminFieldLevel,
        update: isAdminFieldLevel,
      },
      admin: {
        description:
          'Administrators manage users and system settings. Editors update website content only.',
      },
      saveToJWT: true,
    },
  ],
}
