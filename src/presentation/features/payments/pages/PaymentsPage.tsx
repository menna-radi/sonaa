import React from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { usePaymentSummary, useWithdrawals } from '../hooks/usePayments';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { ErrorState } from '../../../components/ui/EmptyState';
import { Skeleton } from '../../../components/ui/Skeleton';
import { PaymentsKpis } from '../components/PaymentsKpis';
import { PayoutsTable } from '../components/PayoutsTable';
import { RevenueChart } from '../../dashboard/components/RevenueChart';
import { formatRelativeTime } from '../../../../core/utils/format';
import { toCsv, downloadCsv } from '../../../../core/utils/csv';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../../core/query/queryKeys';
import '../payments.css';
import '../payments.css';

export const PaymentsPage: React.FC = () => {
  const { t, language } = useLanguage();
  const qc = useQueryClient();
  const summaryQ = usePaymentSummary();
  // CSV export covers the current withdrawals view (first page, pending).
  const exportQ = useWithdrawals({ status: 'PENDING', page: 1, limit: 100 });

  const summary = summaryQ.data ?? null;
  const loading = summaryQ.isLoading;
  const error = summaryQ.error ? summaryQ.error.message : null;

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: queryKeys.payments.all });
  };

  const handleExportCSV = () => {
    const rows: (string | number | null)[][] = [
      ['ID', 'Craftsman', 'Method', 'Amount (ILS)', 'Status', 'Requested'],
      ...(exportQ.data?.items ?? []).map((w) => [w.id, w.craftsmanName, w.method, w.amount, w.status, w.createdAt]),
    ];
    downloadCsv('sonaa_payouts.csv', toCsv(rows));
  };

  return (
    <div className="ui-page">
      <PageHeader
        title={t('payments_title')}
        subtitle={t('payments_subtitle')}
        meta={
          summaryQ.dataUpdatedAt
            ? `${t('updated')} ${formatRelativeTime(summaryQ.dataUpdatedAt, language)}`
            : undefined
        }
        actions={
          <>
            <Button variant="outline" size="sm" icon={<Download size={14} />} onClick={handleExportCSV}>
              {t('btn_export_csv')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw size={14} />}
              loading={summaryQ.isFetching}
              onClick={refresh}
            >
              {t('btn_refresh')}
            </Button>
          </>
        }
      />
      {error ? (
        <ErrorState title={t('status_error_title')} message={error} onRetry={refresh} retryLabel={t('btn_retry')} />
      ) : loading ? (
        <div className="ui-stack">
          <div className="ui-kpi-grid ui-kpi-grid--4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="card" height={120} />
            ))}
          </div>
          <Skeleton variant="card" height={320} />
        </div>
      ) : (
        <>
          <PaymentsKpis summary={summary} />
          <RevenueChart summary={summary ?? undefined} />
          <PayoutsTable />
        </>
      )}
    </div>
  );
};

export default PaymentsPage;
