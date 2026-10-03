import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Card, DataTable, EmptyState, ErrorState, Segmented, StatusPill } from '../../../components/ui';
import { pillVariantFor, statusLabelKey } from '../../../components/ui/status';
import {
  formatDateTime,
  formatMoney,
  formatPercentValue,
  formatRelativeTime,
} from '../../../../core/utils/format';
import type { CommissionLedgerEntry, CommissionLedgerStatus } from '../../../../domain/entities/Billing';
import { useCommissionLedger } from '../hooks/useBilling';
import { BookOpen } from 'lucide-react';

const LIMIT = 20;
const FILTERS: Array<CommissionLedgerStatus | 'ALL'> = ['DUE', 'PAID', 'ALL'];

export const LedgerTable: React.FC = () => {
  const { t, language } = useLanguage();
  const [status, setStatus] = useState<CommissionLedgerStatus | 'ALL'>('DUE');
  const [page, setPage] = useState(1);

  const q = useCommissionLedger({ status, page, limit: LIMIT });
  const totalPages = Math.max(1, Math.ceil((q.data?.total ?? 0) / LIMIT));
  const totals = q.data?.totals;

  return (
    <div className="ui-stack">
      <div className="ui-toolbar">
        <Segmented
          value={status}
          onChange={(v) => {
            setStatus(v as CommissionLedgerStatus | 'ALL');
            setPage(1);
          }}
          items={FILTERS.map((s) => ({ value: s, label: t(`billing_ledger_filter_${s.toLowerCase()}`) }))}
        />
        {totals && (
          <span className="ui-caption">
            {t('billing_ledger_totals')}
            {': '}
            <bdi className="ui-num">{formatMoney(totals.due, 'ILS', language)}</bdi>
            {' · '}
            <bdi className="ui-num">{formatMoney(totals.paid, 'ILS', language)}</bdi>
          </span>
        )}
      </div>
      <Card padding="none">
        {q.isError ? (
          <ErrorState message={q.error.message} onRetry={() => q.refetch()} retryLabel={t('btn_retry')} />
        ) : (
          <DataTable
            columns={[
              {
                key: 'task',
                header: t('billing_ledger_col_task'),
                render: (row: CommissionLedgerEntry) => (
                  <bdi className="ui-num">{row.taskDisplayId ?? row.taskId}</bdi>
                ),
              },
              {
                key: 'craftsman',
                header: t('billing_col_craftsman'),
                render: (row: CommissionLedgerEntry) => <span>{row.craftsmanName ?? '—'}</span>,
              },
              {
                key: 'amount',
                header: t('billing_col_amount'),
                align: 'end',
                render: (row: CommissionLedgerEntry) => (
                  <bdi className="ui-num">{formatMoney(row.amount, 'ILS', language)}</bdi>
                ),
              },
              {
                key: 'rate',
                header: t('billing_ledger_col_rate'),
                align: 'end',
                render: (row: CommissionLedgerEntry) => (
                  <bdi className="ui-num">{formatPercentValue(row.rate * 100)}</bdi>
                ),
              },
              {
                key: 'status',
                header: t('billing_col_status'),
                render: (row: CommissionLedgerEntry) => (
                  <StatusPill
                    variant={pillVariantFor('commission', row.status)}
                    label={t(statusLabelKey('commission', row.status))}
                  />
                ),
              },
              {
                key: 'created',
                header: t('billing_ledger_col_created'),
                render: (row: CommissionLedgerEntry) => (
                  <span title={formatDateTime(row.createdAt, language)}>
                    {formatRelativeTime(row.createdAt, language)}
                  </span>
                ),
              },
              {
                key: 'paid',
                header: t('billing_ledger_col_paid'),
                render: (row: CommissionLedgerEntry) => (
                  <span>{row.paidAt ? formatRelativeTime(row.paidAt, language) : '—'}</span>
                ),
              },
            ]}
            rows={q.data?.items ?? []}
            rowKey={(row: CommissionLedgerEntry) => row.id}
            loading={q.isLoading}
            empty={<EmptyState icon={<BookOpen size={20} />} title={t('empty_ledger')} />}
            pagination={{
              page,
              totalPages,
              totalItems: q.data?.total,
              pageSize: LIMIT,
              onPageChange: setPage,
            }}
            mobile={(row: CommissionLedgerEntry) => (
              <div className="billing-receipt-card">
                <div className="billing-receipt-card__top">
                  <div className="billing-receipt-card__identity">
                    <bdi className="ui-num billing-receipt-card__name">
                      {row.taskDisplayId ?? row.taskId}
                    </bdi>
                    <span className="ui-caption">{row.craftsmanName ?? '—'}</span>
                    <span className="ui-num billing-receipt-card__amount">
                      {formatMoney(row.amount, 'ILS', language)}
                    </span>
                  </div>
                  <StatusPill
                    variant={pillVariantFor('commission', row.status)}
                    label={t(statusLabelKey('commission', row.status))}
                  />
                </div>
              </div>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default LedgerTable;
