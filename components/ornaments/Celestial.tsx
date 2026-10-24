import type { CSSProperties } from 'react';
import { cssVars } from '@/lib/style';

interface CrescentProps {
  readonly className?: string;
  readonly style?: CSSProperties;
}

/** A softly glowing crescent moon with a small star, crowning the arch. Decorative. */
export function Crescent({ className, style }: CrescentProps) {
  return (
    <div className={['crescent', className].filter(Boolean).join(' ')} style={style}>
      <span className="crescent__halo" />
      <svg className="crescent__moon" viewBox="-30 -30 60 60" focusable="false">
        <path d="M6 -21A22 22 0 1 0 6 21A17 17 0 1 1 6 -21Z" />
        <path
          className="crescent__star"
          d="M14 -6L15.4 -2.4L19 -1L15.4 0.4L14 4L12.6 0.4L9 -1L12.6 -2.4Z"
        />
      </svg>
    </div>
  );
}

interface Swag {
  readonly from: number;
  readonly to: number;
  readonly sag: number;
  readonly top: number;
}

/* One 400-unit panel of fairy lights: three swags across the top, two hanging lower. */
const PANEL: readonly Swag[] = [
  { from: 0, to: 140, sag: 34, top: 6 },
  { from: 130, to: 270, sag: 26, top: 2 },
  { from: 260, to: 400, sag: 34, top: 6 },
  { from: -20, to: 200, sag: 46, top: 18 },
  { from: 200, to: 420, sag: 46, top: 18 },
];

const BULBS_PER_SWAG = 9;

/** Point on a quadratic swag that sags `sag` units below its ends at the middle. */
const swagPoint = (swag: Swag, t: number) => ({
  x: swag.from + (swag.to - swag.from) * t,
  y: swag.top + swag.sag * 4 * t * (1 - t),
});

const swagPath = (swag: Swag) =>
  `M${swag.from} ${swag.top}Q${(swag.from + swag.to) / 2} ${swag.top + swag.sag * 2} ${swag.to} ${swag.top}`;

/** `panels` copies side by side, so wide screens get more, not bigger, bulbs. */
const swagsFor = (panels: number): Swag[] =>
  Array.from({ length: panels }, (_, panel) =>
    PANEL.map((swag) => ({ ...swag, from: swag.from + panel * 400, to: swag.to + panel * 400 })),
  ).flat();

interface FairyLightsProps {
  readonly className?: string;
  readonly style?: CSSProperties;
  /** How many 400-unit panels to draw across (1 for phones, 3 for wide screens). */
  readonly panels?: number;
}

/** Draped strings of warm fairy lights; the bulbs glow gently out of step. Decorative. */
export function FairyLights({ className, style, panels = 1 }: FairyLightsProps) {
  return (
    <svg
      className={['fairy-lights', className].filter(Boolean).join(' ')}
      style={style}
      viewBox={`0 0 ${400 * panels} 80`}
      preserveAspectRatio="xMidYMin slice"
      aria-hidden="true"
      focusable="false"
    >
      {swagsFor(panels).map((swag, swagIndex) => (
        <g key={`${swag.from}-${swag.to}-${swag.top}`}>
          <path d={swagPath(swag)} className="fairy-lights__wire" />
          {Array.from({ length: BULBS_PER_SWAG }, (_, index) => {
            const point = swagPoint(swag, (index + 0.5) / BULBS_PER_SWAG);
            return (
              <circle
                key={index}
                cx={point.x.toFixed(1)}
                cy={point.y.toFixed(1)}
                r={swag.top > 10 ? 1.5 : 1.9}
                className="fairy-lights__bulb"
                style={cssVars({
                  '--twinkle-delay': `${((index * 7 + swagIndex * 3) % 11) * 0.37}s`,
                })}
              />
            );
          })}
        </g>
      ))}
    </svg>
  );
}
