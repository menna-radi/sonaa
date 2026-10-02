import React, { useMemo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { PaymentSummary } from '../../../../domain/entities/Payment';
import type { RevenueAnalytics } from '../../../../domain/repositories/MetricRepository';
import { Card } from '../../../components/ui/Card';
import { AreaChart } from '../../../components/charts/AreaChart';
import { formatMoney } from '../../../../core/utils/format';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface RevenueChartProps {
  /** Live revenue analytics from GET /admin/overview-stats → analytics. */
  analytics?: RevenueAnalytics | null;
  /** Payment summary for the header (null when unavailable). */
  summary?: PaymentSummary | null;
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

export const RevenueChart: React.FC<RevenueChartProps> = ({ analytics, summary }) => {
  const { t, language } = useLanguage();

  const series = useMemo(() => analytics?.series || [], [analytics]);
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
      eyebrow={t('sec_revenue_analytics')}
      title={
        <div className="ov-revenue-title">
          <span className="ov-revenue-value">{displayRevenue}</span>
          {trend != null && (
            <span className={`ov-trend ${trendPositive ? 'ov-trend--up' : 'ov-trend--down'}`}>
              {trendPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {`${trendPositive ? '+' : ''}${trend.toFixed(1)}%`}
            </span>
          )}
        </div>
      }
      className="ov-card-fill"
    >
      <p className="ov-revenue-sub">{t('rev_subtitle')}</p>

      {/* Area Chart */}
      {series.length > 0 ? (
        <AreaChart points={points} fillPoints={fillPoints} height={180} ariaLabel="Revenue analytics chart" />
      ) : (
        <div className="ov-chart-empty">{t('rev_no_data')}</div>
      )}

      {/* Mini Stats Footer Grid */}
      <div className="ov-stats-grid">
        <div>
          <span className="ov-stat-label">{t('rev_gmv')}</span>
          <strong className="ov-stat-value">{formatMoney(gmv, 'ILS', language)}</strong>
        </div>
        <div>
          <span className="ov-stat-label">{t('rev_take_rate')}</span>
          <strong className="ov-stat-value">{`${takeRate}%`}</strong>
        </div>
        <div>
          <span className="ov-stat-label">{t('rev_avg_order')}</span>
          <strong className="ov-stat-value">{formatMoney(avgOrder, 'ILS', language)}</strong>
        </div>
        <div>
          <span className="ov-stat-label">{t('rev_disputes')}</span>
          <strong className="ov-stat-value">{`${disputeRate}%`}</strong>
        </div>
      </div>
    </Card>
  );
};
export default RevenueChart;
