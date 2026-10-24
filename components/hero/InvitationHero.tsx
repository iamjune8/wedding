import type { DateParts } from '@/lib/format';
import { introDelay } from '@/lib/style';
import { ArchFrame } from '../ornaments/ArchFrame';
import { JasmineStrands } from '../ornaments/JasmineStrands';
import { Lantern } from '../ornaments/Lantern';
import { Monogram } from '../ornaments/Monogram';
import { OrnamentDivider } from '../ornaments/OrnamentDivider';
import { Petals } from '../ornaments/Petals';
import { Sparkles, type SparkleSpot } from '../ornaments/Sparkles';
import { HeroDate } from './HeroDate';
import { HeroNames } from './HeroNames';

/** Glints around the crown of the arch and beside the names. */
const HERO_SPARKLES: readonly SparkleSpot[] = [
  { x: 22, y: 4, size: 1.1, delay: 0.4, duration: 4.6 },
  { x: 79, y: 5, size: 1.35, delay: 2.1, duration: 5.4 },
  { x: 6, y: 18, size: 0.8, delay: 3.3, duration: 4.2 },
  { x: 95, y: 16, size: 0.95, delay: 1.2, duration: 5 },
  { x: 41, y: 1, size: 0.7, delay: 2.9, duration: 4.4 },
  { x: 60, y: 2, size: 0.8, delay: 0.1, duration: 5.6 },
  { x: 14, y: 46, size: 0.75, delay: 2.8, duration: 4.8 },
  { x: 87, y: 52, size: 0.9, delay: 0.9, duration: 5.8 },
];

interface InvitationHeroProps {
  readonly copy: {
    readonly bismillahArabic: string;
    readonly bismillah: string;
    readonly families: string;
    readonly inviteLine: string;
    readonly scrollCue: string;
  };
  readonly brideName: string;
  readonly groomName: string;
  /** Initials for the monogram seal, e.g. ['N', 'J']. */
  readonly initials: readonly [string, string];
  readonly nikah: {
    readonly dateLabel: string;
    readonly dateParts: DateParts;
    readonly venueName: string | null;
    readonly timeLabel: string;
    readonly timingNote: string | null;
    readonly startIsoWithOffset: string;
  };
}

/**
 * Section A. Everything is server-rendered and readable without JavaScript; the opening
 * sequence is pure CSS (see styles/motion.css) and can be skipped at any moment.
 */
export function InvitationHero({
  copy,
  brideName,
  groomName,
  initials,
  nikah,
}: InvitationHeroProps) {
  const timeLine = nikah.timingNote ? `${nikah.timingNote} · ${nikah.timeLabel}` : nikah.timeLabel;

  return (
    <section className="hero" aria-labelledby="couple-names" data-intro-root data-play-in-view>
      <div className="hero__pattern intro-fade" style={introDelay(0)} aria-hidden="true" />
      <div className="hero__glow" aria-hidden="true" />
      <div className="hero__hangings intro-fade" style={introDelay(150)}>
        <JasmineStrands side="start" />
        <JasmineStrands side="end" />
        <Lantern side="start" drop={2.2} delay={0} />
        <Lantern side="end" drop={3.6} delay={1.7} />
      </div>
      <ArchFrame
        variant="hero"
        className="intro-arch"
        decoration={
          <>
            <Sparkles spots={HERO_SPARKLES} className="hero__sparkles" />
            <Monogram
              first={initials[0]}
              second={initials[1]}
              className="hero__monogram intro-fade"
              style={introDelay(200)}
            />
          </>
        }
      >
        <p
          className="basmala intro-step"
          style={introDelay(350)}
          lang="ar"
          dir="rtl"
          aria-hidden="true"
        >
          {copy.bismillahArabic}
        </p>
        <p className="basmala-translit intro-step" style={introDelay(600)}>
          {copy.bismillah}
        </p>
        <p className="families intro-step" style={introDelay(950)}>
          {copy.families}
        </p>
        <HeroNames brideName={brideName} groomName={groomName} />
        <p className="invite-line intro-step" style={introDelay(2400)}>
          {copy.inviteLine}
        </p>
        <OrnamentDivider className="hero__divider intro-divider" style={introDelay(2650)} />
        <HeroDate
          className="intro-step"
          style={introDelay(2850)}
          dateLabel={nikah.dateLabel}
          dateParts={nikah.dateParts}
          startIsoWithOffset={nikah.startIsoWithOffset}
        />
        <p className="hero-time intro-step" style={introDelay(3050)}>
          {timeLine}
        </p>
        {nikah.venueName ? (
          <p className="hero-venue intro-step" style={introDelay(3200)}>
            {nikah.venueName}
          </p>
        ) : null}
        <a href="#invitation" className="scroll-cue intro-step" style={introDelay(3450)}>
          <span>{copy.scrollCue}</span>
          <span className="scroll-cue__line" aria-hidden="true">
            <span className="scroll-cue__dot" />
          </span>
        </a>
      </ArchFrame>
      <Petals count={16} seed={3} className="hero__petals" />
    </section>
  );
}
