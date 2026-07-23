import type { CollectionConfig } from 'payload'

import { isAdminOrEditor } from '@/access/isAdminOrEditor'
import { anyone } from '@/access/anyone'

const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Media',
    plural: 'Media',
  },
  admin: {
    useAsTitle: 'alt',
    description: 'Images used across the website. Prefer JPEG, PNG, or WebP under 5MB.',
    defaultColumns: ['filename', 'alt', 'mimeType', 'updatedAt'],
    group: 'Site Settings',
    components: {
      beforeList: ['@/components/admin/MediaListCreateLabel#MediaListCreateLabel'],
    },
  },
  access: {
    create: isAdminOrEditor,
    delete: isAdminOrEditor,
    read: anyone,
    update: isAdminOrEditor,
  },
  upload: {
    staticDir: 'media',
    mimeTypes: IMAGE_MIME_TYPES,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 512,
        position: 'centre',
      },
      {
        name: 'hero',
        width: 1920,
        height: 1440,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description: 'Short description of the image for accessibility and SEO.',
      },
    },
    {
      name: 'postUploadActions',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/admin/MediaPostUploadActions#MediaPostUploadActions',
        },
      },
    },
  ],
}
