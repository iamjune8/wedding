import { useSyncExternalStore } from 'react';

/**
 * One shared clock for every countdown on the page.
 *
 * - Ticks on whole-second boundaries, so both countdowns change together and never drift.
 * - Re-reads the real time when the tab becomes visible again (browsers throttle hidden tabs).
 * - Returns null during server rendering and hydration, so no made-up numbers are ever shown.
 *
 * The module-level variables are the store's internal state; React only sees immutable snapshots.
 */

type Listener = () => void;

let listeners: readonly Listener[] = [];
let snapshot: number | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;

const currentSecond = () => Math.floor(Date.now() / 1000) * 1000;

function notify(): void {
  snapshot = currentSecond();
  listeners.forEach((listener) => listener());
}

function scheduleNextTick(): void {
  const untilNextSecond = 1000 - (Date.now() % 1000) + 15;
  timer = setTimeout(() => {
    notify();
    scheduleNextTick();
  }, untilNextSecond);
}

function handleVisibilityChange(): void {
  if (document.visibilityState !== 'visible') return;
  clearTimeout(timer);
  notify();
  scheduleNextTick();
}

function subscribe(listener: Listener): () => void {
  listeners = [...listeners, listener];
  if (listeners.length === 1) {
    snapshot = currentSecond();
    scheduleNextTick();
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }
  return () => {
    listeners = listeners.filter((candidate) => candidate !== listener);
    if (listeners.length === 0) {
      clearTimeout(timer);
      timer = undefined;
      snapshot = null;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  };
}

function getSnapshot(): number {
  if (snapshot === null) snapshot = currentSecond();
  return snapshot;
}

const getServerSnapshot = (): number | null => null;

/** Current time in milliseconds, rounded down to the second; null until the page is interactive. */
export function useNow(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
