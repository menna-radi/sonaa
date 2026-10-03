import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { KpiCard } from '../../../components/ui/KpiCard';
import { formatMoney, formatNumber } from '../../../../core/utils/format';
import { Receipt, Wallet, Lock, Hourglass } from 'lucide-react';
import { useBillingSummary } from '../hooks/useBilling';
import type { BillingTab } from '../pages/BillingPage';

interface BillingKpisProps {
  onTab: (tab: BillingTab) => void;
}

export const BillingKpis: React.FC<BillingKpisProps> = ({ onTab }) => {
  const { t, language } = useLanguage();
  const s = useBillingSummary();

  return (
    <div className="ui-kpi-grid ui-kpi-grid--4">
      <KpiCard
        icon={<Receipt size={16} />}
        label={t('billing_kpi_pending_receipts')}
        value={formatNumber(s.pendingReceipts, language)}
        loading={s.loading}
        onClick={() => onTab('receipts')}
      />
      <KpiCard
        icon={<Hourglass size={16} />}
        label={t('billing_kpi_pending_commission')}
        value={formatNumber(s.pendingCommissionPayments, language)}
        loading={s.loading}
        onClick={() => onTab('commission')}
      />
      {s.commissionDueTotal !== null && (
        <KpiCard
          icon={<Wallet size={16} />}
          label={t('billing_kpi_commission_due')}
          value={formatMoney(s.commissionDueTotal, 'ILS', language)}
          loading={s.loading}
          onClick={() => onTab('commission')}
        />
      )}
      <KpiCard
        icon={<Lock size={16} />}
        label={t('billing_kpi_locked')}
        value={formatNumber(s.lockedCraftsmen, language)}
        tone={s.lockedCraftsmen > 0 ? 'danger' : 'default'}
        loading={s.loading}
        onClick={() => onTab('subscribers')}
      />
    </div>
  );
};

export default BillingKpis;
