import React, { Suspense } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useNavigation } from '../../../context/NavigationContext';
import { useDashboard } from '../hooks/useDashboard';
import { AppShell } from '../../../layouts/AppShell';
import { PageHeader, Button, AlertBanner, Skeleton } from '../../../components/ui';
import { MetricsGrid } from '../components/MetricsGrid';
import { RevenueChart } from '../components/RevenueChart';
import { TopCategories } from '../components/TopCategories';
import { CohortVelocity } from '../components/CohortVelocity';
import { PendingReports } from '../components/PendingReports';
import { ModeratorReview } from '../components/ModeratorReview';
import { LiveActivityPage } from '../../live_activity/pages/LiveActivityPage';
import { CraftsmenPage } from '../../craftsmen/pages/CraftsmenPage';
import { TasksPage } from '../../tasks/pages/TasksPage';
import { ChatPage } from '../../chat/pages/ChatPage';
import { VerificationPage } from '../../verification/pages/VerificationPage';
import { ReportsPage } from '../../reports/pages/ReportsPage';
import { PaymentsPage } from '../../payments/pages/PaymentsPage';
import { AnalyticsPage } from '../../analytics/pages/AnalyticsPage';
import { BroadcastPage } from '../../broadcast/pages/BroadcastPage';
import { NotificationsPage } from '../../notifications/pages/NotificationsPage';
// Ads feature pages are lazy-loaded on purpose: their module URLs contain
// ad-filter keywords (ads/campaigns/promotions) that ad-blockers block outright
// (net::ERR_BLOCKED_BY_CLIENT). Static imports would fail the whole module graph
// and render a blank dashboard, so these load on demand behind Suspense +
// PageErrorBoundary (shows a retry fallback instead of a white screen).
const AdsPage = React.lazy(() => import('../../ads/pages/AdsPage'));
const ActiveCampaignsPage = React.lazy(() => import('../../ads/pages/ActiveCampaignsPage'));
const CreateAdPage = React.lazy(() => import('../../ads/pages/CreateAdPage'));
const PromotionsPage = React.lazy(() => import('../../ads/pages/PromotionsPage'));
const AdAnalyticsPage = React.lazy(() => import('../../ads/pages/AdAnalyticsPage'));
import { SettingsPage } from '../../settings/pages/SettingsPage';
import { ServiceManagementPage } from '../../service_management/pages/ServiceManagementPage';
import { Calendar, Download, RefreshCw, AlertTriangle } from 'lucide-react';

// ── Overview (main dashboard) ────────────────────────────────────────────────
const OverviewPage: React.FC = () => {
  const { t } = useLanguage();
  const {
    metrics,
    categories,
    reports,
    submissions,
    verificationTotal,
    cohortData,
    revenueAnalytics,
    loading,
    error,
    refresh,
  } = useDashboard();

  const handleExport = () => {
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
    csvContent += 'Metric,Value\n';

    metrics.forEach((m) => {
      csvContent += `"${t(m.nameKey)}","${m.value} ${m.unit}"\n`;
    });

    csvContent += '\nCategory,Tasks Count,Percentage\n';
    categories.forEach((c) => {
      csvContent += `"${t(c.nameKey)}","${c.tasksCount}","${c.percentage}%"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sonaa_overview_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="overview-page" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)', width: '100%' }}>
      <PageHeader
        title={t('overview_title')}
        subtitle={t('overview_subtitle')}
        actions={
          <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
            <Button
              variant="outline"
              size="sm"
              iconLeading={<Calendar size={14} />}
            >
              {t('last_7_days')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              iconLeading={<Download size={14} />}
              onClick={handleExport}
            >
              {t('btn_export')}
            </Button>
          </div>
        }
      />

      {error && (
        <AlertBanner
          title="System Failure"
          body={t('status_error')}
          icon={<AlertTriangle size={18} />}
        />
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--sp-3)' }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} variant="card" height={120} />
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--sp-4)' }}>
            <Skeleton variant="card" height={320} />
            <Skeleton variant="card" height={320} />
          </div>
        </div>
      ) : !error ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <MetricsGrid metrics={metrics} />

          <div
            className="overview-row-split"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: 'var(--sp-4)',
              alignItems: 'stretch',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <RevenueChart analytics={revenueAnalytics} />
            </div>
            <div style={{ minWidth: 0 }}>
              <TopCategories categories={categories} />
            </div>
          </div>

          <div
            className="overview-row-split"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: 'var(--sp-4)',
              alignItems: 'stretch',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <CohortVelocity data={cohortData} />
            </div>
            <div style={{ minWidth: 0 }}>
              <PendingReports reports={reports} />
            </div>
          </div>

          <ModeratorReview submissions={submissions} total={verificationTotal} />

          <div style={{ display: 'flex', justifyContent: 'center', margin: 'var(--sp-4) 0' }}>
            <Button
              variant="outline"
              size="sm"
              iconLeading={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
              onClick={() => refresh()}
            >
              Sync Telemetry Nodes
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

// ── Page Router wrapped in AppShell ──────────────────────────────────────────
// Catches chunk-load failures (e.g. ad-blocker killing a lazy page) so one
// blocked page degrades to a retry card instead of a blank white dashboard.
class PageErrorBoundary extends React.Component<
  { pageKey: string; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: unknown): void {
    // eslint-disable-next-line no-console
    console.error('Dashboard page failed to render:', error);
  }

  componentDidUpdate(prevProps: { pageKey: string }): void {
    if (prevProps.pageKey !== this.props.pageKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', width: '100%' }}>
          <AlertBanner
            title="Page failed to load"
            body="This section could not be loaded. If you use an ad-blocker, allow this site and try again."
            icon={<AlertTriangle size={18} />}
          />
          <div>
            <Button variant="primary" size="sm" onClick={this.handleRetry}>
              Retry
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const DashboardPage: React.FC = () => {
  const { currentPage } = useNavigation();

  const renderContent = () => {
    switch (currentPage) {
      case 'overview':
        return <OverviewPage />;
      case 'live_activity':
        return <LiveActivityPage />;
      case 'craftsmen':
        return <CraftsmenPage />;
      case 'tasks':
        return <TasksPage />;
      case 'chat':
        return <ChatPage />;
      case 'verification':
        return <VerificationPage />;
      case 'reports':
        return <ReportsPage />;
      case 'payments':
        return <PaymentsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'broadcast':
        return <BroadcastPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'ads':
        return <AdsPage />;
      case 'campaigns':
        return <ActiveCampaignsPage key="campaigns" defaultTab="Active" />;
      case 'scheduled':
        return <ActiveCampaignsPage key="scheduled" defaultTab="Scheduled" />;
      case 'expired':
        return <ActiveCampaignsPage key="expired" defaultTab="Expired" />;
      case 'create_ad':
        return <CreateAdPage />;
      case 'promotions':
        return <PromotionsPage />;
      case 'ad_analytics':
        return <AdAnalyticsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'service_management':
        return <ServiceManagementPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <AppShell>
      <PageErrorBoundary pageKey={currentPage}>
        <Suspense
          fallback={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', width: '100%' }}>
              <Skeleton variant="card" height={120} />
              <Skeleton variant="card" height={320} />
            </div>
          }
        >
          {renderContent()}
        </Suspense>
      </PageErrorBoundary>
    </AppShell>
  );
};

export default DashboardPage;
