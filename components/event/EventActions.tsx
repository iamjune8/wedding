import { Navigation } from 'lucide-react';
import type { ReactNode } from 'react';
import type { EventView } from '@/lib/events';
import { CalendarActions } from './CalendarActions';

interface EventActionsProps {
  readonly event: EventView;
  readonly calendarNote: string;
  readonly share?: ReactNode;
}

/** Directions appear only once a venue is confirmed; calendar actions are always available. */
export function EventActions({ event, calendarNote, share }: EventActionsProps) {
  return (
    <div className="action-stack">
      {event.directionsUrl && event.venue ? (
        <a
          className="btn btn-primary"
          href={event.directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Navigation strokeWidth={1.5} aria-hidden="true" />
          <span>
            Get Directions
            <span className="sr-only"> to {event.venue.name} (opens Google Maps)</span>
          </span>
        </a>
      ) : null}
      <CalendarActions event={event} note={calendarNote} />
      {share}
    </div>
  );
}
