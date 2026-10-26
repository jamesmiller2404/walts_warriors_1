import type { GlobalConfig } from 'payload';

import { isAdminOrEditor } from '@/access/isAdminOrEditor';
import { anyone } from '@/access/anyone';

// Content for the "A Note from Walt" card on the check-in page
// (src/components/checkin/NoteFromWalt.tsx). The admin updates the note here;
// the section itself is ordered/on-off in the Page Sections global.
export const WaltsNote: GlobalConfig = {
  slug: 'walts-note',
  label: "Walt's Note",
  admin: {
    description:
      "Walt's message shown to members in the 'A Note from Walt' card on the check-in page.",
    group: 'Pages',
  },
  access: {
    read: anyone,
    update: isAdminOrEditor,
  },
  fields: [
    {
      name: 'note',
      type: 'textarea',
      required: true,
      defaultValue:
        "Day 16 is where a lot of people hit the middle slump. You don't need a big day today. You need a show-up day. Ten minutes counts.",
      admin: {
        description: "Walt's note to the members. Line breaks are preserved.",
      },
    },
  ],
};
