import React, { useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { useAnalytics, AnalyticsTimeframe } from '../hooks/useAnalytics';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Segmented } from '../../../components/ui/Segmented';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { GroupedBarChart } from '../../../components/charts/GroupedBarChart';
import { AnalyticsKpis } from '../components/AnalyticsKpis';
import { ZonesCard } from '../components/ZonesCard';
import { PlatformHealthCard } from '../components/PlatformHealthCard';
import '../analytics.css';

export const AnalyticsPage: React.FC = () => {
  const { t } = useLanguage();
  const [timeFilter, setTimeFilter] = useState<AnalyticsTimeframe>('30d');
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
    hasTimeframeSupport,
    refresh,
  } = useAnalytics(timeFilter);

  const handleExportCSV = () => {
    const csvRows = [
      ['Metric', 'Value', 'Timeframe'],
      ['User Growth', String(userGrowth.value), timeFilter],
      ['Active Craftsmen', String(activeCraftsmen.value), timeFilter],
      ['Marketplace Activity', String(marketplaceActivity.value), timeFilter],
      ['Conversion Rate', String(conversionRate.value), timeFilter],
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
    <div className="analytics-page">
      <PageHeader
        title={t('analytics_title')}
        subtitle={t('analytics_subtitle')}
        actions={
          <div className="ui-row ui-row--tight">
            {hasTimeframeSupport && (
              <Segmented
                value={timeFilter}
                onChange={(v) => setTimeFilter(v as AnalyticsTimeframe)}
                items={[
                  { value: '7d', label: '7D' },
                  { value: '30d', label: '30D' },
                  { value: '90d', label: '90D' },
                ]}
                variant="solid"
              />
            )}
            <Button
              size="sm"
              variant="outline"
              icon={<Download size={14} />}
              onClick={handleExportCSV}
            >
              {t('btn_export')}
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="ui-col ui-col--center" style={{ minHeight: 300, gap: 'var(--sp-3)' }}>
          <RefreshCw className="animate-spin" size={32} />
          <span className="ui-caption ui-text-muted">
            {t('status_loading')}
          </span>
        </div>
      ) : error ? (
        <EmptyState
          title={t('status_error_title')}
          description={error}
          action={<Button variant="outline" onClick={refresh}>{t('btn_retry')}</Button>}
        />
      ) : (
        <>
          {/* 1. KPIs Row */}
          <AnalyticsKpis
            userGrowth={userGrowth}
            activeCraftsmen={activeCraftsmen}
            marketplaceActivity={marketplaceActivity}
            conversionRate={conversionRate}
            loading={loading}
          />

          {/* 2. Charts Row: Cohorts + High Demand Zones */}
          <div className="analytics-charts-grid">
            {/* Cohorts Chart Card */}
            {cohorts.length > 0 && (
              <Card
                title={t('analytics_user_growth_cohorts')}
                subtitle={t('analytics_weekly_new_returning')}
              >
                <GroupedBarChart
                  categories={cohorts.map((c) => c.week)}
                  series={[
                    {
                      name: t('analytics_new'),
                      color: 'var(--chart-1)',
                      values: cohorts.map((c) => c.newUsers),
                    },
                    {
                      name: t('analytics_returning'),
                      color: 'var(--chart-2)',
                      values: cohorts.map((c) => c.returningUsers),
                    },
                  ]}
                  height={220}
                />
              </Card>
            )}

            {/* High Demand Zones Card - only show if backend B18 deployed */}
            {hasTimeframeSupport && zones.length > 0 && (
              <ZonesCard zones={zones} />
            )}
          </div>

          {/* 3. Platform Health KPIs */}
          <PlatformHealthCard kpis={kpis} />
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
