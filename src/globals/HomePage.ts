import type { GlobalConfig } from 'payload'

import { isAdminOrEditor } from '@/access/isAdminOrEditor'
import { anyone } from '@/access/anyone'
import { TextBlock } from '@/blocks/TextBlock'

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: 'Home Page',
  admin: {
    description: 'Content for the public homepage.',
    group: 'Pages',
  },
  access: {
    read: anyone,
    update: isAdminOrEditor,
  },
  fields: [
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Large image at the top of the homepage.',
      },
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Background image that starts immediately below the hero image (top of this image aligns to bottom of hero).',
      },
    },
    {
      name: 'backgroundOpacity',
      type: 'number',
      min: 0,
      max: 100,
      defaultValue: 100,
      admin: {
        description: 'Opacity of the background image (0 = transparent, 100 = fully opaque).',
        step: 5,
      },
    },
    {
      name: 'headline',
      type: 'text',
      required: true,
      defaultValue: "Welcome to Walt's Warriors",
    },
    {
      name: 'subheadline',
      type: 'text',
      defaultValue:
        'A health and wellness community helping people thrive through nutrition, fitness, mindset, and healthy lifestyle habits.',
    },
    {
      name: 'introduction',
      type: 'richText',
      admin: {
        description: 'Main introduction paragraph(s) under the hero.',
      },
    },
    {
      name: 'featuredPrograms',
      type: 'relationship',
      relationTo: 'programs',
      hasMany: true,
      admin: {
        description:
          'Pick programs to highlight on the homepage. Leave empty to show the first few published programs.',
      },
    },
    {
      name: 'cta',
      type: 'group',
      label: 'Call to Action',
      fields: [
        {
          name: 'heading',
          type: 'text',
          defaultValue: 'Ready to feel good?',
        },
        {
          name: 'text',
          type: 'textarea',
          defaultValue:
            'Join the community and start building habits that last. Nothing feels as good as feeling good feels!',
        },
        {
          name: 'buttonLabel',
          type: 'text',
          defaultValue: 'Get in Touch',
        },
        {
          name: 'buttonLink',
          type: 'text',
          defaultValue: '/contact',
          admin: {
            description: 'Internal path (e.g. /contact) or full URL.',
          },
        },
      ],
    },
    {
      name: 'contentBlocks',
      type: 'blocks',
      label: 'Content Blocks',
      labels: {
        singular: 'Content Block',
        plural: 'Content Blocks',
      },
      admin: {
        description:
          'Add, reorder, and configure text blocks on a 12-column grid. Each block can be positioned independently and styled with font size and color.',
      },
      blocks: [TextBlock],
    },
  ],
}
