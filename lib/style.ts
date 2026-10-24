import type { CSSProperties } from 'react';

type CustomProperties = Readonly<Record<`--${string}`, string | number>>;

/** Typed helper for passing CSS custom properties through React's `style` prop. */
export const cssVars = (vars: CustomProperties): CSSProperties => ({ ...vars }) as CSSProperties;

/** Delay for one step of the opening sequence. */
export const introDelay = (milliseconds: number) =>
  cssVars({ '--intro-delay': `${milliseconds}ms` });

/** Delay for a scroll-revealed element, so siblings arrive in a gentle sequence. */
export const revealDelay = (milliseconds: number) =>
  cssVars({ '--reveal-delay': `${milliseconds}ms` });
