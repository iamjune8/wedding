import type { CSSProperties, ReactNode } from 'react';

/*
 * A pointed (Mughal-style) arch drawn in hairline gold.
 *
 * The crown keeps its proportions while the jambs stretch with the content, so the arch always
 * fits whatever is inside it. Both drawings share the same 0–300 horizontal scale, so the jamb
 * lines meet the crown exactly at any width. Strokes stay 1px thanks to non-scaling-stroke.
 */

const CROWN_OUTER = 'M0 180C0 102 62 50 150 22C238 50 300 102 300 180';
const CROWN_INNER = 'M9 180C9 108 68 61 150 35C232 61 291 108 291 180';
/* A beaded band between the two lines, like the inlay on Mughal arches. */
const CROWN_BEADS = 'M4.5 180C4.5 105 65 55.5 150 28.5C235 55.5 295.5 105 295.5 180';
const FINIAL = 'M150 0L154.5 6.5L150 13L145.5 6.5Z';

type ArchVariant = 'hero' | 'window' | 'mini';

interface ArchFrameProps {
  readonly variant: ArchVariant;
  readonly className?: string;
  readonly style?: CSSProperties;
  /** Decorative layer drawn over the frame, behind the text (e.g. sparkles). */
  readonly decoration?: ReactNode;
  readonly children?: ReactNode;
}

export function ArchFrame({ variant, className, style, decoration, children }: ArchFrameProps) {
  return (
    <div
      className={['arch', `arch--${variant}`, className].filter(Boolean).join(' ')}
      style={style}
    >
      <div className="arch__frame" aria-hidden="true">
        <svg className="arch__crown" viewBox="0 0 300 180" fill="none" focusable="false">
          <path d={`${CROWN_OUTER}Z`} className="arch__fill" />
          <path d={CROWN_OUTER} className="arch__line" vectorEffect="non-scaling-stroke" />
          <path
            d={CROWN_INNER}
            className="arch__line arch__line--inner"
            vectorEffect="non-scaling-stroke"
          />
          <path d={CROWN_BEADS} className="arch__beads" vectorEffect="non-scaling-stroke" />
          <path d="M150 13V22" className="arch__line" vectorEffect="non-scaling-stroke" />
          <path d={FINIAL} className="arch__finial" />
        </svg>
        <div className="arch__jambs">
          <svg viewBox="0 0 300 100" preserveAspectRatio="none" fill="none" focusable="false">
            <path d="M0 0V100M300 0V100" className="arch__line" vectorEffect="non-scaling-stroke" />
            <path
              d="M9 0V100M291 0V100"
              className="arch__line arch__line--inner"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d="M4.5 0V100M295.5 0V100"
              className="arch__beads"
              vectorEffect="non-scaling-stroke"
            />
            {variant === 'hero' ? null : (
              <path d="M0 100H300" className="arch__line" vectorEffect="non-scaling-stroke" />
            )}
          </svg>
        </div>
      </div>
      {decoration}
      <div className="arch__content">{children}</div>
    </div>
  );
}
