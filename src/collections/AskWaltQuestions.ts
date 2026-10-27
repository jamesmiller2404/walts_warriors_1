import type {
  CollectionAfterChangeHook,
  CollectionBeforeValidateHook,
  CollectionConfig,
} from 'payload';

import { isAdminOrEditor } from '@/access/isAdminOrEditor';
import { isStaffFieldLevel } from '@/access/isStaff';
import { MAX_STORED_QUESTIONS, pruneOldestUnpinned } from '@/lib/pinnedQuestions';

type AuthedUser = {
  id: number | string;
  name?: string;
  collection?: string;
  status?: string;
};

// Any signed-in account may send Walt a question, but suspended members are
// rejected so a locked-out account cannot keep posting.
const isLoggedIn = ({ req: { user } }: { req: { user: AuthedUser | null | undefined } }) => {
  if (!user?.id) return false;
  if (user.collection === 'members' && user.status !== 'active') return false;
  return true;
};

// A member only ever sees their own submissions; staff see every question.
const isOwnerOrStaff = ({ req: { user } }: { req: { user: AuthedUser | null | undefined } }) => {
  if (!user) return false;
  if (user.collection === 'users') return true;
  return { member: { equals: user.id } };
};

// Runs before validation so the required `memberName` is always populated:
// - member submissions are forced to belong to the signed-in member,
// - the member's display name is copied onto the row (the admin list can only
//   be sorted by user name via a real column — sorting the `member`
//   relationship sorts by id),
// - members can never set `pinned` (staff-only shortlist flag).
const beforeAskWaltValidate: CollectionBeforeValidateHook = async ({ data, operation, req }) => {
  if (!data) return data;
  const { user } = req;

  if (operation === 'create' && user?.collection === 'members') {
    data.member = user.id;
    data.pinned = false;
  }

  const memberRef = data.member;
  const memberId = memberRef && typeof memberRef === 'object' ? memberRef.id : memberRef;

  if (memberId) {
    // Staff can attach or reassign a member; always refresh the sortable name.
    const member = await req.payload.findByID({
      collection: 'members',
      id: memberId,
      depth: 0,
      overrideAccess: true,
    });
    data.memberName = member.displayName || data.memberName;
  } else if (operation === 'create' && !data.memberName && user?.collection === 'users') {
    // Staff submissions have no member row; keep their name for the list.
    data.memberName = user.name || 'Staff';
  }

  return data;
};

// Retention: after a new question lands, drop the oldest *unpinned* rows so the
// table stays bounded. Pinned questions (the Questions of interest list) are
// never deleted automatically.
const pruneAskWaltQuestions: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation === 'create') {
    await pruneOldestUnpinned(req.payload, {
      max: MAX_STORED_QUESTIONS,
      keepId: doc.id,
      req,
    });
  }
  return doc;
};

export const AskWaltQuestions: CollectionConfig = {
  slug: 'ask-walt-questions',
  labels: {
    singular: 'Ask Walt Question',
    plural: 'Ask Walt Questions',
  },
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['memberName', 'question', 'pinned', 'createdAt'],
    description: `Questions and comments sent through the 'Ask Walt' card. Tick "Pinned" in the column to build a "questions of interest" list.`,
    group: 'Community',
    listSearchableFields: ['memberName', 'question'],
    components: {
      // "List Pinned Questions" button (opens the pinned-questions modal). Sits
      // where Payload's "Create New" button would be — that one is hidden in
      // custom.scss because questions only arrive via the public Ask Walt card.
      beforeListTable: ['@/components/admin/PinnedQuestionsModal#PinnedQuestionsModal'],
    },
  },
  // Newest first. Click the User or Created column header to re-sort.
  defaultSort: '-createdAt',
  // Payload's own row-selection delete ignores the Pinned flag, so it is disabled
  // here: bulk removal goes through "Delete all unpinned" (which always keeps
  // pinned questions) and "Clear all pins" in the admin panel buttons.
  disableBulkDelete: true,
  access: {
    create: isLoggedIn,
    read: isOwnerOrStaff,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    beforeValidate: [beforeAskWaltValidate],
    afterChange: [pruneAskWaltQuestions],
  },
  fields: [
    {
      name: 'memberName',
      type: 'text',
      required: true,
      index: true,
      access: {
        create: isStaffFieldLevel,
        update: isStaffFieldLevel,
      },
      admin: {
        readOnly: true,
        description:
          "Copied from the member's display name when the question is submitted. Used for the User column and sorting.",
      },
    },
    {
      name: 'question',
      type: 'textarea',
      required: true,
      maxLength: 1000,
      admin: {
        description: 'The question or comment as the member wrote it.',
      },
    },
    {
      name: 'member',
      type: 'relationship',
      relationTo: 'members',
      index: true,
      access: {
        // Members get their own id forced in the hook; only staff can attach or
        // reassign a member, so ownership cannot be spoofed.
        create: isStaffFieldLevel,
        update: isStaffFieldLevel,
      },
      admin: {
        description: 'Member who sent this. Set automatically for member submissions.',
      },
    },
    {
      name: 'pinned',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      access: {
        create: isStaffFieldLevel,
        update: isStaffFieldLevel,
      },
      admin: {
        position: 'sidebar',
        components: {
          // Checkbox right in the list view — staff can pin/unpin without
          // opening the question (and keep bulk edit for several at once).
          Cell: '@/components/admin/PinCell#PinCell',
        },
        description:
          'Pinned questions make up the Questions of interest list for the Q&A. Staff only — members cannot pin their own questions.',
      },
    },
  ],
};
