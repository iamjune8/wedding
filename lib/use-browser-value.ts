import { useSyncExternalStore } from 'react';

const subscribeNever = () => () => {};

/**
 * Reads a browser-only value without a hydration mismatch: the server and the first client
 * render use `serverValue`, then React switches to `read()` once the page is interactive.
 * `read` must return a primitive (or otherwise stable) value.
 */
export function useBrowserValue<T>(read: () => T, serverValue: T): T {
  return useSyncExternalStore(subscribeNever, read, () => serverValue);
}

export function useIsClient(): boolean {
  return useBrowserValue(() => true, false);
}
