import { cssVars } from '@/lib/style';

/** Position (% across the space beside the arch) and length (% of its height) of each string. */
const STRANDS: readonly { readonly x: number; readonly length: number }[] = [
  { x: 14, length: 52 },
  { x: 36, length: 34 },
  { x: 60, length: 64 },
  { x: 84, length: 26 },
];

interface JasmineStrandsProps {
  readonly side: 'start' | 'end';
}

/**
 * Strings of jasmine (mogra) buds ending in a rose, as hung over a wedding stage. Shown only
 * where there is room beside the arch; pure CSS beads, no images.
 */
export function JasmineStrands({ side }: JasmineStrandsProps) {
  return (
    <div className={`jasmine jasmine--${side}`} aria-hidden="true">
      {STRANDS.map((strand) => (
        <span
          key={strand.x}
          className="jasmine__strand"
          style={cssVars({ '--x': `${strand.x}%`, '--length': `${strand.length}%` })}
        />
      ))}
    </div>
  );
}
