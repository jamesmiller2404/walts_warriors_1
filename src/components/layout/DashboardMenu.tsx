'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';

import { DASHBOARD_MENU_ITEMS } from './siteNav';

type Props = {
  /** Classes for the trigger, so each header keeps its own nav typography. */
  triggerClassName: string;
  /** Classes for the popup panel (background, text color, blur, ...). */
  menuClassName: string;
  /** Inline font style for the panel — usually a size smaller than the nav. */
  fontStyle?: CSSProperties;
};

/**
 * "Dashboard" nav item with its dropdown (Your Dashboard + the member's
 * challenge-group dashboard). Desktop opens on hover; touch and keyboard use
 * the button. Escape, an outside tap/click, or focus leaving the item closes it
 * and Escape returns focus to the trigger.
 */
export function DashboardMenu({ triggerClassName, menuClassName, fontStyle }: Props) {
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const open = hovered || pinned;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  // Outside tap/click closes a clicked-open menu (touch has no mouseleave).
  useEffect(() => {
    if (!pinned) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest('[data-dashboard-menu]')) setPinned(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [pinned]);

  // Escape closes and hands focus back to the trigger.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setHovered(false);
      setPinned(false);
      triggerRef.current?.focus();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const close = () => {
    setHovered(false);
    setPinned(false);
  };

  return (
    <li
      data-dashboard-menu
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={close}
      onBlur={(event) => {
        // Focus moved out of the trigger + panel entirely.
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) close();
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setPinned((value) => !value)}
        className={`inline-flex items-center gap-[0.35em] bg-transparent ${triggerClassName}`}
      >
        Dashboard
        <svg
          aria-hidden="true"
          viewBox="0 0 12 8"
          className={`h-[0.5em] w-[0.75em] transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1 1.5 6 6.5 11 1.5" />
        </svg>
      </button>

      {open ? (
        // Transparent gap element keeps hover alive between trigger and panel.
        <div className="absolute left-1/2 top-full z-40 -translate-x-1/2 pt-2">
          <ul
            id={menuId}
            className={`min-w-max rounded-md py-1 shadow-lg ${menuClassName}`}
            style={fontStyle}
          >
            {DASHBOARD_MENU_ITEMS.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={close}
                  className="block px-4 py-1.5 font-bold whitespace-nowrap text-[#c5d7e2] transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}
