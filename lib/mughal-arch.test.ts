import { describe, expect, it } from 'vitest';
import {
  ARCH_CENTRE,
  OPENING,
  crenellationPath,
  pointOnArch,
  pointedArchPath,
  scallopPoints,
  scallopedArchPath,
  widenArch,
} from './mughal-arch';

describe('pointOnArch', () => {
  it('starts at the springing and ends at the apex', () => {
    expect(pointOnArch(OPENING, 0)).toEqual({ x: OPENING.springX, y: OPENING.springY });
    expect(pointOnArch(OPENING, 1)).toEqual({ x: ARCH_CENTRE, y: OPENING.apexY });
  });

  it('only ever rises towards the apex', () => {
    const heights = Array.from({ length: 21 }, (_, index) => pointOnArch(OPENING, index / 20).y);
    heights.slice(1).forEach((y, index) => expect(y).toBeLessThanOrEqual(heights[index] ?? 0));
  });
});

describe('scallopPoints', () => {
  it('divides the half arch into equal-length scallops', () => {
    const points = scallopPoints(OPENING, 6);
    expect(points).toHaveLength(7);
    const lengths = points
      .slice(1)
      .map((point, index) =>
        Math.hypot(point.x - (points[index]?.x ?? 0), point.y - (points[index]?.y ?? 0)),
      );
    const shortest = Math.min(...lengths);
    const longest = Math.max(...lengths);
    expect(longest / shortest).toBeLessThan(1.1);
  });

  it('rejects impossible scallop counts', () => {
    expect(() => scallopPoints(OPENING, 0)).toThrow(RangeError);
    expect(() => scallopPoints(OPENING, 2.5)).toThrow(RangeError);
  });
});

describe('scallopedArchPath', () => {
  it('draws one arc per scallop, symmetric about the centre', () => {
    const path = scallopedArchPath(OPENING, 6);
    expect(path.startsWith(`M${OPENING.springX} ${OPENING.springY}`)).toBe(true);
    expect(path.match(/A/g)).toHaveLength(12);
    expect(path.endsWith(`${400 - OPENING.springX} ${OPENING.springY}`)).toBe(true);
  });
});

describe('widenArch and pointedArchPath', () => {
  it('moves the moulding outward and upward', () => {
    const wider = widenArch(OPENING, 10);
    expect(wider.springX).toBe(OPENING.springX - 10);
    expect(wider.apexY).toBeLessThan(OPENING.apexY);
    expect(pointedArchPath(wider)).toMatch(/^M46 270C/);
  });
});

describe('crenellationPath', () => {
  it('draws the requested number of closed leaves', () => {
    expect(crenellationPath(-40, 16, 12).match(/Z/g)).toHaveLength(12);
  });
});
