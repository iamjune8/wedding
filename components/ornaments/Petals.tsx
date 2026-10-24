import { createPetals } from '@/lib/petals';
import { cssVars } from '@/lib/style';

/** A rounded flower petal with a soft vein, drawn once and coloured per tone in CSS. */
const PETAL = 'M0 -10C6 -10 10 -4 8 2C6.5 7 2.5 10 0 10C-2.5 10 -6.5 7 -8 2C-10 -4 -6 -10 0 -10Z';
const VEIN = 'M0 -7C.6 -2 .6 3 0 8';

interface PetalsProps {
  /** How many petals fall at once. */
  readonly count?: number;
  /** Changes the pattern so each chapter's shower looks different. */
  readonly seed?: number;
  readonly className?: string;
}

/**
 * A shower of rose, blush, marigold, jasmine and lilac petals. Transform-only CSS animation,
 * paused while off screen and absent for visitors who prefer reduced motion.
 */
export function Petals({ count = 14, seed = 1, className }: PetalsProps) {
  return (
    <div className={['petals', className].filter(Boolean).join(' ')} aria-hidden="true">
      {createPetals(count, seed).map((petal) => (
        <span
          key={`${petal.left}-${petal.delay}`}
          className={`petal petal--${petal.tone}`}
          style={cssVars({
            '--left': `${petal.left}%`,
            '--size': `${petal.size}rem`,
            '--delay': `${petal.delay}s`,
            '--duration': `${petal.duration}s`,
            '--sway': `${petal.sway}px`,
            '--spin': `${petal.spin}deg`,
          })}
        >
          <svg viewBox="-10 -10 20 20" focusable="false">
            <path d={PETAL} className="petal__body" />
            <path d={VEIN} className="petal__vein" />
          </svg>
        </span>
      ))}
    </div>
  );
}
