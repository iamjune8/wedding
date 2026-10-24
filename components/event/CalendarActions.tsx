import { CalendarPlus, ChevronDown, Download, ExternalLink } from 'lucide-react';
import type { EventView } from '@/lib/events';

interface CalendarActionsProps {
  readonly event: EventView;
  readonly note: string;
}

const ICON = { strokeWidth: 1.5, 'aria-hidden': true } as const;

/**
 * "Add to Calendar" as a native disclosure: works without JavaScript and with the keyboard.
 *
 * The .ics link deliberately has no `download` attribute. iPhone Safari then opens the event in
 * an "Add to Calendar" sheet, while desktop and Android browsers save the file.
 */
export function CalendarActions({ event, note }: CalendarActionsProps) {
  return (
    <details className="disclosure">
      <summary className="btn btn-secondary disclosure__summary">
        <CalendarPlus {...ICON} />
        <span>
          Add to Calendar<span className="sr-only"> for the {event.shortTitle}</span>
        </span>
        <ChevronDown {...ICON} className="disclosure__chevron" />
      </summary>
      <div className="disclosure__panel">
        <a className="option-link" href={event.calendar.path} type="text/calendar">
          <span className="option-link__text">
            <span className="option-link__title">Apple Calendar or other apps</span>
            <span className="option-link__hint">Downloads an .ics file</span>
          </span>
          <Download {...ICON} />
        </a>
        <a
          className="option-link"
          href={event.calendar.googleUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="option-link__text">
            <span className="option-link__title">Google Calendar</span>
            <span className="option-link__hint">
              Opens Google Calendar<span className="sr-only"> in a new tab</span>
            </span>
          </span>
          <ExternalLink {...ICON} />
        </a>
        <p className="disclosure__note">{note}</p>
      </div>
    </details>
  );
}
