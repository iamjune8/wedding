import { describe, expect, it } from 'vitest';
import { createRateLimiter } from './rate-limit';

describe('createRateLimiter', () => {
  it('allows up to the limit within a window, then refuses', () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 60_000 });
    expect([1, 2, 3].map(() => limiter.allow('1.2.3.4', 0))).toEqual([true, true, true]);
    expect(limiter.allow('1.2.3.4', 1000)).toBe(false);
  });

  it('counts each visitor separately', () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000 });
    expect(limiter.allow('a', 0)).toBe(true);
    expect(limiter.allow('b', 0)).toBe(true);
    expect(limiter.allow('a', 10)).toBe(false);
  });

  it('allows again once the window has passed', () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000 });
    expect(limiter.allow('a', 0)).toBe(true);
    expect(limiter.allow('a', 60_001)).toBe(true);
  });
});
