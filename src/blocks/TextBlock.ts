import type { Block } from 'payload'

export const TextBlock: Block = {
  slug: 'textBlock',
  labels: {
    singular: 'Text Block',
    plural: 'Text Blocks',
  },
  fields: [
    {
      name: 'text',
      type: 'textarea',
      required: true,
      admin: {
        description: 'The text content to display.',
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
      type: 'row',
      fields: [
        {
          name: 'fontFamily',
          type: 'select',
          defaultValue: 'manrope',
          options: [
            { label: 'Manrope', value: 'manrope' },
            { label: 'Manrope SemiBold', value: 'manrope-semibold' },
            { label: 'Manrope Bold', value: 'manrope-bold' },
            { label: 'Manrope ExtraBold', value: 'manrope-extrabold' },
            { label: 'Archivo Black', value: 'archivo-black' },
            { label: 'Montserrat Bold', value: 'montserrat-bold' },
            { label: 'Montserrat ExtraBold', value: 'montserrat-extrabold' },
            { label: 'EB Garamond Italic', value: 'eb-garamond-italic' },
            { label: 'EB Garamond Medium Italic', value: 'eb-garamond-medium-italic' },
            { label: 'EB Garamond SemiBold Italic', value: 'eb-garamond-semibold-italic' },
          ],
          admin: {
            description: 'Font family from the imported fonts.',
            width: '50%',
          },
        },
        {
          name: 'fontSize',
          type: 'text',
          defaultValue: '18',
          admin: {
            description: 'Font size in points (8–128).',
            width: '50%',
          },
        },
        {
          name: 'fontColor',
          type: 'select',
          defaultValue: 'stone-900',
          options: [
            { label: 'Stone 900 (dark)', value: 'stone-900' },
            { label: 'Stone 800', value: 'stone-800' },
            { label: 'Stone 700', value: 'stone-700' },
            { label: 'Stone 600', value: 'stone-600' },
            { label: 'Brand 900', value: 'brand-900' },
            { label: 'Brand 800', value: 'brand-800' },
            { label: 'Brand 700', value: 'brand-700' },
            { label: 'Brand 600', value: 'brand-600' },
            { label: 'White', value: 'white' },
          ],
          admin: {
            description: 'Font color from the brand palette.',
            width: '50%',
          },
        },
      ],
    },
  ],
}
