import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { PageHeader, Button, EmptyState, Segmented } from '../../../components/ui';
import { formatRelativeTime } from '../../../../core/utils/format';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../../core/query/queryKeys';
import { BillingKpis } from '../components/BillingKpis';
import { RefreshCw } from 'lucide-react';
import '../billing.css';

export type BillingTab = 'receipts' | 'commission' | 'subscribers' | 'plans' | 'settings';

const TABS: BillingTab[] = ['receipts', 'commission', 'subscribers', 'plans', 'settings'];

function readTab(): BillingTab {
  try {
    const v = sessionStorage.getItem('billing_tab');
    if (v === 'receipts' || v === 'commission' || v === 'subscribers' || v === 'plans' || v === 'settings') {
      return v;
    }
  } catch {
    // storage unavailable — fall through to default
  }
  return 'receipts';
}

export const BillingPage: React.FC = () => {
  const { t, language } = useLanguage();
  const qc = useQueryClient();
  const [tab, setTab] = useState<BillingTab>(readTab);
  const [updatedAt, setUpdatedAt] = useState<number | undefined>(undefined);

  const changeTab = (v: string) => {
    const next = (TABS as string[]).includes(v) ? (v as BillingTab) : 'receipts';
    setTab(next);
    try {
      sessionStorage.setItem('billing_tab', next);
    } catch {
      // storage unavailable — state still works
    }
  };

  const refresh = () => {
    setUpdatedAt(Date.now());
    void qc.invalidateQueries({ queryKey: queryKeys.billing.all });
  };

  return (
    <div className="ui-page">
      <PageHeader
        title={t('billing_title')}
        subtitle={t('billing_subtitle')}
        meta={updatedAt ? `${t('updated')} ${formatRelativeTime(updatedAt, language)}` : undefined}
        actions={
          <Button variant="outline" size="sm" icon={<RefreshCw size={14} />} onClick={refresh}>
            {t('btn_refresh')}
          </Button>
        }
      />
      <BillingKpis onTab={changeTab} />
      <div className="billing-tabs">
        <Segmented
          value={tab}
          onChange={changeTab}
          items={TABS.map((id) => ({ value: id, label: t(`billing_tab_${id}`) }))}
        />
      </div>
      <EmptyState title={t('coming_soon')} />
    </div>
  );
};

export default BillingPage;
