import type { GlobalConfig } from 'payload'

import { isAdminOrEditor } from '@/access/isAdminOrEditor'
import { anyone } from '@/access/anyone'

export const AboutWalt: GlobalConfig = {
  slug: 'about-walt',
  label: 'About Walt',
  admin: {
    description: 'Story, mission, and philosophy for the About page.',
    group: 'Pages',
  },
  access: {
    read: anyone,
    update: isAdminOrEditor,
  },
  fields: [
    {
      name: 'headline',
      type: 'text',
      required: true,
      defaultValue: 'About Walt\'s Warriors',
    },
    {
      name: 'subheadline',
      type: 'text',
      defaultValue: 'A health and wellness community dedicated to helping people thrive.',
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'introduction',
      type: 'richText',
      admin: {
        description: 'Main about story and mission.',
      },
    },
    {
      name: 'philosophy',
      type: 'textarea',
      defaultValue: 'Nothing feels as good as feeling good feels!',
      admin: {
        description: 'Core philosophy quote shown on the About page.',
      },
    },
    {
      name: 'focusAreas',
      type: 'array',
      labels: {
        singular: 'Focus Area',
        plural: 'Focus Areas',
      },
      admin: {
        description: 'Pillars such as nutrition, fitness, mindset, and lifestyle.',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
        },
      ],
      defaultValue: [
        {
          title: 'Nutrition',
          description: 'Practical strategies for eating well and feeling energized.',
        },
        {
          title: 'Fitness',
          description: 'Movement habits that support lasting health.',
        },
        {
          title: 'Mindset',
          description: 'Encouragement and real-world experiences that inspire change.',
        },
        {
          title: 'Healthy Lifestyle',
          description: 'Daily habits that help you thrive long term.',
        },
      ],
    },
    {
      name: 'portrait',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional photo of Walt or the community.',
      },
    },
  ],
}
