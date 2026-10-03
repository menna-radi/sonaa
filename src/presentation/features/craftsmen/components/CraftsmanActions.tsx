import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Button } from '../../../components/ui/Button';
import { useConfirm, useConfirmWithReason } from '../../../components/ui/ConfirmDialog';
import { useToast } from '../../../components/ui/Toast';
import { errorMessage } from '../../../../core/errors/errorMessage';
import { validate, tError } from '../../../../domain/validation';
import { suspendSchema } from '../../../../domain/validation/ops';
import type { Craftsman } from '../hooks/useCraftsmen';
import { useCraftsmen } from '../hooks/useCraftsmen';

interface CraftsmanActionsProps {
  craftsman: Craftsman;
}

export const CraftsmanActions: React.FC<CraftsmanActionsProps> = ({ craftsman }) => {
  const { t } = useLanguage();
  const confirm = useConfirm();
  const confirmWithReason = useConfirmWithReason();
  const toast = useToast();
  const { mutations } = useCraftsmen();
  const busy = mutations.suspend.isPending || mutations.unsuspend.isPending || mutations.ban.isPending;

  const handleSuspend = async () => {
    const { confirmed, reason } = await confirmWithReason({
      title: t('craftsmen_suspend_title'),
      body: t('craftsmen_suspend_body'),
      tone: 'warning',
      requireReason: true,
      reasonPlaceholder: t('billing_reject_reason_ph'),
    });
    if (!confirmed) return;
    const v = validate(suspendSchema, { reason: reason ?? '' });
    if (!v.ok) {
      toast.error(tError(t, v.errors.reason) ?? t('err_generic'));
      return;
    }
    try {
      await mutations.suspend.mutateAsync({ id: craftsman.id, reason: v.data.reason });
    } catch (e) {
      toast.error(errorMessage(e, t));
    }
  };

  const handleUnsuspend = async () => {
    const ok = await confirm({
      title: t('craftsmen_unsuspend_title'),
      body: t('craftsmen_unsuspend_body'),
    });
    if (!ok) return;
    try {
      await mutations.unsuspend.mutateAsync(craftsman.id);
    } catch (e) {
      toast.error(errorMessage(e, t));
    }
  };

  const handleBan = async () => {
    const { confirmed } = await confirmWithReason({
      title: t('craftsmen_ban_title'),
      body: t('craftsmen_ban_body'),
      tone: 'danger',
      requireReason: false,
      confirmText: 'BAN',
      confirmTextPlaceholder: t('craftsmen_ban_confirm_ph'),
    });
    if (!confirmed) return;
    try {
      await mutations.ban.mutateAsync(craftsman.id);
    } catch (e) {
      toast.error(errorMessage(e, t));
    }
  };

  const isActive = craftsman.accountStatus === 'ACTIVE';
  const isSuspended = craftsman.accountStatus === 'SUSPENDED';

  return (
    <div className="ui-row">
      {isActive && (
        <Button size="sm" variant="outline" disabled={busy} onClick={() => void handleSuspend()}>
          {t('craftsmen_suspend')}
        </Button>
      )}
      {isSuspended && (
        <Button size="sm" variant="outline" disabled={busy} onClick={() => void handleUnsuspend()}>
          {t('craftsmen_unsuspend')}
        </Button>
      )}
      {craftsman.accountStatus !== 'BLOCKED' && (
        <Button size="sm" variant="danger" disabled={busy} onClick={() => void handleBan()}>
          {t('craftsmen_ban')}
        </Button>
      )}
    </div>
  );
};

export default CraftsmanActions;
