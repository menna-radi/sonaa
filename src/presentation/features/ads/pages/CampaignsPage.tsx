import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { PageHeader, Button, Segmented, Skeleton } from '../../../components/ui';
import { formatRelativeTime } from '../../../../core/utils/format';
import { useCampaigns } from '../hooks/useCampaigns';
import { getCampaignState } from '../components/campaignState';
import { CampaignsTable, type CampaignsTab } from '../components/CampaignsTable';
import { AdAnalyticsPage } from './AdAnalyticsPage';
import { RefreshCw } from 'lucide-react';

const TABS: Array<CampaignsTab | 'Analytics'> = ['Active', 'Scheduled', 'Ended', 'Analytics'];

function readTab(): CampaignsTab | 'Analytics' {
  try {
    const v = sessionStorage.getItem('campaigns_tab');
    if (v === 'Active' || v === 'Scheduled' || v === 'Ended' || v === 'Analytics') return v;
  } catch {
    // storage unavailable — fall through to default
  }
  return 'Active';
}

export const CampaignsPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [tab, setTab] = useState<CampaignsTab | 'Analytics'>(readTab);
  const campaignsQ = useCampaigns({ enabled: tab !== 'Analytics' });
  const [now] = useState(() => Date.now());

  const counts = (campaignsQ.data ?? []).reduce(
    (acc, c) => {
      const state = getCampaignState(c, now);
      if (state === 'ACTIVE' || state === 'PAUSED') acc.Active += 1;
      else if (state === 'SCHEDULED') acc.Scheduled += 1;
      else acc.Ended += 1;
      return acc;
    },
    { Active: 0, Scheduled: 0, Ended: 0 }
  );

  const changeTab = (v: string) => {
    const next = (TABS as string[]).includes(v) ? (v as CampaignsTab | 'Analytics') : 'Active';
    setTab(next);
    try {
      sessionStorage.setItem('campaigns_tab', next);
    } catch {
      // storage unavailable — state still works
    }
  };

  return (
    <div className="ui-page">
      <PageHeader
        title={t('nav_campaigns')}
        subtitle={t('campaigns_subtitle')}
        meta={campaignsQ.dataUpdatedAt ? `${t('updated')} ${formatRelativeTime(campaignsQ.dataUpdatedAt, language)}` : undefined}
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw size={14} />}
            loading={campaignsQ.isFetching}
            onClick={() => campaignsQ.refetch()}
          >
            {t('btn_refresh')}
          </Button>
        }
      />
      <div>
        <Segmented
          value={tab}
          onChange={changeTab}
          items={[
            { value: 'Active', label: t('campaigns_tab_active'), count: counts.Active },
            { value: 'Scheduled', label: t('campaigns_tab_scheduled'), count: counts.Scheduled },
            { value: 'Ended', label: t('campaigns_tab_ended'), count: counts.Ended },
            { value: 'Analytics', label: t('campaigns_tab_analytics') },
          ]}
        />
      </div>
      {tab === 'Analytics' ? (
        <AdAnalyticsPage embedded />
      ) : campaignsQ.isLoading ? (
        <Skeleton variant="card" height={320} />
      ) : (
        <CampaignsTable key={tab} tab={tab} />
      )}
    </div>
  );
};

export default CampaignsPage;
