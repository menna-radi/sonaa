import React from 'react';
import { DollarSign, TrendingUp, Percent, Clock, Wallet } from 'lucide-react';
import { KpiCard } from '../../../components/ui/KpiCard';
import { formatMoney } from '../../../../core/utils/format';
import type { PaymentSummary } from '../../../../domain/entities/Payment';
import { useLanguage } from '../../../context/LanguageContext';

interface PaymentsKpisProps {
  summary: PaymentSummary | null;
  loading?: boolean;
}

export const PaymentsKpis: React.FC<PaymentsKpisProps> = ({ summary, loading = false }) => {
  const { t, language } = useLanguage();

  return (
    <div className="ui-kpi-grid ui-kpi-grid--4">
      <KpiCard
        icon={<DollarSign size={16} />}
        label={t('payments_kpi_gmv')}
        value={summary ? formatMoney(summary.gmvMtd, 'ILS', language) : '—'}
        delta={summary?.gmvChangePct ?? null}
        loading={loading}
      />
      <KpiCard
        icon={<TrendingUp size={16} />}
        label={t('payments_kpi_net')}
        value={summary ? formatMoney(summary.netRevenue, 'ILS', language) : '—'}
        delta={summary?.revenueChangePct ?? null}
        loading={loading}
      />
      <KpiCard
        icon={<Percent size={16} />}
        label={t('payments_kpi_take_rate')}
        value={summary ? `${summary.takeRate}%` : '—'}
        delta={summary?.takeRateChangePct ?? null}
        loading={loading}
      />
      <KpiCard
        icon={<Wallet size={16} />}
        label={t('payments_kpi_mrr')}
        value={summary ? formatMoney(summary.mrr, 'ILS', language) : '—'}
        loading={loading}
      />
      {summary && summary.pendingPayouts > 0 && (
        <KpiCard
          icon={<Clock size={16} />}
          label={t('payments_kpi_pending_payouts')}
          value={formatMoney(summary.pendingPayouts, 'ILS', language)}
          caption={`${summary.pendingCraftsmenCount} ${t('payments_craftsmen_count')}`}
          loading={loading}
        />
      )}
    </div>
  );
};

export default PaymentsKpis;
