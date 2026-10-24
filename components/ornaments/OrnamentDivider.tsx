import type { CSSProperties } from 'react';
import { StarMotif } from './StarMotif';

interface OrnamentDividerProps {
  readonly className?: string;
  readonly style?: CSSProperties;
  /** Marks the divider for the scroll reveal (lines extend outwards from the star). */
  readonly reveal?: boolean;
}

export function OrnamentDivider({ className, style, reveal = false }: OrnamentDividerProps) {
  return (
    <div
      className={['ornament-divider', className].filter(Boolean).join(' ')}
      style={style}
      aria-hidden="true"
      data-reveal={reveal ? 'divider' : undefined}
    >
      <span className="ornament-divider__line ornament-divider__line--start" />
      <StarMotif className="ornament-divider__star" />
      <span className="ornament-divider__line ornament-divider__line--end" />
    </div>
  );
}
