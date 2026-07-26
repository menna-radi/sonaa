import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useNavigation } from '../../../context/NavigationContext';
import { useDashboard } from '../hooks/useDashboard';
import { Sidebar } from '../../../../presentation/layouts/Sidebar';
import { Header } from '../../../../presentation/layouts/Header';
import { MobileBottomTabs } from '../../../../presentation/layouts/MobileBottomTabs';
import { MetricsGrid } from '../components/MetricsGrid';
import { RevenueChart } from '../components/RevenueChart';
import { TopCategories } from '../components/TopCategories';
import { CohortVelocity } from '../components/CohortVelocity';
import { PendingReports } from '../components/PendingReports';
import { ModeratorReview } from '../components/ModeratorReview';
import { LiveActivityPage } from '../../live_activity/pages/LiveActivityPage';
import { CraftsmenPage } from '../../craftsmen/pages/CraftsmenPage';
import { TasksPage } from '../../tasks/pages/TasksPage';
import { VerificationPage } from '../../verification/pages/VerificationPage';
import { ReportsPage } from '../../reports/pages/ReportsPage';
import { PaymentsPage } from '../../payments/pages/PaymentsPage';
import { AnalyticsPage } from '../../analytics/pages/AnalyticsPage';
import { BroadcastPage } from '../../broadcast/pages/BroadcastPage';
import { NotificationsPage } from '../../notifications/pages/NotificationsPage';
import { AdsPage } from '../../ads/pages/AdsPage';
import { ActiveCampaignsPage } from '../../ads/pages/ActiveCampaignsPage';
import { CreateAdPage } from '../../ads/pages/CreateAdPage';
import { PromotionsPage } from '../../ads/pages/PromotionsPage';
import { AdAnalyticsPage } from '../../ads/pages/AdAnalyticsPage';
import { SettingsPage } from '../../settings/pages/SettingsPage';
import { ServiceManagementPage } from '../../service_management/pages/ServiceManagementPage';
import { Calendar, Download, RefreshCw, AlertTriangle, ArrowUpRight, Search, Bell } from 'lucide-react';

// ── Overview (main dashboard) ────────────────────────────────────────────────
const OverviewPage: React.FC = () => {
  const { t } = useLanguage();
  const {
    metrics,
    categories,
    reports,
    submissions,
    cohortData,
    loading,
    error,
    refresh
  } = useDashboard();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const revenueMetric = metrics.find(m => m.id === 'revenue');

  const handleExport = () => {
    // 1. Construct CSV headers and rows with UTF-8 BOM for Arabic support
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
    csvContent += 'Metric,Value\n';
    
    metrics.forEach(m => {
      csvContent += `"${t(m.nameKey)}","${m.value} ${m.unit}"\n`;
    });

    csvContent += '\nCategory,Tasks Count,Percentage\n';
    categories.forEach(c => {
      csvContent += `"${t(c.nameKey)}","${c.tasksCount}","${c.percentage}%"\n`;
    });

    // 2. Trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sonaa_overview_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className="main-content">
        {/* Mobile Header (visible only on mobile) */}
        <div className="mobile-header mobile-only">
          <div className="mobile-header-left">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="mobile-logo-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                textAlign: 'start',
                fontFamily: 'inherit'
              }}
            >
              <div className="mobile-logo">S</div>
              <div className="mobile-logo-text">
                <strong>Sonaa</strong>
                <span>Admin</span>
              </div>
            </button>
          </div>
          <div className="mobile-header-right" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button className="mobile-action-btn"><Search size={16} /></button>
            <button className="mobile-action-btn" style={{ position: 'relative' }}>
              <Bell size={16} />
              <span className="mobile-badge" />
            </button>
          </div>
        </div>

        {/* Mobile Subheader (visible only on mobile) */}
        <div className="mobile-subheader mobile-only">
          <h2>Overview</h2>
          <span>Last 7 days · Updated 2m ago</span>
        </div>

        <div className="overview-page-body-content">
          {/* Desktop/Tablet Title row */}
          <div className="desktop-tablet-page-header desktop-tablet-only">
            <div style={{ textAlign: 'start' }} className="animate-fade-in">
              <h1 style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-title)', color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
                {t('overview_title')}
              </h1>
              <p style={{ color: '#ffffff', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                {t('overview_subtitle')}
              </p>
            </div>

            <div className="animate-fade-in" style={{ display: 'flex', gap: '8px' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                <Calendar size={14} />
                <span>{t('last_7_days')}</span>
              </button>
              <button 
                onClick={handleExport}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'var(--color-primary)', borderRadius: 'var(--border-radius-sm)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--bg-base)', cursor: 'pointer', border: 'none' }}
              >
                <Download size={14} />
                <span>{t('btn_export')}</span>
              </button>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="glass-card status-danger animate-fade-in" style={{ padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', color: 'var(--color-danger)' }}>
                <AlertTriangle size={20} />
                <div style={{ textAlign: 'start' }}>
                  <strong style={{ display: 'block' }}>System Failure</strong>
                  <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>{t('status_error')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex-center" style={{ minHeight: '400px', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <RefreshCw className="animate-spin" size={36} style={{ color: 'var(--color-primary)' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('status_loading')}</p>
            </div>
          ) : !error ? (
            <div className="dashboard-content-layout animate-fade-in">

              {/* Mobile revenue hero */}
              {revenueMetric && (
                <div className="mobile-only-hero animate-fade-in">
                  <div className="mobile-revenue-card">
                    <div className="mobile-revenue-glow" />
                    <div className="mobile-revenue-top">
                      <span className="mobile-revenue-label">Revenue MTD</span>
                      <span className="mobile-revenue-trend">
                        <ArrowUpRight size={10} strokeWidth={3} />
                        18.9%
                      </span>
                    </div>
                    <strong className="mobile-revenue-val">842,308 ILS</strong>
                    <span className="mobile-revenue-sub">Net · Commission + subscriptions</span>
                    <div className="mobile-revenue-chart">
                      <svg width="100%" height="48" viewBox="0 0 280 48" preserveAspectRatio="none">
                        <polyline fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeOpacity="0.8" points="0,40 30,35 60,37 90,30 120,32 150,22 180,24 210,18 240,20 270,12 280,10" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              <MetricsGrid metrics={metrics} />

              <div className="layout-split-grid first-row-split" style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: '5.52 5.52 0%', display: 'flex' }} className="revenue-chart-wrapper"><RevenueChart /></div>
                <div style={{ flex: '2.68 2.68 0%', display: 'flex' }} className="top-categories-wrapper"><TopCategories categories={categories} /></div>
              </div>

              {/* Needs attention (Mobile only) */}
              <div className="mobile-only mobile-attention-section animate-fade-in">
                <span className="mobile-attention-section-title">Needs attention</span>
                <div className="mobile-attention-list">
                  {/* Emergency requests card */}
                  <div className="mobile-attention-card emergency">
                    <div className="mobile-attention-icon-wrapper">
                      <AlertTriangle size={14} className="icon-red" />
                    </div>
                    <div className="mobile-attention-content">
                      <strong className="mobile-attention-card-title">Emergency requests</strong>
                      <span className="mobile-attention-card-sub">+23% vs yesterday</span>
                    </div>
                    <div className="mobile-attention-right">
                      <strong className="mobile-attention-value">47</strong>
                      <span className="mobile-attention-chevron">›</span>
                    </div>
                  </div>

                  {/* Verification queue card */}
                  <div className="mobile-attention-card verification">
                    <div className="mobile-attention-icon-wrapper">
                      <AlertTriangle size={14} className="icon-orange" />
                    </div>
                    <div className="mobile-attention-content">
                      <strong className="mobile-attention-card-title">Verification queue</strong>
                      <span className="mobile-attention-card-sub">Avg SLA 3h 12m</span>
                    </div>
                    <div className="mobile-attention-right">
                      <strong className="mobile-attention-value">129</strong>
                      <span className="mobile-attention-chevron">›</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="layout-split-grid second-row-split" style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: '4.81 4.81 0%', display: 'flex' }} className="cohort-velocity-wrapper"><CohortVelocity data={cohortData} /></div>
                <div style={{ flex: '3.39 3.39 0%', display: 'flex' }} className="pending-reports-wrapper"><PendingReports reports={reports} /></div>
              </div>

              {/* Mobile System Status */}
              <div className="mobile-only mobile-status-card animate-fade-in">
                <div className="mobile-status-header">
                  <span className="mobile-status-title">System status</span>
                  <span className="mobile-status-badge">
                    <span className="mobile-status-dot" />
                    All healthy
                  </span>
                </div>
                <div className="mobile-status-grid">
                  <div className="mobile-status-item">
                    <span className="mobile-status-dot" />
                    API Gateway
                  </div>
                  <div className="mobile-status-item">
                    <span className="mobile-status-dot" />
                    Payments
                  </div>
                  <div className="mobile-status-item">
                    <span className="mobile-status-dot" />
                    Notifications
                  </div>
                  <div className="mobile-status-item">
                    <span className="mobile-status-dot" />
                    Geo Services
                  </div>
                </div>
              </div>

              <ModeratorReview submissions={submissions} />
            </div>
          ) : null}

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--spacing-xl)', marginBottom: 'var(--spacing-xl)' }}>
            <button onClick={() => refresh()} style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', padding: '10px 20px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Sync Telemetry Nodes</span>
            </button>
          </div>
        </div>
      </main>

      <MobileBottomTabs />

      <style>{`


        .mobile-only-hero {
          display: none !important;
        }

        .dashboard-content-layout {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        /* Tablet Screens (min-width: 769px and max-width: 1024px) */
        @media (min-width: 769px) and (max-width: 1024px) {
          .layout-split-grid {
            flex-direction: column !important;
            gap: 16px !important;
          }
          .layout-split-grid > div {
            width: 100% !important;
            flex: none !important;
          }
          .main-content {
            padding-inline-start: var(--spacing-md) !important;
            padding-inline-end: var(--spacing-md) !important;
          }
        }

        /* Mobile Screens (max-width: 768px) */
        @media (max-width: 768px) {

          .mobile-only-hero {
            display: block !important;
          }
          .top-header {
            display: none !important;
          }
          .main-content {
            margin-inline-start: 0 !important;
            padding-top: 0 !important;
            padding-bottom: 96px !important;
            padding-inline-start: 0 !important;
            padding-inline-end: 0 !important;
          }
          .overview-page-body-content {
            padding: 20px !important;
          }
          .dashboard-content-layout {
            gap: 16px !important;
          }
          .mobile-bottom-tabs {
            display: flex !important;
          }

          /* Hide split layout components on mobile except TopCategories which is styled internally */
          .first-row-split {
            flex-direction: column !important;
            gap: 16px !important;
          }
          .revenue-chart-wrapper {
            display: none !important;
          }
          .top-categories-wrapper {
            width: 100% !important;
            flex: none !important;
          }
          .second-row-split {
            display: none !important;
          }

          /* Mobile Revenue Hero Card */
          .mobile-revenue-card {
            background: linear-gradient(180deg, #171717 0%, #0A0A0A 100%);
            border-radius: 24px;
            padding: 20px;
            color: #FFFFFF;
            position: relative;
            overflow: hidden;
            text-align: start;
            box-shadow: 0 8px 30px rgba(0,0,0,0.15);
            height: 183.5px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
          }

          .mobile-revenue-glow {
            position: absolute;
            background: rgba(255, 255, 255, 0.05);
            filter: blur(20px);
            width: 160px;
            height: 160px;
            border-radius: 50%;
            top: -48px;
            right: -48px;
            pointer-events: none;
          }

          .mobile-revenue-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
          }

          .mobile-revenue-label {
            font-size: 10px;
            color: #A3A3A3;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
          }

          .mobile-revenue-trend {
            display: flex;
            align-items: center;
            gap: 2px;
            font-size: 10px;
            font-weight: 700;
            color: #4ADE80;
            background: rgba(34, 197, 94, 0.1);
            padding: 3px 8px;
            border-radius: 9999px;
          }

          .mobile-revenue-val {
            font-size: 30px;
            font-weight: 700;
            color: #FFFFFF;
            margin-top: 8px;
            letter-spacing: -0.6px;
            line-height: 1.2;
            font-family: var(--font-sans);
          }

          .mobile-revenue-sub {
            font-size: 11px;
            color: #A3A3A3;
            margin-top: 8px;
          }

          .mobile-revenue-chart {
            position: absolute;
            bottom: 20px;
            left: 20px;
            right: 20px;
            height: 48px;
            opacity: 0.8;
            pointer-events: none;
          }

          /* Duplicate mobile header styles removed (defined in global.css) */

          /* Mobile Needs Attention Cards */
          .mobile-attention-section {
            display: flex !important;
            flex-direction: column;
            gap: 8px;
            text-align: start;
          }
          .mobile-attention-section-title {
            font-size: 10px;
            font-weight: 700;
            color: #737373;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            padding-inline-start: 4px;
          }
          .mobile-attention-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .mobile-attention-card {
            height: 70px;
            border-radius: 16px;
            padding: 16px;
            display: flex;
            align-items: center;
            box-sizing: border-box;
            width: 100%;
          }
          .mobile-attention-card.emergency {
            background: #FEF2F2;
            border: 1px solid #FEE2E2;
            color: #B91C1C;
          }
          .mobile-attention-card.verification {
            background: #FFFBEB;
            border: 1px solid #FEF3C7;
            color: #B45309;
          }
          .mobile-attention-icon-wrapper {
            width: 36px;
            height: 36px;
            border-radius: 12px;
            background: #FFFFFF;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            margin-inline-end: 12px;
          }
          .mobile-attention-content {
            display: flex;
            flex-direction: column;
            text-align: start;
            flex-grow: 1;
          }
          .mobile-attention-card-title {
            font-size: 12px;
            font-weight: 700;
            line-height: 1.3;
          }
          .mobile-attention-card-sub {
            font-size: 10px;
            opacity: 0.8;
            margin-top: 2px;
          }
          .mobile-attention-right {
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .mobile-attention-value {
            font-size: 20px;
            font-weight: 700;
          }
          .mobile-attention-chevron {
            font-size: 18px;
            font-weight: 700;
            opacity: 0.7;
          }
          .icon-red {
            color: #EF4444;
          }
          .icon-orange {
            color: #F59E0B;
          }

          /* Mobile System Status Card */
          .mobile-status-card {
            display: block !important;
            background: #FFFFFF;
            border: 1px solid #E5E5E5;
            border-radius: 16px;
            padding: 16px;
            box-sizing: border-box;
            text-align: start;
          }
          .mobile-status-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
          }
          .mobile-status-title {
            font-size: 12px;
            font-weight: 700;
            color: #171717;
          }
          .mobile-status-badge {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 10px;
            font-weight: 700;
            color: #15803D;
          }
          .mobile-status-dot {
            width: 6px;
            height: 6px;
            background: #22C55E;
            border-radius: 50%;
            display: inline-block;
          }
          .mobile-status-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }
          .mobile-status-item {
            display: flex;
            align-items: center;
            gap: 6px;
            background: #FAFAFA;
            border: 1px solid #E5E5E5;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 10px;
            color: #404040;
            font-weight: 500;
          }
          .mobile-status-item .mobile-status-dot {
            width: 6px;
            height: 6px;
          }
        }
      `}</style>
    </div>
  );
};

// ── Page Router ───────────────────────────────────────────────────────────────
export const DashboardPage: React.FC = () => {
  const { currentPage } = useNavigation();

  switch (currentPage) {
    case 'overview':
      return <OverviewPage />;
    case 'live_activity':
      return <LiveActivityPage />;
    case 'craftsmen':
      return <CraftsmenPage />;
    case 'tasks':
      return <TasksPage />;
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

export default DashboardPage;
