import type { EventView } from '@/lib/events';
import { revealDelay } from '@/lib/style';
import { Countdown } from '../countdown/Countdown';
import { CountdownNoscript } from '../countdown/CountdownNoscript';
import { Petals } from '../ornaments/Petals';
import { Rosette } from '../ornaments/Rosette';
import { EventActions } from './EventActions';
import { VenueBlock } from './VenueBlock';

interface HaldiSectionProps {
  readonly event: EventView;
  readonly calendarNote: string;
  readonly pendingMessage: string;
}

/**
 * Section E: the Haldi, a warmer closing chapter. Directions appear automatically once a venue
 * is added to lib/wedding-config.ts; until then the venue is clearly marked as to be announced.
 */
export function HaldiSection({ event, calendarNote, pendingMessage }: HaldiSectionProps) {
  return (
    <section
      id={event.id}
      className="section haldi-section"
      aria-labelledby={`${event.id}-title`}
      data-play-in-view
    >
      <Petals count={14} seed={5} />
      <div className="haldi-layout">
        <div className="haldi-layout__ornament" data-reveal="ornament">
          <Rosette />
        </div>
        <header className="haldi-layout__intro" data-reveal style={revealDelay(100)}>
          <h2 id={`${event.id}-title`} className="section-title">
            {event.title}
          </h2>
          <p className="event-date">
            <time dateTime={event.startIsoWithOffset}>{event.dateLabel}</time>
          </p>
          <p className="event-time">{event.timeLabel}</p>
        </header>
        <div className="haldi-layout__venue" data-reveal style={revealDelay(180)}>
          <VenueBlock venue={event.venue} pendingMessage={pendingMessage} />
        </div>
        <div className="haldi-layout__countdown" data-reveal style={revealDelay(120)}>
          <h3 className="haldi-layout__countdown-title">{event.countdown.heading}</h3>
          <Countdown
            tone="haldi"
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
        <div className="haldi-layout__actions" data-reveal style={revealDelay(160)}>
          <EventActions event={event} calendarNote={calendarNote} />
        </div>
      </div>
    </section>
  );
}
