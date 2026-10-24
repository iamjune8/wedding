import { revealDelay } from '@/lib/style';
import { StarMotif } from '../ornaments/StarMotif';
import { RsvpForm } from './RsvpForm';

interface RsvpSectionProps {
  readonly presence: { readonly heading: string; readonly text: string };
  readonly copy: { readonly kicker: string; readonly heading: string; readonly intro: string };
}

/** "Your presence is our blessing", then the reply card, before the closing dua. */
export function RsvpSection({ presence, copy }: RsvpSectionProps) {
  return (
    <section id="rsvp" className="section rsvp-section" aria-labelledby="rsvp-title">
      <div className="rsvp-presence" data-reveal>
        <p className="rsvp-presence__heading">{presence.heading}</p>
        <p className="rsvp-presence__text">{presence.text}</p>
      </div>
      <div className="rsvp-card" data-reveal>
        <span className="rsvp-card__corner rsvp-card__corner--tl" aria-hidden="true">
          <StarMotif />
        </span>
        <span className="rsvp-card__corner rsvp-card__corner--tr" aria-hidden="true">
          <StarMotif />
        </span>
        <span className="rsvp-card__corner rsvp-card__corner--bl" aria-hidden="true">
          <StarMotif />
        </span>
        <span className="rsvp-card__corner rsvp-card__corner--br" aria-hidden="true">
          <StarMotif />
        </span>
        <p className="rsvp-card__kicker">{copy.kicker}</p>
        <h2 id="rsvp-title" className="rsvp-card__title">
          {copy.heading}
        </h2>
        <p className="rsvp-card__intro" data-reveal style={revealDelay(120)}>
          {copy.intro}
        </p>
        <RsvpForm />
      </div>
    </section>
  );
}
