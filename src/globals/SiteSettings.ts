import type { GlobalConfig } from 'payload'

import { isAdminOrEditor } from '@/access/isAdminOrEditor'
import { anyone } from '@/access/anyone'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: {
    description: 'Community identity, contact details, and social links used across the site.',
    group: 'Site Settings',
  },
  access: {
    read: anyone,
    update: isAdminOrEditor,
  },
  fields: [
    {
      name: 'businessName',
      type: 'text',
      required: true,
      defaultValue: "Walt's Warriors",
      label: 'Community Name',
    },
    {
      name: 'tagline',
      type: 'text',
      defaultValue: 'Nothing feels as good as feeling good feels!',
      admin: {
        description: 'Short line under the community name (optional).',
      },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'phone',
          type: 'text',
          admin: { width: '50%' },
        },
        {
          name: 'email',
          type: 'email',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'address',
      type: 'group',
      fields: [
        { name: 'street', type: 'text' },
        {
          type: 'row',
          fields: [
            { name: 'city', type: 'text', admin: { width: '40%' } },
            { name: 'state', type: 'text', admin: { width: '30%' } },
            { name: 'zip', type: 'text', admin: { width: '30%' } },
          ],
        },
      ],
    },
    {
      name: 'socialLinks',
      type: 'array',
      labels: {
        singular: 'Social Link',
        plural: 'Social Links',
      },
      admin: {
        description: 'Links shown in the header/footer.',
      },
      fields: [
        {
          name: 'platform',
          type: 'select',
          required: true,
          options: [
            { label: 'Facebook', value: 'facebook' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'X / Twitter', value: 'twitter' },
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'TikTok', value: 'tiktok' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
        {
          name: 'label',
          type: 'text',
          admin: {
            description: 'Optional custom label (mainly for “Other”).',
          },
        },
      ],
    },
    {
      name: 'hours',
      type: 'array',
      labels: {
        singular: 'Hours Entry',
        plural: 'Hours',
      },
      fields: [
        {
          name: 'day',
          type: 'text',
          required: true,
          admin: {
            description: 'e.g. Monday–Friday, Saturday',
          },
        },
        {
          name: 'hours',
          type: 'text',
          required: true,
          admin: {
            description: 'e.g. 9:00 AM – 5:00 PM or Closed',
          },
        },
      ],
    },
  ],
}
