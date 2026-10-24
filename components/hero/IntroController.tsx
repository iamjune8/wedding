'use client';

import { useEffect, useState } from 'react';
import { INTRO_DURATION_MS, INTRO_STORAGE_KEY } from '@/lib/intro';
import { useIsClient } from '@/lib/use-browser-value';

const FAST_FORWARD_RATE = 8;

function rememberIntroSeen(): void {
  try {
    window.sessionStorage.setItem(INTRO_STORAGE_KEY, '1');
  } catch {
    // Storage can be unavailable (private mode, some in-app browsers); skipping still works.
  }
}

/** Plays the rest of the opening sequence quickly instead of cutting it off. */
export function fastForwardIntro(): void {
  // The envelope and the arch opening are both marked as intro roots.
  const roots = Array.from(document.querySelectorAll<HTMLElement>('[data-intro-root]'));
  // Only the one-off, time-based intro: scroll-linked drift and looping glints keep their pace.
  const animations = roots
    .flatMap((root) => root.getAnimations?.({ subtree: true }) ?? [])
    .filter(
      (animation) =>
        animation.timeline === document.timeline &&
        animation.effect?.getTiming().iterations !== Infinity,
    );
  animations.forEach((animation) => {
    try {
      animation.updatePlaybackRate(FAST_FORWARD_RATE);
    } catch {
      animation.finish();
    }
  });
  document.documentElement.dataset.intro = 'done';
  rememberIntroSeen();
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Offers a "Skip intro" control while the opening sequence plays. A key press or tap anywhere
 * also fast-forwards it, so nothing stays hidden from a guest who is ready to read.
 */
export function IntroController() {
  const isClient = useIsClient();
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const alreadySkipped = document.documentElement.dataset.intro === 'skip';
    const remaining = INTRO_DURATION_MS - performance.now();

    if (alreadySkipped || prefersReducedMotion() || remaining <= 250) {
      const settle = window.setTimeout(() => {
        rememberIntroSeen();
        setFinished(true);
      }, 0);
      return () => window.clearTimeout(settle);
    }

    const listeners = new AbortController();
    const skip = () => {
      listeners.abort();
      fastForwardIntro();
      setFinished(true);
    };
    const timer = window.setTimeout(() => {
      listeners.abort();
      rememberIntroSeen();
      setFinished(true);
    }, remaining);
    window.addEventListener('keydown', skip, { signal: listeners.signal });
    window.addEventListener('pointerdown', skip, { signal: listeners.signal });

    return () => {
      window.clearTimeout(timer);
      listeners.abort();
    };
  }, []);

  if (!isClient || finished) return null;

  return (
    <button
      type="button"
      className="skip-intro"
      onClick={() => {
        fastForwardIntro();
        setFinished(true);
      }}
    >
      Skip intro
    </button>
  );
}
