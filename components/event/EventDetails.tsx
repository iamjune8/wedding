import type { ReactNode } from 'react';
import type { EventView } from '@/lib/events';
import { revealDelay } from '@/lib/style';
import { MughalArch } from '../ornaments/MughalArch';
import { EventActions } from './EventActions';
import { VenueBlock } from './VenueBlock';

interface EventDetailsProps {
  readonly event: EventView;
  readonly calendarNote: string;
  readonly pendingMessage: string;
  readonly share: ReactNode;
}

/** Section D: the Nikah ceremony, its venue inside an arch window, and the guest actions. */
export function EventDetails({ event, calendarNote, pendingMessage, share }: EventDetailsProps) {
  const timeLine = event.timingNote ? `${event.timeLabel} · ${event.timingNote}` : event.timeLabel;

  return (
    <section id={event.id} className="section venue-section" aria-labelledby={`${event.id}-title`}>
      <div className="venue-layout">
        <header className="venue-layout__intro" data-reveal>
          <p className="event-kicker">{event.title}</p>
          <h2 id={`${event.id}-title`} className="section-title">
            {event.heading}
          </h2>
          <p className="event-intro">{event.intro}</p>
          <p className="event-date">
            <time dateTime={event.startIsoWithOffset}>{event.dateLabel}</time>
          </p>
          <p className="event-time">{timeLine}</p>
        </header>
        <div className="venue-layout__place" data-reveal="arch" style={revealDelay(120)}>
          <MughalArch id={`${event.id}-arch`} variant="window">
            <VenueBlock venue={event.venue} pendingMessage={pendingMessage} />
          </MughalArch>
        </div>
        <div className="venue-layout__actions" data-reveal style={revealDelay(220)}>
          <EventActions event={event} calendarNote={calendarNote} share={share} />
        </div>
      </div>
    </section>
  );
}
