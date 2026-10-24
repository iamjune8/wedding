import { describe, expect, it } from 'vitest';
import {
  centrepieceLayout,
  cornerLayout,
  foregroundLayout,
  inDrawOrder,
  seededRandom,
  type FloralItem,
} from './flora';

describe('seededRandom', () => {
  it('repeats the same sequence for the same seed', () => {
    const a = seededRandom(7);
    const b = seededRandom(7);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('stays within [0, 1)', () => {
    const random = seededRandom(3);
    for (let index = 0; index < 500; index += 1) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('floral layouts', () => {
  it('are identical on every render (no hydration mismatch)', () => {
    expect(foregroundLayout(4)).toEqual(foregroundLayout(4));
    expect(centrepieceLayout(2)).toEqual(centrepieceLayout(2));
    expect(cornerLayout(9)).toEqual(cornerLayout(9));
  });

  it('keep every flower roughly inside its canvas', () => {
    for (const layout of [foregroundLayout(4), centrepieceLayout(2), cornerLayout(9)]) {
      for (const item of layout.items) {
        expect(item.x).toBeGreaterThanOrEqual(-20);
        expect(item.x).toBeLessThanOrEqual(layout.width + 20);
        expect(item.y).toBeGreaterThanOrEqual(0);
        expect(item.y).toBeLessThanOrEqual(layout.height + 10);
      }
    }
  });

  it('mixes roses of several tones with leaves and blossoms', () => {
    const { items } = foregroundLayout(4);
    const tones = new Set(items.flatMap((item) => (item.kind === 'rose' ? [item.tone] : [])));
    expect(tones.size).toBeGreaterThanOrEqual(3);
    expect(items.some((item) => item.kind === 'leaf')).toBe(true);
    expect(items.some((item) => item.kind === 'blossom')).toBe(true);
  });
});

describe('inDrawOrder', () => {
  it('draws leaves behind roses and roses from back (top) to front (bottom)', () => {
    const items: FloralItem[] = [
      { kind: 'rose', tone: 'pink', x: 0, y: 50, size: 10, rotate: 0 },
      { kind: 'blossom', x: 0, y: 0, size: 5, rotate: 0 },
      { kind: 'rose', tone: 'ivory', x: 0, y: 10, size: 10, rotate: 0 },
      { kind: 'leaf', x: 0, y: 99, size: 10, rotate: 0 },
    ];
    expect(inDrawOrder(items).map((item) => `${item.kind}${item.y}`)).toEqual([
      'leaf99',
      'rose10',
      'rose50',
      'blossom0',
    ]);
  });
});
