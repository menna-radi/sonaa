import React from 'react';
import { DollarSign, TrendingUp, Percent, Clock } from 'lucide-react';
import { KpiCard } from '../../../components/ui/KpiCard';
import { formatMoney } from '../../../../core/utils/format';
import { PaymentSummary } from '../../../../domain/entities/Payment';
import { useLanguage } from '../../../context/LanguageContext';

interface PaymentsKpisProps {
  summary: PaymentSummary | null;
  loading?: boolean;
}

export const PaymentsKpis: React.FC<PaymentsKpisProps> = ({ summary, loading = false }) => {
  const { t, language } = useLanguage();

  const gmv = summary ? formatMoney(summary.gmvMtd, 'ILS', language) : '—';
  const net = summary ? formatMoney(summary.netRevenue, 'ILS', language) : '—';
  const takeRate = summary ? `${summary.takeRate}%` : '—';
  const pending = summary ? formatMoney(summary.pendingPayouts, 'ILS', language) : '—';

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 'var(--sp-4)',
        width: '100%',
      }}
    >
      <KpiCard
        icon={<DollarSign size={16} />}
        label={t('payments_gmv_mtd') || 'GMV (MTD)'}
        value={gmv}
        delta={summary?.gmvChangePct}
        loading={loading}
      />
      <KpiCard
        icon={<TrendingUp size={16} />}
        label={t('payments_net_revenue') || 'Net Revenue'}
        value={net}
        delta={summary?.revenueChangePct}
        loading={loading}
      />
      <KpiCard
        icon={<Percent size={16} />}
        label={t('payments_take_rate') || 'Take Rate'}
        value={takeRate}
        delta={summary?.takeRateChangePct}
        loading={loading}
      />
      <KpiCard
        icon={<Clock size={16} />}
        label={t('payments_pending_payouts') || 'Pending Payouts'}
        value={pending}
        caption={
          summary
            ? `${summary.pendingCraftsmenCount} ${t('payments_craftsmen_count') || 'craftsmen'}`
            : undefined
        }
        loading={loading}
      />
    </div>
  );
};
