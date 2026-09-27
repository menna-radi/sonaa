import React, { useState, useMemo } from 'react';
import {
  Eye,
  MousePointerClick,
  DollarSign,
  Download,
  Percent,
  BarChart2,
  Calendar,
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { KpiCard } from '../../../components/ui/KpiCard';
import { Select } from '../../../components/ui/FormFields';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { LineChart, LineChartSeries } from '../../../components/charts/LineChart';
import { formatMoney } from '../../../../core/utils/format';

const TRENDS_DATA = {
  impressions: [150000, 210000, 270000, 310000, 300000, 380000, 360000, 440000, 580000, 520000, 610000, 680000, 640000, 720000, 680000, 740000],
  clicks: [5000, 7500, 9500, 11000, 10500, 13500, 12800, 15500, 21000, 18500, 22000, 24500, 23000, 26000, 24500, 27000],
  ctr: [3.1, 3.25, 3.4, 3.5, 3.45, 3.65, 3.6, 3.75, 4.0, 3.85, 4.1, 4.25, 4.15, 4.3, 4.2, 4.35],
  conversions: [250, 380, 480, 550, 520, 680, 640, 780, 1050, 920, 1100, 1220, 1150, 1300, 1220, 1350],
  revenue: [15000, 22000, 28000, 32000, 30500, 39000, 37000, 45000, 60000, 53000, 63000, 70000, 66000, 74000, 70000, 76000],
};

const CHART_LABELS = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'];

interface CampaignComparisonRow {
  id: string;
  name: string;
  impressions: string;
  clicks: string;
  ctr: string;
  conversions: string;
  revenue: string;
  rawImp: number;
  rawClicks: number;
  rawCtr: number;
  rawConv: number;
  rawRevenue: number;
}

const INITIAL_CAMPAIGNS: CampaignComparisonRow[] = [
  { id: '1', name: 'Summer AC Repair Promo', impressions: '124K', clicks: '5,218', ctr: '4.2%', conversions: '842', revenue: '28,000 ₪', rawImp: 124000, rawClicks: 5218, rawCtr: 4.2, rawConv: 842, rawRevenue: 28000 },
  { id: '2', name: 'Jerusalem Deep Cleaning', impressions: '210K', clicks: '8,190', ctr: '3.9%', conversions: '1,204', revenue: '42,000 ₪', rawImp: 210000, rawClicks: 8190, rawCtr: 3.9, rawConv: 1204, rawRevenue: 42000 },
  { id: '3', name: 'Plumbing Emergency Boost', impressions: '89K', clicks: '4,539', ctr: '5.1%', conversions: '612', revenue: '18,000 ₪', rawImp: 89000, rawClicks: 4539, rawCtr: 5.1, rawConv: 612, rawRevenue: 18000 },
  { id: '4', name: 'Electricians Featured Slots', impressions: '152K', clicks: '9,728', ctr: '6.4%', conversions: '980', revenue: '34,000 ₪', rawImp: 152000, rawClicks: 9728, rawCtr: 6.4, rawConv: 980, rawRevenue: 34000 },
  { id: '5', name: 'Ramallah Movers Special', impressions: '65K', clicks: '2,015', ctr: '3.1%', conversions: '340', revenue: '14,000 ₪', rawImp: 65000, rawClicks: 2015, rawCtr: 3.1, rawConv: 340, rawRevenue: 14000 },
];

const TOP_ADS = [
  { name: 'Electricians Featured Slots', value: '6.4%', pct: 100 },
  { name: 'Plumbing Emergency Boost', value: '5.1%', pct: 80 },
  { name: 'Summer AC Repair Promo', value: '4.2%', pct: 65 },
  { name: 'Jerusalem Deep Cleaning', value: '3.9%', pct: 60 },
  { name: 'Painting Pros — Old City', value: '3.7%', pct: 57 },
];

const TOP_CATEGORIES = [
  { name: 'AC Repair', value: '1,612 conv', pct: 100 },
  { name: 'Plumbers', value: '1,284 conv', pct: 80 },
  { name: 'Electricians', value: '980 conv', pct: 60 },
  { name: 'Cleaning', value: '842 conv', pct: 52 },
  { name: 'Painting', value: '618 conv', pct: 38 },
];

const TOP_CITIES = [
  { name: 'Jerusalem (القدس)', value: '1,842 conv', pct: 100 },
  { name: 'Ramallah (رام الله)', value: '1,124 conv', pct: 61 },
  { name: 'Bethlehem (بيت لحم)', value: '624 conv', pct: 34 },
  { name: 'Hebron (الخليل)', value: '380 conv', pct: 21 },
  { name: 'Nablus (نابلس)', value: '158 conv', pct: 9 },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HEATMAP_HOURS = Array.from({ length: 24 }, (_, i) => i);
const LABELED_HOURS = [0, 3, 6, 9, 12, 15, 18, 21];

const generateHeatmapMatrix = () => [
  [0.8, 0.6, 0.5, 0.7, 0.9, 1.1, 1.2, 1.4, 1.8, 3.8, 4.2, 4.5, 5.1, 5.4, 5.2, 4.8, 5.6, 5.8, 6.0, 5.7, 5.2, 4.5, 3.8, 2.1],
  [0.9, 0.7, 0.6, 0.8, 1.0, 1.2, 1.3, 1.5, 1.9, 4.0, 4.4, 4.7, 5.3, 5.6, 5.4, 5.0, 5.8, 6.0, 6.2, 5.9, 5.4, 4.7, 4.0, 2.3],
  [1.0, 0.8, 0.7, 0.9, 1.1, 1.3, 1.4, 1.6, 2.0, 4.2, 4.6, 4.9, 5.5, 5.8, 5.6, 5.2, 6.0, 6.2, 6.4, 6.1, 5.6, 4.9, 4.2, 2.5],
  [0.9, 0.7, 0.6, 0.8, 1.0, 1.2, 1.3, 1.5, 1.9, 4.1, 4.5, 4.8, 5.4, 5.7, 5.5, 5.1, 5.9, 6.1, 6.3, 6.0, 5.5, 4.8, 4.1, 2.4],
  [1.1, 0.9, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.2, 4.5, 4.9, 5.2, 5.8, 6.1, 5.9, 5.5, 6.3, 6.5, 6.7, 6.4, 5.9, 5.2, 4.5, 2.8],
  [1.3, 1.1, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.5, 5.0, 5.4, 5.7, 6.3, 6.6, 6.4, 6.0, 6.8, 7.0, 7.2, 6.9, 6.4, 5.7, 5.0, 3.2],
  [1.2, 1.0, 0.9, 1.1, 1.3, 1.5, 1.7, 1.9, 2.4, 4.8, 5.2, 5.5, 6.1, 6.4, 6.2, 5.8, 6.6, 6.8, 7.0, 6.7, 6.2, 5.5, 4.8, 3.0],
];

const HEATMAP_MATRIX = generateHeatmapMatrix();

const getHeatmapColor = (val: number) => {
  if (val < 1.5) return 'var(--surface-sunken)';
  if (val < 3.0) return 'rgba(37, 99, 235, 0.18)';
  if (val < 4.5) return 'rgba(37, 99, 235, 0.38)';
  if (val < 6.0) return 'rgba(37, 99, 235, 0.65)';
  return 'var(--primary)';
};

export const AdAnalyticsPage: React.FC = () => {
  const { t, isRtl } = useLanguage();

  const [activeMetrics, setActiveMetrics] = useState<string[]>(['impressions', 'clicks']);
  const [hoveredCell, setHoveredCell] = useState<{ day: string; hour: number; val: number } | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('all');

  const stats = useMemo(() => {
    if (selectedCampaignId === 'all') {
      return {
        impressions: '2.42M',
        clicks: '84,231',
        ctr: '3.48%',
        conversions: '4,128',
        revenue: formatMoney(218000, 'ILS'),
      };
    }
    const camp = INITIAL_CAMPAIGNS.find((c) => c.id === selectedCampaignId);
    if (!camp) {
      return {
        impressions: '0',
        clicks: '0',
        ctr: '0%',
        conversions: '0',
        revenue: '0 ₪',
      };
    }
    return {
      impressions: camp.impressions,
      clicks: camp.clicks,
      ctr: camp.ctr,
      conversions: camp.conversions,
      revenue: formatMoney(camp.rawRevenue, 'ILS'),
    };
  }, [selectedCampaignId]);

  const handleMetricToggle = (metric: string) => {
    if (activeMetrics.includes(metric)) {
      if (activeMetrics.length > 1) {
        setActiveMetrics(activeMetrics.filter((m) => m !== metric));
      }
    } else {
      setActiveMetrics([...activeMetrics, metric]);
    }
  };

  const chartSeries: LineChartSeries[] = useMemo(() => {
    const metricDefs: { id: string; name: string; color: string }[] = [
      { id: 'impressions', name: 'Impressions', color: 'var(--chart-1)' },
      { id: 'clicks', name: 'Clicks', color: 'var(--chart-2, #10b981)' },
      { id: 'ctr', name: 'CTR', color: 'var(--chart-3, #f59e0b)' },
      { id: 'conversions', name: 'Conversions', color: 'var(--chart-4, #8b5cf6)' },
      { id: 'revenue', name: 'Revenue', color: 'var(--chart-5, #ec4899)' },
    ];

    return metricDefs.map((def) => {
      let data = TRENDS_DATA[def.id as keyof typeof TRENDS_DATA];
      if (selectedCampaignId !== 'all') {
        const idx = INITIAL_CAMPAIGNS.findIndex((c) => c.id === selectedCampaignId);
        const factor = (idx !== -1 ? idx + 1 : 1) * 0.15 + 0.3;
        data = data.map((v) => Math.round(v * factor));
      }
      return {
        id: def.id,
        name: def.name,
        data,
        color: def.color,
        active: activeMetrics.includes(def.id),
      };
    });
  }, [activeMetrics, selectedCampaignId]);

  const handleExportCSV = () => {
    const headers = ['Campaign', 'Impressions', 'Clicks', 'CTR', 'Conversions', 'Revenue'];
    const rows = INITIAL_CAMPAIGNS.map((c) => [
      `"${c.name.replace(/"/g, '""')}"`,
      c.rawImp,
      c.rawClicks,
      `${c.rawCtr}%`,
      c.rawConv,
      `${c.rawRevenue} ILS`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ad_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: Column<CampaignComparisonRow>[] = [
    {
      key: 'name',
      header: 'Campaign',
      render: (r) => (
        <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
          {r.name}
        </span>
      ),
    },
    {
      key: 'impressions',
      header: 'Imp.',
      align: 'end',
      render: (r) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)' }}>
          {r.impressions}
        </span>
      ),
    },
    {
      key: 'clicks',
      header: 'Clicks',
      align: 'end',
      render: (r) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)' }}>
          {r.clicks}
        </span>
      ),
    },
    {
      key: 'ctr',
      header: 'CTR',
      align: 'end',
      render: (r) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)' }}>
          {r.ctr}
        </span>
      ),
    },
    {
      key: 'conversions',
      header: 'Conv.',
      align: 'end',
      render: (r) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)' }}>
          {r.conversions}
        </span>
      ),
    },
    {
      key: 'revenue',
      header: 'Revenue',
      align: 'end',
      render: (r) => (
        <span style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
          {formatMoney(r.rawRevenue, 'ILS')}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', width: '100%' }}>
      <PageHeader
        title={t('ad_analytics_page_title') || 'Advertisement Analytics'}
        subtitle={t('ad_analytics_page_subtitle') || 'Deep performance insights across all campaigns'}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            <div style={{ width: '180px' }}>
              <Select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                options={[
                  { value: 'all', label: 'All Campaigns' },
                  ...INITIAL_CAMPAIGNS.map((c) => ({ value: c.id, label: c.name })),
                ]}
              />
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--sp-1)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                background: 'var(--surface-base)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                color: 'var(--text-secondary)',
              }}
            >
              <Calendar size={13} />
              <span>Last 30 days</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download size={14} />
              <span>Export</span>
            </Button>
          </div>
        }
      />

      {/* KPI Cards Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 'var(--sp-4)',
          width: '100%',
        }}
      >
        <KpiCard
          icon={<Eye size={16} />}
          label="Impressions"
          value={stats.impressions}
          caption="+12.4% vs last period"
        />
        <KpiCard
          icon={<MousePointerClick size={16} />}
          label="Clicks"
          value={stats.clicks}
          caption="+8.2% vs last period"
        />
        <KpiCard
          icon={<Percent size={16} />}
          label="Average CTR"
          value={stats.ctr}
          caption="+0.3pp vs last period"
        />
        <KpiCard
          icon={<BarChart2 size={16} />}
          label="Conversions"
          value={stats.conversions}
          caption="+18.9% vs last period"
        />
        <KpiCard
          icon={<DollarSign size={16} />}
          label="Revenue"
          value={stats.revenue}
          caption="+23.0% vs last period"
        />
      </div>

      {/* Performance Trends Card */}
      <Card padding="md" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--sp-2)',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: 'var(--font-size-base)', fontWeight: 600 }}>
              Performance Trends
            </h3>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              Toggle metric series to compare
            </span>
          </div>

          <div style={{ display: 'flex', gap: 'var(--sp-1)', flexWrap: 'wrap' }}>
            {(['impressions', 'clicks', 'ctr', 'conversions', 'revenue'] as const).map((m) => {
              const active = activeMetrics.includes(m);
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleMetricToggle(m)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full, 9999px)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    border: '1px solid var(--border-color)',
                    background: active ? 'var(--primary)' : 'var(--surface-sunken)',
                    color: active ? 'var(--on-primary, #ffffff)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)',
                  }}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>

        <LineChart series={chartSeries} labels={CHART_LABELS} height={200} />
      </Card>

      {/* Conversion Funnel & Campaign Comparison */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 1fr) minmax(320px, 1.6fr)',
          gap: 'var(--sp-4)',
          alignItems: 'start',
        }}
      >
        {/* Funnel Card */}
        <Card padding="md" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 'var(--font-size-base)', fontWeight: 600 }}>
              Conversion Funnel
            </h3>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              From initial impression to converted task
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600 }}>1. Impressions</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>2.42M (100%)</span>
              </div>
              <ProgressBar value={100} max={100} tone="default" size="md" />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600 }}>2. Clicks</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>84,231 (3.48%)</span>
              </div>
              <ProgressBar value={60} max={100} tone="default" size="md" />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600 }}>3. Conversions</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>4,128 (4.9% of clicks)</span>
              </div>
              <ProgressBar value={24} max={100} tone="default" size="md" />
            </div>
          </div>
        </Card>

        {/* Campaign Comparison Table Card */}
        <Card padding="md" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 'var(--font-size-base)', fontWeight: 600 }}>
              Campaign Comparison
            </h3>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              Breakdown across active ad campaigns
            </span>
          </div>

          <DataTable
            columns={columns}
            rows={INITIAL_CAMPAIGNS}
            rowKey={(r) => r.id}
          />
        </Card>
      </div>

      {/* Top Distributions Row (3 Columns) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--sp-4)',
        }}
      >
        <Card padding="md" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          <h4 style={{ margin: 0, fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Top Ads by CTR</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            {TOP_ADS.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)' }}>
                  <span>{item.name}</span>
                  <span style={{ fontWeight: 600 }}>{item.value}</span>
                </div>
                <ProgressBar value={item.pct} max={100} size="sm" tone="default" />
              </div>
            ))}
          </div>
        </Card>

        <Card padding="md" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          <h4 style={{ margin: 0, fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Top Categories</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            {TOP_CATEGORIES.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)' }}>
                  <span>{item.name}</span>
                  <span style={{ fontWeight: 600 }}>{item.value}</span>
                </div>
                <ProgressBar value={item.pct} max={100} size="sm" tone="default" />
              </div>
            ))}
          </div>
        </Card>

        <Card padding="md" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          <h4 style={{ margin: 0, fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Top Cities</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            {TOP_CITIES.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)' }}>
                  <span>{item.name}</span>
                  <span style={{ fontWeight: 600 }}>{item.value}</span>
                </div>
                <ProgressBar value={item.pct} max={100} size="sm" tone="default" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Engagement Heatmap Card */}
      <Card padding="md" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 'var(--font-size-base)', fontWeight: 600 }}>
              Engagement Heatmap
            </h3>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              CTR distribution by day of week and hour of day
            </span>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            <span>Low</span>
            <div style={{ display: 'flex', gap: '3px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'var(--surface-sunken)' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'rgba(37, 99, 235, 0.18)' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'rgba(37, 99, 235, 0.38)' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'rgba(37, 99, 235, 0.65)' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'var(--primary)' }} />
            </div>
            <span>High</span>
          </div>
        </div>

        {/* 24-Column Heatmap Grid */}
        <div style={{ overflowX: 'auto', paddingBottom: 'var(--sp-2)' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '40px repeat(24, minmax(20px, 1fr))',
              gap: '4px',
              minWidth: '600px',
            }}
          >
            {/* Corner header */}
            <div />
            {HEATMAP_HOURS.map((hr) => (
              <div
                key={hr}
                style={{
                  textAlign: 'center',
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                }}
              >
                {LABELED_HOURS.includes(hr) ? hr : ''}
              </div>
            ))}

            {/* Days rows */}
            {DAYS.map((day, dIdx) => (
              <React.Fragment key={dIdx}>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                  {day}
                </div>
                {HEATMAP_HOURS.map((hr) => {
                  const val = HEATMAP_MATRIX[dIdx][hr];
                  const bgColor = getHeatmapColor(val);
                  return (
                    <div
                      key={hr}
                      onMouseEnter={() => setHoveredCell({ day, hour: hr, val })}
                      onMouseLeave={() => setHoveredCell(null)}
                      style={{
                        height: '22px',
                        borderRadius: '3px',
                        background: bgColor,
                        cursor: 'pointer',
                        transition: 'transform 0.1s',
                      }}
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {hoveredCell && (
          <div
            style={{
              padding: 'var(--sp-2) var(--sp-3)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--surface-inverse)',
              color: 'var(--on-inverse)',
              fontSize: 'var(--font-size-xs)',
              alignSelf: 'flex-start',
            }}
          >
            <strong>{hoveredCell.day}</strong>, {hoveredCell.hour}:00 &bull; CTR:{' '}
            <strong>{hoveredCell.val}%</strong>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdAnalyticsPage;
