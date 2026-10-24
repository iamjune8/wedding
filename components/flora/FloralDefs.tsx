import { ROSE_TONES, type RoseTone } from '@/lib/flora';

/*
 * The floral sprite: every rose, leaf, blossom and bud on the page is a <use> of one of these
 * symbols, so the artwork is drawn once and stays crisp at any size. Rendered once per page.
 */

/** Colours for each rose tone: light edge, petal body, shading for the petal lines. */
const TONE_COLOURS: Record<RoseTone, readonly [string, string, string]> = {
  ivory: ['#fffdf8', '#f5ede1', '#c4ad90'],
  peach: ['#fdf0e2', '#f3cfab', '#c48a5c'],
  champagne: ['#fbf2de', '#eed8ad', '#b38f55'],
  blush: ['#fdf1f3', '#eed0d7', '#bd8796'],
  pink: ['#fbe2e8', '#e9b1be', '#b5687d'],
};

/* Flat, illustrated roses in the style of the couple's floral gate: a scalloped bloom with
 * curved petal lines spiralling into the heart. */
const SCALLOPS = Array.from({ length: 7 }, (_, index) => (index * 360) / 7);
const PETAL_LINES = [
  'M-31 9A32 32 0 0 1 21 -25',
  'M31 -3A31 31 0 0 1 -5 31',
  'M-25 21A30 30 0 0 1 -30 -6',
  'M-17 -6A19 19 0 0 1 17 -10',
  'M18 1A18 18 0 0 1 -4 18',
  'M-13 12A15 15 0 0 1 -15 -2',
  'M-8 -2A9 9 0 0 1 8 -3',
  'M7 3A8 8 0 0 1 -3 8',
];

function RoseSymbol({ tone }: { tone: RoseTone }) {
  const [edge, body, shade] = TONE_COLOURS[tone];
  const fill = `flora-${tone}-fill`;
  return (
    <symbol id={`flora-rose-${tone}`} viewBox="-50 -50 100 100" overflow="visible">
      <defs>
        <radialGradient id={fill} cx="0" cy="0" r="48" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={body} />
          <stop offset="0.55" stopColor={body} />
          <stop offset="1" stopColor={edge} />
        </radialGradient>
      </defs>
      {/* A soft shadow so each bloom sits on the ones behind it. */}
      <circle r="43" cy="4" fill="rgb(30 28 40 / 0.18)" />
      {SCALLOPS.map((angle) => (
        <circle
          key={angle}
          r="15"
          cy="-31"
          transform={`rotate(${angle})`}
          fill={`url(#${fill})`}
          stroke={shade}
          strokeOpacity="0.35"
          strokeWidth="1"
        />
      ))}
      <circle r="36" fill={`url(#${fill})`} />
      <g fill="none" stroke={shade} strokeLinecap="round" strokeOpacity="0.6" strokeWidth="2.1">
        {PETAL_LINES.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <path
        d="M-27 -21A34 34 0 0 1 6 -34"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.55"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle r="3" fill={shade} fillOpacity="0.55" />
    </symbol>
  );
}

export function FloralDefs() {
  return (
    <svg className="flora-defs" aria-hidden="true" focusable="false" width="0" height="0">
      <defs>
        <linearGradient id="flora-leaf-fill" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6d7a63" />
          <stop offset="0.6" stopColor="#84927a" />
          <stop offset="1" stopColor="#a9b59c" />
        </linearGradient>
      </defs>
      {ROSE_TONES.map((tone) => (
        <RoseSymbol key={tone} tone={tone} />
      ))}
      <symbol id="flora-leaf" viewBox="-2 -16 48 32" overflow="visible">
        <path d="M0 0C8 -11 26 -14 44 -2C27 11 9 10 0 0Z" fill="url(#flora-leaf-fill)" />
        <path
          d="M2 0C14 -3 28 -4 42 -2"
          fill="none"
          stroke="#5c6852"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
      </symbol>
      <symbol id="flora-blossom" viewBox="-12 -12 24 24" overflow="visible">
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse
            key={angle}
            cx="0"
            cy="-5.5"
            rx="4"
            ry="5.5"
            fill="#fdf7ec"
            stroke="#e6d6bd"
            strokeWidth="0.6"
            transform={`rotate(${angle})`}
          />
        ))}
        <circle r="2.4" fill="#e3bd6a" />
      </symbol>
      <symbol id="flora-bud" viewBox="-10 -14 20 28" overflow="visible">
        <path d="M0 10C-7 4 -7 -6 0 -12C7 -6 7 4 0 10Z" fill="#e7a9b7" />
        <path d="M0 -12C3 -6 3 2 0 10" fill="none" stroke="#c97c90" strokeWidth="0.8" />
        <path d="M-6 6C-3 9 3 9 6 6L0 13Z" fill="#84927a" />
      </symbol>
    </svg>
  );
}
