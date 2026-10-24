import type { CSSProperties, ReactNode } from 'react';
import {
  ARCH_WIDTH,
  FRAME_SIDE,
  OPENING,
  crenellationPath,
  pointedArchPath,
  scallopedArchPath,
  widenArch,
} from '@/lib/mughal-arch';

/*
 * A Mughal palace arch in carved dusty-pink (or sage) stone: kangura crenellations, a carved
 * spandrel band, a scalloped opening framed by ivory, gold-beaded and mauve mouldings, and a
 * fluted pillar on each side standing on a plinth.
 *
 * The crown and plinth keep their proportions; the sides stretch with the content, so the same
 * frame holds the opening invitation, the event cards and the closing.
 */

const CROWN_TOP = -48;
const CROWN_HEIGHT = OPENING.springY - CROWN_TOP;
const RIGHT = ARCH_WIDTH - FRAME_SIDE;

const OPENING_EDGE = scallopedArchPath(OPENING, 6);
const STONE = `M0 -30H${ARCH_WIDTH}V${OPENING.springY}H0Z${OPENING_EDGE}Z`;
const MOULDINGS = [8, 15, 22, 26].map((offset) => pointedArchPath(widenArch(OPENING, offset)));
const KANGURA = crenellationPath(CROWN_TOP, 18, 14);

/* Eight-petal carved rosette, centred on 0 0. */
const ROSETTE_PETAL = 'M0 -4C4 -8 4 -15 0 -19C-4 -15 -4 -8 0 -4Z';
const ROSETTE_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

/* Fluted pillar: shaft from x 6 to 26, mirrored on the right. */
const SHAFT = { left: 6, right: 26 };
const FLUTES = [11, 16, 21];
const CAPITAL =
  'M2 270V258C2 250 8 245 14 245H18C24 245 30 250 30 258V270Z' +
  'M16 245C11 239 11 231 16 225C21 231 21 239 16 245Z';
const PILLAR_BASE = 'M2 34V22C2 16 6 13 11 13H21C26 13 30 16 30 22V34Z';

export type MughalVariant = 'window' | 'mini';
export type MughalTone = 'rose' | 'sage';

interface MughalArchProps {
  /** Unique per page: keeps each frame's gradients and patterns separate. */
  readonly id: string;
  readonly variant: MughalVariant;
  readonly tone?: MughalTone;
  readonly className?: string;
  readonly style?: CSSProperties;
  /** Decorative layer drawn over the frame, behind the content (lanterns, flowers, …). */
  readonly decoration?: ReactNode;
  readonly children?: ReactNode;
}

const mirrorX = (x: number) => ARCH_WIDTH - x;

function Rosette({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} className="mughal__rosette">
      <circle r="21" className="mughal__rosette-ring" />
      {ROSETTE_ANGLES.map((angle) => (
        <path key={angle} d={ROSETTE_PETAL} transform={`rotate(${angle})`} />
      ))}
      <circle r="3.2" className="mughal__rosette-heart" />
    </g>
  );
}

function Crown({ id }: { id: string }) {
  return (
    <svg
      className="mughal__crown"
      viewBox={`0 ${CROWN_TOP} ${ARCH_WIDTH} ${CROWN_HEIGHT}`}
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-stone`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="mughal__stop-hi" />
          <stop offset="0.55" className="mughal__stop" />
          <stop offset="1" className="mughal__stop-lo" />
        </linearGradient>
        <pattern id={`${id}-carving`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path
            d="M10 2L12.4 7.6L18 10L12.4 12.4L10 18L7.6 12.4L2 10L7.6 7.6Z"
            className="mughal__carving"
          />
        </pattern>
        <clipPath id={`${id}-clip`}>
          <path d={STONE} clipRule="evenodd" />
        </clipPath>
      </defs>

      <path d={KANGURA} fill={`url(#${id}-stone)`} className="mughal__kangura" />
      <path d={STONE} fill={`url(#${id}-stone)`} fillRule="evenodd" />
      <rect
        x="0"
        y="-30"
        width={ARCH_WIDTH}
        height={CROWN_HEIGHT}
        fill={`url(#${id}-carving)`}
        clipPath={`url(#${id}-clip)`}
        className="mughal__carved"
      />

      {/* Cornice */}
      <path d={`M0 -30H${ARCH_WIDTH}`} className="mughal__gilt" />
      <path d={`M0 -22H${ARCH_WIDTH}`} className="mughal__ivory-line" />
      <path d={`M0 -18H${ARCH_WIDTH}`} className="mughal__gilt mughal__gilt--fine" />

      {/* Spandrel rosettes and the apex medallion */}
      <Rosette x={74} y={40} />
      <Rosette x={mirrorX(74)} y={40} />
      <Rosette x={200} y={4} scale={0.62} />

      {/* Mouldings around the opening, outermost first */}
      <path d={MOULDINGS[3]} className="mughal__ivory-line mughal__ivory-line--fine" />
      <path d={MOULDINGS[2]} className="mughal__deep-line" />
      <path d={MOULDINGS[1]} className="mughal__beads" />
      <path d={MOULDINGS[0]} className="mughal__ivory-line" />

      {/* The scalloped edge: a soft shadow, then a crisp ivory lip */}
      <path d={OPENING_EDGE} className="mughal__edge-shadow" />
      <path d={OPENING_EDGE} className="mughal__edge" />

      {/* Pillar capitals */}
      <path d={CAPITAL} className="mughal__capital" />
      <path
        d={CAPITAL}
        className="mughal__capital"
        transform={`translate(${ARCH_WIDTH} 0) scale(-1 1)`}
      />
    </svg>
  );
}

function Sides() {
  const lines = (x: number, className: string) => (
    <>
      <path d={`M${x} 0V100`} className={className} vectorEffect="non-scaling-stroke" />
      <path d={`M${mirrorX(x)} 0V100`} className={className} vectorEffect="non-scaling-stroke" />
    </>
  );
  return (
    <div className="mughal__sides">
      <svg viewBox={`0 0 ${ARCH_WIDTH} 100`} preserveAspectRatio="none" focusable="false">
        <rect x="0" y="0" width={FRAME_SIDE} height="100" className="mughal__side-stone" />
        <rect x={RIGHT} y="0" width={FRAME_SIDE} height="100" className="mughal__side-stone" />
        <rect
          x={SHAFT.left}
          y="0"
          width={SHAFT.right - SHAFT.left}
          height="100"
          className="mughal__shaft"
        />
        <rect
          x={mirrorX(SHAFT.right)}
          y="0"
          width={SHAFT.right - SHAFT.left}
          height="100"
          className="mughal__shaft"
        />
        {FLUTES.map((x) => (
          <g key={x}>{lines(x, 'mughal__flute')}</g>
        ))}
        {lines(SHAFT.left, 'mughal__gilt')}
        {lines(SHAFT.right, 'mughal__gilt')}
        {lines(30, 'mughal__ivory-line mughal__ivory-line--fine')}
        {lines(34, 'mughal__deep-line')}
        {lines(48, 'mughal__ivory-line')}
        {lines(FRAME_SIDE, 'mughal__edge')}
      </svg>
      {/* Gold beading (CSS dots stay round however tall the sides grow). */}
      <span className="mughal__bead-column mughal__bead-column--start" />
      <span className="mughal__bead-column mughal__bead-column--end" />
    </div>
  );
}

function Plinth() {
  return (
    <svg className="mughal__base" viewBox={`0 0 ${ARCH_WIDTH} 64`} focusable="false">
      <rect x="0" y="0" width={FRAME_SIDE} height="34" className="mughal__side-stone" />
      <rect x={RIGHT} y="0" width={FRAME_SIDE} height="34" className="mughal__side-stone" />
      <rect x="0" y="34" width={ARCH_WIDTH} height="30" className="mughal__plinth" />
      <path d={PILLAR_BASE} className="mughal__capital" />
      <path
        d={PILLAR_BASE}
        className="mughal__capital"
        transform={`translate(${ARCH_WIDTH} 0) scale(-1 1)`}
      />
      <path d={`M${SHAFT.left} 0V13M${SHAFT.right} 0V13`} className="mughal__gilt" />
      <path d={`M0 34H${ARCH_WIDTH}`} className="mughal__gilt" />
      <path d={`M0 41H${ARCH_WIDTH}`} className="mughal__ivory-line" />
      <path d={`M0 58H${ARCH_WIDTH}`} className="mughal__deep-line" />
    </svg>
  );
}

export function MughalArch({
  id,
  variant,
  tone = 'rose',
  className,
  style,
  decoration,
  children,
}: MughalArchProps) {
  return (
    <div
      className={['mughal', `mughal--${variant}`, `mughal--${tone}`, className]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      <div className="mughal__interior" aria-hidden="true" />
      <div className="mughal__frame" aria-hidden="true">
        <Crown id={id} />
        <Sides />
        <Plinth />
      </div>
      {decoration ? (
        <div className="mughal__decoration" aria-hidden="true">
          {decoration}
        </div>
      ) : null}
      <div className="mughal__content">{children}</div>
    </div>
  );
}
