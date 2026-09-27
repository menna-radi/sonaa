import React, { useState } from 'react';
import type { Task } from '../../../../domain/entities/Task';
import { useNavigation } from '../../../context/NavigationContext';
import { AlertBanner, Button, ConfirmDialog, useToast } from '../../../components/ui';
import { AlertTriangle, MapPin, ShieldAlert } from 'lucide-react';

interface EmergencyBannerProps {
  emergencyTask: Task | null;
  onDispatchBackup?: (taskId: string) => Promise<void> | void;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({
  emergencyTask,
  onDispatchBackup,
}) => {
  const { navigate } = useNavigation();
  const { success } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [dispatching, setDispatching] = useState(false);

  if (!emergencyTask) return null;

  const handleDispatch = async () => {
    setDispatching(true);
    try {
      if (onDispatchBackup) {
        await onDispatchBackup(emergencyTask.id);
      }
      success(`Emergency backup dispatched for task ${emergencyTask.jobNumber}`);
    } finally {
      setDispatching(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <div
        className="tasks-emergency-sticky-banner"
        style={{
          position: 'sticky',
          bottom: 'var(--sp-4)',
          zIndex: 40,
          boxShadow: 'var(--shadow-modal)',
        }}
      >
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
          body={`${emergencyTask.title} · ${emergencyTask.zone} · Customer: ${emergencyTask.customer}`}
          actions={
            <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
              <Button
                variant="outline"
                size="sm"
                iconLeading={<MapPin size={12} />}
                onClick={() => navigate('live_activity')}
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
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title={`Dispatch Emergency Backup for ${emergencyTask.jobNumber}?`}
        description="This will instantly trigger priority SOS broadcast to all vetted craftsmen operating within a 5km radius of this location."
        confirmLabel="Dispatch Responders"
        confirmVariant="danger"
        isLoading={dispatching}
        onConfirm={handleDispatch}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
};

export default EmergencyBanner;
