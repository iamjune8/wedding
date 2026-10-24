/*
 * Layouts for the floral artwork (components/flora). Every arrangement is generated from a
 * fixed seed, so the server and browser draw identical flowers and nothing shifts on hydration.
 */

export const ROSE_TONES = ['ivory', 'peach', 'champagne', 'blush', 'pink'] as const;
export type RoseTone = (typeof ROSE_TONES)[number];

export type FloralItem =
  | {
      readonly kind: 'rose';
      readonly tone: RoseTone;
      readonly x: number;
      readonly y: number;
      readonly size: number;
      readonly rotate: number;
    }
  | {
      readonly kind: 'leaf' | 'blossom' | 'bud';
      readonly x: number;
      readonly y: number;
      readonly size: number;
      readonly rotate: number;
    };

export interface FloralLayout {
  readonly width: number;
  readonly height: number;
  readonly items: readonly FloralItem[];
}

/** Small deterministic random sequence (LCG), returning numbers in [0, 1). */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0 || 1;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

const roundTo = (value: number) => Math.round(value * 10) / 10;

type Random = () => number;
const between = (random: Random, min: number, max: number) => roundTo(min + random() * (max - min));
const pick = <T>(random: Random, values: readonly T[]): T =>
  values[Math.floor(random() * values.length)] as T;

/** Mostly ivory, peach and champagne, like the floral gate, with a little blush and pink. */
const ROSE_MIX: readonly RoseTone[] = [
  'ivory',
  'ivory',
  'peach',
  'champagne',
  'ivory',
  'peach',
  'blush',
  'pink',
];

const DRAW_ORDER: Record<FloralItem['kind'], number> = { leaf: 0, bud: 1, rose: 2, blossom: 3 };

/** Leaves at the back, then buds, roses (top to bottom, for depth) and small blossoms. */
export function inDrawOrder(items: readonly FloralItem[]): FloralItem[] {
  return [...items].sort(
    (a, b) => DRAW_ORDER[a.kind] - DRAW_ORDER[b.kind] || (a.kind === 'rose' ? a.y - b.y : 0),
  );
}

/** A dense bank of flowers along the bottom edge, highest at the sides. */
export function foregroundLayout(seed: number, width = 400, height = 130): FloralLayout {
  const random = seededRandom(seed);
  const sideLift = (x: number) => Math.abs(x - width / 2) / (width / 2); // 0 centre, 1 edges
  const leaves = Array.from({ length: 22 }, (_, index): FloralItem => {
    const x = between(random, index * (width / 22) - 6, index * (width / 22) + 12);
    return {
      kind: 'leaf',
      x,
      y: between(random, height * 0.55, height * 0.8) - sideLift(x) * height * 0.3,
      size: between(random, 30, 44),
      rotate: x < width / 2 ? between(random, -165, -110) : between(random, -70, -15),
    };
  });
  const roses = Array.from({ length: 13 }, (_, index): FloralItem => {
    const x = between(random, index * (width / 12) - 8, index * (width / 12) + 8);
    return {
      kind: 'rose',
      tone: pick(random, ROSE_MIX),
      x,
      y: between(random, height * 0.68, height * 0.86) - sideLift(x) * height * 0.32,
      size: between(random, 34, 50) + sideLift(x) * 10,
      rotate: between(random, 0, 360),
    };
  });
  const backRoses = Array.from({ length: 6 }, (_, index): FloralItem => {
    const x = between(random, index * (width / 5) - 10, index * (width / 5) + 10);
    return {
      kind: 'rose',
      tone: pick(random, ['blush', 'peach', 'ivory'] as const),
      x,
      y: between(random, height * 0.45, height * 0.58) - sideLift(x) * height * 0.3,
      size: between(random, 24, 32),
      rotate: between(random, 0, 360),
    };
  });
  const blossoms = Array.from({ length: 16 }, (): FloralItem => {
    const x = between(random, 0, width);
    return {
      kind: 'blossom',
      x,
      y: between(random, height * 0.5, height * 0.95) - sideLift(x) * height * 0.25,
      size: between(random, 9, 14),
      rotate: between(random, 0, 72),
    };
  });
  const buds = Array.from({ length: 8 }, (): FloralItem => {
    const x = between(random, 0, width);
    return {
      kind: 'bud',
      x,
      y: between(random, height * 0.38, height * 0.55) - sideLift(x) * height * 0.3,
      size: between(random, 10, 15),
      rotate: between(random, -30, 30),
    };
  });
  return {
    width,
    height,
    items: inDrawOrder([...leaves, ...backRoses, ...roses, ...blossoms, ...buds]),
  };
}

/** The tall oval floral installation that stands between the bride and groom. */
export function centrepieceLayout(seed: number): FloralLayout {
  const width = 200;
  const height = 300;
  const random = seededRandom(seed);
  const centre = { x: 100, y: 128 };
  const radius = { x: 68, y: 108 };
  const ring = Array.from({ length: 26 }, (_, index): FloralItem[] => {
    const angle = (index / 26) * Math.PI * 2 - Math.PI / 2;
    const x = roundTo(centre.x + Math.cos(angle) * radius.x);
    const y = roundTo(centre.y + Math.sin(angle) * radius.y);
    const outward = (angle * 180) / Math.PI;
    return [
      {
        kind: 'leaf',
        x,
        y,
        size: between(random, 20, 28),
        rotate: roundTo(outward + between(random, -30, 30)),
      },
      index % 2 === 0
        ? {
            kind: 'rose',
            tone: pick(random, ROSE_MIX),
            x,
            y,
            size: between(random, 22, 30),
            rotate: between(random, 0, 360),
          }
        : { kind: 'blossom', x, y, size: between(random, 9, 12), rotate: between(random, 0, 72) },
    ];
  }).flat();
  const mound = Array.from({ length: 14 }, (_, index): FloralItem => ({
    kind: 'rose',
    tone: pick(random, ROSE_MIX),
    x: between(random, 30 + index * 10, 40 + index * 10),
    y: between(random, 232, 268) + Math.abs(index - 6.5) * 1.6,
    size: between(random, 28, 40),
    rotate: between(random, 0, 360),
  }));
  const moundLeaves = Array.from({ length: 12 }, (_, index): FloralItem => ({
    kind: 'leaf',
    x: between(random, 24 + index * 13, 32 + index * 13),
    y: between(random, 236, 262),
    size: between(random, 26, 36),
    rotate: index < 6 ? between(random, -175, -120) : between(random, -60, -5),
  }));
  const hanging = Array.from({ length: 5 }, (_, index): FloralItem => ({
    kind: 'bud',
    x: 76 + index * 12,
    y: between(random, 30, 44) + Math.abs(index - 2) * 4,
    size: between(random, 9, 12),
    rotate: 180,
  }));
  return { width, height, items: inDrawOrder([...ring, ...mound, ...moundLeaves, ...hanging]) };
}

/** A spray rising from a bottom corner (mirror it in CSS for the other side). */
export function cornerLayout(seed: number): FloralLayout {
  const width = 200;
  const height = 200;
  const random = seededRandom(seed);
  const spray = Array.from({ length: 9 }, (_, index): FloralItem[] => {
    const t = index / 8;
    const x = roundTo(16 + t * 150);
    const y = roundTo(186 - Math.sin(t * Math.PI * 0.5) * 30 - (1 - t) * 120);
    return [
      {
        kind: 'leaf',
        x,
        y,
        size: between(random, 26, 38),
        rotate: between(random, -120, -20),
      },
      {
        kind: 'rose',
        tone: pick(random, ROSE_MIX),
        x: x + between(random, -6, 6),
        y: y + between(random, -4, 8),
        size: between(random, 26, 44) * (1 - t * 0.35),
        rotate: between(random, 0, 360),
      },
    ];
  }).flat();
  const blossoms = Array.from({ length: 8 }, (): FloralItem => ({
    kind: 'blossom',
    x: between(random, 10, 150),
    y: between(random, 80, 196),
    size: between(random, 8, 12),
    rotate: between(random, 0, 72),
  }));
  return { width, height, items: inDrawOrder([...spray, ...blossoms]) };
}

/** A low, rounded mound of roses and leaves, for the foot of a pillar or a corner. */
export function moundLayout(seed: number): FloralLayout {
  const width = 160;
  const height = 100;
  const random = seededRandom(seed);
  const leaves = Array.from({ length: 11 }, (_, index): FloralItem => {
    const t = index / 10;
    return {
      kind: 'leaf',
      x: roundTo(80 + Math.cos(Math.PI * (1 - t)) * 46),
      y: roundTo(78 - Math.sin(Math.PI * t) * 34),
      size: between(random, 30, 40),
      rotate: roundTo(-180 + t * 180 + between(random, -15, 15)),
    };
  });
  const roses = Array.from({ length: 8 }, (_, index): FloralItem => {
    const t = index / 7;
    return {
      kind: 'rose',
      tone: pick(random, ROSE_MIX),
      x: roundTo(80 + Math.cos(Math.PI * (1 - t)) * 50 + between(random, -4, 4)),
      y: roundTo(84 - Math.sin(Math.PI * t) * 30 + between(random, -3, 3)),
      size: between(random, 26, 36) + Math.sin(Math.PI * t) * 8,
      rotate: between(random, 0, 360),
    };
  });
  const blossoms = Array.from({ length: 7 }, (): FloralItem => ({
    kind: 'blossom',
    x: between(random, 24, 136),
    y: between(random, 46, 96),
    size: between(random, 8, 12),
    rotate: between(random, 0, 72),
  }));
  return { width, height, items: inDrawOrder([...leaves, ...roses, ...blossoms]) };
}
