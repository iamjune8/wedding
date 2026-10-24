import Image from 'next/image';
import { ARTWORK } from '@/lib/artwork';
import { cornerLayout } from '@/lib/flora';
import type { DateParts } from '@/lib/format';
import { introDelay } from '@/lib/style';
import { FloralCluster } from '../flora/FloralCluster';
import { Crescent, FairyLights } from '../ornaments/Celestial';
import { JasmineStrands } from '../ornaments/JasmineStrands';
import { Lantern } from '../ornaments/Lantern';
import { OrnamentDivider } from '../ornaments/OrnamentDivider';
import { Sparkles, type SparkleSpot } from '../ornaments/Sparkles';
import { GateScene } from './GateScene';
import { HeroDate } from './HeroDate';
import { HeroNames } from './HeroNames';

/** A restrained scatter of stars glinting in the night sky. */
const SKY_SPARKLES: readonly SparkleSpot[] = [
  { x: 9, y: 9, size: 0.7, delay: 0.6, duration: 5.2 },
  { x: 88, y: 7, size: 0.9, delay: 2.2, duration: 6 },
  { x: 22, y: 30, size: 0.5, delay: 3.4, duration: 4.6 },
  { x: 77, y: 26, size: 0.6, delay: 1.3, duration: 5.4 },
  { x: 95, y: 44, size: 0.55, delay: 4.1, duration: 5 },
  { x: 4, y: 52, size: 0.6, delay: 2.9, duration: 5.8 },
];

const CORNER = cornerLayout(9);

interface InvitationHeroProps {
  readonly copy: {
    readonly bismillah: string;
    readonly families: string;
    readonly inviteLine: string;
    readonly scrollCue: string;
  };
  readonly brideName: string;
  readonly groomName: string;
  readonly nikah: {
    readonly shortTitle: string;
    readonly dateLabel: string;
    readonly dateParts: DateParts;
    readonly timeLabel: string;
    readonly timingNote: string | null;
    readonly startIsoWithOffset: string;
    readonly venueName: string | null;
  };
}

/**
 * Section A, the cinematic opening, built around the Nikah setting: the floral gate with the
 * bride and groom seated within it. Scenes (timings in styles/palace.css):
 * 1. the night sky, lanterns and fairy lights;
 * 2. the Bismillah in gold, "Nikah" written in script beneath the crescent;
 * 3. the floral gate is revealed and the couple appears within it;
 * 4. their names, the date, prayer timing and venue;
 * 5. an invitation to continue into the celebration.
 * Everything is server-rendered and readable without JavaScript or motion.
 */
export function InvitationHero({ copy, brideName, groomName, nikah }: InvitationHeroProps) {
  const timeLine = nikah.timingNote ? `${nikah.timingNote} · ${nikah.timeLabel}` : nikah.timeLabel;

  return (
    <section className="hero" aria-labelledby="couple-names" data-intro-root data-play-in-view>
      <div className="hero__sky intro-fade" style={introDelay(0)} aria-hidden="true">
        <Sparkles spots={SKY_SPARKLES} className="hero__stars" />
      </div>
      <div className="hero__glow intro-fade" style={introDelay(400)} aria-hidden="true" />
      <FairyLights
        className="hero__fairy-lights hero__fairy-lights--narrow intro-fade"
        style={introDelay(900)}
      />
      <FairyLights
        panels={3}
        className="hero__fairy-lights hero__fairy-lights--wide intro-fade"
        style={introDelay(900)}
      />
      <div className="hero__hangings" aria-hidden="true">
        <div className="intro-fade" style={introDelay(800)}>
          <JasmineStrands side="start" />
          <JasmineStrands side="end" />
        </div>
        <div className="intro-drop" style={introDelay(500)}>
          <Lantern side="start" drop={2.2} delay={0} />
        </div>
        <div className="intro-drop" style={introDelay(750)}>
          <Lantern side="end" drop={3.6} delay={1.7} />
        </div>
      </div>
      <FloralCluster
        layout={CORNER}
        className="hero__corner hero__corner--start intro-rise"
        style={introDelay(4000)}
      />
      <FloralCluster
        layout={CORNER}
        className="hero__corner hero__corner--end intro-rise"
        style={introDelay(4100)}
      />

      <div className="hero__stage">
        <header className="hero__heading">
          <Crescent className="hero__crescent intro-fade" style={introDelay(1200)} />
          <Image
            src={ARTWORK.bismillah.src}
            width={ARTWORK.bismillah.width}
            height={ARTWORK.bismillah.height}
            alt={ARTWORK.bismillah.alt}
            priority
            sizes="(min-width: 1024px) 18rem, 62vw"
            className="basmala-art intro-step"
            style={introDelay(1100)}
          />
          <p className="basmala-translit intro-step" style={introDelay(1400)}>
            {copy.bismillah}
          </p>
          <p className="nikah-script intro-write" style={introDelay(1700)}>
            {nikah.shortTitle}
          </p>
        </header>

        <GateScene />

        <div className="hero__details">
          <p className="families intro-step" style={introDelay(4600)}>
            {copy.families}
          </p>
          <HeroNames brideName={brideName} groomName={groomName} />
          <p className="invite-line intro-step" style={introDelay(5450)}>
            {copy.inviteLine}
          </p>
          <OrnamentDivider className="hero__divider intro-divider" style={introDelay(5650)} />
          <HeroDate
            className="intro-step"
            style={introDelay(5800)}
            dateLabel={nikah.dateLabel}
            dateParts={nikah.dateParts}
            startIsoWithOffset={nikah.startIsoWithOffset}
          />
          <p className="hero-time intro-step" style={introDelay(6000)}>
            {timeLine}
          </p>
          {nikah.venueName ? (
            <p className="hero-venue intro-step" style={introDelay(6150)}>
              {nikah.venueName}
            </p>
          ) : null}
        </div>
      </div>

      <a href="#invitation" className="scroll-cue intro-step" style={introDelay(6800)}>
        <span>{copy.scrollCue}</span>
        <span className="scroll-cue__line" aria-hidden="true">
          <span className="scroll-cue__dot" />
        </span>
      </a>
    </section>
  );
}
