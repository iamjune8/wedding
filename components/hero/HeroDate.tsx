import type { CSSProperties } from 'react';
import type { DateParts } from '@/lib/format';

interface HeroDateProps {
  readonly dateLabel: string;
  readonly dateParts: DateParts;
  readonly startIsoWithOffset: string;
  readonly className?: string;
  readonly style?: CSSProperties;
}

/**
 * The printed-invitation date line: FRIDAY | 30 | APRIL, with the year beneath.
 * Screen readers hear the plain date ("Friday, 30 April 2027") instead of the pieces.
 */
export function HeroDate({
  dateLabel,
  dateParts,
  startIsoWithOffset,
  className,
  style,
}: HeroDateProps) {
  return (
    <p className={['hero-date', className].filter(Boolean).join(' ')} style={style}>
      <time dateTime={startIsoWithOffset}>
        <span className="sr-only">{dateLabel}</span>
        <span className="date-trio" aria-hidden="true">
          <span className="date-trio__side date-trio__side--start">{dateParts.weekday}</span>
          <span className="date-trio__day">{dateParts.day}</span>
          <span className="date-trio__side date-trio__side--end">{dateParts.month}</span>
          <span className="date-trio__year">{dateParts.year}</span>
        </span>
      </time>
    </p>
  );
}
