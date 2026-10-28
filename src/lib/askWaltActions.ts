'use server';

import { getCurrentAccount } from '@/lib/auth';
import { getPayloadClient } from '@/lib/payload';
import { clearAllPins, deleteUnpinnedQuestions } from '@/lib/pinnedQuestions';
import { checkRateLimit } from '@/lib/rateLimit';

export type AskWaltState = {
  error?: string;
  success?: string;
};

const MAX_LENGTH = 1000;

export async function submitAskWaltQuestionAction(
  _prevState: AskWaltState,
  formData: FormData,
): Promise<AskWaltState> {
  const question = String(formData.get('question') || '').trim();

  if (!question) return { error: 'Type your question first.' };
  if (question.length > MAX_LENGTH) {
    return { error: `Please keep your question under ${MAX_LENGTH} characters.` };
  }

  // Guests have no account to attach the question to.
  const account = await getCurrentAccount();
  if (!account) return { error: 'Please log in to send Walt a question.' };
  if (account.isDemo) return { error: 'Demo mode \u2014 questions are read-only.' };

  const accountId = account.kind === 'member' ? account.member.id : account.user.id;
  const limit = checkRateLimit(`ask-walt:${accountId}`, 5, 60_000);
  if (!limit.ok) {
    return { error: `Too many questions in a row. Try again in ${limit.retryAfterSeconds}s.` };
  }

  try {
    const payload = await getPayloadClient();
    await payload.create({
      collection: 'ask-walt-questions',
      // `user` + `overrideAccess: false` enforces the collection's own rules:
      // the beforeValidate hook stamps member/memberName for member accounts,
      // and the access rules keep suspended members out.
      data: {
        question,
        memberName: account.displayName,
        ...(account.kind === 'member' ? { member: account.member.id } : {}),
      },
      user: account.kind === 'member' ? account.member : account.user,
      overrideAccess: false,
    });
  } catch {
    return { error: 'Could not send your question. Please try again.' };
  }

  return { success: 'Thanks — Walt has your question for the next Q&A.' };
}

// Bulk "clear the pinned list" for the admin panel. Only unpins (never deletes)
// and is restricted to staff, matching the collection's update access.
export async function clearPinnedQuestionsAction(): Promise<{
  error?: string;
  cleared?: number;
}> {
  const account = await getCurrentAccount();
  if (!account || account.kind !== 'staff') {
    return { error: 'Only administrators and editors can clear the pinned list.' };
  }

  try {
    const payload = await getPayloadClient();
    return { cleared: await clearAllPins(payload) };
  } catch {
    return { error: 'Could not clear the pinned list. Please try again.' };
  }
}

// Bulk delete of every unpinned question. Pinned questions are never touched —
// clear the pins first if everything should be removed.
export async function deleteUnpinnedQuestionsAction(): Promise<{
  error?: string;
  deleted?: number;
}> {
  const account = await getCurrentAccount();
  if (!account || account.kind !== 'staff') {
    return { error: 'Only administrators and editors can delete questions.' };
  }

  try {
    const payload = await getPayloadClient();
    return { deleted: await deleteUnpinnedQuestions(payload) };
  } catch {
    return { error: 'Could not delete the questions. Please try again.' };
  }
}
