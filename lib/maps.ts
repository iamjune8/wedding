export interface DirectionsVenue {
  readonly name: string;
  readonly address: string;
}

const GOOGLE_MAPS_DIRECTIONS = 'https://www.google.com/maps/dir/?api=1&destination=';

/**
 * Public Google Maps directions link (no API key). The destination is the venue's written
 * address, not coordinates, so Google resolves it; nothing here claims a verified map pin.
 * Returns null while a venue is still to be announced, so no directions are offered.
 */
export function buildDirectionsUrl(venue: DirectionsVenue | null): string | null {
  if (!venue) return null;
  return `${GOOGLE_MAPS_DIRECTIONS}${encodeURIComponent(`${venue.name}, ${venue.address}`)}`;
}
