import React, { useState } from 'react';
import { AlertTriangle, MapPin, ShieldAlert } from 'lucide-react';
import type { ActivityEvent } from '../../../../domain/entities/LiveActivity';
import { AlertBanner, Button, ConfirmDialog } from '../../../components/ui';

interface SosBannerProps {
  event: ActivityEvent | null;
  onDispatchBackup?: (eventId: string) => Promise<void> | void;
}

export const SosBanner: React.FC<SosBannerProps> = ({ event, onDispatchBackup }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [dispatching, setDispatching] = useState(false);

  if (!event) return null;

  const handleDispatch = async () => {
    setDispatching(true);
    try {
      if (onDispatchBackup) {
        await onDispatchBackup(event.id);
      }
    } finally {
      setDispatching(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <AlertBanner
        icon={<AlertTriangle size={20} style={{ color: 'var(--danger-text)' }} />}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            <span>Emergency in progress</span>
            <span
              style={{
                backgroundColor: 'var(--danger-text)',
                color: '#FFFFFF',
                fontSize: 'var(--fs-micro)',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: 'var(--r-full)',
              }}
            >
              SOS
            </span>
          </div>
        }
        body={event.subtitle || 'Active emergency alert triggered'}
        actions={
          <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
            <Button
              variant="outline"
              size="sm"
              iconLeading={<MapPin size={12} />}
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent('focus-map-job', {
                    detail: {
                      eventId: event.id,
                      title: event.title,
                    },
                  })
                );
              }}
            >
              View on map
            </Button>

            <Button
              variant="danger"
              size="sm"
              iconLeading={<ShieldAlert size={12} />}
              onClick={() => setConfirmOpen(true)}
            >
              Dispatch backup
            </Button>
          </div>
        }
      />

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Dispatch Backup Unit"
        description="Are you sure you want to dispatch emergency backup responders to this incident? An immediate push dispatch will be issued to nearby vetted craftsmen."
        confirmLabel="Confirm & Dispatch"
        confirmVariant="danger"
        isLoading={dispatching}
        onConfirm={handleDispatch}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
};

export default SosBanner;
