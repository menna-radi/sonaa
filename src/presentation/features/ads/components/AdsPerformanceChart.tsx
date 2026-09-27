import React, { useMemo } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Segmented } from '../../../components/ui/Segmented';
import { Campaign } from '../types';

interface AdsPerformanceChartProps {
  campaigns: Campaign[];
  timeFilter: '30d' | '90d' | 'ytd';
  onTimeFilterChange: (val: '30d' | '90d' | 'ytd') => void;
}

export const AdsPerformanceChart: React.FC<AdsPerformanceChartProps> = ({
  campaigns,
  timeFilter,
  onTimeFilterChange,
}) => {
  const chartPaths = useMemo(() => {
    switch (timeFilter) {
      case '30d':
      default:
        return {
          fill: 'M0 200V127.84C16.422 118.219 32.844 123.029 49.266 142.272C65.688 161.515 82.11 144.677 98.532 91.76C114.954 38.8427 131.376 46.0587 147.798 113.408C164.22 180.757 180.642 161.515 197.064 55.68C213.486 -50.1547 229.908 -45.344 246.33 70.112C262.752 185.568 279.174 168.731 295.596 19.6C312.018 -129.531 328.44 -122.315 344.862 41.248C361.284 204.811 377.706 185.568 394.128 -16.48C410.55 -218.528 426.972 -213.717 443.394 -2.048C459.816 209.621 476.238 192.784 492.66 -52.56V200H0Z',
          line: 'M0 127.84C16.422 118.219 32.844 123.029 49.266 142.272C65.688 161.515 82.11 144.677 98.532 91.76C114.954 38.8427 131.376 46.0587 147.798 113.408C164.22 180.757 180.642 161.515 197.064 55.68C213.486 -50.1547 229.908 -45.344 246.33 70.112C262.752 185.568 279.174 168.731 295.596 19.6C312.018 -129.531 328.44 -122.315 344.862 41.248C361.284 204.811 377.706 185.568 394.128 -16.48C410.55 -218.528 426.972 -213.717 443.394 -2.048C459.816 209.621 476.238 192.784 492.66 -52.56',
        };
      case '90d':
        return {
          fill: 'M0 200V140C20 130 40 145 60 110C80 75 100 80 120 120C140 160 160 130 180 80C200 30 220 40 240 90C260 140 280 110 300 50C320 -10 340 0 360 70C380 140 400 110 420 50C440 -10 460 0 492 -30V200H0Z',
          line: 'M0 140C20 130 40 145 60 110C80 75 100 80 120 120C140 160 160 130 180 80C200 30 220 40 240 90C260 140 280 110 300 50C320 -10 340 0 360 70C380 140 400 110 420 50C440 -10 460 0 492 -30',
        };
      case 'ytd':
        return {
          fill: 'M0 200V150C30 130 60 110 90 100C120 90 150 70 180 80C210 90 240 60 270 40C300 20 330 30 360 50C390 70 420 60 450 30C470 10 480 20 492 -10V200H0Z',
          line: 'M0 150C30 130 60 110 90 100C120 90 150 70 180 80C210 90 240 60 270 40C300 20 330 30 360 50C390 70 420 60 450 30C470 10 480 20 492 -10',
        };
    }
  }, [timeFilter]);

  const summary = useMemo(() => {
    const totalImpressions = campaigns.reduce((sum, c) => sum + (c.impressions || 0), 0);
    const totalConversions = campaigns.reduce((sum, c) => sum + (c.conversions || 0), 0);
    const avgCtr =
      totalImpressions > 0
        ? ((totalConversions / totalImpressions) * 100).toFixed(1)
        : '0.0';

    const formatNum = (n: number) => {
      if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
      if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
      return n.toLocaleString();
    };

    return {
      impressions: formatNum(totalImpressions),
      clicks: formatNum(totalConversions),
      conversions: totalConversions.toLocaleString(),
      ctr: `${avgCtr}%`,
    };
  }, [campaigns]);

  return (
    <Card padding="md" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', flex: 2 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 'var(--sp-2)',
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: 'var(--font-size-base)', fontWeight: 600 }}>
            Campaign Performance
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginTop: 'var(--sp-1)' }}>
            <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
              {summary.impressions}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                color: 'var(--color-success)',
              }}
            >
              <ArrowUpRight size={14} />
              <span>Live Trends</span>
            </span>
          </div>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Impressions &bull; Selected window
          </span>
        </div>

        <Segmented
          value={timeFilter}
          onChange={(val) => onTimeFilterChange(val as '30d' | '90d' | 'ytd')}
          items={[
            { value: '30d', label: '30D' },
            { value: '90d', label: '90D' },
            { value: 'ytd', label: 'YTD' },
          ]}
        />
      </div>

      {/* SVG Chart */}
      <div style={{ position: 'relative', width: '100%', height: '180px', overflow: 'hidden' }}>
        <svg
          viewBox="0 0 492.66 200"
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          style={{ overflow: 'visible', display: 'block' }}
        >
          <defs>
            <linearGradient id="adsChartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1="50" x2="492.66" y2="50" stroke="var(--chart-grid)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="0" y1="100" x2="492.66" y2="100" stroke="var(--chart-grid)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="0" y1="150" x2="492.66" y2="150" stroke="var(--chart-grid)" strokeWidth="1" strokeDasharray="3 3" />

          {/* Shaded Area */}
          <path d={chartPaths.fill} fill="url(#adsChartGrad)" />

          {/* Stroke Polyline */}
          <path
            d={chartPaths.line}
            fill="none"
            stroke="var(--chart-1)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Summary Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 'var(--sp-2)',
          paddingTop: 'var(--sp-3)',
          borderTop: '1px solid var(--border-color)',
        }}
      >
        <div>
          <span style={{ display: 'block', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Impressions
          </span>
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
            {summary.impressions}
          </span>
        </div>
        <div>
          <span style={{ display: 'block', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Clicks
          </span>
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
            {summary.clicks}
          </span>
        </div>
        <div>
          <span style={{ display: 'block', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Conversions
          </span>
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
            {summary.conversions}
          </span>
        </div>
        <div>
          <span style={{ display: 'block', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Avg. CTR
          </span>
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
            {summary.ctr}
          </span>
        </div>
      </div>
    </Card>
  );
};
