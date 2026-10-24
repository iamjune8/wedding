import type { CSSProperties } from 'react';
import type { FloralItem, FloralLayout } from '@/lib/flora';

const hrefOf = (item: FloralItem) =>
  item.kind === 'rose' ? `#flora-rose-${item.tone}` : `#flora-${item.kind}`;

/** Leaves are drawn from their stem end; everything else from its centre. */
const boxOf = (item: FloralItem) =>
  item.kind === 'leaf'
    ? { x: 0, y: -item.size / 3, width: item.size, height: (item.size * 2) / 3 }
    : { x: -item.size / 2, y: -item.size / 2, width: item.size, height: item.size };

interface FloralClusterProps {
  readonly layout: FloralLayout;
  readonly className?: string;
  readonly style?: CSSProperties;
  /** How the drawing fits its box (defaults to keeping its proportions). */
  readonly preserveAspectRatio?: string;
}

/** Draws one arrangement from lib/flora.ts using the shared floral sprite. Decorative. */
export function FloralCluster({
  layout,
  className,
  style,
  preserveAspectRatio = 'xMidYMax meet',
}: FloralClusterProps) {
  return (
    <svg
      className={['flora', className].filter(Boolean).join(' ')}
      style={style}
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      preserveAspectRatio={preserveAspectRatio}
      aria-hidden="true"
      focusable="false"
      overflow="visible"
    >
      {layout.items.map((item, index) => (
        <use
          key={`${item.kind}-${index}`}
          href={hrefOf(item)}
          {...boxOf(item)}
          transform={`translate(${item.x} ${item.y}) rotate(${item.rotate})`}
          className={`flora__${item.kind}`}
        />
      ))}
    </svg>
  );
}
