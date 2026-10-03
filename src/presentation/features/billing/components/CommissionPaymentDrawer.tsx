import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Drawer, KeyValueList, ProofViewer, StatusPill } from '../../../components/ui';
import { pillVariantFor, statusLabelKey } from '../../../components/ui/status';
import { formatDateTime, formatMoney, formatRelativeTime } from '../../../../core/utils/format';
import type { CommissionPayment } from '../../../../domain/entities/Billing';
import { Lock, LockOpen } from 'lucide-react';

interface CommissionPaymentDrawerProps {
  payment: CommissionPayment | null;
  ledgerSupported: boolean;
  onClose: () => void;
}

export const CommissionPaymentDrawer: React.FC<CommissionPaymentDrawerProps> = ({
  payment,
  ledgerSupported,
  onClose,
}) => {
  const { t, language } = useLanguage();
  if (!payment) return null;

  return (
    <Drawer isOpen={!!payment} onClose={onClose} title={payment.craftsmanName} subtitle={payment.craftsmanTitle}>
      <div className="ui-stack">
        <KeyValueList
          items={[
            { label: t('billing_col_amount'), value: <bdi className="ui-num">{formatMoney(payment.amount, 'ILS', language)}</bdi> },
            {
              label: t('billing_col_status'),
              value: (
                <StatusPill
                  variant={pillVariantFor('commission', payment.status)}
                  label={t(statusLabelKey('commission', payment.status))}
                />
              ),
            },
            {
              label: t('commission_lock_state'),
              value: payment.commissionLocked ? (
                <span className="ui-row">
                  <Lock size={14} /> {t('status_locked')}
                </span>
              ) : (
                <span className="ui-row">
                  <LockOpen size={14} /> {t('commission_unlocked')}
                </span>
              ),
            },
            {
              label: t('billing_col_submitted'),
              value: (
                <span title={formatDateTime(payment.createdAt, language)}>
                  {formatRelativeTime(payment.createdAt, language)}
                </span>
              ),
            },
            ...(payment.email
              ? [{ label: t('billing_col_craftsman'), value: <span className="ui-num">{payment.email}</span> }]
              : []),
            ...(payment.phone
              ? [{ label: t('billing_col_phone'), value: <bdi className="ui-num">{payment.phone}</bdi> }]
              : []),
            ...(payment.notes ? [{ label: t('billing_col_notes'), value: payment.notes }] : []),
          ]}
        />
        <div>
          <div className="ui-eyebrow">{t('billing_col_receipt')}</div>
          <ProofViewer src={payment.paymentProofUrl} alt={payment.craftsmanName} size={160} />
        </div>
        <div>
          <div className="ui-eyebrow">{t('commission_linked_entries')}</div>
          {payment.ledgerEntries && payment.ledgerEntries.length > 0 ? (
            <ul className="billing-ledger-links">
              {payment.ledgerEntries.map((e) => (
                <li key={e.id}>
                  <bdi className="ui-num">{e.taskDisplayId ?? e.id}</bdi>
                  {' · '}
                  <bdi className="ui-num">{formatMoney(e.amount, 'ILS', language)}</bdi>
                </li>
              ))}
            </ul>
          ) : (
            <p className="ui-caption">{ledgerSupported ? t('empty_commission') : t('commission_ledger_unavailable')}</p>
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default CommissionPaymentDrawer;
