import { cssVars } from '@/lib/style';

/** A four-point glint, like light catching gold leaf. */
const GLINT =
  'M0 -10C.9 -2.2 2.2 -.9 10 0C2.2 .9 .9 2.2 0 10C-.9 2.2 -2.2 .9 -10 0C-2.2 -.9 -.9 -2.2 0 -10Z';

export interface SparkleSpot {
  /** Position inside the parent, in percent. */
  readonly x: number;
  readonly y: number;
  /** Size in rem. */
  readonly size: number;
  /** Seconds before the first twinkle, so they never pulse in unison. */
  readonly delay: number;
  readonly duration: number;
}

interface SparklesProps {
  readonly spots: readonly SparkleSpot[];
  readonly className?: string;
}

/** Decorative twinkles. They only animate while on screen and never for reduced motion. */
export function Sparkles({ spots, className }: SparklesProps) {
  return (
    <div className={['sparkles', className].filter(Boolean).join(' ')} aria-hidden="true">
      {spots.map((spot) => (
        <svg
          key={`${spot.x}-${spot.y}`}
          className="sparkle"
          viewBox="-10 -10 20 20"
          focusable="false"
          style={cssVars({
            '--x': `${spot.x}%`,
            '--y': `${spot.y}%`,
            '--size': `${spot.size}rem`,
            '--delay': `${spot.delay}s`,
            '--duration': `${spot.duration}s`,
          })}
        >
          <path d={GLINT} />
        </svg>
      ))}
    </div>
  );
}
