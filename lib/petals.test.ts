import { describe, expect, it } from 'vitest';
import { createPetals, PETAL_TONES } from './petals';

describe('createPetals', () => {
  it('is deterministic, so server and browser render identical petals', () => {
    expect(createPetals(12, 7)).toEqual(createPetals(12, 7));
    expect(createPetals(12, 7)).not.toEqual(createPetals(12, 8));
  });

  it('spreads petals across the width and keeps values in range', () => {
    const petals = createPetals(10, 3);
    expect(petals).toHaveLength(10);
    petals.forEach((petal, index) => {
      expect(petal.left).toBeGreaterThanOrEqual(index * 10);
      expect(petal.left).toBeLessThanOrEqual((index + 1) * 10);
      expect(petal.size).toBeGreaterThanOrEqual(0.9);
      expect(petal.size).toBeLessThanOrEqual(1.7);
      expect(petal.duration).toBeGreaterThanOrEqual(11);
      expect(Math.abs(petal.sway)).toBeLessThanOrEqual(60);
    });
  });

  it('uses every flower tone', () => {
    const tones = new Set(createPetals(10, 1).map((petal) => petal.tone));
    expect([...tones].sort()).toEqual([...PETAL_TONES].sort());
  });
});
