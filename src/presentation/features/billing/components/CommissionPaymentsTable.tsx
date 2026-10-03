import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import {
  Button,
  Card,
  DataTable,
  EmptyState,
  ErrorState,
  ProofViewer,
  SearchInput,
  Segmented,
  StatusPill,
} from '../../../components/ui';
import { pillVariantFor, statusLabelKey } from '../../../components/ui/status';
import { useConfirm, useConfirmWithReason } from '../../../components/ui/ConfirmDialog';
import { useToast } from '../../../components/ui/Toast';
import { formatDateTime, formatMoney, formatRelativeTime } from '../../../../core/utils/format';
import { validate, tError } from '../../../../domain/validation';
import { rejectReasonSchema } from '../../../../domain/validation/billing';
import type { AppError } from '../../../../core/errors/AppError';
import type { CommissionPayment, CommissionPaymentStatus } from '../../../../domain/entities/Billing';
import { useApproveCommission, useRejectCommission } from '../hooks/useBillingMutations';
import { useCommissionPayments } from '../hooks/useBilling';
import { CircleDollarSign } from 'lucide-react';

const LIMIT = 20;

interface CommissionPaymentsTableProps {
  initialSearch: string;
  onDetails: (payment: CommissionPayment) => void;
}

export const CommissionPaymentsTable: React.FC<CommissionPaymentsTableProps> = ({ initialSearch, onDetails }) => {
  const { t, language } = useLanguage();
  const confirm = useConfirm();
  const confirmWithReason = useConfirmWithReason();
  const toast = useToast();
  const approve = useApproveCommission();
  const reject = useRejectCommission();

  const [status, setStatus] = useState<CommissionPaymentStatus | 'ALL'>('PENDING');
  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(1);
  const busy = approve.isPending || reject.isPending;

  const q = useCommissionPayments({ status, page, limit: LIMIT, search: search || undefined });
  const totalPages = Math.max(1, Math.ceil((q.data?.total ?? 0) / LIMIT));

  const handleApprove = async (row: CommissionPayment) => {
    const body = t('commission_approve_body').replace('{amount}', formatMoney(row.amount, 'ILS', language));
    const ok = await confirm({ title: t('billing_approve_title'), body });
    if (!ok) return;
    approve.mutate(row.id, {
      onError: (e: Error) => {
        if ((e as AppError).status === 409) {
          toast.error(t('err_conflict'));
          void q.refetch();
        }
      },
    });
  };

  const handleReject = async (row: CommissionPayment) => {
    const { confirmed, reason } = await confirmWithReason({
      title: t('billing_reject_title'),
      body: t('commission_reject_body'),
      tone: 'danger',
      requireReason: true,
      reasonPlaceholder: t('billing_reject_reason_ph'),
    });
    if (!confirmed) return;
    const v = validate(rejectReasonSchema, { reason: reason ?? '' });
    if (!v.ok) {
      toast.error(tError(t, v.errors.reason) ?? t('err_generic'));
      return;
    }
    reject.mutate({ id: row.id, reason: v.data.reason });
  };

  return (
    <div className="ui-stack">
      <div className="ui-toolbar">
        <Segmented
          value={status}
          onChange={(v) => {
            setStatus(v as CommissionPaymentStatus | 'ALL');
            setPage(1);
          }}
          items={(['PENDING', 'APPROVED', 'REJECTED'] as const).map((s) => ({
            value: s,
            label: t(`commission_filter_${s.toLowerCase()}`),
          }))}
        />
        <div className="ui-toolbar__grow">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder={t('billing_commission_search_ph')} />
        </div>
      </div>
      <Card padding="none">
        {q.isError ? (
          <ErrorState message={q.error.message} onRetry={() => q.refetch()} retryLabel={t('btn_retry')} />
        ) : (
          <DataTable
            columns={[
              {
                key: 'craftsman',
                header: t('billing_col_craftsman'),
                render: (row: CommissionPayment) => (
                  <span>
                    <span className="ui-text-strong">{row.craftsmanName}</span>
                    <br />
                    <span className="ui-caption">{row.craftsmanTitle}</span>
                  </span>
                ),
              },
              {
                key: 'amount',
                header: t('billing_col_amount'),
                align: 'end',
                render: (row: CommissionPayment) => (
                  <bdi className="ui-num">{formatMoney(row.amount, 'ILS', language)}</bdi>
                ),
              },
              {
                key: 'submitted',
                header: t('billing_col_submitted'),
                render: (row: CommissionPayment) => (
                  <span title={formatDateTime(row.createdAt, language)}>
                    {formatRelativeTime(row.createdAt, language)}
                  </span>
                ),
              },
              {
                key: 'receipt',
                header: t('billing_col_receipt'),
                render: (row: CommissionPayment) => <ProofViewer src={row.paymentProofUrl} alt={row.craftsmanName} />,
              },
              {
                key: 'lock',
                header: t('commission_lock_state'),
                render: (row: CommissionPayment) =>
                  row.commissionLocked ? (
                    <StatusPill variant="danger" label={t('status_locked')} />
                  ) : (
                    <span className="ui-caption">{t('commission_unlocked')}</span>
                  ),
              },
              {
                key: 'status',
                header: t('billing_col_status'),
                render: (row: CommissionPayment) => (
                  <StatusPill
                    variant={pillVariantFor('commission', row.status)}
                    label={t(statusLabelKey('commission', row.status))}
                  />
                ),
              },
              {
                key: 'actions',
                header: t('billing_col_actions'),
                align: 'end',
                render: (row: CommissionPayment) => (
                  <span className="ui-row">
                    {row.status === 'PENDING' ? (
                      <>
                        <Button size="sm" variant="primary" disabled={busy} onClick={() => void handleApprove(row)}>
                          {t('billing_approve')}
                        </Button>
                        <Button size="sm" variant="outline" disabled={busy} onClick={() => void handleReject(row)}>
                          {t('billing_reject')}
                        </Button>
                      </>
                    ) : (
                      ''
                    )}
                    <Button size="sm" variant="ghost" onClick={() => onDetails(row)}>
                      {t('billing_details')}
                    </Button>
                  </span>
                ),
              },
            ]}
            rows={q.data?.items ?? []}
            rowKey={(row: CommissionPayment) => row.id}
            loading={q.isLoading}
            empty={<EmptyState icon={<CircleDollarSign size={20} />} title={t('empty_commission')} />}
            pagination={{
              page,
              totalPages,
              totalItems: q.data?.total,
              pageSize: LIMIT,
              onPageChange: setPage,
            }}
            mobile={(row: CommissionPayment) => (
              <div className="billing-receipt-card">
                <div className="billing-receipt-card__top">
                  <ProofViewer src={row.paymentProofUrl} alt={row.craftsmanName} size={48} />
                  <div className="billing-receipt-card__identity">
                    <span className="billing-receipt-card__name">{row.craftsmanName}</span>
                    <span className="ui-num billing-receipt-card__amount">
                      {formatMoney(row.amount, 'ILS', language)}
                    </span>
                  </div>
                  <StatusPill
                    variant={pillVariantFor('commission', row.status)}
                    label={t(statusLabelKey('commission', row.status))}
                  />
                </div>
                <div className="billing-receipt-card__actions">
                  {row.status === 'PENDING' ? (
                    <>
                      <Button size="sm" variant="primary" disabled={busy} onClick={() => void handleApprove(row)}>
                        {t('billing_approve')}
                      </Button>
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => void handleReject(row)}>
                        {t('billing_reject')}
                      </Button>
                    </>
                  ) : (
                    ''
                  )}
                  <Button size="sm" variant="ghost" onClick={() => onDetails(row)}>
                    {t('billing_details')}
                  </Button>
                </div>
              </div>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default CommissionPaymentsTable;
