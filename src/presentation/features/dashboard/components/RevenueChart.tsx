import React, { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { PaymentSummary } from '../../../../domain/entities/Payment';
import type { RevenueAnalytics } from '../../../../domain/repositories/MetricRepository';
import { Card } from '../../../components/ui/Card';
import { AreaChart } from '../../../components/charts/AreaChart';
import { formatMoney } from '../../../../core/utils/format';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface RevenueChartProps {
  /** Live revenue analytics from GET /admin/overview-stats → analytics. */
  analytics?: RevenueAnalytics | null;
}

const VIEW_W = 600;
const VIEW_H = 160;
const PAD_X = 10;
const TOP = 20;
const BASELINE = 150;

/** Map a backend revenue series onto the 600×160 chart space. */
const toPoints = (series: Array<{ revenue: number }>): { points: string; fillPoints: string } => {
  if (series.length === 0) return { points: '', fillPoints: '' };
  const max = Math.max(...series.map((p) => p.revenue), 0);
  const step = series.length > 1 ? (VIEW_W - PAD_X * 2) / (series.length - 1) : 0;
  const coords = series.map((p, i) => {
    const x = Math.round(PAD_X + i * step);
    const y = max > 0 ? Math.round(BASELINE - (p.revenue / max) * (BASELINE - TOP)) : BASELINE;
    return `${x},${y}`;
  });
  return {
    points: coords.join(' '),
    fillPoints: `${coords.join(' ')} ${VIEW_W},${VIEW_H} ${PAD_X},${VIEW_H}`,
  };
};

/** Honest trend: avg of last 7 points vs avg of the 7 before (both from live data). */
const deriveTrend = (series: Array<{ revenue: number }>): number | null => {
  if (series.length < 4) return null;
  const tail = series.slice(-7);
  const prev = series.slice(-14, -7);
  const avg = (arr: Array<{ revenue: number }>) =>
    arr.reduce((sum, p) => sum + p.revenue, 0) / (arr.length || 1);
  const base = prev.length > 0 ? avg(prev) : avg(series.slice(0, Math.max(1, series.length - 7)));
  if (base <= 0) return null;
  return ((avg(tail) - base) / base) * 100;
};

export const RevenueChart: React.FC<RevenueChartProps> = ({ analytics }) => {
  const { t, language } = useLanguage();
  const { repositories } = useDependencies();
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

  const series = analytics?.series || [];
  const { points, fillPoints } = useMemo(() => toPoints(series), [series]);
  const trend = useMemo(() => deriveTrend(series), [series]);

  // Header comes from the live payment summary (no fabricated fallbacks).
  const displayRevenue = formatMoney(summary?.netRevenue || 0, 'ILS', language);

  // Footer stats prefer the live overview analytics, then the payment summary.
  const gmv = analytics?.gmv ?? summary?.gmvMtd ?? 0;
  const takeRate = analytics?.takeRate ?? summary?.takeRate ?? 0;
  const avgOrder = analytics?.avgOrderValue ?? 0;
  const disputeRate = analytics?.disputeRate ?? 0;

  const trendPositive = (trend || 0) >= 0;

  return (
    <Card
      eyebrow={t('sec_revenue_analytics') || 'Revenue Analytics'}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 'var(--fs-display)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            {displayRevenue}
          </span>
          {trend != null && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                color: trendPositive ? 'var(--success)' : 'var(--danger)',
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {trendPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {`${trendPositive ? '+' : ''}${trend.toFixed(1)}%`}
            </span>
          )}
        </div>
      }
      actions={
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            whiteSpace: 'nowrap',
          }}
        >
          Last 30 days
        </span>
      }
      style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      <p style={{ margin: '0 0 var(--space-4) 0', fontSize: 'var(--fs-caption)', color: 'var(--text-muted)' }}>
        Live platform revenue · Compared to prior week
      </p>

      {/* Area Chart */}
      {series.length > 0 ? (
        <AreaChart points={points} fillPoints={fillPoints} height={180} ariaLabel="Revenue analytics chart" />
      ) : (
        <div
          style={{
            height: 180,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px dashed var(--border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-muted)',
            fontSize: 'var(--fs-small)',
          }}
        >
          No revenue data yet
        </div>
      )}

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
            {`${(gmv / 1000000).toFixed(2)}M ILS`}
          </strong>
        </div>
        <div>
          <span style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Take Rate
          </span>
          <strong style={{ display: 'block', fontSize: 'var(--fs-body)', color: 'var(--text-strong)', marginTop: 2 }}>
            {`${takeRate}%`}
          </strong>
        </div>
        <div>
          <span style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Avg Order
          </span>
          <strong style={{ display: 'block', fontSize: 'var(--fs-body)', color: 'var(--text-strong)', marginTop: 2 }}>
            {formatMoney(avgOrder, 'ILS', language)}
          </strong>
        </div>
        <div>
          <span style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Disputes
          </span>
          <strong style={{ display: 'block', fontSize: 'var(--fs-body)', color: 'var(--text-strong)', marginTop: 2 }}>
            {`${disputeRate}%`}
          </strong>
        </div>
      </div>
    </Card>
  );
};
export default RevenueChart;
