'use client';

import { CheckboxInput, useConfig } from '@payloadcms/ui';
import type { CheckboxFieldClient, DefaultCellComponentProps } from 'payload';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

// Interactive "Pinned" list cell: toggling it saves straight to the API, so the
// Questions of interest list can be curated without opening each question.
export function PinCell({
  cellData,
  collectionSlug,
  field,
  rowData,
}: DefaultCellComponentProps<CheckboxFieldClient, boolean>) {
  const { config } = useConfig();
  const router = useRouter();
  const serverChecked = Boolean(cellData);
  const [checked, setChecked] = useState(serverChecked);
  const [lastServerChecked, setLastServerChecked] = useState(serverChecked);
  const [failed, setFailed] = useState(false);

  // The saved value can change without this cell knowing about it (bulk edit, or
  // "Clear all pins"). Adjusting state during render is React's recommended way
  // to follow a changed prop, and keeps the checkbox in sync after a refresh.
  if (serverChecked !== lastServerChecked) {
    setLastServerChecked(serverChecked);
    setChecked(serverChecked);
  }

  const id = rowData?.id;

  const onToggle = async () => {
    if (id === undefined || id === null) return;
    const next = !checked;

    setChecked(next); // optimistic
    setFailed(false);

    try {
      const res = await fetch(
        `${config.routes.api}/${collectionSlug}/${encodeURIComponent(String(id))}`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [field.name]: next }),
        },
      );
      if (!res.ok) throw new Error(`Request failed with ${res.status}`);
      router.refresh();
    } catch {
      setChecked(!next); // revert
      setFailed(true);
    }
  };

  return (
    <span
      // Keep the click from reaching the row (a list row can navigate to the
      // document). No preventDefault here — that would cancel the checkbox's
      // own toggle and the change event would never fire.
      onClick={(event) => {
        event.stopPropagation();
      }}
      title={failed ? 'Could not update — try again' : 'Pin to Questions of interest'}
      style={{ display: 'inline-flex', alignItems: 'center' }}
    >
      <CheckboxInput
        checked={checked}
        id={`pin-${id}`}
        name="Pin to Questions of interest"
        onToggle={onToggle}
      />
    </span>
  );
}

export default PinCell;
