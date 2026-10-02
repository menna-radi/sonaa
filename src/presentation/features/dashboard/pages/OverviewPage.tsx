import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { PageHeader, Button, ErrorState, Skeleton } from '../../../components/ui';
import { formatRelativeTime } from '../../../../core/utils/format';
import { useDashboard } from '../hooks/useDashboard';
import { MetricsGrid } from '../components/MetricsGrid';
import { RevenueChart } from '../components/RevenueChart';
import { TopCategories } from '../components/TopCategories';
import { CohortVelocity } from '../components/CohortVelocity';
import { PendingDisputes } from '../components/PendingDisputes';
import { ModeratorReview } from '../components/ModeratorReview';
import { exportOverviewPdf } from '../utils/overviewPdfExport';
import { Download, RefreshCw } from 'lucide-react';
import '../dashboard.css';

export const OverviewPage: React.FC = () => {
  const { t, language } = useLanguage();
  const q = useDashboard();

  const handleExport = () => {
    try {
      exportOverviewPdf({
        metrics: q.metrics,
        categories: q.categories,
        reports: q.reports,
        submissions: q.submissions,
        verificationTotal: q.verificationTotal,
        cohortData: q.cohortData,
        revenueAnalytics: q.revenueAnalytics,
      });
    } catch (err) {
      console.error('Overview PDF export failed:', err);
    }
  };

  return (
    <div className="ui-page">
      <PageHeader
        title={t('overview_title')}
        subtitle={t('overview_subtitle')}
        meta={q.dataUpdatedAt ? `${t('updated')} ${formatRelativeTime(q.dataUpdatedAt, language)}` : undefined}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw size={14} />}
              loading={q.isFetching}
              onClick={() => q.refresh()}
            >
              {t('btn_refresh')}
            </Button>
            <Button variant="primary" size="sm" icon={<Download size={14} />} onClick={handleExport}>
              {t('btn_export')}
            </Button>
          </>
        }
      />
      {q.error ? (
        <ErrorState
          title={t('status_error_title')}
          message={q.error}
          onRetry={() => q.refresh()}
          retryLabel={t('btn_retry')}
        />
      ) : q.loading ? (
        <div className="ui-stack">
          <div className="ui-kpi-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} variant="card" height={120} />
            ))}
          </div>
          <div className="ui-split ui-split--even">
            <Skeleton variant="card" height={320} />
            <Skeleton variant="card" height={320} />
          </div>
        </div>
      ) : (
        <>
          <MetricsGrid metrics={q.metrics} />
          <div className="ui-split ui-split--even">
            <RevenueChart analytics={q.revenueAnalytics} summary={q.paymentSummary} />
            <TopCategories categories={q.categories} />
          </div>
          <div className="ui-split ui-split--even">
            <CohortVelocity data={q.cohortData} />
            <PendingDisputes reports={q.reports} />
          </div>
          <ModeratorReview submissions={q.submissions} total={q.verificationTotal} />
        </>
      )}
    </div>
  );
};

export default OverviewPage;
