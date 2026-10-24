'use client';

import { useEffect } from 'react';

/** Elements are revealed once their top passes this fraction of the viewport height. */
const REVEAL_LINE = 0.92;

/**
 * Scroll storytelling without touching scroll itself: elements marked `data-reveal` fade and
 * rise into place as they come into view.
 *
 * - Content is only hidden after this runs (via `data-reveal-ready` on <html>), so it stays
 *   visible if JavaScript fails.
 * - Anything already on screen, or scrolled past (fast flicks, anchor jumps, find-in-page), is
 *   revealed immediately, so nothing can be left behind invisible.
 * - Visitors who prefer reduced motion never have anything hidden.
 */
export function RevealObserver() {
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !('IntersectionObserver' in window)) return;

    const hasPassedRevealLine = (element: HTMLElement) =>
      element.getBoundingClientRect().top < window.innerHeight * REVEAL_LINE;

    let pending = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));

    const revealPassed = (
      observer?: IntersectionObserver,
      entries: readonly IntersectionObserverEntry[] = [],
    ) => {
      // Trust the observer's own verdict too (e.g. when pinch-zoom changes innerHeight).
      const signalled = entries
        .filter((entry) => entry.isIntersecting || entry.boundingClientRect.top < 0)
        .map((entry) => entry.target);
      const passed = pending.filter(
        (element) => signalled.includes(element) || hasPassedRevealLine(element),
      );
      passed.forEach((element) => {
        element.dataset.revealed = 'true';
        observer?.unobserve(element);
      });
      pending = pending.filter((element) => !passed.includes(element));
      if (pending.length === 0) observer?.disconnect();
    };

    revealPassed();

    const observer = new IntersectionObserver((entries) => revealPassed(observer, entries), {
      rootMargin: `0px 0px -${Math.round((1 - REVEAL_LINE) * 100)}% 0px`,
      threshold: 0,
    });
    pending.forEach((element) => observer.observe(element));
    document.documentElement.setAttribute('data-reveal-ready', '');

    // Printing or saving as PDF shows the whole invitation, scrolled or not.
    const revealAll = () => document.documentElement.removeAttribute('data-reveal-ready');
    window.addEventListener('beforeprint', revealAll);

    return () => {
      observer.disconnect();
      window.removeEventListener('beforeprint', revealAll);
    };
  }, []);

  return null;
}
