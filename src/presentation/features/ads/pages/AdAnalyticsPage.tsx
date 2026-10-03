import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { AlertBanner } from '../../../components/ui/AlertBanner';
import { Card } from '../../../components/ui/Card';
import { KpiCard } from '../../../components/ui/KpiCard';
import { DataTable } from '../../../components/ui/DataTable';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/EmptyState';
import { Skeleton } from '../../../components/ui/Skeleton';
import { GroupedBarChart } from '../../../components/charts';
import { formatNumber, formatPercentValue } from '../../../../core/utils/format';
import { useCampaigns } from '../hooks/useCampaigns';
import { getCampaignState } from '../components/campaignState';
import type { Campaign } from '../../../../domain/repositories/AdRepository';
import { Eye, MousePointerClick, Percent, Megaphone, BarChart3 } from 'lucide-react';

interface AdAnalyticsPageProps {
  embedded?: boolean;
}

export const AdAnalyticsPage: React.FC<AdAnalyticsPageProps> = ({ embedded = false }) => {
  const { t, language } = useLanguage();
  const campaignsQ = useCampaigns();
  const [now] = useState(() => Date.now());

  const campaigns = campaignsQ.data ?? [];
  const totalImpressions = campaigns.reduce((n, c) => n + (c.impressions || 0), 0);
  const totalClicks = campaigns.reduce((n, c) => n + (c.clicks ?? 0), 0);
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : null;
  const activeCount = campaigns.filter((c) => getCampaignState(c, now) === 'ACTIVE').length;

  const top8 = [...campaigns].sort((a, b) => (b.impressions || 0) - (a.impressions || 0)).slice(0, 8);
  const top5 = top8.slice(0, 5);

  const body = (
    <>
      {campaignsQ.isError && (
        <ErrorState
          title={t('status_error_title')}
          message={campaignsQ.error.message}
          onRetry={() => campaignsQ.refetch()}
          retryLabel={t('btn_retry')}
        />
      )}
      {totalClicks === 0 && !campaignsQ.isLoading && !campaignsQ.isError && (
        <AlertBanner tone="info" title={t('campaigns_clicks_note')} />
      )}
      <div className="ui-kpi-grid ui-kpi-grid--4">
        <KpiCard
          icon={<Eye size={16} />}
          label={t('campaigns_kpi_impressions')}
          value={formatNumber(totalImpressions, language)}
          loading={campaignsQ.isLoading}
        />
        <KpiCard
          icon={<MousePointerClick size={16} />}
          label={t('campaigns_kpi_clicks')}
          value={formatNumber(totalClicks, language)}
          loading={campaignsQ.isLoading}
        />
        <KpiCard
          icon={<Percent size={16} />}
          label={t('campaigns_kpi_ctr')}
          value={ctr === null ? '—' : formatPercentValue(ctr)}
          loading={campaignsQ.isLoading}
        />
        <KpiCard
          icon={<Megaphone size={16} />}
          label={t('campaigns_kpi_active')}
          value={formatNumber(activeCount, language)}
          loading={campaignsQ.isLoading}
        />
      </div>
      <Card title={t('campaigns_top_title')}>
        {top8.length === 0 ? (
          <EmptyState icon={<BarChart3 size={20} />} title={t('empty_campaigns')} />
        ) : (
          <div className="ui-stack">
            <GroupedBarChart
              categories={top8.map((c) => c.name)}
              series={[
                { name: t('campaigns_kpi_impressions'), color: 'var(--chart-1)', values: top8.map((c) => c.impressions || 0) },
                { name: t('campaigns_kpi_clicks'), color: 'var(--chart-2)', values: top8.map((c) => c.clicks ?? 0) },
              ]}
              height={200}
              ariaLabel={t('campaigns_top_title')}
            />
            <DataTable
              columns={[
                {
                  key: 'campaign',
                  header: t('campaigns_col_campaign'),
                  render: (c: Campaign) => <span className="ui-text-strong">{c.name}</span>,
                },
                {
                  key: 'impressions',
                  header: t('campaigns_col_impressions'),
                  align: 'end',
                  render: (c: Campaign) => <bdi className="ui-num">{formatNumber(c.impressions, language)}</bdi>,
                },
                {
                  key: 'clicks',
                  header: t('campaigns_col_clicks'),
                  align: 'end',
                  render: (c: Campaign) => <bdi className="ui-num">{formatNumber(c.clicks ?? 0, language)}</bdi>,
                },
                {
                  key: 'ctr',
                  header: t('campaigns_col_ctr'),
                  align: 'end',
                  render: (c: Campaign) => {
                    const imp = c.impressions || 0;
                    return (
                      <bdi className="ui-num">
                        {imp > 0 ? formatPercentValue(((c.clicks ?? 0) / imp) * 100) : '—'}
                      </bdi>
                    );
                  },
                },
              ]}
              rows={top5}
              rowKey={(c: Campaign) => c.id}
              loading={campaignsQ.isLoading}
              empty={<EmptyState icon={<BarChart3 size={20} />} title={t('empty_campaigns')} />}
              mobile={(c: Campaign) => (
                <div className="campaign-row">
                  <div className="campaign-row__top">
                    <span className="campaign-row__name">{c.name}</span>
                  </div>
                  <div className="ui-caption">
                    <bdi className="ui-num">
                      {formatNumber(c.impressions, language)} {t('campaigns_impressions')}
                      {' · '}
                      {formatNumber(c.clicks ?? 0, language)} {t('campaigns_clicks')}
                    </bdi>
                  </div>
                </div>
              )}
            />
          </div>
        )}
      </Card>
    </>
  );

  if (embedded) return <>{body}</>;

  return (
    <div className="ui-page">
      {campaignsQ.isError ? (
        <ErrorState
          title={t('status_error_title')}
          message={campaignsQ.error.message}
          onRetry={() => campaignsQ.refetch()}
          retryLabel={t('btn_retry')}
        />
      ) : campaignsQ.isLoading ? (
        <Skeleton variant="card" height={320} />
      ) : (
        body
      )}
    </div>
  );
};

export default AdAnalyticsPage;
