import { introDelay } from '@/lib/style';

interface HeroNamesProps {
  readonly brideName: string;
  readonly groomName: string;
}

/**
 * The couple's names, the focal point of the opening. Screen readers hear
 * "Nida Khatib and Juned Shaikh"; the decorative ampersand is hidden from them.
 */
export function HeroNames({ brideName, groomName }: HeroNamesProps) {
  return (
    <h1 id="couple-names" className="names">
      <span className="names__line intro-mask">
        <span style={introDelay(1300)}>{brideName}</span>
      </span>{' '}
      <span className="names__amp intro-fade" style={introDelay(1750)} aria-hidden="true">
        &amp;
      </span>
      <span className="sr-only">and</span>{' '}
      <span className="names__line intro-mask">
        <span style={introDelay(1950)}>{groomName}</span>
      </span>
    </h1>
  );
}
