'use client';

import { useEffect } from 'react';

// Live controls in guest mode: real links (not the href="#" placeholders) and
// working buttons (not disabled, and not marked placeholder with a "coming
// soon" title). Keep in sync with the notes in globals.css.
const LIVE_CONTROL_SELECTOR = [
  "a[href]:not([href='#']):not([href^='#'])",
  "button:not([disabled]):not([aria-disabled='true']):not([title*='coming soon'])",
  "input[type='submit']:not([disabled])",
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
 */
export function GuestLinkHint() {
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;

    const timers = new WeakMap<Element, number>();
    const flashing = new WeakSet<Element>();

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

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) flash(entry.target);
        }
      },
      // A quarter of the control counts as "in view". Leaving the viewport and
      // coming back crosses the threshold again, so it re-flashes.
      { threshold: 0.25 },
    );

    const observeAll = (root: ParentNode) => {
      root.querySelectorAll(LIVE_CONTROL_SELECTOR).forEach((element) => observer.observe(element));
    };

    observeAll(document);

    // Client-side navigation and conditional UI mount new controls after this
    // effect runs — observe those too.
    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches(LIVE_CONTROL_SELECTOR)) observer.observe(node);
          observeAll(node);
        });
      }
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
      document.querySelectorAll('.guest-hint-flash').forEach((element) => {
        element.classList.remove('guest-hint-flash');
        const timer = timers.get(element);
        if (timer !== undefined) window.clearTimeout(timer);
      });
    };
  }, []);

  return null;
}
