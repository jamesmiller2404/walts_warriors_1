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

// Must match the guest-hint-glow animation duration in globals.css.
const FLASH_DURATION_MS = 800;
// Beat between one control going dark and the next lighting up, so the glow
// reads as a hand-over rather than one sweep of half the page.
const FLASH_GAP_MS = 140;

/**
 * Guest-preview affordance. While the site is opened to guests (demo identity,
 * src/lib/siteAccess.ts) every live link/button glows once with a green outline
 * and then fades away. Each control glows exactly once — never again, even if
 * it scrolls out and back — and they light up one at a time, in document order,
 * so the glow walks the visitor's eye down the page instead of flashing the
 * whole viewport at once. Controls are only queued once they are on screen, so
 * scrolling hands the glow on to the next part of the page. Rendered only for
 * the demo identity; the frontend layout also stamps data-guest-hint on <html>
 * to scope the CSS.
 *
 * On the home page the explainer modal (GuestHintModal) shows first: the hints
 * wait until it has been dismissed (GUEST_HINT_RELEASE_EVENT) so the client
 * reads the explanation before any boxes start flashing. Everywhere else — and
 * on later home visits in the same session — they start immediately.
 */
export function GuestLinkHint() {
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;

    // Controls that have had their one glow (Weak, so removed nodes are GC'd).
    const flashed = new WeakSet<Element>();
    // Controls waiting their turn. Exactly one is lit at any moment.
    const queued = new Set<Element>();

    let started = false;
    let pumping = false;
    let timer: number | undefined;
    let intersectionObserver: IntersectionObserver | null = null;
    let mutationObserver: MutationObserver | null = null;

    const isOnScreen = (element: Element) => {
      const rect = element.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight;
    };

    // Nearest queued control to the top of the document, so the glow keeps
    // travelling down the page instead of jumping back up.
    const nextInLine = (): Element | null => {
      const candidates = Array.from(queued).filter((element) => element.isConnected);
      candidates.sort((a, b) =>
        a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
      );
      return candidates[0] ?? null;
    };

    // Skip anything that has been scrolled out of sight while it waited. It is
    // dropped, not burned: coming back into view queues it again.
    const takeNext = (): Element | null => {
      let element = nextInLine();
      while (element && !isOnScreen(element)) {
        queued.delete(element);
        element = nextInLine();
      }
      return element;
    };

    // Lights up one control, lets the glow fade, pauses, then hands over to the
    // next in line. Anything already lit is never lit again.
    const pump = () => {
      if (!started || pumping) return;
      const element = takeNext();
      if (!element) return; // idle — the next enqueue calls pump() again
      pumping = true;
      queued.delete(element);
      flashed.add(element);
      element.classList.add('guest-hint-flash');
      timer = window.setTimeout(() => {
        element.classList.remove('guest-hint-flash');
        timer = window.setTimeout(() => {
          pumping = false;
          pump();
        }, FLASH_GAP_MS);
      }, FLASH_DURATION_MS);
    };

    const enqueue = (element: Element) => {
      if (flashed.has(element) || queued.has(element)) return;
      queued.add(element);
      pump();
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
            if (entry.isIntersecting) enqueue(entry.target);
          }
        },
        // A quarter of the control counts as "in view" — enough to join the
        // queue. Each control only ever glows once, so re-entering the viewport
        // does not repeat it.
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
      pumping = false;
      if (timer !== undefined) window.clearTimeout(timer);
      timer = undefined;

      intersectionObserver?.disconnect();
      mutationObserver?.disconnect();
      intersectionObserver = null;
      mutationObserver = null;

      queued.clear();
      // `flashed` is deliberately kept: a control that already glowed stays dark.
      document
        .querySelectorAll('.guest-hint-flash')
        .forEach((element) => element.classList.remove('guest-hint-flash'));
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
