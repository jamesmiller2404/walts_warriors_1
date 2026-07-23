import type { CollectionConfig } from 'payload'

import { isAdminOrEditor } from '@/access/isAdminOrEditor'
import { anyone } from '@/access/anyone'

export const Programs: CollectionConfig = {
  slug: 'programs',
  labels: {
    singular: 'Program / Service',
    plural: 'Programs / Services',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'published', 'order', 'updatedAt'],
    description: 'Programs and services for nutrition, fitness, mindset, and healthy lifestyle habits.',
    group: 'Content',
  },
  access: {
    create: isAdminOrEditor,
    delete: isAdminOrEditor,
    read: anyone,
    update: isAdminOrEditor,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly name (e.g. nutrition-coaching). Used in /programs/nutrition-coaching',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (typeof value === 'string' && value.length > 0) {
              return value
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
            }
            if (data?.name && typeof data.name === 'string') {
              return data.name
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
            }
            return value
          },
        ],
      },
    },
    {
      name: 'description',
      type: 'richText',
      required: true,
    },
    {
      name: 'summary',
      type: 'textarea',
      admin: {
        description: 'Short blurb shown on cards and the home page.',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Nutrition', value: 'nutrition' },
        { label: 'Fitness', value: 'fitness' },
        { label: 'Mindset', value: 'mindset' },
        { label: 'Lifestyle', value: 'lifestyle' },
        { label: 'Community', value: 'community' },
        { label: 'Other', value: 'other' },
      ],
      defaultValue: 'lifestyle',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'pricing',
      type: 'group',
      admin: {
        description: 'Optional. Leave blank if members should inquire for details.',
      },
      fields: [
        {
          name: 'showPrice',
          type: 'checkbox',
          defaultValue: false,
          label: 'Show price on website',
        },
        {
          name: 'priceLabel',
          type: 'text',
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.showPrice),
            description: 'e.g. Free for members, From $49, Included',
          },
        },
        {
          name: 'priceNote',
          type: 'text',
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.showPrice),
            description: 'Optional note under the price.',
          },
        },
      ],
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Lower numbers appear first.',
        position: 'sidebar',
      },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Uncheck to hide this program from the public site.',
      },
    },
  ],
}
