'use client';

import { Check, Link2, MessageCircle, Share2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { buildWhatsAppShareUrl, withInvitationUrl } from '@/lib/share';
import { useBrowserValue } from '@/lib/use-browser-value';
import { useShareActions, type ShareStatus } from './use-share-actions';

export interface ShareInvitationProps {
  /** Invitation text without the link; the public link is appended here. */
  readonly message: string;
  /** Public address resolved at build time; null falls back to the current address. */
  readonly siteUrl: string | null;
  readonly shareTitle: string;
}

const ICON = { strokeWidth: 1.5, 'aria-hidden': true } as const;
const STATUS_TEXT: Readonly<Record<ShareStatus, string>> = {
  idle: '',
  copied: 'Invitation link copied.',
  error: 'Could not copy the link. Please copy it from the address bar.',
};

interface OptionContentProps {
  readonly title: string;
  readonly hint: ReactNode;
  readonly icon: ReactNode;
}

function OptionContent({ title, hint, icon }: OptionContentProps) {
  return (
    <>
      <span className="option-link__text">
        <span className="option-link__title">{title}</span>
        <span className="option-link__hint">{hint}</span>
      </span>
      {icon}
    </>
  );
}

export function ShareInvitation({ message, siteUrl, shareTitle }: ShareInvitationProps) {
  const origin = useBrowserValue<string | null>(() => window.location.origin, null);
  const canShareNatively = useBrowserValue(() => typeof navigator.share === 'function', false);
  const shareUrl = siteUrl ?? origin;
  const { status, copyLink, shareNatively } = useShareActions({
    url: shareUrl,
    title: shareTitle,
    text: message,
  });

  return (
    <div className="share-options">
      <a
        className="option-link"
        href={buildWhatsAppShareUrl(withInvitationUrl(message, shareUrl))}
        target="_blank"
        rel="noopener noreferrer"
      >
        <OptionContent
          title="Share on WhatsApp"
          hint={
            <>
              Opens WhatsApp with the message ready<span className="sr-only"> in a new tab</span>
            </>
          }
          icon={<MessageCircle {...ICON} />}
        />
      </a>
      {/* Shown once interactive, so there is never a button that does nothing. */}
      {origin === null ? null : canShareNatively ? (
        <button type="button" className="option-link" onClick={shareNatively}>
          <OptionContent
            title="More ways to share"
            hint="Uses your device’s share menu"
            icon={<Share2 {...ICON} />}
          />
        </button>
      ) : (
        <button type="button" className="option-link" onClick={copyLink}>
          <OptionContent
            title="Copy invitation link"
            hint="Paste it into any message"
            icon={status === 'copied' ? <Check {...ICON} /> : <Link2 {...ICON} />}
          />
        </button>
      )}
      <p className="share-options__status" role="status" aria-live="polite">
        {STATUS_TEXT[status]}
      </p>
    </div>
  );
}
