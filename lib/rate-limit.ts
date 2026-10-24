interface RateLimitOptions {
  readonly limit: number;
  readonly windowMs: number;
}

/**
 * A small fixed-window limiter. On serverless hosting each instance keeps its own count, so
 * this is a speed bump against floods, not an exact quota.
 */
export function createRateLimiter({ limit, windowMs }: RateLimitOptions) {
  let windows: ReadonlyMap<string, { readonly start: number; readonly count: number }> = new Map();

  return {
    allow(key: string, now: number = Date.now()): boolean {
      const current = windows.get(key);
      const fresh = !current || now - current.start > windowMs;
      const next = fresh ? { start: now, count: 1 } : { ...current, count: current.count + 1 };
      // Rebuild immutably, dropping expired entries so memory stays small.
      windows = new Map(
        [...windows].filter(([, entry]) => now - entry.start <= windowMs).concat([[key, next]]),
      );
      return next.count <= limit;
    },
    reset() {
      windows = new Map();
    },
  };
}
