import React, { Suspense } from 'react';
import LanguageContext from '../../../context/LanguageContext';
import { useNavigation } from '../../../context/NavigationContext';
import { AppShell } from '../../../layouts/AppShell';
import { AlertBanner, Button, Skeleton } from '../../../components/ui';
import { OverviewPage } from './OverviewPage';
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
// Ads pages stay lazy: ad-blockers block their module URLs outright.
const CampaignsPage = React.lazy(() => import('../../ads/pages/CampaignsPage'));
const CreateAdPage = React.lazy(() => import('../../ads/pages/CreateAdPage'));
const PromotionsPage = React.lazy(() => import('../../ads/pages/PromotionsPage'));
import { SettingsPage } from '../../settings/pages/SettingsPage';
import { ServiceManagementPage } from '../../service_management/pages/ServiceManagementPage';
import { BillingPage } from '../../billing/pages/BillingPage';
import { UsersPage } from '../../users/pages/UsersPage';
import { AlertTriangle } from 'lucide-react';

class PageErrorBoundary extends React.Component<
  { pageKey: string; children: React.ReactNode },
  { hasError: boolean }
> {
  static contextType = LanguageContext;
  declare context: React.ContextType<typeof LanguageContext>;
  state = { hasError: false };
  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }
  componentDidCatch(error: unknown): void {
    console.error('Dashboard page failed to render:', error);
  }
  componentDidUpdate(prevProps: { pageKey: string }): void {
    if (prevProps.pageKey !== this.props.pageKey && this.state.hasError) this.setState({ hasError: false });
  }
  private handleRetry = (): void => {
    this.setState({ hasError: false });
  };
  render(): React.ReactNode {
    if (this.state.hasError) {
      const t = this.context?.t ?? ((k: string) => k);
      return (
        <div className="ui-page">
          <AlertBanner title={t('page_failed_title')} body={t('page_failed_body')} icon={<AlertTriangle size={18} />} />
          <div>
            <Button variant="primary" size="sm" onClick={this.handleRetry}>
              {t('btn_retry')}
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
      case 'overview': return <OverviewPage />;
      case 'live_activity': return <LiveActivityPage />;
      case 'craftsmen': return <CraftsmenPage />;
      case 'tasks': return <TasksPage />;
      case 'chat': return <ChatPage />;
      case 'verification': return <VerificationPage />;
      case 'reports': return <ReportsPage />;
      case 'payments': return <PaymentsPage />;
      case 'analytics': return <AnalyticsPage />;
      case 'broadcast': return <BroadcastPage />;
      case 'notifications': return <NotificationsPage />;
      case 'ads':
      case 'campaigns':
      case 'scheduled':
      case 'expired':
      case 'ad_analytics': {
        const tab =
          currentPage === 'scheduled' ? 'Scheduled' : currentPage === 'expired' ? 'Ended' : currentPage === 'ad_analytics' ? 'Analytics' : 'Active';
        try {
          sessionStorage.setItem('campaigns_tab', tab);
        } catch {
          // storage unavailable — page defaults to Active
        }
        return <CampaignsPage key={currentPage} />;
      }
      case 'create_ad': return <CreateAdPage />;
      case 'promotions': return <PromotionsPage />;
      case 'settings': return <SettingsPage />;
      case 'service_management': return <ServiceManagementPage />;
      case 'billing': return <BillingPage />;
      case 'users': return <UsersPage />;
      default: return <OverviewPage />;
    }
  };
  return (
    <AppShell>
      <PageErrorBoundary pageKey={currentPage}>
        <Suspense
          fallback={
            <div className="ui-page">
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
