import { ImageResponse } from 'next/og';
import { buildEventViews } from '@/lib/events';
import { loadOgFonts } from '@/lib/og/fonts';
import { ARCH_CROWN, ARCH_CROWN_INNER, ARCH_FINIAL, OG } from '@/lib/og/palette';
import { weddingConfig } from '@/lib/wedding-config';

const { couple } = weddingConfig;
const { nikah, haldi } = buildEventViews(weddingConfig, null);

export const alt = `${couple.bride.fullName} and ${couple.groom.fullName}: Nikah on ${nikah.dateLabel}, Haldi on ${haldi.dateLabel}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Hairline frame plus the gold arch behind the names. */
function ArchBackdrop() {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: 22,
          left: 22,
          right: 22,
          bottom: 22,
          border: `1px solid ${OG.hairline}`,
          display: 'flex',
        }}
      />
      <svg
        width="900"
        height="540"
        viewBox="0 0 300 180"
        style={{ position: 'absolute', top: 44, left: 150 }}
      >
        <path d={ARCH_CROWN} fill="none" stroke={OG.champagne} strokeWidth="0.45" />
        <path
          d={ARCH_CROWN_INNER}
          fill="none"
          stroke={OG.champagne}
          strokeWidth="0.3"
          opacity="0.6"
        />
        <path d="M150 13V22" stroke={OG.champagne} strokeWidth="0.45" />
        <path d={ARCH_FINIAL} fill={OG.champagne} />
      </svg>
    </>
  );
}

function Names() {
  const name = { fontSize: 128, fontWeight: 300, color: OG.charcoal } as const;
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginTop: 18 }}>
      <span style={name}>{couple.bride.firstName}</span>
      <span style={{ fontSize: 92, fontStyle: 'italic', color: OG.gold, margin: '0 30px' }}>
        &amp;
      </span>
      <span style={name}>{couple.groom.firstName}</span>
    </div>
  );
}

function EventColumn({ label, date, time }: { label: string; date: string; time: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 380 }}>
      <div style={{ fontSize: 26, fontStyle: 'italic', color: OG.goldInk }}>{label}</div>
      <div style={{ fontSize: 31, fontWeight: 500, color: OG.charcoal, marginTop: 6 }}>{date}</div>
      <div style={{ fontSize: 23, fontWeight: 500, color: OG.inkSoft, marginTop: 4 }}>{time}</div>
    </div>
  );
}

function EventRow() {
  const nikahTime = nikah.timingNote ? `${nikah.timeLabel} · ${nikah.timingNote}` : nikah.timeLabel;
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', marginTop: 38 }}>
      <EventColumn label={nikah.shortTitle} date={nikah.dateLabel} time={nikahTime} />
      <div style={{ width: 1, background: OG.champagne, margin: '6px 28px' }} />
      <EventColumn label={haldi.shortTitle} date={haldi.dateLabel} time={haldi.timeLabel} />
    </div>
  );
}

/** The link preview shown by WhatsApp, iMessage and social apps. Rendered once at build time. */
export default async function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        background: OG.ivory,
        fontFamily: 'Cormorant',
      }}
    >
      <ArchBackdrop />
      <div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 96 }}
      >
        <div style={{ fontSize: 30, fontStyle: 'italic', color: OG.goldInk, letterSpacing: 1 }}>
          {weddingConfig.copy.bismillah}
        </div>
        <Names />
        <EventRow />
      </div>
    </div>,
    { ...size, fonts: await loadOgFonts() },
  );
}
