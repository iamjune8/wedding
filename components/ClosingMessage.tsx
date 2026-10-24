import Image from 'next/image';
import { ARTWORK } from '@/lib/artwork';
import { moundLayout } from '@/lib/flora';
import { revealDelay } from '@/lib/style';
import { FloralCluster } from './flora/FloralCluster';
import { MughalArch } from './ornaments/MughalArch';
import { Petals } from './ornaments/Petals';
import { Sparkles, type SparkleSpot } from './ornaments/Sparkles';
import { StarMotif } from './ornaments/StarMotif';

const CLOSING_FLOWERS_START = moundLayout(21);
const CLOSING_FLOWERS_END = moundLayout(33);

const CLOSING_SPARKLES: readonly SparkleSpot[] = [
  { x: 14, y: 8, size: 0.55, delay: 0.8, duration: 4.4 },
  { x: 86, y: 12, size: 0.7, delay: 2.4, duration: 5.2 },
  { x: 50, y: -6, size: 0.6, delay: 1.6, duration: 4.8 },
];

interface ClosingMessageProps {
  readonly lines: readonly string[];
  readonly brideName: string;
  readonly groomName: string;
}

/** Section F: the closing dua and an understated return of the couple's names. */
export function ClosingMessage({ lines, brideName, groomName }: ClosingMessageProps) {
  const [dua, ...requests] = lines;

  return (
    <footer className="closing" data-play-in-view>
      <Petals count={10} seed={9} />
      <div className="closing__inner">
        <div data-reveal="ornament">
          <StarMotif className="closing__star" />
        </div>
        {dua ? (
          <p className="closing__dua" data-reveal style={revealDelay(80)}>
            {dua}
          </p>
        ) : null}
        {requests.map((line) => (
          <p key={line} className="closing__request" data-reveal style={revealDelay(180)}>
            {line}
          </p>
        ))}
        <div className="closing__couple" data-reveal style={revealDelay(60)}>
          <Image
            src={ARTWORK.coupleStanding.src}
            width={ARTWORK.coupleStanding.width}
            height={ARTWORK.coupleStanding.height}
            alt={ARTWORK.coupleStanding.alt}
            sizes="(min-width: 768px) 15rem, 52vw"
            className="closing__couple-art"
          />
          <FloralCluster
            layout={CLOSING_FLOWERS_START}
            className="closing__flowers closing__flowers--start"
          />
          <FloralCluster
            layout={CLOSING_FLOWERS_END}
            className="closing__flowers closing__flowers--end"
          />
        </div>
        <div className="closing__names-wrap" data-reveal="arch" style={revealDelay(120)}>
          <MughalArch
            id="closing-arch"
            variant="mini"
            decoration={<Sparkles spots={CLOSING_SPARKLES} />}
          >
            <p className="closing__names">
              <span>{brideName}</span>{' '}
              <span className="closing__amp" aria-hidden="true">
                &amp;
              </span>
              <span className="sr-only">and</span> <span>{groomName}</span>
            </p>
          </MughalArch>
        </div>
      </div>
    </footer>
  );
}
