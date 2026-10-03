import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Button, ProofViewer, StatusPill } from '../../../components/ui';
import { pillVariantFor, statusLabelKey } from '../../../components/ui/status';
import { formatMoney, formatRelativeTime } from '../../../../core/utils/format';
import type { SubscriptionRequest } from '../../../../domain/entities/Billing';

interface ReceiptRowProps {
  row: SubscriptionRequest;
  onApprove: (row: SubscriptionRequest) => void;
  onReject: (row: SubscriptionRequest) => void;
  onChat: (row: SubscriptionRequest) => void;
  pendingAction: boolean;
}

export const ReceiptRow: React.FC<ReceiptRowProps> = ({ row, onApprove, onReject, onChat, pendingAction }) => {
  const { t, language } = useLanguage();
  const pending = row.status === 'PENDING_VERIFICATION';

  return (
    <div className="billing-receipt-card">
      <div className="billing-receipt-card__top">
        <ProofViewer src={row.paymentProofUrl} alt={row.userName} size={48} />
        <div className="billing-receipt-card__identity">
          <span className="billing-receipt-card__name">{row.userName}</span>
          <span className="ui-caption">
            {row.planTitle} · {row.durationMonths} {t('billing_plan_months')}
          </span>
          <span className="ui-num billing-receipt-card__amount">{formatMoney(row.price, 'ILS', language)}</span>
        </div>
        <StatusPill variant={pillVariantFor('billing', row.status)} label={t(statusLabelKey('billing', row.status))} />
      </div>
      <div className="ui-caption">
        {formatRelativeTime(row.createdAt, language)}
        {row.status === 'REJECTED' && row.rejectionReason ? ` · ${row.rejectionReason}` : ''}
      </div>
      {pending && (
        <div className="billing-receipt-card__actions">
          <Button size="sm" variant="primary" disabled={pendingAction} onClick={() => onApprove(row)}>
            {t('billing_approve')}
          </Button>
          <Button size="sm" variant="outline" disabled={pendingAction} onClick={() => onReject(row)}>
            {t('billing_reject')}
          </Button>
          {row.chatRoomId && (
            <Button size="sm" variant="ghost" disabled={pendingAction} onClick={() => onChat(row)}>
              {t('billing_chat')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ReceiptRow;
