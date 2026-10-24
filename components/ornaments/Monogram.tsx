import type { CSSProperties } from 'react';

/** Eight-point star (two overlapping squares) with its points on a circle of radius `outer`. */
function octagramPath(outer: number): string {
  const inner = (outer * Math.cos(Math.PI / 4)) / Math.cos(Math.PI / 8);
  const points = Array.from({ length: 16 }, (_, index) => {
    const radius = index % 2 === 0 ? outer : inner;
    const angle = (index * Math.PI) / 8 - Math.PI / 2;
    return `${(radius * Math.cos(angle)).toFixed(2)} ${(radius * Math.sin(angle)).toFixed(2)}`;
  });
  return `M${points.join('L')}Z`;
}

const STAR_OUTER = octagramPath(48);
const STAR_INNER = octagramPath(43);

interface MonogramProps {
  readonly first: string;
  readonly second: string;
  readonly className?: string;
  readonly style?: CSSProperties;
}

/**
 * The couple's initials in a gilded eight-point medallion, crowning the opening arch like a
 * wax seal. Decorative: the full names are read out by the heading below.
 */
export function Monogram({ first, second, className, style }: MonogramProps) {
  return (
    <div
      className={['monogram', className].filter(Boolean).join(' ')}
      style={style}
      aria-hidden="true"
    >
      <svg className="monogram__seal" viewBox="-50 -50 100 100" focusable="false">
        <path d={STAR_OUTER} className="monogram__star" />
        <path d={STAR_INNER} className="monogram__star-inner" />
        <circle r="33" className="monogram__disc" />
        <circle r="36.5" className="monogram__beads" />
        <circle r="30" className="monogram__ring" />
      </svg>
      <span className="monogram__letters">
        <span>{first}</span>
        <span className="monogram__dot" />
        <span>{second}</span>
      </span>
    </div>
  );
}
