import React, { useState } from 'react';
import { Download, RefreshCw, Users, Activity, CheckSquare, TrendingUp, MapPin, Check } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { useAnalytics } from '../hooks/useAnalytics';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Segmented } from '../../../components/ui/Segmented';
import { KpiCard } from '../../../components/ui/KpiCard';
import { Card } from '../../../components/ui/Card';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { StatusPill } from '../../../components/ui/StatusPill';
import { EmptyState } from '../../../components/ui/EmptyState';
import { GroupedBarChart } from '../../../components/charts/GroupedBarChart';

export const AnalyticsPage: React.FC = () => {
  const { t, isRtl } = useLanguage();
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | '90d' | 'ytd'>('30d');
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
    refresh,
  } = useAnalytics(timeFilter);

  const handleExportCSV = () => {
    const csvRows = [
      ['Metric', 'Value', 'Timeframe'],
      ['User Growth', userGrowth ? String(userGrowth.value) : '0', timeFilter],
      ['Active Craftsmen', activeCraftsmen ? String(activeCraftsmen.value) : '0', timeFilter],
      ['Conversion Rate', conversionRate ? `${conversionRate.value}` : '0%', timeFilter],
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sonaa_analytics_${timeFilter}.csv`);
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
        title={t('analytics_title') || 'Marketplace Analytics'}
        subtitle={
          t('analytics_subtitle') ||
          'Comprehensive health metrics, user acquisition velocity, cohort retention, and demand heatmaps'
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
              variant="solid"
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
            {t('status_loading') || 'Loading marketplace analytics...'}
          </span>
        </div>
      ) : error ? (
        <EmptyState
          title="Failed to Load Analytics"
          description={error}
          action={<Button variant="outline" onClick={refresh}>Retry</Button>}
        />
      ) : (
        <>
          {/* 1. KPIs Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 'var(--sp-4)',
              width: '100%',
            }}
          >
            <KpiCard
              icon={<Users size={16} />}
              label={t('analytics_user_growth') || 'User Growth'}
              value={userGrowth.value}
              delta={userGrowth.isPositive ? 14.2 : -5.0}
              caption={t('analytics_new_signups') || 'New signups'}
            />
            <KpiCard
              icon={<Activity size={16} />}
              label={t('analytics_active_craftsmen') || 'Active Craftsmen'}
              value={activeCraftsmen.value}
              delta={activeCraftsmen.isPositive ? 8.1 : -2.0}
              caption={`${activeCraftsmen.rawVal > 6800 ? '312' : '287'} ${t('analytics_online_now') || 'online now'}`}
            />
            <KpiCard
              icon={<CheckSquare size={16} />}
              label={t('analytics_marketplace_activity') || 'Marketplace Activity'}
              value={marketplaceActivity.value}
              delta={marketplaceActivity.isPositive ? 12.5 : -1.0}
              caption={t('analytics_tasks_last_7d') || 'Tasks in last 7 days'}
            />
            <KpiCard
              icon={<TrendingUp size={16} />}
              label={t('analytics_conversion_rate') || 'Conversion Rate'}
              value={conversionRate.value}
              delta={conversionRate.isPositive ? 2.4 : -0.5}
              caption={t('analytics_posted_matched') || 'Posted to matched'}
            />
          </div>

          {/* 2. Charts Row: Cohorts + High Demand Zones */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
              gap: 'var(--sp-4)',
            }}
          >
            {/* Cohorts Chart Card */}
            <Card
              title={t('analytics_user_growth_cohorts') || 'User Growth Cohorts'}
              subtitle={t('analytics_weekly_new_returning') || 'Weekly new vs returning active users'}
            >
              <GroupedBarChart
                categories={cohorts.map((c) => c.week)}
                series={[
                  {
                    name: t('analytics_new') || 'New Users',
                    color: 'var(--chart-1)',
                    values: cohorts.map((c) => c.newUsers),
                  },
                  {
                    name: t('analytics_returning') || 'Returning Users',
                    color: 'var(--chart-2)',
                    values: cohorts.map((c) => c.returningUsers),
                  },
                ]}
                height={220}
              />
            </Card>

            {/* High Demand Zones Card */}
            <Card
              title={t('analytics_high_demand_zones') || 'High Demand Zones'}
              subtitle={t('analytics_riyadh_districts') || 'Jerusalem operational sectors and demand density'}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                {zones.map((zone, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                        <MapPin size={14} style={{ color: 'var(--primary)' }} />
                        <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--on-surface)' }}>
                          {zone.name}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--on-surface-subtle)' }}>
                          {zone.tasksCount} {t('analytics_tasks_count') || 'tasks'}
                        </span>
                        <StatusPill variant="neutral">{zone.trend}</StatusPill>
                      </div>
                    </div>
                    <ProgressBar
                      value={zone.barWidth}
                      max={100}
                      tone={zone.barWidth > 75 ? 'danger' : zone.barWidth > 50 ? 'warning' : 'default'}
                    />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* 3. Platform Health KPIs */}
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span>{t('analytics_platform_health') || 'Platform Health & Operational SLAs'}</span>
                <StatusPill variant="success" dot pulse>
                  <Check size={12} style={{ marginInlineEnd: 4 }} />
                  {t('analytics_all_healthy') || 'All Systems Healthy'}
                </StatusPill>
              </div>
            }
            subtitle={t('analytics_operational_kpis') || 'Key operational indicators vs target benchmarks'}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--sp-4)',
              }}
            >
              {kpis.map((kpi) => (
                <div
                  key={kpi.id}
                  style={{
                    background: 'var(--surface-sunken)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--sp-3)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--sp-2)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--on-surface-subtle)' }}>
                      {t(kpi.nameKey)}
                    </span>
                    <StatusPill variant={kpi.isOnTrack ? 'success' : 'warning'}>
                      {t(kpi.statusKey)}
                    </StatusPill>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--sp-1)' }}>
                    <span style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--on-surface)' }}>
                      {kpi.value}
                    </span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--on-surface-subtle)' }}>
                      {kpi.unit}
                    </span>
                  </div>

                  <ProgressBar
                    value={kpi.value}
                    max={100}
                    tone={kpi.isOnTrack ? 'success' : 'warning'}
                  />
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
