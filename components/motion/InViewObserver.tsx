'use client';

import { useEffect } from 'react';

/**
 * Marks `data-play-in-view` regions with `data-in-view="true"` only while they are on screen.
 * Looping decorations (sparkles, glints, petals) run only then, saving battery and keeping
 * scrolling smooth on low-powered phones.
 */
export function InViewObserver() {
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;

    const regions = Array.from(document.querySelectorAll<HTMLElement>('[data-play-in-view]'));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          (entry.target as HTMLElement).dataset.inView = String(entry.isIntersecting);
        });
      },
      { rootMargin: '10% 0px' },
    );
    regions.forEach((region) => observer.observe(region));

    return () => observer.disconnect();
  }, []);

  return null;
}
