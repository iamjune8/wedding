'use client';

import { RotateCcw } from 'lucide-react';
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

/** The one-off, time-based opening animations (looping glints and lights are left alone). */
function openingAnimations(): Animation[] {
  const roots = Array.from(document.querySelectorAll<HTMLElement>('[data-intro-root]'));
  return roots
    .flatMap((root) => root.getAnimations?.({ subtree: true }) ?? [])
    .filter(
      (animation) =>
        animation.timeline === document.timeline &&
        animation.effect?.getTiming().iterations !== Infinity,
    );
}

/** Plays the rest of the opening sequence quickly instead of cutting it off. */
export function fastForwardIntro(): void {
  openingAnimations().forEach((animation) => {
    try {
      animation.updatePlaybackRate(FAST_FORWARD_RATE);
    } catch {
      animation.finish();
    }
  });
  document.documentElement.dataset.intro = 'done';
  rememberIntroSeen();
}

/**
 * Plays the opening again from the first scene. Only the opening's own animations restart;
 * the countdowns are separate components and keep counting untouched.
 */
export function replayIntro(): void {
  const html = document.documentElement;
  window.scrollTo({ top: 0, behavior: 'auto' });
  if (html.dataset.intro === 'skip') {
    // The opening was never played on this visit: enabling it starts every scene afresh.
    html.dataset.intro = 'replay';
    return;
  }
  html.dataset.intro = 'replay';
  openingAnimations().forEach((animation) => {
    animation.cancel();
    animation.play();
  });
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** 'settling' briefly hides both controls after a skip, so the tap that skipped cannot land
 * on the Replay button appearing in the same corner. */
type Phase = 'playing' | 'settling' | 'finished' | 'still';

const SETTLE_MS = 700;

/** While the opening plays, a key press or tap anywhere fast-forwards it. */
function useOpeningPlayback(phase: Phase, finish: () => void, skipped: () => void) {
  useEffect(() => {
    if (phase !== 'playing') return undefined;
    const startedAt = performance.now();
    const listeners = new AbortController();
    const skip = () => {
      listeners.abort();
      fastForwardIntro();
      skipped();
    };
    const timer = window.setTimeout(
      () => {
        listeners.abort();
        rememberIntroSeen();
        finish();
      },
      // On first load the clock started with the page; on a replay it starts now.
      Math.max(
        0,
        INTRO_DURATION_MS - (document.documentElement.dataset.intro === 'replay' ? 0 : startedAt),
      ),
    );
    window.addEventListener('keydown', skip, { signal: listeners.signal });
    window.addEventListener('pointerdown', skip, { signal: listeners.signal });
    return () => {
      window.clearTimeout(timer);
      listeners.abort();
    };
  }, [phase, finish, skipped]);
}

function initialPhase(): Phase {
  if (prefersReducedMotion()) return 'still';
  const alreadySkipped = document.documentElement.dataset.intro === 'skip';
  return alreadySkipped || INTRO_DURATION_MS - performance.now() <= 250 ? 'finished' : 'playing';
}

/**
 * Offers "Skip intro" while the opening plays, then "Replay invitation" once it has finished.
 * Visitors who prefer reduced motion see the still invitation and neither control.
 */
export function IntroController() {
  const isClient = useIsClient();
  const [phase, setPhase] = useState<Phase | null>(null);

  useEffect(() => {
    const settle = window.setTimeout(() => {
      const next = initialPhase();
      if (next !== 'playing') rememberIntroSeen();
      setPhase(next);
    }, 0);
    return () => window.clearTimeout(settle);
  }, []);

  const [finish] = useState(() => () => setPhase('finished'));
  const [skipped] = useState(() => () => setPhase('settling'));
  useOpeningPlayback(phase ?? 'still', finish, skipped);

  useEffect(() => {
    if (phase !== 'settling') return undefined;
    const timer = window.setTimeout(() => setPhase('finished'), SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  if (!isClient || phase === null || phase === 'still' || phase === 'settling') return null;

  if (phase === 'playing') {
    return (
      <button
        type="button"
        className="skip-intro"
        onClick={() => {
          fastForwardIntro();
          setPhase('settling');
        }}
      >
        Skip intro
      </button>
    );
  }

  return (
    <button
      type="button"
      className="replay-intro"
      onClick={() => {
        replayIntro();
        setPhase('playing');
      }}
    >
      <RotateCcw size={15} strokeWidth={1.5} aria-hidden="true" />
      Replay invitation
    </button>
  );
}
