import type { Block } from 'payload'

export const ImageBlock: Block = {
  slug: 'imageBlock',
  labels: {
    singular: 'Image Block',
    plural: 'Image Blocks',
  },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'The image to display.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'columnStart',
          type: 'select',
          defaultValue: '1',
          options: [
            { label: '1', value: '1' },
            { label: '2', value: '2' },
            { label: '3', value: '3' },
            { label: '4', value: '4' },
            { label: '5', value: '5' },
            { label: '6', value: '6' },
            { label: '7', value: '7' },
            { label: '8', value: '8' },
            { label: '9', value: '9' },
            { label: '10', value: '10' },
            { label: '11', value: '11' },
            { label: '12', value: '12' },
          ],
          admin: {
            description: 'Starting column (1–12) on the 12-column grid.',
            width: '50%',
          },
        },
        {
          name: 'columnSpan',
          type: 'select',
          defaultValue: '6',
          options: [
            { label: '1', value: '1' },
            { label: '2', value: '2' },
            { label: '3', value: '3' },
            { label: '4', value: '4' },
            { label: '5', value: '5' },
            { label: '6', value: '6' },
            { label: '7', value: '7' },
            { label: '8', value: '8' },
            { label: '9', value: '9' },
            { label: '10', value: '10' },
            { label: '11', value: '11' },
            { label: '12', value: '12' },
          ],
          admin: {
            description: 'How many columns this block spans (1–12).',
            width: '50%',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'rowStart',
          type: 'select',
          defaultValue: 'auto',
          options: [
            { label: 'Auto', value: 'auto' },
            { label: '1', value: '1' },
            { label: '2', value: '2' },
            { label: '3', value: '3' },
            { label: '4', value: '4' },
            { label: '5', value: '5' },
            { label: '6', value: '6' },
            { label: '7', value: '7' },
            { label: '8', value: '8' },
            { label: '9', value: '9' },
            { label: '10', value: '10' },
          ],
          admin: {
            description: 'Starting row (1–10, or Auto for default flow).',
            width: '50%',
          },
        },
        {
          name: 'rowSpan',
          type: 'select',
          defaultValue: 'auto',
          options: [
            { label: 'Auto', value: 'auto' },
            { label: '1', value: '1' },
            { label: '2', value: '2' },
            { label: '3', value: '3' },
            { label: '4', value: '4' },
            { label: '5', value: '5' },
            { label: '6', value: '6' },
          ],
          admin: {
            description: 'How many rows this block spans (1–6, or Auto).',
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'objectFit',
      type: 'select',
      defaultValue: 'cover',
      options: [
        { label: 'Cover', value: 'cover' },
        { label: 'Contain', value: 'contain' },
        { label: 'Fill', value: 'fill' },
        { label: 'None', value: 'none' },
        { label: 'Scale Down', value: 'scale-down' },
      ],
      admin: {
        description: 'How the image fills its container.',
      },
    },
    {
      name: 'objectPosition',
      type: 'text',
      defaultValue: 'center',
      admin: {
        description: 'CSS object-position value (e.g. center, top, 50% 20%). Use % values to keep the soldier\'s head/torso visible.',
      },
    },
    {
      name: 'alt',
      type: 'text',
      admin: {
        description: 'Override the media\'s alt text for accessibility. Leave empty to use the media default.',
      },
    },
    {
      name: 'caption',
      type: 'textarea',
      admin: {
        description: 'Optional caption displayed below the image.',
      },
    },
  ],
}
