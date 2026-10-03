import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { DataTable, type Column } from '../../../components/ui/DataTable';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/EmptyState';
import { Segmented } from '../../../components/ui/Segmented';
import { StatusPill } from '../../../components/ui/StatusPill';
import { useConfirm } from '../../../components/ui/ConfirmDialog';
import { pillVariantFor, statusLabelKey } from '../../../components/ui/status';
import { formatDateTime, formatMoney, formatRelativeTime } from '../../../../core/utils/format';
import type { WithdrawalRequest } from '../../../../domain/entities/Payment';
import { useWithdrawals, useApproveWithdrawal, useRejectWithdrawal, useRetryWithdrawal } from '../hooks/usePayments';
import { useLanguage } from '../../../context/LanguageContext';
import { ArrowDownToLine } from 'lucide-react';

const LIMIT = 20;
type Tab = 'PENDING' | 'COMPLETED' | 'FAILED';
const TABS: Tab[] = ['PENDING', 'COMPLETED', 'FAILED'];

export const PayoutsTable: React.FC = () => {
  const { t, language } = useLanguage();
  const confirm = useConfirm();
  const approve = useApproveWithdrawal();
  const reject = useRejectWithdrawal();
  const retry = useRetryWithdrawal();

  const [tab, setTab] = useState<Tab>('PENDING');
  const [page, setPage] = useState(1);
  const busy = approve.isPending || reject.isPending || retry.isPending;

  const q = useWithdrawals({ status: tab, page, limit: LIMIT });
  const rows = q.data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((q.data?.total ?? 0) / LIMIT));

  const handleApprove = async (req: WithdrawalRequest) => {
    const body = t('withdrawals_approve_body')
      .replace('{amount}', formatMoney(req.amount, 'ILS', language))
      .replace('{method}', req.method || '—');
    const ok = await confirm({ title: t('billing_approve_title'), body });
    if (!ok) return;
    approve.mutate(req.id);
  };

  const handleReject = async (req: WithdrawalRequest) => {
    const ok = await confirm({
      title: t('billing_reject_title'),
      body: t('withdrawals_reject_body'),
      tone: 'danger',
    });
    if (!ok) return;
    reject.mutate(req.id);
  };

  const handleRetry = async (req: WithdrawalRequest) => {
    const ok = await confirm({
      title: t('withdrawals_retry_title'),
      body: t('withdrawals_retry_body'),
      tone: 'danger',
    });
    if (!ok) return;
    retry.mutate(req.id);
  };

  const columns: Array<Column<WithdrawalRequest>> = [
    {
      key: 'craftsman',
      header: t('billing_col_craftsman'),
      render: (req) => <span className="ui-text-strong">{req.craftsmanName}</span>,
    },
    {
      key: 'amount',
      header: t('billing_col_amount'),
      align: 'end',
      render: (req) => <bdi className="ui-num">{formatMoney(req.amount, 'ILS', language)}</bdi>,
    },
    {
      key: 'method',
      header: t('withdrawals_col_method'),
      render: (req) => <bdi className="ui-num">{req.method || '—'}</bdi>,
    },
    {
      key: 'requested',
      header: t('billing_col_submitted'),
      render: (req) => (
        <span title={req.createdAt ? formatDateTime(req.createdAt, language) : undefined}>
          {req.createdAt ? formatRelativeTime(req.createdAt, language) : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('billing_col_status'),
      render: (req) => (
        <StatusPill variant={pillVariantFor('withdrawal', req.status)} label={t(statusLabelKey('withdrawal', req.status))} />
      ),
    },
    {
      key: 'actions',
      header: t('billing_col_actions'),
      align: 'end',
      render: (req) =>
        req.status === 'PENDING' ? (
          <span className="ui-row">
            <Button size="sm" variant="primary" disabled={busy} onClick={() => void handleApprove(req)}>
              {t('billing_approve')}
            </Button>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => void handleReject(req)}>
              {t('billing_reject')}
            </Button>
          </span>
        ) : req.status === 'FAILED' ? (
          <Button size="sm" variant="outline" disabled={busy} onClick={() => void handleRetry(req)}>
            {t('withdrawals_retry')}
          </Button>
        ) : (
          ''
        ),
    },
  ];

  return (
    <div className="ui-stack">
      <div className="ui-toolbar">
        <Segmented
          value={tab}
          onChange={(v) => {
            setTab(v as Tab);
            setPage(1);
          }}
          items={TABS.map((s) => ({ value: s, label: t(`withdrawals_tab_${s.toLowerCase()}`) }))}
        />
      </div>
      <Card padding="none">
        {q.isError ? (
          <ErrorState message={q.error.message} onRetry={() => q.refetch()} retryLabel={t('btn_retry')} />
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(r) => r.id}
            loading={q.isLoading}
            empty={<EmptyState icon={<ArrowDownToLine size={20} />} title={t('empty_withdrawals')} />}
            pagination={{ page, totalPages, totalItems: q.data?.total, pageSize: LIMIT, onPageChange: setPage }}
            mobile={(req) => (
              <div className="billing-receipt-card">
                <div className="billing-receipt-card__top">
                  <div className="billing-receipt-card__identity">
                    <span className="billing-receipt-card__name">{req.craftsmanName}</span>
                    <span className="ui-num billing-receipt-card__amount">
                      {formatMoney(req.amount, 'ILS', language)}
                    </span>
                    <span className="ui-caption">
                      <bdi className="ui-num">{req.method || '—'}</bdi>
                    </span>
                  </div>
                  <StatusPill
                    variant={pillVariantFor('withdrawal', req.status)}
                    label={t(statusLabelKey('withdrawal', req.status))}
                  />
                </div>
                <div className="billing-receipt-card__actions">
                  {req.status === 'PENDING' ? (
                    <>
                      <Button size="sm" variant="primary" disabled={busy} onClick={() => void handleApprove(req)}>
                        {t('billing_approve')}
                      </Button>
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => void handleReject(req)}>
                        {t('billing_reject')}
                      </Button>
                    </>
                  ) : req.status === 'FAILED' ? (
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => void handleRetry(req)}>
                      {t('withdrawals_retry')}
                    </Button>
                  ) : (
                    ''
                  )}
                </div>
              </div>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default PayoutsTable;
