import { ChevronDown, Share2 } from 'lucide-react';
import { ShareInvitation, type ShareInvitationProps } from './ShareInvitation';

const ICON = { strokeWidth: 1.5, 'aria-hidden': true } as const;

/** "Share Invitation" disclosure holding WhatsApp, the device share menu and copy-link. */
export function ShareActions(props: ShareInvitationProps) {
  return (
    <details className="disclosure">
      <summary className="btn btn-secondary disclosure__summary">
        <Share2 {...ICON} />
        <span>Share Invitation</span>
        <ChevronDown {...ICON} className="disclosure__chevron" />
      </summary>
      <div className="disclosure__panel">
        <ShareInvitation {...props} />
      </div>
    </details>
  );
}
