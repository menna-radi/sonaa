import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useNavigation } from '../../../context/NavigationContext';
import { KpiCard } from '../../../components/ui/KpiCard';
import { formatMoney, formatNumber } from '../../../../core/utils/format';
import type { OverviewBilling } from '../../../../domain/repositories/MetricRepository';
import { Receipt, Wallet, Lock, ArrowDownToLine } from 'lucide-react';

interface BillingSnapshotProps {
  billing: OverviewBilling;
}

const setBillingTab = (tab: 'receipts' | 'commission' | 'subscribers') => {
  try {
    sessionStorage.setItem('billing_tab', tab);
  } catch {
    // storage unavailable — navigation still works
  }
};

export const BillingSnapshot: React.FC<BillingSnapshotProps> = ({ billing }) => {
  const { t, language } = useLanguage();
  const { navigate } = useNavigation();

  return (
    <div>
      <div className="ui-eyebrow">{t('overview_billing_title')}</div>
      <div className="ui-kpi-grid ui-kpi-grid--4">
        <KpiCard
          icon={<Receipt size={16} />}
          label={t('billing_kpi_pending_receipts')}
          value={formatNumber(billing.pendingReceipts, language)}
          onClick={() => {
            setBillingTab('receipts');
            navigate('billing');
          }}
        />
        <KpiCard
          icon={<Wallet size={16} />}
          label={t('billing_kpi_commission_due')}
          value={formatMoney(billing.commissionDueTotal, 'ILS', language)}
          onClick={() => {
            setBillingTab('commission');
            navigate('billing');
          }}
        />
        <KpiCard
          icon={<Lock size={16} />}
          label={t('billing_kpi_locked')}
          value={formatNumber(billing.lockedCraftsmen, language)}
          tone={billing.lockedCraftsmen > 0 ? 'danger' : 'default'}
          onClick={() => {
            setBillingTab('subscribers');
            navigate('billing');
          }}
        />
        <KpiCard
          icon={<ArrowDownToLine size={16} />}
          label={t('payments_kpi_pending_withdrawals')}
          value={formatNumber(billing.pendingWithdrawals, language)}
          onClick={() => navigate('payments')}
        />
      </div>
    </div>
  );
};

export default BillingSnapshot;
