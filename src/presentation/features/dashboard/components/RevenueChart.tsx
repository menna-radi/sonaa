import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { PaymentSummary } from '../../../../domain/entities/Payment';
import { Card } from '../../../components/ui/Card';
import { Segmented } from '../../../components/ui/Segmented';
import { AreaChart } from '../../../components/charts/AreaChart';
import { formatMoney } from '../../../../core/utils/format';
import { ArrowUpRight } from 'lucide-react';

export const RevenueChart: React.FC = () => {
  const { t, language } = useLanguage();
  const { repositories } = useDependencies();
  const [timeframe, setTimeframe] = useState<'30d' | '90d' | 'ytd'>('30d');
  const [summary, setSummary] = useState<PaymentSummary | null>(null);

  useEffect(() => {
    let isMounted = true;
    repositories.paymentRepository.getPaymentSummary().then((res) => {
      if (isMounted && res.success) {
        setSummary(res.data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [repositories.paymentRepository]);

  const displayRevenue = summary
    ? formatMoney(summary.netRevenue, 'ILS', language)
    : formatMoney(842308, 'ILS', language);

  const displayGmv = summary
    ? `${(summary.gmvMtd / 1000000).toFixed(2)}M ILS`
    : '4.12M ILS';

  const displayTakeRate = summary ? `${summary.takeRate}%` : '20.4%';

  const chartsData = {
    '30d': {
      points: '10,130 50,120 90,118 130,122 170,112 210,105 250,100 290,108 330,95 370,88 410,90 450,78 490,72 530,70 570,60 600,55',
      fillPoints: '10,130 50,120 90,118 130,122 170,112 210,105 250,100 290,108 330,95 370,88 410,90 450,78 490,72 530,70 570,60 600,55 600,160 10,160',
      trend: '+18.9%',
      sub: 'Last 30 days · Compared to prior month',
    },
    '90d': {
      points: '10,140 70,135 140,110 210,118 280,95 350,102 420,82 490,68 560,50 600,42',
      fillPoints: '10,140 70,135 140,110 210,118 280,95 350,102 420,82 490,68 560,50 600,42 600,160 10,160',
      trend: '+22.4%',
      sub: 'Last 90 days · Compared to prior quarter',
    },
    ytd: {
      points: '10,150 100,130 200,112 300,90 400,68 500,52 600,30',
      fillPoints: '10,150 100,130 200,112 300,90 400,68 500,52 600,30 600,160 10,160',
      trend: '+34.1%',
      sub: 'Year to date · Compared to prior year',
    },
  };

  const activeData = chartsData[timeframe];

  return (
    <Card
      eyebrow={t('sec_revenue_analytics') || 'Revenue Analytics'}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 'var(--fs-display)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            {displayRevenue}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, color: 'var(--success)', fontSize: 13, fontWeight: 700 }}>
            <ArrowUpRight size={14} />
            {activeData.trend}
          </span>
        </div>
      }
      actions={
        <Segmented
          variant="solid"
          value={timeframe}
          onChange={(v) => setTimeframe(v as any)}
          items={[
            { value: '30d', label: '30D' },
            { value: '90d', label: '90D' },
            { value: 'ytd', label: 'YTD' },
          ]}
        />
      }
      style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      <p style={{ margin: '0 0 var(--space-4) 0', fontSize: 'var(--fs-caption)', color: 'var(--text-muted)' }}>
        {activeData.sub}
      </p>

      {/* Area Chart */}
      <AreaChart
        points={activeData.points}
        fillPoints={activeData.fillPoints}
        height={180}
        ariaLabel="Revenue analytics chart"
      />

      {/* Mini Stats Footer Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 'var(--space-4)',
          borderTop: '1px solid var(--border)',
          paddingTop: 'var(--space-4)',
          marginTop: 'var(--space-4)',
        }}
      >
        <div>
          <span style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            GMV
          </span>
          <strong style={{ display: 'block', fontSize: 'var(--fs-body)', color: 'var(--text-strong)', marginTop: 2 }}>
            {displayGmv}
          </strong>
        </div>
        <div>
          <span style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Take Rate
          </span>
          <strong style={{ display: 'block', fontSize: 'var(--fs-body)', color: 'var(--text-strong)', marginTop: 2 }}>
            {displayTakeRate}
          </strong>
        </div>
        <div>
          <span style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Avg Order
          </span>
          <strong style={{ display: 'block', fontSize: 'var(--fs-body)', color: 'var(--text-strong)', marginTop: 2 }}>
            {formatMoney(342, 'ILS', language)}
          </strong>
        </div>
        <div>
          <span style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Disputes
          </span>
          <strong style={{ display: 'block', fontSize: 'var(--fs-body)', color: 'var(--text-strong)', marginTop: 2 }}>
            0.8%
          </strong>
        </div>
      </div>
    </Card>
  );
};
export default RevenueChart;
