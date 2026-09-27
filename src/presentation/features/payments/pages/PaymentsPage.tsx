import React, { useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { usePayments } from '../hooks/usePayments';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Segmented } from '../../../components/ui/Segmented';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PaymentsKpis } from '../components/PaymentsKpis';
import { RevenueChart } from '../../dashboard/components/RevenueChart';
import { BitSubscriptionManager } from '../components/BitSubscriptionManager';
import { PayoutsTable } from '../components/PayoutsTable';

export const PaymentsPage: React.FC = () => {
  const { t, isRtl } = useLanguage();
  const {
    summary,
    failedTransactions,
    withdrawalRequests,
    loading,
    error,
    retryingId,
    refresh,
    onRetry,
    onApprove,
    onReject,
  } = usePayments();

  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | '90d' | 'ytd'>('30d');

  const handleExportCSV = () => {
    const csvRows = [
      ['ID', 'User', 'Type', 'Amount (ILS)', 'Status', 'Date'],
      ...withdrawalRequests.map((p: any) => [
        p.id,
        p.craftsmanName || p.recipient,
        p.type || 'Payout',
        String(p.amount),
        p.status,
        p.requestedDate || 'Recent',
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sonaa_payments_${timeFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-4)',
        direction: isRtl ? 'rtl' : 'ltr',
      }}
    >
      <PageHeader
        title={t('payments_title') || 'Payments & Subscriptions'}
        subtitle={
          t('payments_subtitle') ||
          'Revenue telemetry, Bit subscription verifications, commission ledger, and craftsman payouts'
        }
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            <Segmented
              value={timeFilter}
              onChange={(v) => setTimeFilter(v as any)}
              items={[
                { value: '7d', label: '7D' },
                { value: '30d', label: '30D' },
                { value: '90d', label: '90D' },
                { value: 'ytd', label: 'YTD' },
              ]}
            />
            <Button
              size="sm"
              variant="outline"
              icon={<Download size={14} />}
              onClick={handleExportCSV}
            >
              {t('btn_export') || 'Export CSV'}
            </Button>
          </div>
        }
      />

      {loading ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 300,
            flexDirection: 'column',
            gap: 'var(--sp-3)',
          }}
        >
          <RefreshCw className="animate-spin" size={32} style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--on-surface-subtle)' }}>
            {t('status_loading') || 'Loading telemetry data...'}
          </span>
        </div>
      ) : error ? (
        <EmptyState
          title="Telemetry Data Unavailable"
          description={error}
          action={<Button variant="outline" onClick={refresh}>Retry</Button>}
        />
      ) : (
        <>
          <PaymentsKpis summary={summary} loading={loading} />

          <RevenueChart />

          <BitSubscriptionManager onRefreshNeeded={refresh} />

          <PayoutsTable
            failedTransactions={failedTransactions}
            withdrawalRequests={withdrawalRequests}
            retryingId={retryingId}
            onRetry={onRetry}
            onApprove={onApprove}
            onReject={onReject}
          />
        </>
      )}
    </div>
  );
};
