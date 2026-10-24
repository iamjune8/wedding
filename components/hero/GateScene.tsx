import Image from 'next/image';
import { ARTWORK } from '@/lib/artwork';
import { moundLayout } from '@/lib/flora';
import { introDelay } from '@/lib/style';
import { FloralCluster } from '../flora/FloralCluster';

const MOUND_START = moundLayout(4);
const MOUND_END = moundLayout(17);

/**
 * The Nikah setting: the evening sun sets within the floral gate (from the first moment of the
 * opening); in scene 3 the gate is revealed, the couple appears seated within it on a
 * pool of warm light, and mounds of roses settle at the foot of each pillar.
 */
export function GateScene() {
  const { nikahGate, coupleSeated } = ARTWORK;
  return (
    <figure className="gate-scene">
      <span className="gate-scene__sunset intro-fade" style={introDelay(300)} aria-hidden="true" />
      <span className="gate-scene__sun intro-rise" style={introDelay(600)} aria-hidden="true" />
      <span className="gate-scene__light intro-fade" style={introDelay(2900)} aria-hidden="true" />
      <Image
        src={nikahGate.src}
        width={nikahGate.width}
        height={nikahGate.height}
        alt={nikahGate.alt}
        sizes="(min-width: 1024px) 38rem, 92vw"
        priority
        className="gate-scene__gate intro-bloom"
        style={introDelay(2800)}
      />
      <Image
        src={coupleSeated.src}
        width={coupleSeated.width}
        height={coupleSeated.height}
        alt={coupleSeated.alt}
        sizes="(min-width: 1024px) 21rem, 52vw"
        priority
        className="gate-scene__couple intro-rise"
        style={introDelay(3400)}
      />
      <FloralCluster
        layout={MOUND_START}
        className="gate-scene__flowers gate-scene__flowers--start intro-rise"
        style={introDelay(3800)}
      />
      <FloralCluster
        layout={MOUND_END}
        className="gate-scene__flowers gate-scene__flowers--end intro-rise"
        style={introDelay(3950)}
      />
    </figure>
  );
}
