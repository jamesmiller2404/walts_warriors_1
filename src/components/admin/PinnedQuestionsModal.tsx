'use client';

import {
  Banner,
  Button,
  ConfirmationModal,
  Modal,
  toast,
  useConfig,
  useModal,
} from '@payloadcms/ui';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { clearPinnedQuestionsAction, deleteUnpinnedQuestionsAction } from '@/lib/askWaltActions';
import {
  DATE_RANGE_PRESETS,
  MAX_STORED_QUESTIONS,
  filterByRange,
  formatPinnedQuestions,
  getDateRange,
  type DateRangePreset,
} from '@/lib/pinnedQuestions';

const MODAL_SLUG = 'ask-walt-pinned-questions';
const CONFIRM_SLUG = 'ask-walt-clear-pins';
const DELETE_SLUG = 'ask-walt-delete-unpinned';
const baseClass = 'confirmation-modal';

const labelStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '4px',
  fontSize: '0.85rem',
};

const inputStyle = {
  background: 'var(--theme-elevation-50)',
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: '2px',
  color: 'var(--theme-text)',
  padding: '6px 8px',
  fontSize: '0.9rem',
};

const textareaStyle = {
  ...inputStyle,
  marginTop: '12px',
  width: '100%',
  fontFamily: 'monospace',
  lineHeight: 1.4,
};

type FetchedQuestion = {
  id: number | string;
  memberName: string;
  question: string;
  createdAt: string;
  pinned?: boolean | null;
};

// `navigator.clipboard` needs a secure context; the textarea fallback keeps the
// button working over plain http (e.g. a LAN preview).
async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);
  if (!copied) throw new Error('Copy command was rejected');
}

export function PinnedQuestionsModal() {
  const { config } = useConfig();
  const { closeModal, isModalOpen, openModal } = useModal();
  const router = useRouter();

  const [rows, setRows] = useState<FetchedQuestion[] | null>(null);
  const [storedCount, setStoredCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [preset, setPreset] = useState<DateRangePreset>('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const isOpen = isModalOpen(MODAL_SLUG);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(
        `${config.routes.api}/ask-walt-questions?limit=0&depth=0&sort=createdAt`,
        { credentials: 'include' },
      );
      if (!res.ok) throw new Error(`Request failed with ${res.status}`);
      const data = (await res.json()) as { docs?: FetchedQuestion[] };
      const docs = Array.isArray(data.docs) ? data.docs : [];
      setRows(docs);
      setStoredCount(docs.length);
    } catch {
      setRows([]);
      setLoadError('Could not load questions. Close this and try again.');
    } finally {
      setLoading(false);
    }
  }, [config.routes.api]);

  // Lightweight count so the "limit reached" alert can also show on the list page
  // without opening the modal. Best-effort — failures are ignored.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${config.routes.api}/ask-walt-questions/count`, {
          credentials: 'include',
        });
        if (!res.ok) return;
        const data = (await res.json()) as { totalDocs?: number };
        if (!cancelled && typeof data.totalDocs === 'number') setStoredCount(data.totalDocs);
      } catch {
        // Ignore: the alert is informational only.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [config.routes.api]);

  // Reload on every open so questions pinned a moment ago are included.
  const open = () => {
    setCopied(false);
    setCopyError(false);
    openModal(MODAL_SLUG);
    void load();
  };

  const totalStored = rows?.length ?? 0;
  const limitReached = (storedCount ?? 0) >= MAX_STORED_QUESTIONS;
  const pinnedRows = useMemo(() => (rows ?? []).filter((row) => row.pinned), [rows]);

  const range = useMemo(
    () =>
      getDateRange(preset, new Date(), {
        from: from || undefined,
        to: to || undefined,
      }),
    [preset, from, to],
  );

  const visibleRows = useMemo(() => filterByRange(pinnedRows, range), [pinnedRows, range]);
  const copyText = useMemo(
    () => formatPinnedQuestions(visibleRows, range.label),
    [visibleRows, range.label],
  );

  const copy = async () => {
    try {
      await copyToClipboard(copyText);
      setCopied(true);
      setCopyError(false);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      setCopyError(true);
    }
  };

  // Bulk clear: removes the pin flag from every question (nothing is deleted),
  // then refreshes the list so the Pinned column checkboxes update too.
  const clearPins = async () => {
    const result = await clearPinnedQuestionsAction();
    if (result.error) {
      toast.error(result.error);
      return;
    }

    setRows((current) => (current ? current.map((row) => ({ ...row, pinned: false })) : current));
    router.refresh();

    if (!result.cleared) {
      toast.success('There were no pinned questions.');
    } else if (result.cleared === 1) {
      toast.success('Cleared 1 pinned question.');
    } else {
      toast.success(`Cleared ${result.cleared} pinned questions.`);
    }
  };

  // Bulk delete of everything that is NOT pinned. Pinned questions are the
  // curated list, so they always survive — clear the pins first to remove all.
  const deleteUnpinned = async () => {
    const result = await deleteUnpinnedQuestionsAction();
    if (result.error) {
      toast.error(result.error);
      return;
    }

    const deleted = result.deleted ?? 0;
    setStoredCount((current) => (current === null ? current : Math.max(0, current - deleted)));
    router.refresh();

    if (deleted === 0) {
      toast.success('There were no unpinned questions.');
    } else if (deleted === 1) {
      toast.success('Deleted 1 unpinned question.');
    } else {
      toast.success(`Deleted ${deleted} unpinned questions.`);
    }
  };

  return (
    <>
      {limitReached ? (
        <div style={{ marginBottom: '0.75rem' }}>
          <Banner type="warning">
            Ask Walt question limit reached ({storedCount} of {MAX_STORED_QUESTIONS} stored). New
            questions replace the oldest unpinned question — pinned questions are never deleted.
          </Banner>
        </div>
      ) : null}

      <div
        style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginBottom: '1rem' }}
      >
        <Button
          buttonStyle="secondary"
          onClick={() => openModal(DELETE_SLUG)}
          size="small"
          type="button"
        >
          Delete all unpinned
        </Button>
        <Button
          buttonStyle="secondary"
          onClick={() => openModal(CONFIRM_SLUG)}
          size="small"
          type="button"
        >
          Clear all pins
        </Button>
        <Button buttonStyle="pill" onClick={open} size="small" type="button">
          List Pinned Questions
        </Button>
      </div>

      {isOpen ? (
        <Modal className={baseClass} closeOnBlur slug={MODAL_SLUG}>
          <div
            className={`${baseClass}__wrapper`}
            style={{
              width: '100%',
              maxWidth: '760px',
              maxHeight: '85vh',
              overflowY: 'auto',
              background: 'var(--theme-elevation-0)',
              border: '1px solid var(--theme-elevation-150)',
              borderRadius: '4px',
              padding: '24px',
              color: 'var(--theme-text)',
            }}
          >
            <h1 style={{ margin: 0, fontSize: '1.4rem' }}>Questions of interest</h1>
            <p style={{ margin: '4px 0 0', opacity: 0.7 }}>
              {pinnedRows.length} pinned · {totalStored} of {MAX_STORED_QUESTIONS} questions stored
            </p>

            {totalStored >= MAX_STORED_QUESTIONS ? (
              <div style={{ marginTop: '12px' }}>
                <Banner type="warning">
                  Storage limit reached — {totalStored} of {MAX_STORED_QUESTIONS} questions stored.
                  New questions replace the oldest unpinned question; pinned questions are never
                  deleted.
                </Banner>
              </div>
            ) : null}

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                alignItems: 'flex-end',
                marginTop: '16px',
              }}
            >
              <label style={labelStyle}>
                <span>Range</span>
                <select
                  onChange={(event) => setPreset(event.target.value as DateRangePreset)}
                  style={inputStyle}
                  value={preset}
                >
                  {DATE_RANGE_PRESETS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              {preset === 'custom' ? (
                <>
                  <label style={labelStyle}>
                    <span>From</span>
                    <input
                      onChange={(event) => setFrom(event.target.value)}
                      style={inputStyle}
                      type="date"
                      value={from}
                    />
                  </label>
                  <label style={labelStyle}>
                    <span>To</span>
                    <input
                      onChange={(event) => setTo(event.target.value)}
                      style={inputStyle}
                      type="date"
                      value={to}
                    />
                  </label>
                </>
              ) : null}
            </div>

            <div style={{ marginTop: '16px' }}>
              {loading ? <p>Loading…</p> : null}
              {loadError ? (
                <p style={{ color: 'var(--theme-error-500)', margin: 0 }}>{loadError}</p>
              ) : null}

              {!loading && !loadError && pinnedRows.length === 0 ? (
                <p style={{ opacity: 0.8, margin: 0 }}>
                  Nothing pinned yet — tick Pinned in the list to build this list.
                </p>
              ) : null}

              {!loading && !loadError && pinnedRows.length > 0 && visibleRows.length === 0 ? (
                <p style={{ opacity: 0.8, margin: 0 }}>No pinned questions in this range.</p>
              ) : null}

              {visibleRows.length > 0 ? (
                <>
                  <ol
                    style={{
                      margin: 0,
                      paddingLeft: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    {visibleRows.map((row) => (
                      <li key={row.id}>
                        <strong>{row.memberName}</strong> — {row.question}
                      </li>
                    ))}
                  </ol>
                  <textarea
                    onFocus={(event) => event.currentTarget.select()}
                    readOnly
                    rows={6}
                    style={textareaStyle}
                    value={copyText}
                  />
                  {copyError ? (
                    <p style={{ color: 'var(--theme-error-500)', marginTop: '8px' }}>
                      Copy failed — select the text above and copy it manually.
                    </p>
                  ) : null}
                </>
              ) : null}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '12px',
                alignItems: 'center',
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid var(--theme-elevation-100)',
              }}
            >
              <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                Storage limit: {MAX_STORED_QUESTIONS} questions — the oldest unpinned questions are
                deleted automatically; pinned questions are never deleted.
              </span>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <Button
                  buttonStyle="secondary"
                  disabled={pinnedRows.length === 0}
                  onClick={() => {
                    closeModal(MODAL_SLUG);
                    openModal(CONFIRM_SLUG);
                  }}
                  size="small"
                  type="button"
                >
                  Clear all pins
                </Button>
                <Button
                  buttonStyle="primary"
                  disabled={visibleRows.length === 0}
                  onClick={() => void copy()}
                  size="small"
                  type="button"
                >
                  {copied ? 'Copied!' : 'Copy all'}
                </Button>
                <Button
                  buttonStyle="secondary"
                  onClick={() => closeModal(MODAL_SLUG)}
                  size="small"
                  type="button"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      ) : null}

      <ConfirmationModal
        body="This removes the Pinned flag from every question. Nothing is deleted — you can pin questions again at any time."
        cancelLabel="Cancel"
        confirmLabel="Clear all pins"
        confirmingLabel="Clearing…"
        heading="Clear all pinned questions?"
        modalSlug={CONFIRM_SLUG}
        onConfirm={clearPins}
      />

      <ConfirmationModal
        body="This permanently deletes every question that is not pinned. Pinned questions are kept — clear the pins first if you want to remove everything. This cannot be undone."
        cancelLabel="Cancel"
        confirmLabel="Delete unpinned"
        confirmingLabel="Deleting…"
        heading="Delete all unpinned questions?"
        modalSlug={DELETE_SLUG}
        onConfirm={deleteUnpinned}
      />
    </>
  );
}

export default PinnedQuestionsModal;
