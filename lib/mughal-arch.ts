/*
 * Geometry for the Mughal arch frame (components/ornaments/MughalArch.tsx).
 *
 * Everything is drawn on a 400-unit-wide canvas. The crown of the arch is a pointed (Persian)
 * arch whose edge is cut into scallops, as in Mughal multifoil arches; moulding lines around it
 * are the same pointed arch, widened outward.
 */

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface ArchShape {
  /** Left springing point x (the right side mirrors it around x = 200). */
  readonly springX: number;
  /** y where the arch meets the straight sides. */
  readonly springY: number;
  /** y of the pointed apex. */
  readonly apexY: number;
}

export const ARCH_WIDTH = 400;
export const ARCH_CENTRE = ARCH_WIDTH / 2;

/** Width of the stone frame, pillars included, on each side. */
export const FRAME_SIDE = 56;

/** The opening of the crown: springs at the bottom of the crown, apex near the top. */
export const OPENING: ArchShape = { springX: FRAME_SIDE, springY: 270, apexY: 52 };

const round = (value: number) => Math.round(value * 100) / 100;
const pt = ({ x, y }: Point) => `${round(x)} ${round(y)}`;

/** Point on the left half of a pointed arch, t = 0 at the springing, 1 at the apex. */
export function pointOnArch(shape: ArchShape, t: number): Point {
  const height = shape.springY - shape.apexY;
  const halfSpan = ARCH_CENTRE - shape.springX;
  // Cubic Bézier: rises steeply from the springing, then leans in to a sharp apex.
  const p0 = { x: shape.springX, y: shape.springY };
  const p1 = { x: shape.springX, y: shape.springY - height * 0.55 };
  const p2 = { x: shape.springX + halfSpan * 0.42, y: shape.apexY + height * 0.16 };
  const p3 = { x: ARCH_CENTRE, y: shape.apexY };
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return {
    x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
    y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
  };
}

const mirror = ({ x, y }: Point): Point => ({ x: ARCH_WIDTH - x, y });

/** A smooth pointed arch from the left springing over the apex to the right springing. */
export function pointedArchPath(shape: ArchShape): string {
  const height = shape.springY - shape.apexY;
  const halfSpan = ARCH_CENTRE - shape.springX;
  const left = [
    { x: shape.springX, y: shape.springY - height * 0.55 },
    { x: shape.springX + halfSpan * 0.42, y: shape.apexY + height * 0.16 },
    { x: ARCH_CENTRE, y: shape.apexY },
  ];
  const right = [
    mirror(left[1] as Point),
    mirror(left[0] as Point),
    { x: ARCH_WIDTH - shape.springX, y: shape.springY },
  ];
  return [
    `M${pt({ x: shape.springX, y: shape.springY })}`,
    `C${left.map(pt).join(' ')}`,
    `C${right.map(pt).join(' ')}`,
  ].join('');
}

/** Points that divide one half of the arch into `lobes` scallops of similar length. */
export function scallopPoints(shape: ArchShape, lobes: number): Point[] {
  if (!Number.isInteger(lobes) || lobes < 1)
    throw new RangeError('lobes must be a positive integer');
  // Sample finely, then pick points at equal arc length so every scallop has the same size.
  const samples = Array.from({ length: 401 }, (_, index) => pointOnArch(shape, index / 400));
  const lengths = samples.reduce<number[]>((total, point, index) => {
    const previous = samples[index - 1];
    const last = total[total.length - 1] ?? 0;
    return [...total, previous ? last + Math.hypot(point.x - previous.x, point.y - previous.y) : 0];
  }, []);
  const full = lengths[lengths.length - 1] ?? 0;
  return Array.from({ length: lobes + 1 }, (_, lobe) => {
    const target = (full * lobe) / lobes;
    const index = lengths.findIndex((length) => length >= target);
    return samples[index === -1 ? samples.length - 1 : index] as Point;
  });
}

/**
 * The scalloped edge of the opening, left springing → apex → right springing. Each scallop
 * is a circular bite into the stone, so small cusps point into the opening between them.
 */
export function scallopedArchPath(shape: ArchShape, lobes: number, depth = 0.62): string {
  const left = scallopPoints(shape, lobes);
  const right = [...left].reverse().map(mirror);
  const points = [...left, ...right.slice(1)];
  const [first, ...rest] = points;
  if (!first) return '';
  const arcs = rest.map((point, index) => {
    const previous = points[index] as Point;
    const chord = Math.hypot(point.x - previous.x, point.y - previous.y);
    const radius = round(chord * depth);
    // Sweep 1 bulges each scallop outward, into the stone.
    return `A${radius} ${radius} 0 0 1 ${pt(point)}`;
  });
  return `M${pt(first)}${arcs.join('')}`;
}

/** The same arch, moved outward by `offset` units (for moulding lines around the opening). */
export function widenArch(shape: ArchShape, offset: number): ArchShape {
  return {
    springX: shape.springX - offset,
    springY: shape.springY,
    apexY: shape.apexY - offset * 1.15,
  };
}

/** Kangura (leaf-shaped crenellations) along the top edge of the frame. */
export function crenellationPath(top: number, height: number, count: number): string {
  const step = ARCH_WIDTH / count;
  const leaves = Array.from({ length: count }, (_, index) => {
    const left = index * step + step * 0.14;
    const right = (index + 1) * step - step * 0.14;
    const middle = (left + right) / 2;
    const base = top + height;
    return (
      `M${pt({ x: left, y: base })}` +
      `C${pt({ x: left, y: top + height * 0.45 })} ${pt({ x: middle - step * 0.12, y: top + height * 0.3 })} ${pt({ x: middle, y: top })}` +
      `C${pt({ x: middle + step * 0.12, y: top + height * 0.3 })} ${pt({ x: right, y: top + height * 0.45 })} ${pt({ x: right, y: base })}Z`
    );
  });
  return leaves.join('');
}
