import type { GlobalConfig } from 'payload';

import { isAdminOrEditor } from '@/access/isAdminOrEditor';
import { anyone } from '@/access/anyone';

// Select options shared by both arrays — the label is what the admin sees in
// the drag-and-drop list; the value is the registry key used by the frontend
// (see src/lib/pageSections.ts).
const HOME_SECTION_OPTIONS = [
  { label: 'Daily check-in strip', value: 'checkInStrip' },
  { label: 'Your challenge group today', value: 'challengeGroupToday' },
  { label: 'Group feed', value: 'groupFeed' },
  { label: 'This week in the library', value: 'thisWeekInLibrary' },
  { label: 'Coming up', value: 'comingUp' },
  { label: 'Ask Walt', value: 'askWalt' },
  { label: 'Next challenge', value: 'nextChallenge' },
];

export const PageSections: GlobalConfig = {
  slug: 'page-sections',
  label: 'Page Sections',
  admin: {
    description:
      'Controls which self-contained sections appear on the home and check-in pages, their order (drag rows to reorder), and which column they sit in. Until rows are saved here the pages fall back to the built-in default order.',
    group: 'Pages',
  },
  access: {
    read: anyone,
    update: isAdminOrEditor,
  },
  fields: [
    {
      name: 'homeSections',
      type: 'array',
      label: 'Home Page Sections',
      labels: {
        singular: 'Home Section',
        plural: 'Home Sections',
      },
      admin: {
        description:
          'Sections on the home page. Drag rows to reorder; untick "Enabled" to hide a section.',
      },
      fields: [
        {
          name: 'section',
          type: 'select',
          required: true,
          label: 'Section',
          options: HOME_SECTION_OPTIONS,
        },
        {
          name: 'enabled',
          type: 'checkbox',
          label: 'Enabled',
          defaultValue: true,
          admin: {
            description: 'Untick to hide this section from the page.',
          },
        },
        {
          name: 'column',
          type: 'select',
          label: 'Placement',
          defaultValue: 'narrow',
          options: [
            { label: 'Full width (above both columns)', value: 'full' },
            { label: 'Wide column (left, large cards)', value: 'wide' },
            { label: 'Narrow column (right, small cards)', value: 'narrow' },
          ],
          admin: {
            description:
              'Which area of the home page the section renders in. Sections stay in their chosen area and are ordered top-to-bottom within it.',
          },
        },
      ],
    },
    {
      name: 'checkInSections',
      type: 'array',
      label: 'Check-In Page Sections',
      labels: {
        singular: 'Check-In Section',
        plural: 'Check-In Sections',
      },
      admin: {
        description:
          'Sections on the member check-in page. Drag rows to reorder; untick "Enabled" to hide a section.',
      },
      fields: [
        {
          name: 'section',
          type: 'select',
          required: true,
          label: 'Section',
          options: [{ label: "Today's challenge check-in", value: 'todaysChallengeCheckIn' }],
        },
        {
          name: 'enabled',
          type: 'checkbox',
          label: 'Enabled',
          defaultValue: true,
          admin: {
            description: 'Untick to hide this section from the page.',
          },
        },
      ],
    },
  ],
};
