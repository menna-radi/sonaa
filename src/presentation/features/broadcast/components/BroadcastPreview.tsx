import React from 'react';
import { Smartphone, Bell, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { Card } from '../../../components/ui/Card';

interface BroadcastPreviewProps {
  title: string;
  message: string;
  imageUrl?: string;
  deepLink?: string;
  targetCity?: string;
  audienceText?: string;
  channelsText?: string;
}

export const BroadcastPreview: React.FC<BroadcastPreviewProps> = ({
  title,
  message,
  imageUrl,
  deepLink,
  targetCity,
  audienceText,
  channelsText,
}) => {
  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
          <Smartphone size={18} style={{ color: 'var(--primary)' }} />
          <span>Device Live Preview</span>
        </div>
      }
      subtitle="How this notification appears on Android & iOS devices"
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--sp-4)',
        }}
      >
        {/* Phone Frame */}
        <div
          style={{
            width: '100%',
            maxWidth: 320,
            background: 'var(--surface-sunken)',
            border: '2px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--sp-4)',
            boxShadow: 'var(--shadow-md)',
            position: 'relative',
          }}
        >
          {/* Top Notch / Speaker pill */}
          <div
            style={{
              width: 60,
              height: 4,
              background: 'var(--border-strong)',
              borderRadius: 'var(--radius-full)',
              margin: '0 auto var(--sp-4) auto',
            }}
          />

          {/* System Notification Bubble */}
          <div
            style={{
              background: 'var(--surface-raised)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--sp-3)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--sp-2)',
            }}
          >
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    background: 'var(--primary)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  S
                </div>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--on-surface)' }}>
                  Sonaa · صنّاع
                </span>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--on-surface-subtle)' }}>now</span>
            </div>

            {/* Notification Title & Body */}
            <div>
              <div
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 700,
                  color: 'var(--on-surface)',
                  lineHeight: 1.3,
                }}
              >
                {title.trim() || 'Urgent Marketplace Update'}
              </div>
              <div
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--on-surface-muted)',
                  marginTop: 2,
                  lineHeight: 1.4,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {message.trim() ||
                  'Special notification for craftsmen and customers in Jerusalem. Open the app to view new service requests!'}
              </div>
            </div>

            {/* Attached Image if any */}
            {imageUrl && (
              <div
                style={{
                  width: '100%',
                  height: 120,
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  background: 'var(--surface-sunken)',
                  border: '1px solid var(--border-subtle)',
                  marginTop: 4,
                }}
              >
                <img
                  src={imageUrl}
                  alt="Notification preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Deep link chip */}
            {deepLink && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: '10px',
                  color: 'var(--primary)',
                  fontWeight: 600,
                  marginTop: 2,
                }}
              >
                <ExternalLink size={10} />
                <span>Action: {deepLink}</span>
              </div>
            )}
          </div>
        </div>

        {/* Audience summary badge */}
        <div
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--on-surface-subtle)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <span>
            Target Audience: <strong>{audienceText || 'All Users'}</strong>
          </span>
          {targetCity && <span>Region: <strong>{targetCity}</strong></span>}
          <span>
            Active Channels: <strong>{channelsText || 'Push, In-App'}</strong>
          </span>
        </div>
      </div>
    </Card>
  );
};
