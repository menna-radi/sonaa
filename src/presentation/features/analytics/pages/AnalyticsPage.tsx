import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Sidebar } from '../../../../presentation/layouts/Sidebar';
import { Header } from '../../../../presentation/layouts/Header';
import { MobileBottomTabs } from '../../../../presentation/layouts/MobileBottomTabs';
import { useAnalytics } from '../hooks/useAnalytics';
import {
  Download,
  RefreshCw,
  MapPin,
  ArrowUpRight,
  TrendingUp,
  Check,
  AlertTriangle,
  Users,
  CheckSquare,
  Activity,
  Search,
  Bell
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { t } = useLanguage();
  const {
    loading,
    error,
    userGrowth,
    activeCraftsmen,
    marketplaceActivity,
    conversionRate,
    cohorts,
    zones,
    kpis,
    refresh
  } = useAnalytics();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | '90d' | 'ytd'>('7d');
  const [mobileSection, setMobileSection] = useState<'kpis' | 'cohorts' | 'zones'>('kpis');

  const handleExportCSV = () => {
    const csvRows = [
      ['Metric', 'Value', 'Timeframe'],
      ['User Growth', userGrowth ? String(userGrowth) : '0', timeFilter],
      ['Active Craftsmen', activeCraftsmen ? String(activeCraftsmen) : '0', timeFilter],
      ['Conversion Rate', conversionRate ? `${conversionRate}%` : '0%', timeFilter],
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sonaa_analytics_${timeFilter}.csv`);
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
              <div className="mobile-logo">A</div>
              <div className="mobile-logo-text">
                <strong>Arox</strong>
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

        {/* Mobile Subheader */}
        <div className="mobile-subheader mobile-only">
          <h2>{t('nav_analytics') || 'Analytics'}</h2>
          <span>{t('analytics_subtitle')}</span>
        </div>

        <div className="analytics-page-body">
          {/* Desktop/Tablet Page Header */}
          <div className="desktop-tablet-page-header desktop-tablet-only">
            <div style={{ textAlign: 'start' }} className="animate-fade-in">
              <h1 className="analytics-page-title" style={{ margin: 0 }}>
                {t('analytics_title')}
              </h1>
              <p className="analytics-page-subtitle" style={{ margin: '4px 0 0 0' }}>
                {t('analytics_subtitle')}
              </p>
            </div>

            <div className="animate-fade-in" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {/* Date Filter Pills */}
              <div className="time-filter-pills" style={{ display: 'flex', gap: '4px', background: 'var(--bg-surface-hover)', padding: '4px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}>
                {(['7d', '30d', '90d', 'ytd'] as const).map(pill => (
                  <button
                    key={pill}
                    onClick={() => setTimeFilter(pill)}
                    style={{
                      border: 'none',
                      background: timeFilter === pill ? 'var(--bg-surface)' : 'transparent',
                      color: timeFilter === pill ? 'var(--text-primary)' : 'var(--text-secondary)',
                      padding: '6px 12px',
                      borderRadius: 'var(--border-radius-xs)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: timeFilter === pill ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                      transition: 'var(--transition-fast)'
                    }}
                  >
                    {pill.toUpperCase()}
                  </button>
                ))}
              </div>

              <button onClick={handleExportCSV} className="analytics-export-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'var(--color-primary)', borderRadius: 'var(--border-radius-sm)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--bg-base)', border: 'none', cursor: 'pointer' }}>
                <Download size={14} />
                <span>{t('btn_export')}</span>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="glass-card status-danger animate-fade-in" style={{ padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', color: 'var(--color-danger)' }}>
                <AlertTriangle size={20} />
                <div style={{ textAlign: 'start' }}>
                  <strong style={{ display: 'block' }}>Telemetry Failure</strong>
                  <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>{error}</span>
                </div>
              </div>
            </div>
          )}

          {/* Loading View */}
          {loading ? (
            <div className="flex-center" style={{ minHeight: '400px', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <RefreshCw className="animate-spin" size={36} style={{ color: 'var(--color-primary)' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('status_loading')}</p>
            </div>
          ) : !error ? (
            <div className="analytics-content-layout animate-fade-in">

              {/* 1. Metrics Grid */}
              <div className="analytics-metrics-grid">
                {/* User Growth Card */}
                <div className="analytics-metric-card glass-card">
                  <div className="metric-card-top">
                    <div className="metric-icon-wrapper">
                      <Users size={16} />
                    </div>
                    <div className={`metric-trend-tag ${userGrowth.isPositive ? 'trend-positive' : 'trend-negative'}`}>
                      <ArrowUpRight size={10} strokeWidth={3} className="trend-arrow" />
                      <span>{userGrowth.change}</span>
                    </div>
                  </div>
                  <span className="metric-label">{t('analytics_user_growth')}</span>
                  <strong className="metric-value">{userGrowth.value}</strong>
                  <span className="metric-sub">{t('analytics_new_signups')}</span>
                </div>

                {/* Active Craftsmen Card */}
                <div className="analytics-metric-card glass-card">
                  <div className="metric-card-top">
                    <div className="metric-icon-wrapper">
                      <Activity size={16} />
                    </div>
                    <div className={`metric-trend-tag ${activeCraftsmen.isPositive ? 'trend-positive' : 'trend-negative'}`}>
                      <ArrowUpRight size={10} strokeWidth={3} className="trend-arrow" />
                      <span>{activeCraftsmen.change}</span>
                    </div>
                  </div>
                  <span className="metric-label">{t('analytics_active_craftsmen')}</span>
                  <strong className="metric-value">{activeCraftsmen.value}</strong>
                  <span className="metric-sub">
                    <span className="online-dot" />
                    {activeCraftsmen.rawVal > 6800 ? '312' : '287'} {t('analytics_online_now')}
                  </span>
                </div>

                {/* Marketplace Activity Card */}
                <div className="analytics-metric-card glass-card">
                  <div className="metric-card-top">
                    <div className="metric-icon-wrapper">
                      <CheckSquare size={16} />
                    </div>
                    <div className={`metric-trend-tag ${marketplaceActivity.isPositive ? 'trend-positive' : 'trend-negative'}`}>
                      <ArrowUpRight size={10} strokeWidth={3} className="trend-arrow" />
                      <span>{marketplaceActivity.change}</span>
                    </div>
                  </div>
                  <span className="metric-label">{t('analytics_marketplace_activity')}</span>
                  <strong className="metric-value">{marketplaceActivity.value}</strong>
                  <span className="metric-sub">{t('analytics_tasks_last_7d')}</span>
                </div>

                {/* Conversion Rate Card */}
                <div className="analytics-metric-card glass-card">
                  <div className="metric-card-top">
                    <div className="metric-icon-wrapper">
                      <TrendingUp size={16} />
                    </div>
                    <div className={`metric-trend-tag ${conversionRate.isPositive ? 'trend-positive' : 'trend-negative'}`}>
                      <ArrowUpRight size={10} strokeWidth={3} className="trend-arrow" />
                      <span>{conversionRate.change}</span>
                    </div>
                  </div>
                  <span className="metric-label">{t('analytics_conversion_rate')}</span>
                  <strong className="metric-value">{conversionRate.value}</strong>
                  <span className="metric-sub">{t('analytics_posted_matched')}</span>
                </div>
              </div>

              {/* Mobile Navigation Toggle Pills */}
              <div className="mobile-section-toggles mobile-only">
                <button
                  className={`mobile-section-toggle-btn ${mobileSection === 'kpis' ? 'active' : ''}`}
                  onClick={() => setMobileSection('kpis')}
                >
                  {t('tab_analytics_health') || 'Health'}
                </button>
                <button
                  className={`mobile-section-toggle-btn ${mobileSection === 'cohorts' ? 'active' : ''}`}
                  onClick={() => setMobileSection('cohorts')}
                >
                  {t('tab_analytics_cohorts') || 'Cohorts'}
                </button>
                <button
                  className={`mobile-section-toggle-btn ${mobileSection === 'zones' ? 'active' : ''}`}
                  onClick={() => setMobileSection('zones')}
                >
                  {t('tab_analytics_zones') || 'Zones'}
                </button>
              </div>

              {/* 2. Split Rows (Cohorts Chart + High Demand Zones) */}
              <div className={`analytics-middle-row ${mobileSection !== 'kpis' ? 'mobile-visible-block' : 'mobile-hidden'}`}>
                {/* Cohorts Card */}
                <div className={`cohorts-card glass-card ${mobileSection === 'cohorts' ? 'mobile-active-card' : 'mobile-inactive-card'}`}>
                  <div className="cohorts-card-header">
                    <div style={{ textAlign: 'start' }}>
                      <span className="cohorts-card-title">{t('analytics_user_growth_cohorts')}</span>
                      <h4 className="cohorts-card-subtitle">{t('analytics_weekly_new_returning')}</h4>
                    </div>
                    <div className="cohorts-legend">
                      <div className="legend-item">
                        <span className="legend-dot dot-new" />
                        <span>{t('analytics_new')}</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-dot dot-returning" />
                        <span>{t('analytics_returning')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="cohorts-chart-outer-container">
                    <div className="cohorts-chart-inner-container">
                      {cohorts.map((c, index) => {
                        const maxUnit = 176; // Max height representation
                        const scaleFactor = 160 / maxUnit; // Scale to fit nicely in 160px container
                        const newHeight = c.newUsers * scaleFactor;
                        const returningHeight = c.returningUsers * scaleFactor;

                        return (
                          <div key={index} className="cohort-column-wrapper">
                            <div className="cohort-bars-container">
                              {/* Returning Users Bar (Top) */}
                              <div
                                className="cohort-bar returning-bar"
                                style={{ height: `${returningHeight}px` }}
                              >
                                <div className="cohort-tooltip">
                                  <strong>{t('analytics_returning')}:</strong> {(c.returningUsers / 12).toFixed(1)}K
                                </div>
                              </div>
                              {/* Spacer Gap (4px) */}
                              <div className="cohort-bar-gap" />
                              {/* New Users Bar (Bottom) */}
                              <div
                                className="cohort-bar new-bar"
                                style={{ height: `${newHeight}px` }}
                              >
                                <div className="cohort-tooltip">
                                  <strong>{t('analytics_new')}:</strong> {(c.newUsers / 12).toFixed(1)}K
                                </div>
                              </div>
                            </div>
                            <span className="cohort-week-label">{c.week}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* High Demand Zones Card */}
                <div className={`zones-card glass-card ${mobileSection === 'zones' ? 'mobile-active-card' : 'mobile-inactive-card'}`}>
                  <span className="zones-card-title">{t('analytics_high_demand_zones')}</span>
                  <h4 className="zones-card-subtitle">{t('analytics_riyadh_districts')}</h4>

                  <div className="zones-list-container">
                    {zones.map((zone, idx) => (
                      <div key={idx} className="zone-item-wrapper">
                        <div className="zone-info-header">
                          <div className="zone-name-left">
                            <MapPin size={12} className="zone-marker-icon" />
                            <span className="zone-name">{zone.name}</span>
                          </div>
                          <div className="zone-stats-right">
                            <span className="zone-tasks-count">{zone.tasksCount} {t('analytics_tasks_count')}</span>
                            <span className="zone-trend-percent">{zone.trend}</span>
                          </div>
                        </div>
                        <div className="zone-progress-bar-bg">
                          <div
                            className="zone-progress-bar-fill"
                            style={{ width: `${zone.barWidth}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Platform Health KPI Card */}
              <div className={`platform-health-card glass-card ${mobileSection === 'kpis' ? 'mobile-active-card' : 'mobile-inactive-card'}`}>
                <div className="platform-health-header">
                  <div style={{ textAlign: 'start' }}>
                    <span className="platform-health-title">{t('analytics_platform_health')}</span>
                    <h4 className="platform-health-subtitle">{t('analytics_operational_kpis')}</h4>
                  </div>
                  <div className="health-status-badge">
                    <Check size={12} className="health-check-icon" />
                    <span>{t('analytics_all_healthy')}</span>
                  </div>
                </div>

                <div className="platform-health-grid">
                  {kpis.map((kpi) => {
                    const targetText = kpi.id === 'match_rate' ? '90%'
                      : kpi.id === 'eta_accuracy' ? '95%'
                        : kpi.id === 'craftsman_util' ? '75%'
                          : kpi.id === 'dispute_rate' ? '1.5%'
                            : kpi.id === 'refund_rate' ? '2.0%'
                              : '';

                    return (
                      <div key={kpi.id} className="kpi-gauge-card">
                        <div className="kpi-card-header">
                          <span className="kpi-card-name">{t(kpi.nameKey)}</span>
                          <span className={`kpi-status-tag ${kpi.isOnTrack ? 'kpi-on-track' : 'kpi-below-target'}`}>
                            {t(kpi.statusKey)}
                          </span>
                        </div>

                        <div className="kpi-card-body">
                          <strong className="kpi-value-text">{kpi.value}</strong>
                          <span className="kpi-unit-text">{kpi.unit}</span>
                          {targetText && (
                            <span className="kpi-target-label">
                              Target: {targetText}
                            </span>
                          )}
                        </div>

                        <div className="kpi-progress-wrapper">
                          <div className="kpi-progress-bar-bg">
                            <div
                              className="kpi-progress-bar-fill"
                              style={{ width: `${kpi.barWidth}%` }}
                            />
                            {/* Target Marker Indicator */}
                            {kpi.targetWidth && (
                              <div
                                className="kpi-target-marker"
                                style={{
                                  insetInlineStart: `${kpi.targetWidth}%`,
                                  backgroundColor: kpi.isOnTrack ? 'var(--color-success)' : 'var(--text-disabled)'
                                }}
                                title={`Target Indicator (${targetText})`}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          ) : null}

          {/* Sync Button Container */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--spacing-xl)', marginBottom: 'var(--spacing-xl)' }}>
            <button
              onClick={refresh}
              style={{
                background: 'var(--bg-surface-hover)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-sm)',
                padding: '10px 20px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                outline: 'none',
                transition: 'var(--transition-fast)'
              }}
              className="sync-telemetry-btn"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Sync Telemetry Nodes</span>
            </button>
          </div>
        </div>
      </main>

      <MobileBottomTabs />

      <style>{`
        /* --- CSS Global Variables & Layout Integration --- */
        .analytics-page-body {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .analytics-content-layout {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* --- Metric Cards styling --- */
        .analytics-metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .analytics-metric-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: 20px;
          display: flex;
          flex-direction: column;
          text-align: start;
          box-shadow: var(--glass-shadow);
          transition: var(--transition-fast);
          position: relative;
          overflow: hidden;
        }

        .analytics-metric-card:hover {
          transform: translateY(-2px);
          border-color: var(--text-primary);
        }

        .metric-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .metric-icon-wrapper {
          width: 32px;
          height: 32px;
          border-radius: var(--border-radius-sm);
          background: var(--bg-surface-hover);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary);
        }

        .metric-trend-tag {
          display: flex;
          align-items: center;
          gap: 2px;
          font-size: 10px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: var(--border-radius-full);
        }

        .trend-positive {
          color: var(--color-success);
          background: rgba(34, 197, 94, 0.1);
        }

        .trend-negative {
          color: var(--color-danger);
          background: rgba(220, 38, 38, 0.1);
        }

        .trend-arrow {
          flex-shrink: 0;
        }

        /* Reverse trend arrow for RTL mirroring direction if negative */
        [dir="rtl"] .trend-arrow {
          transform: scaleX(-1);
        }

        .metric-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .metric-value {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.2;
          font-family: var(--font-sans);
          letter-spacing: -0.5px;
          margin-bottom: 4px;
        }

        .metric-sub {
          font-size: 10px;
          color: var(--text-disabled);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .online-dot {
          width: 6px;
          height: 6px;
          border-radius: var(--border-radius-full);
          background-color: var(--color-success);
          display: inline-block;
        }

        /* --- Middle Row split styling --- */
        .analytics-middle-row {
          display: flex;
          gap: 16px;
          width: 100%;
        }

        .cohorts-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: 25px;
          box-shadow: var(--glass-shadow);
          display: flex;
          flex-direction: column;
          flex: 3;
          min-width: 0;
          box-sizing: border-box;
        }

        .zones-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: 25px;
          box-shadow: var(--glass-shadow);
          display: flex;
          flex-direction: column;
          flex: 2;
          min-width: 0;
          box-sizing: border-box;
        }

        .cohorts-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0px; /* margin handled by chart container top margin to get exact 24px gap */
        }

        .cohorts-card-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-secondary);
          display: block;
          text-transform: none;
          letter-spacing: normal;
        }

        .zones-card-title, .platform-health-title {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: block;
        }

        .cohorts-card-subtitle {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 6px 0 0 0;
        }

        .zones-card-subtitle, .platform-health-subtitle {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 4px 0 0 0;
        }

        .cohorts-legend {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 3px;
        }

        .dot-new {
          background-color: var(--text-primary);
        }

        .dot-returning {
          background-color: #d4d4d4;
        }

        /* --- Cohort Custom CSS Chart --- */
        .cohorts-chart-outer-container {
          display: flex;
          justify-content: center;
          height: 187px; /* 160px bars + 12px gap + 15px labels */
          margin-top: 24px; /* exact 24px gap from subtitle text to top of bars */
        }

        .cohorts-chart-axis-y {
          display: none;
        }

        .cohorts-chart-inner-container {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-grow: 1;
          position: relative;
          width: 100%;
          max-width: 431px; /* spans full card content width: 481px - 50px padding = 431px */
          margin: 0 auto;
        }

        .cohort-column-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 44px;
          height: 100%;
          justify-content: flex-start; /* align bars to top and labels underneath */
        }

        .cohort-bars-container {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          width: 100%;
          height: 160px;
          position: relative;
          cursor: pointer;
        }

        .cohort-bar {
          width: 100%;
          border-radius: 6px;
          transition: transform var(--transition-fast), filter var(--transition-fast);
          position: relative;
        }

        .cohort-bar:hover {
          filter: brightness(1.1);
          transform: scaleX(1.05);
        }

        .new-bar {
          background-color: var(--text-primary);
        }

        .returning-bar {
          background-color: #d4d4d4;
        }

        .cohort-bar-gap {
          height: 6px;
          width: 100%;
          background: transparent;
          flex-shrink: 0;
        }

        .cohort-week-label {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-disabled);
          margin-top: 12px;
          font-family: var(--font-sans);
        }

        /* Chart Tooltip */
        .cohort-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(-6px);
          background: var(--color-primary);
          color: var(--bg-base);
          padding: 6px 10px;
          border-radius: var(--border-radius-xs);
          font-size: 9px;
          font-weight: 500;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          visibility: hidden;
          transition: opacity var(--transition-fast), visibility var(--transition-fast);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 10;
        }

        /* Tooltip Arrow */
        .cohort-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-width: 4px;
          border-style: solid;
          border-color: var(--color-primary) transparent transparent transparent;
        }

        .cohort-bars-container:hover .cohort-tooltip {
          opacity: 1;
          visibility: visible;
        }

        /* --- High Demand Zones styling --- */
        .zones-list-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 20px;
        }

        .zone-item-wrapper {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .zone-info-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .zone-name-left {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .zone-marker-icon {
          color: var(--text-muted);
        }

        .zone-name {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .zone-stats-right {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 10px;
        }

        .zone-tasks-count {
          color: var(--text-muted);
        }

        .zone-trend-percent {
          font-weight: 700;
          color: var(--color-success);
        }

        .zone-progress-bar-bg {
          height: 4px;
          background-color: var(--bg-surface-hover);
          border-radius: var(--border-radius-full);
          overflow: hidden;
          position: relative;
          width: 100%;
        }

        .zone-progress-bar-fill {
          height: 100%;
          background-color: var(--text-primary);
          border-radius: var(--border-radius-full);
          transition: width var(--transition-slow) cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* --- Platform Health styling --- */
        .platform-health-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: 24px;
          box-shadow: var(--glass-shadow);
        }

        .platform-health-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .health-status-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(34, 197, 94, 0.1);
          color: var(--color-success);
          font-size: 10px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: var(--border-radius-full);
        }

        .platform-health-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .kpi-gauge-card {
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-md);
          padding: 16px;
          display: flex;
          flex-direction: column;
          text-align: start;
          transition: border-color var(--transition-fast);
        }

        .kpi-gauge-card:hover {
          border-color: var(--text-muted);
        }

        .kpi-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .kpi-card-name {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .kpi-status-tag {
          font-size: 9px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: var(--border-radius-xs);
        }

        .kpi-on-track {
          color: var(--color-success);
          background: rgba(34, 197, 94, 0.08);
        }

        .kpi-below-target {
          color: #d97706; /* Dark yellow/orange */
          background: rgba(217, 119, 6, 0.08);
        }

        .kpi-card-body {
          display: flex;
          align-items: baseline;
          margin-bottom: 16px;
          gap: 4px;
        }

        .kpi-value-text {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
          font-family: var(--font-sans);
          letter-spacing: -0.5px;
        }

        .kpi-unit-text {
          font-size: 12px;
          color: var(--text-disabled);
          font-weight: 500;
        }

        .kpi-target-label {
          font-size: 9px;
          color: var(--text-disabled);
          margin-inline-start: auto;
          font-weight: 500;
        }

        .kpi-progress-wrapper {
          width: 100%;
          margin-top: auto;
        }

        .kpi-progress-bar-bg {
          height: 6px;
          background-color: var(--bg-surface-hover);
          border-radius: var(--border-radius-full);
          position: relative;
          width: 100%;
        }

        .kpi-progress-bar-fill {
          height: 100%;
          background-color: var(--text-primary);
          border-radius: var(--border-radius-full);
          transition: width var(--transition-normal);
        }

        .kpi-target-marker {
          position: absolute;
          top: -2px;
          bottom: -2px;
          width: 2px;
          border-radius: 1px;
          z-index: 1;
        }

        /* --- Sync Button animation --- */
        .sync-telemetry-btn:hover {
          background-color: var(--bg-surface-hover) !important;
          color: var(--text-primary) !important;
          border-color: var(--text-muted) !important;
        }

        /* --- Responsive Viewport Tweak Rules --- */

        /* Mobile layout toggle hidden by default on desktop/tablet */
        .mobile-section-toggles {
          display: none;
        }

        /* Tablet Screens (min-width: 769px and max-width: 1024px) */
        @media (min-width: 769px) and (max-width: 1024px) {
          .analytics-metrics-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 16px !important;
          }

          .analytics-middle-row {
            flex-direction: column !important;
            gap: 16px !important;
          }

          .cohorts-card,
          .zones-card {
            flex: unset !important;
            width: 100% !important;
          }

          .cohorts-chart-inner-container {
            max-width: 100% !important;
            justify-content: center !important;
            gap: 26px !important;
          }

          .cohort-column-wrapper {
            width: 40px !important;
          }

          .platform-health-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 16px !important;
          }

          .main-content {
            padding-inline-start: var(--spacing-md) !important;
            padding-inline-end: var(--spacing-md) !important;
          }
        }

        /* Mobile Screens (max-width: 768px) */
        @media (max-width: 768px) {
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

          .analytics-page-body {
            padding: 20px !important;
            gap: 16px !important;
          }

          .analytics-content-layout {
            gap: 16px !important;
          }

          .mobile-bottom-tabs {
            display: flex !important;
          }

          /* Metrics: 2-column list matching Payments page mobile layout */
          .analytics-metrics-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }

          .analytics-metric-card {
            padding: 16px !important;
            border-radius: 16px !important;
          }

          .metric-value {
            font-size: 20px !important;
          }

          /* Toggles Row to switch between cohorts chart, zones progress list, and health metrics */
          .mobile-section-toggles {
            display: flex !important;
            background: var(--bg-surface-hover);
            border: 1px solid var(--border-color);
            padding: 4px;
            border-radius: 12px;
            gap: 4px;
            width: 100%;
            box-sizing: border-box;
            margin-top: 4px;
          }

          .mobile-section-toggle-btn {
            flex: 1;
            border: none;
            background: transparent;
            padding: 8px 6px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 700;
            color: var(--text-secondary);
            cursor: pointer;
            text-align: center;
            transition: background var(--transition-fast), color var(--transition-fast);
            white-space: nowrap;
          }

          .mobile-section-toggle-btn.active {
            background: var(--bg-surface) !important;
            color: var(--text-primary) !important;
            box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
          }

          /* Hide/Show Cards according to active segment */
          .mobile-hidden {
            display: none !important;
          }

          .mobile-visible-block {
            display: block !important;
          }

          .mobile-active-card {
            display: flex !important;
            flex-direction: column !important; /* Force vertical card layout on mobile */
            width: 100% !important;
            box-sizing: border-box;
            border-radius: 16px !important;
            padding: 16px !important;
            margin-top: 8px;
          }

          .mobile-inactive-card {
            display: none !important;
          }

          /* Platform Health layout on mobile */
          .platform-health-card {
            border-radius: 16px !important;
            padding: 16px !important;
            margin-top: 8px;
          }

          .platform-health-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
            margin-top: 16px !important;
          }

          .kpi-gauge-card {
            padding: 12px !important;
            border-radius: 12px !important;
          }

          .kpi-value-text {
            font-size: 20px !important;
          }

          .cohorts-chart-outer-container {
            height: 180px !important;
            margin-top: 16px !important;
          }

          .cohorts-chart-inner-container {
            max-width: 100% !important;
            justify-content: space-between !important;
            padding: 0 10px !important;
            box-sizing: border-box !important;
          }

          .cohort-column-wrapper {
            width: 12% !important;
            max-width: 32px !important;
          }

          .cohort-bars-container {
            width: 100% !important;
            height: 140px !important;
          }

          .cohort-bar {
            border-radius: 4px !important;
          }

          .cohort-bar-gap {
            height: 4px !important;
          }

          .cohort-week-label {
            margin-top: 8px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AnalyticsPage;
