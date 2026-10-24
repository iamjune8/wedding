import { revealDelay } from '@/lib/style';
import { StarMotif } from '../ornaments/StarMotif';
import { RsvpForm } from './RsvpForm';

/** The reply card, between the Haldi (the last event) and the closing dua. */
export function RsvpSection() {
  return (
    <section id="rsvp" className="section rsvp-section" aria-labelledby="rsvp-title">
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
        <p className="rsvp-card__kicker">Kindly reply</p>
        <h2 id="rsvp-title" className="rsvp-card__title">
          RSVP
        </h2>
        <p className="rsvp-card__intro" data-reveal style={revealDelay(120)}>
          We would be honoured to know if you can join us.
        </p>
        <RsvpForm />
      </div>
    </section>
  );
}
