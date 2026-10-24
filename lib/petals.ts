/** Flower tones for the petal shower. */
export const PETAL_TONES = ['rose', 'blush', 'marigold', 'jasmine', 'lilac'] as const;
export type PetalTone = (typeof PETAL_TONES)[number];

export interface PetalSpec {
  readonly left: number; // % across the section
  readonly size: number; // rem
  readonly delay: number; // s (used negatively, so the shower is already falling on load)
  readonly duration: number; // s to fall the full height
  readonly sway: number; // px of side drift
  readonly spin: number; // degrees of tumble
  readonly tone: PetalTone;
}

/**
 * A small deterministic random sequence (same output on the server and in the browser, so
 * the petals never cause a hydration mismatch).
 */
function sequence(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

const between = (random: () => number, min: number, max: number) =>
  Math.round((min + random() * (max - min)) * 100) / 100;

/** Evenly spread petals with natural variation in size, speed, drift and colour. */
export function createPetals(count: number, seed: number): readonly PetalSpec[] {
  const random = sequence(seed);
  return Array.from({ length: count }, (_, index) => ({
    left: between(random, (index / count) * 100, ((index + 1) / count) * 100),
    size: between(random, 0.9, 1.7),
    delay: between(random, 0, 14),
    duration: between(random, 11, 19),
    sway: between(random, -60, 60),
    spin: between(random, 240, 540),
    tone: PETAL_TONES[index % PETAL_TONES.length] ?? 'rose',
  }));
}
