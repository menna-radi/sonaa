import React, { useState } from 'react';
import type { Craftsman } from '../hooks/useCraftsmen';
import { Button, ConfirmDialog, useToast } from '../../../components/ui';
import { Eye, AlertTriangle, CheckCircle, Ban } from 'lucide-react';

interface CraftsmanActionsProps {
  craftsman: Craftsman;
  onSuspend: (id: string, reason?: string) => Promise<void>;
  onUnsuspend: (id: string) => Promise<void>;
  onBan: (id: string) => Promise<void>;
  onViewProfile?: (craftsman: Craftsman) => void;
}

export const CraftsmanActions: React.FC<CraftsmanActionsProps> = ({
  craftsman,
  onSuspend,
  onUnsuspend,
  onBan,
  onViewProfile,
}) => {
  const { success, error } = useToast();
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [unsuspendModalOpen, setUnsuspendModalOpen] = useState(false);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isSuspended = craftsman.status === 'suspended';

  const handleSuspend = async () => {
    setLoading(true);
    try {
      await onSuspend(craftsman.id, 'Moderator suspension');
      success(`Craftsman ${craftsman.name} has been suspended.`);
      setSuspendModalOpen(false);
    } catch (err: any) {
      error(err?.message || 'Failed to suspend craftsman.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsuspend = async () => {
    setLoading(true);
    try {
      await onUnsuspend(craftsman.id);
      success(`Craftsman ${craftsman.name} has been reactivated.`);
      setUnsuspendModalOpen(false);
    } catch (err: any) {
      error(err?.message || 'Failed to reactivate craftsman.');
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async () => {
    setLoading(true);
    try {
      await onBan(craftsman.id);
      success(`Craftsman ${craftsman.name} has been permanently banned.`);
      setBanModalOpen(false);
    } catch (err: any) {
      error(err?.message || 'Failed to ban craftsman.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--sp-2)', width: '100%' }}>
      {/* 1. View button */}
      <Button
        variant="ghost"
        size="sm"
        iconLeading={<Eye size={14} />}
        onClick={() => onViewProfile?.(craftsman)}
      >
        View
      </Button>

      {/* 2. Suspend/Unsuspend button */}
      {isSuspended ? (
        <Button
          variant="outline"
          size="sm"
          iconLeading={<CheckCircle size={14} />}
          onClick={() => setUnsuspendModalOpen(true)}
        >
          Reactivate
        </Button>
      ) : (
        <Button
          variant="soft-warning"
          size="sm"
          iconLeading={<AlertTriangle size={14} />}
          onClick={() => setSuspendModalOpen(true)}
        >
          Suspend
        </Button>
      )}

      {/* 3. Ban button */}
      <Button
        variant="soft-danger"
        size="sm"
        iconLeading={<Ban size={14} />}
        onClick={() => setBanModalOpen(true)}
      >
        Ban
      </Button>

      {/* Confirm Dialogs */}
      <ConfirmDialog
        isOpen={suspendModalOpen}
        title={`Suspend ${craftsman.name}?`}
        description="This will temporarily pause the craftsman account, prevent bidding on open tasks, and flag existing active dispatches for supervisor review."
        confirmLabel="Confirm Suspension"
        confirmVariant="danger"
        isLoading={loading}
        onConfirm={handleSuspend}
        onCancel={() => setSuspendModalOpen(false)}
      />

      <ConfirmDialog
        isOpen={unsuspendModalOpen}
        title={`Reactivate ${craftsman.name}?`}
        description="This will restore the craftsman account to full operational standing and allow receiving customer task requests."
        confirmLabel="Reactivate Account"
        confirmVariant="primary"
        isLoading={loading}
        onConfirm={handleUnsuspend}
        onCancel={() => setUnsuspendModalOpen(false)}
      />

      <ConfirmDialog
        isOpen={banModalOpen}
        title={`Permanently Ban ${craftsman.name}?`}
        description="WARNING: This action cannot be easily undone. The craftsman will be permanently blacklisted from the platform across phone, ID, and device credentials."
        confirmLabel="Permanently Ban"
        confirmVariant="danger"
        isLoading={loading}
        onConfirm={handleBan}
        onCancel={() => setBanModalOpen(false)}
      />
    </div>
  );
};

export default CraftsmanActions;
