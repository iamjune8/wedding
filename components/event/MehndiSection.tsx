import type { EventView } from '@/lib/events';
import { revealDelay } from '@/lib/style';
import { Countdown } from '../countdown/Countdown';
import { CountdownNoscript } from '../countdown/CountdownNoscript';
import { Petals } from '../ornaments/Petals';
import { Rosette } from '../ornaments/Rosette';
import { EventActions } from './EventActions';
import { VenueBlock } from './VenueBlock';

interface MehndiSectionProps {
  readonly event: EventView;
  readonly calendarNote: string;
  readonly pendingMessage: string;
}

/**
 * Section E: the Mehndi (henna evening), a henna-green chapter before the RSVP. It is hosted at
 * home, so the venue reads "At our residence"; directions appear only if an address is added.
 */
export function MehndiSection({ event, calendarNote, pendingMessage }: MehndiSectionProps) {
  return (
    <section
      id={event.id}
      className="section mehndi-section"
      aria-labelledby={`${event.id}-title`}
      data-play-in-view
    >
      <Petals count={14} seed={5} />
      <div className="mehndi-layout">
        <div className="mehndi-layout__ornament" data-reveal="ornament">
          <Rosette />
        </div>
        <header className="mehndi-layout__intro" data-reveal style={revealDelay(100)}>
          <h2 id={`${event.id}-title`} className="section-title">
            {event.title}
          </h2>
          {event.subtitle ? <p className="event-subtitle">{event.subtitle}</p> : null}
          <p className="event-date">
            <time dateTime={event.startIsoWithOffset}>{event.dateLabel}</time>
          </p>
          <p className="event-time">{event.timeLabel}</p>
        </header>
        <div className="mehndi-layout__venue" data-reveal style={revealDelay(180)}>
          <VenueBlock
            venue={event.venue}
            hostedAt={event.hostedAt}
            pendingMessage={pendingMessage}
          />
        </div>
        <div className="mehndi-layout__countdown" data-reveal style={revealDelay(120)}>
          <h3 className="mehndi-layout__countdown-title">{event.countdown.heading}</h3>
          <Countdown
            tone="mehndi"
            targetMs={event.startsAtMs}
            dayEndMs={event.dayEndsAtMs}
            label={`Time remaining until the ${event.shortTitle}`}
            reachedMessage={event.countdown.reachedMessage}
            pastMessage={event.countdown.pastMessage}
          />
          <CountdownNoscript
            eventName={event.shortTitle}
            dateLabel={event.dateLabel}
            timeLabel={event.timeLabel}
          />
        </div>
        <div className="mehndi-layout__actions" data-reveal style={revealDelay(160)}>
          <EventActions event={event} calendarNote={calendarNote} />
        </div>
      </div>
    </section>
  );
}
