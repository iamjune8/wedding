import { Fragment } from 'react';
import type { Venue } from '@/lib/wedding-config';

interface VenueBlockProps {
  readonly venue: Venue | null;
  readonly pendingMessage: string;
  /** A place given without an address, e.g. "At our residence". */
  readonly hostedAt?: string | null;
}

/** Shows a confirmed venue, or an honest "to be announced" state. Never invents details. */
export function VenueBlock({ venue, pendingMessage, hostedAt = null }: VenueBlockProps) {
  if (!venue && hostedAt) {
    return (
      <div className="venue venue--home">
        <p className="venue__eyebrow">Venue</p>
        <p className="venue__name">{hostedAt}</p>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="venue venue--pending">
        <dl className="venue__facts">
          <div className="venue__fact">
            <dt>Venue</dt>
            <dd>To be announced</dd>
          </div>
          <div className="venue__fact">
            <dt>Address</dt>
            <dd>To be announced</dd>
          </div>
        </dl>
        <p className="venue__note">{pendingMessage}</p>
      </div>
    );
  }

  const parts = venue.address.split(/,\s*/);

  return (
    <div className="venue">
      <p className="venue__name">{venue.name}</p>
      {/* Lines only break between address parts, never inside "Sector New 50". */}
      <address className="venue__address">
        {parts.map((part, index) => {
          const isLast = index === parts.length - 1;
          return (
            <Fragment key={`${index}-${part}`}>
              <span className="venue__address-part">{isLast ? part : `${part},`}</span>
              {isLast ? null : ' '}
            </Fragment>
          );
        })}
      </address>
    </div>
  );
}
