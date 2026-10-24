/** A sixteen-petal geometric rosette in marigold and rose: the Mehndi chapter's ornament. Its petals
 * draw themselves when it scrolls into view (pathLength lets CSS animate every petal alike). */

const LONG_PETAL = 'M0 -15C6.5 -26 6.5 -40 0 -54C-6.5 -40 -6.5 -26 0 -15Z';
const SHORT_PETAL = 'M0 -15C4 -22 4 -30 0 -38C-4 -30 -4 -22 0 -15Z';
const PETALS = Array.from({ length: 16 }, (_, index) => index * 22.5);

interface RosetteProps {
  readonly className?: string;
}

export function Rosette({ className }: RosetteProps) {
  return (
    <svg
      className={['rosette', className].filter(Boolean).join(' ')}
      viewBox="-60 -60 120 120"
      aria-hidden="true"
      focusable="false"
    >
      <g className="rosette__petals">
        {PETALS.map((angle) => (
          <path
            key={`long-${angle}`}
            d={LONG_PETAL}
            transform={`rotate(${angle})`}
            pathLength={1}
          />
        ))}
      </g>
      <g className="rosette__petals rosette__petals--short">
        {PETALS.map((angle) => (
          <path
            key={`short-${angle}`}
            d={SHORT_PETAL}
            transform={`rotate(${angle + 11.25})`}
            pathLength={1}
          />
        ))}
      </g>
      <circle r="11" className="rosette__ring" />
      <circle r="15" className="rosette__ring rosette__ring--soft" />
      <circle r="2.6" className="rosette__centre" />
    </svg>
  );
}
