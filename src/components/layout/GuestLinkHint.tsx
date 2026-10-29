'use client';

import { useEffect } from 'react';

import {
  GUEST_HINT_HOLD_EVENT,
  GUEST_HINT_RELEASE_EVENT,
  GUEST_HINT_SESSION_KEY,
} from './guestHintConfig';

// Live controls in guest mode: real links (not the href="#" placeholders) and
// working buttons (not disabled, and not marked placeholder with a "coming
// soon" title). Elements inside preview-only UI (e.g. the guest explainer
// modal) opt out with data-guest-hint-skip. Keep in sync with globals.css.
const LIVE_CONTROL_SELECTOR = [
  "a[href]:not([href='#']):not([href^='#']):not([data-guest-hint-skip])",
  "button:not([disabled]):not([aria-disabled='true']):not([title*='coming soon']):not([data-guest-hint-skip])",
  "input[type='submit']:not([disabled]):not([data-guest-hint-skip])",
].join(', ');

// Must match the guest-hint-flicker animation duration in globals.css.
const FLASH_DURATION_MS = 3600;

/**
 * Guest-preview affordance. While the site is opened to guests (demo identity,
 * src/lib/siteAccess.ts) every live link/button flickers once with a green
 * outline as it scrolls into view, then the highlight clears itself. Scroll a
 * control out and back and it flashes again. Rendered only for the demo
 * identity; the frontend layout also stamps data-guest-hint on <html> to scope
 * the CSS.
 *
 * On the home page the explainer modal (GuestHintModal) shows first: the hints
 * wait until it has been dismissed (GUEST_HINT_RELEASE_EVENT) so the client
 * reads the explanation before any boxes start flashing. Everywhere else — and
 * on later home visits in the same session — they start immediately.
 */
export function GuestLinkHint() {
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;

    const timers = new WeakMap<Element, number>();
    let flashing = new WeakSet<Element>();
    let started = false;
    let intersectionObserver: IntersectionObserver | null = null;
    let mutationObserver: MutationObserver | null = null;

    const clearFlash = (element: Element) => {
      const timer = timers.get(element);
      if (timer !== undefined) window.clearTimeout(timer);
      timers.delete(element);
      element.classList.remove('guest-hint-flash');
      flashing.delete(element);
    };

    const flash = (element: Element) => {
      if (flashing.has(element)) return;
      flashing.add(element);
      element.classList.add('guest-hint-flash');
      timers.set(
        element,
        window.setTimeout(() => clearFlash(element), FLASH_DURATION_MS),
      );
    };

    const observeAll = (root: ParentNode) => {
      root
        .querySelectorAll(LIVE_CONTROL_SELECTOR)
        .forEach((element) => intersectionObserver?.observe(element));
    };

    const start = () => {
      if (started) return;
      started = true;

      intersectionObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) flash(entry.target);
          }
        },
        // A quarter of the control counts as "in view". Leaving the viewport
        // and coming back crosses the threshold again, so it re-flashes.
        { threshold: 0.25 },
      );

      observeAll(document);

      // Client-side navigation and conditional UI mount new controls after this
      // effect runs — observe those too.
      mutationObserver = new MutationObserver((records) => {
        for (const record of records) {
          record.addedNodes.forEach((node) => {
            if (!(node instanceof Element)) return;
            if (node.matches(LIVE_CONTROL_SELECTOR)) intersectionObserver?.observe(node);
            observeAll(node);
          });
        }
      });
      mutationObserver.observe(document.body, { childList: true, subtree: true });
    };

    const stop = () => {
      started = false;
      intersectionObserver?.disconnect();
      mutationObserver?.disconnect();
      intersectionObserver = null;
      mutationObserver = null;

      document.querySelectorAll('.guest-hint-flash').forEach((element) => {
        const timer = timers.get(element);
        if (timer !== undefined) window.clearTimeout(timer);
        element.classList.remove('guest-hint-flash');
      });
      flashing = new WeakSet<Element>();
    };

    const onHold = () => stop();
    const onRelease = () => start();
    window.addEventListener(GUEST_HINT_HOLD_EVENT, onHold);
    window.addEventListener(GUEST_HINT_RELEASE_EVENT, onRelease);

    // Home page + explainer not yet dismissed this session → wait for the
    // release event instead of flashing behind the dialog.
    let explained = false;
    try {
      explained = window.sessionStorage.getItem(GUEST_HINT_SESSION_KEY) === '1';
    } catch {
      explained = false;
    }
    const waitingForExplainer = window.location.pathname === '/' && !explained;
    if (!waitingForExplainer) start();

    return () => {
      window.removeEventListener(GUEST_HINT_HOLD_EVENT, onHold);
      window.removeEventListener(GUEST_HINT_RELEASE_EVENT, onRelease);
      stop();
    };
  }, []);

  return null;
}
