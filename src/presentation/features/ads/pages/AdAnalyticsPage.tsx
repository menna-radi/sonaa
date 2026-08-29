import React, { useState, useMemo } from 'react';
import { 
  Eye, 
  MousePointerClick, 
  DollarSign, 
  ChevronDown, 
  Download, 
  Calendar,
  Percent,
  BarChart2,
  Bell,
  Search
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { Sidebar } from '../../../layouts/Sidebar';
import { Header } from '../../../layouts/Header';
import { MobileBottomTabs } from '../../../layouts/MobileBottomTabs';

// Mock performance trends data for 4 weeks per metric
const TRENDS_DATA = {
  impressions: [150000, 210000, 270000, 310000, 300000, 380000, 360000, 440000, 580000, 520000, 610000, 680000, 640000, 720000, 680000, 740000],
  clicks: [5000, 7500, 9500, 11000, 10500, 13500, 12800, 15500, 21000, 18500, 22000, 24500, 23000, 26000, 24500, 27000],
  ctr: [3.1, 3.25, 3.4, 3.5, 3.45, 3.65, 3.6, 3.75, 4.0, 3.85, 4.1, 4.25, 4.15, 4.3, 4.2, 4.35],
  conversions: [250, 380, 480, 550, 520, 680, 640, 780, 1050, 920, 1100, 1220, 1150, 1300, 1220, 1350],
  revenue: [15000, 22000, 28000, 32000, 30500, 39000, 37000, 45000, 60000, 53000, 63000, 70000, 66000, 74000, 70000, 76000]
};

const CHART_LABELS = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'];

// Mock Campaigns Comparison Table data
const INITIAL_CAMPAIGNS = [
  { id: '1', name: 'Summer AC Repair Promo', impressions: '124K', clicks: '5,218', ctr: '4.2%', conversions: '842', revenue: '28K ILS', rawImp: 124000, rawClicks: 5218, rawCtr: 4.2, rawConv: 842, rawRevenue: 28000 },
  { id: '2', name: 'Jerusalem Deep Cleaning', impressions: '210K', clicks: '8,190', ctr: '3.9%', conversions: '1,204', revenue: '42K ILS', rawImp: 210000, rawClicks: 8190, rawCtr: 3.9, rawConv: 1204, rawRevenue: 42000 },
  { id: '3', name: 'Plumbing Emergency Boost', impressions: '89K', clicks: '4,539', ctr: '5.1%', conversions: '612', revenue: '18K ILS', rawImp: 89000, rawClicks: 4539, rawCtr: 5.1, rawConv: 612, rawRevenue: 18000 },
  { id: '4', name: 'Electricians Featured Slots', impressions: '152K', clicks: '9,728', ctr: '6.4%', conversions: '980', revenue: '34K ILS', rawImp: 152000, rawClicks: 9728, rawCtr: 6.4, rawConv: 980, rawRevenue: 34000 },
  { id: '5', name: 'Ramallah Movers Special', impressions: '65K', clicks: '2,015', ctr: '3.1%', conversions: '340', revenue: '14K ILS', rawImp: 65000, rawClicks: 2015, rawCtr: 3.1, rawConv: 340, rawRevenue: 14000 }
];

// Mock Top lists
const TOP_ADS = [
  { name: 'Electricians Featured Slots', value: '6.4%', width: '100%', active: true },
  { name: 'Plumbing Emergency Boost', value: '5.1%', width: '80%', active: false },
  { name: 'Summer AC Repair Promo', value: '4.2%', width: '65%', active: false },
  { name: 'Jerusalem Deep Cleaning', value: '3.9%', width: '60%', active: false },
  { name: 'Painting Pros — Old City', value: '3.7%', width: '57%', active: false }
];

const TOP_CATEGORIES = [
  { name: 'AC Repair', value: '1,612 conv', width: '100%', active: true },
  { name: 'Plumbers', value: '1,284 conv', width: '80%', active: false },
  { name: 'Electricians', value: '980 conv', width: '60%', active: false },
  { name: 'Cleaning', value: '842 conv', width: '52%', active: false },
  { name: 'Painting', value: '618 conv', width: '38%', active: false }
];

const TOP_CITIES = [
  { name: 'Jerusalem (القدس)', value: '1,842 conv', width: '100%', active: true },
  { name: 'Ramallah (رام الله)', value: '1,124 conv', width: '61%', active: false },
  { name: 'Bethlehem (بيت لحم)', value: '624 conv', width: '34%', active: false },
  { name: 'Hebron (الخليل)', value: '380 conv', width: '21%', active: false },
  { name: 'Nablus (نابلس)', value: '158 conv', width: '9%', active: false }
];

// Heatmap Days and Hours
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// 24 Columns for Heatmap, with labels spaced every 3 columns
const HEATMAP_HOURS = Array.from({ length: 24 }, (_, i) => i);
const LABELED_HOURS = [0, 3, 6, 9, 12, 15, 18, 21];

// Generate heatmap matrix (7 days x 24 hours)
// Morning/early hours (0-8) are low (light gray), working/afternoon/evening hours (9-23) are high (dark charcoal/black)
const generateHeatmapMatrix = () => {
  return [
    // Mon
    [0.8, 0.6, 0.5, 0.7, 0.9, 1.1, 1.2, 1.4, 1.8, 3.8, 4.2, 4.5, 5.1, 5.4, 5.2, 4.8, 5.6, 5.8, 6.0, 5.7, 5.2, 4.5, 3.8, 2.1],
    // Tue
    [0.9, 0.7, 0.6, 0.8, 1.0, 1.2, 1.3, 1.5, 1.9, 4.0, 4.4, 4.7, 5.3, 5.6, 5.4, 5.0, 5.8, 6.0, 6.2, 5.9, 5.4, 4.7, 4.0, 2.3],
    // Wed
    [1.0, 0.8, 0.7, 0.9, 1.1, 1.3, 1.4, 1.6, 2.0, 4.2, 4.6, 4.9, 5.5, 5.8, 5.6, 5.2, 6.0, 6.2, 6.4, 6.1, 5.6, 4.9, 4.2, 2.5],
    // Thu
    [0.9, 0.7, 0.6, 0.8, 1.0, 1.2, 1.3, 1.5, 1.9, 4.1, 4.5, 4.8, 5.4, 5.7, 5.5, 5.1, 5.9, 6.1, 6.3, 6.0, 5.5, 4.8, 4.1, 2.4],
    // Fri
    [1.1, 0.9, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.2, 4.5, 4.9, 5.2, 5.8, 6.1, 5.9, 5.5, 6.3, 6.5, 6.7, 6.4, 5.9, 5.2, 4.5, 2.8],
    // Sat
    [1.3, 1.1, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.5, 5.0, 5.4, 5.7, 6.3, 6.6, 6.4, 6.0, 6.8, 7.0, 7.2, 6.9, 6.4, 5.7, 5.0, 3.2],
    // Sun
    [1.2, 1.0, 0.9, 1.1, 1.3, 1.5, 1.7, 1.9, 2.4, 4.8, 5.2, 5.5, 6.1, 6.4, 6.2, 5.8, 6.6, 6.8, 7.0, 6.7, 6.2, 5.5, 4.8, 3.0]
  ];
};

const HEATMAP_MATRIX = generateHeatmapMatrix();

const getHeatmapColorClass = (val: number) => {
  if (val < 1.5) return 'heat-level-1';
  if (val < 3.0) return 'heat-level-2';
  if (val < 4.5) return 'heat-level-3';
  if (val < 6.0) return 'heat-level-4';
  return 'heat-level-5';
};

export const AdAnalyticsPage: React.FC = () => {
  const { t, isRtl } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // States: activeMetrics is an array supporting multiple selections. Default is Impressions and Clicks active.
  const [activeMetrics, setActiveMetrics] = useState<string[]>(['impressions', 'clicks']);
  const [hoveredCell, setHoveredCell] = useState<{ day: string; hour: number; val: number } | null>(null);
  const [sortField, setSortField] = useState<string>('rawRevenue');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('all');

  // Stats definition (matching Figma mockup)
  const stats = useMemo(() => {
    if (selectedCampaignId === 'all') {
      return {
        impressions: '2.42M',
        impressionsTrend: '+12.4%',
        clicks: '84,231',
        clicksTrend: '+8.2%',
        ctr: '3.48%',
        ctrTrend: '+0.3pp',
        conversions: '4,128',
        conversionsTrend: '+18.9%',
        revenue: isRtl ? '٢١٨,٠٠٠ شيكل' : '218K ILS',
        revenueTrend: '+23%'
      };
    }

    const camp = INITIAL_CAMPAIGNS.find(c => c.id === selectedCampaignId);
    if (!camp) {
      return {
        impressions: '0', impressionsTrend: '0%',
        clicks: '0', clicksTrend: '0%',
        ctr: '0%', ctrTrend: '0%',
        conversions: '0', conversionsTrend: '0%',
        revenue: '0 ILS', revenueTrend: '0%'
      };
    }

    return {
      impressions: camp.impressions,
      impressionsTrend: '+4.5%',
      clicks: camp.clicks,
      clicksTrend: '+2.1%',
      ctr: camp.ctr,
      ctrTrend: '+0.1pp',
      conversions: camp.conversions,
      conversionsTrend: '+5.4%',
      revenue: camp.revenue,
      revenueTrend: '+8.2%'
    };
  }, [selectedCampaignId, isRtl]);

  // Toggle active metric pill
  const handleMetricToggle = (metric: string) => {
    if (activeMetrics.includes(metric)) {
      // Keep at least one metric active
      if (activeMetrics.length > 1) {
        setActiveMetrics(activeMetrics.filter(m => m !== metric));
      }
    } else {
      setActiveMetrics([...activeMetrics, metric]);
    }
  };

  // SVG Chart math and curves drawing
  const chartWidth = 900;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  const getPointsForMetric = (metric: string) => {
    let values = TRENDS_DATA[metric as keyof typeof TRENDS_DATA];
    if (selectedCampaignId !== 'all') {
      const idx = INITIAL_CAMPAIGNS.findIndex(c => c.id === selectedCampaignId);
      const factor = (idx !== -1 ? idx + 1 : 1) * 0.15 + 0.3;
      values = values.map(v => Math.round(v * factor));
    }
    const maxVal = Math.max(...values) * 1.1;
    const minVal = Math.min(...values) * 0.9;
    const range = maxVal - minVal || 1;

    return values.map((val, idx) => {
      const x = (idx / (values.length - 1)) * (chartWidth - paddingX * 2) + paddingX;
      const y = chartHeight - ((val - minVal) / range) * (chartHeight - paddingY * 2) - paddingY;
      return { x, y, val };
    });
  };

  // Generate smooth bezier curve path
  const getBezierPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 3;
      const cpY1 = p0.y;
      const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3;
      const cpY2 = p1.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  // Table handling
  const handleSort = (field: string) => {
    const rawField = `raw${field.charAt(0).toUpperCase()}${field.slice(1)}`;
    if (sortField === rawField) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(rawField);
      setSortAsc(false);
    }
  };

  const sortedCampaigns = [...INITIAL_CAMPAIGNS]
    .sort((a, b) => {
      let valA = (a as any)[sortField];
      let valB = (b as any)[sortField];
      return sortAsc ? valA - valB : valB - valA;
    });

  const handleExport = () => {
    const headers = ['Campaign', 'Impressions', 'Clicks', 'CTR', 'Conversions', 'Revenue'];
    const rows = sortedCampaigns.map(c => [
      `"${c.name.replace(/"/g, '""')}"`,
      c.rawImp,
      c.rawClicks,
      `${c.rawCtr}%`,
      c.rawConv,
      `${c.rawRevenue} ILS`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ad_analytics_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="app-container" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className="main-content">
        {/* Mobile Header (standard Sonaa mobile template) */}
        <div className="mobile-header mobile-only">
          <div className="mobile-header-left">
            <button
              onClick={() => setSidebarOpen(true)}
              className="mobile-logo-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                textAlign: 'start',
                fontFamily: 'inherit'
              }}
            >
              <div className="mobile-logo">A</div>
              <div className="mobile-logo-text">
                <strong>Arox</strong>
                <span>Admin</span>
              </div>
            </button>
          </div>
          <div className="mobile-header-right" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button className="mobile-action-btn"><Search size={16} /></button>
            <button className="mobile-action-btn" style={{ position: 'relative' }}>
              <Bell size={16} />
              <span className="mobile-badge" />
            </button>
          </div>
        </div>

        {/* Mobile Subheader */}
        <div className="mobile-subheader mobile-only">
          <h2>{t('ad_analytics_page_title') || 'Advertisement Analytics'}</h2>
          <span>{t('ad_analytics_page_subtitle') || 'Deep performance insights across all campaigns'}</span>
        </div>

        {/* Desktop & Tablet Top Action Header */}
        <div className="desktop-tablet-page-header desktop-tablet-only">
          <div style={{ textAlign: 'start' }}>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 600, letterSpacing: '-0.7px', color: 'var(--text-primary)' }}>
              {t('ad_analytics_page_title') || 'Advertisement Analytics'}
            </h1>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>
              {t('ad_analytics_page_subtitle') || 'Deep performance insights across all campaigns'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="select-filter-btn"
              style={{
                border: '1px solid var(--border-color)',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--border-radius-sm)',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">{t('ad_analytics_all_campaigns') || 'All Campaigns'}</option>
              {INITIAL_CAMPAIGNS.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div className="select-filter-btn">
              <Calendar size={14} className="calendar-icon" />
              <span>{t('ad_analytics_last_30_days') || 'Last 30 days'}</span>
              <ChevronDown size={14} className="control-chevron" />
            </div>
            <button className="export-download-btn" onClick={handleExport} title="Export CSV Data">
              <Download size={14} />
              <span>{isRtl ? 'تصدير' : 'Export'}</span>
            </button>
          </div>
        </div>

        <div className="analytics-page-body animate-fade-in">

          {/* Grid Area 1: Stats Metric Cards */}
          <div className="stats-cards-grid">
            {/* Impressions */}
            <div 
              className={`stat-metric-card glass-card ${activeMetrics.includes('impressions') ? 'active-outline' : ''}`}
              onClick={() => handleMetricToggle('impressions')}
            >
              <div className="card-header">
                <div className="stat-icon-container">
                  <Eye size={16} />
                </div>
                <span className="trend-green">{stats.impressionsTrend}</span>
              </div>
              <span className="stat-label">{t('ad_analytics_impressions') || 'Impressions'}</span>
              <span className="stat-value">{stats.impressions}</span>
            </div>

            {/* Clicks */}
            <div 
              className={`stat-metric-card glass-card ${activeMetrics.includes('clicks') ? 'active-outline' : ''}`}
              onClick={() => handleMetricToggle('clicks')}
            >
              <div className="card-header">
                <div className="stat-icon-container">
                  <MousePointerClick size={16} />
                </div>
                <span className="trend-green">{stats.clicksTrend}</span>
              </div>
              <span className="stat-label">{t('ad_analytics_clicks') || 'Clicks'}</span>
              <span className="stat-value">{stats.clicks}</span>
            </div>

            {/* CTR */}
            <div 
              className={`stat-metric-card glass-card ${activeMetrics.includes('ctr') ? 'active-outline' : ''}`}
              onClick={() => handleMetricToggle('ctr')}
            >
              <div className="card-header">
                <div className="stat-icon-container">
                  <Percent size={16} />
                </div>
                <span className="trend-green">{stats.ctrTrend}</span>
              </div>
              <span className="stat-label">{t('ad_analytics_ctr') || 'CTR'}</span>
              <span className="stat-value">{stats.ctr}</span>
            </div>

            {/* Conversions */}
            <div 
              className={`stat-metric-card glass-card ${activeMetrics.includes('conversions') ? 'active-outline' : ''}`}
              onClick={() => handleMetricToggle('conversions')}
            >
              <div className="card-header">
                <div className="stat-icon-container">
                  <BarChart2 size={16} />
                </div>
                <span className="trend-green">{stats.conversionsTrend}</span>
              </div>
              <span className="stat-label">{t('ad_analytics_conversions') || 'Conversions'}</span>
              <span className="stat-value">{stats.conversions}</span>
            </div>

            {/* Revenue */}
            <div 
              className={`stat-metric-card glass-card ${activeMetrics.includes('revenue') ? 'active-outline' : ''}`}
              onClick={() => handleMetricToggle('revenue')}
            >
              <div className="card-header">
                <div className="stat-icon-container">
                  <DollarSign size={16} />
                </div>
                <span className="trend-green">{stats.revenueTrend}</span>
              </div>
              <span className="stat-label">{t('ad_analytics_revenue') || 'Revenue'}</span>
              <span className="stat-value">{stats.revenue}</span>
            </div>
          </div>

          {/* Grid Area 2: Performance Trends Card */}
          <div className="chart-large-card glass-card">
            <div className="chart-header-row">
              <div className="chart-title-block">
                <h3>{t('ad_analytics_trends_title') || 'Performance Trends'}</h3>
                <span>{t('ad_analytics_trends_subtitle') || 'Toggle metrics to compare'}</span>
              </div>

              {/* Selector Pills */}
              <div className="chart-metric-selector-pills">
                {(['impressions', 'clicks', 'ctr', 'conversions', 'revenue'] as const).map((m) => (
                  <button 
                    key={m}
                    className={`pill-btn ${activeMetrics.includes(m) ? 'active' : ''}`}
                    onClick={() => handleMetricToggle(m)}
                  >
                    {t(`ad_analytics_${m}`) || m.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Line Chart Canvas */}
            <div className="svg-chart-container">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="svg-line-chart">
                {/* Horizontal dashed grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
                  const y = chartHeight - r * (chartHeight - paddingY * 2) - paddingY;
                  return (
                    <line key={i} x1="30" y1={y} x2={chartWidth - 30} y2={y} className="grid-dashed-line" />
                  );
                })}

                {/* Render active lines */}
                {activeMetrics.map((metric) => {
                  const pts = getPointsForMetric(metric);
                  const pathD = getBezierPath(pts);
                  // Color codes for high contrast chart visualization in dark mode
                  const strokeColor = metric === 'impressions' ? '#3b82f6' : 
                                      metric === 'clicks' ? '#10b981' : 
                                      metric === 'ctr' ? '#f59e0b' : 
                                      metric === 'conversions' ? '#8b5cf6' : '#ec4899';
                  
                  return (
                    <g key={metric}>
                      {/* Bezier Path */}
                      <path 
                        d={pathD} 
                        className="svg-chart-line" 
                        style={{ stroke: strokeColor, strokeWidth: metric === 'impressions' ? '3px' : '2px' }} 
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* X-Axis labels matching grid vertices */}
            <div className="chart-x-axis-labels">
              {CHART_LABELS.map((label, idx) => (
                <span key={idx} className="x-label-item">{label}</span>
              ))}
            </div>
          </div>

          {/* Grid Area 3: Conversion Funnel & Campaign Comparison */}
          <div className="layout-two-columns">
            {/* Funnel Card */}
            <div className="column-funnel-card glass-card">
              <div className="card-header-block">
                <h3>{t('ad_analytics_funnel_title') || 'Conversion Funnel'}</h3>
                <span>{t('ad_analytics_funnel_subtitle') || 'From impression to conversion'}</span>
              </div>

              <div className="funnel-container">
                {/* Step 1 */}
                <div className="funnel-step-item">
                  <div className="step-label-row">
                    <span>{t('ad_analytics_impressions') || 'Impressions'}</span>
                    <span className="step-raw-val">2.42M</span>
                  </div>
                  <div className="step-bar-bg">
                    <div className="step-bar-fill step-1-fill" style={{ width: '100%' }}>
                      <span>100</span>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="funnel-arrow-indicator">↳</div>

                {/* Step 2 */}
                <div className="funnel-step-item">
                  <div className="step-label-row">
                    <span>{t('ad_analytics_clicks') || 'Clicks'}</span>
                    <span className="step-raw-val">84,231</span>
                  </div>
                  <div className="step-bar-bg">
                    <div className="step-bar-fill step-2-fill" style={{ width: '60%' }}>
                      <span>60</span>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="funnel-arrow-indicator">↳</div>

                {/* Step 3 */}
                <div className="funnel-step-item">
                  <div className="step-label-row">
                    <span>{t('ad_analytics_conversions') || 'Conversions'}</span>
                    <span className="step-raw-val">4,128</span>
                  </div>
                  <div className="step-bar-bg">
                    <div className="step-bar-fill step-3-fill" style={{ width: '24%' }}>
                      <span>24</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Table Card */}
            <div className="column-table-card glass-card">
              <div className="table-header-block">
                <div className="title-section">
                  <h3>{t('ad_analytics_comparison_title') || 'Campaign Comparison'}</h3>
                  <span>{t('ad_analytics_comparison_subtitle') || 'Top 5 campaigns by performance'}</span>
                </div>
              </div>

              {/* Data Table */}
              <div className="table-scroll-container">
                <table className="analytics-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('name')} className="sortable text-start">
                        {isRtl ? 'الحملة الإعلانية' : 'Campaign'} {sortField === 'name' ? (sortAsc ? '▲' : '▼') : ''}
                      </th>
                      <th onClick={() => handleSort('imp')} className="sortable text-end">
                        {isRtl ? 'الظهور' : 'Imp.'} {sortField === 'rawImp' ? (sortAsc ? '▲' : '▼') : ''}
                      </th>
                      <th onClick={() => handleSort('clicks')} className="sortable text-end">
                        {isRtl ? 'النقرات' : 'Clicks'} {sortField === 'rawClicks' ? (sortAsc ? '▲' : '▼') : ''}
                      </th>
                      <th onClick={() => handleSort('ctr')} className="sortable text-end">
                        {isRtl ? 'نسبة النقر' : 'CTR'} {sortField === 'rawCtr' ? (sortAsc ? '▲' : '▼') : ''}
                      </th>
                      <th onClick={() => handleSort('conversions')} className="sortable text-end">
                        {isRtl ? 'التحويل' : 'Conv.'} {sortField === 'rawConv' ? (sortAsc ? '▲' : '▼') : ''}
                      </th>
                      <th onClick={() => handleSort('revenue')} className="sortable text-end">
                        {isRtl ? 'الإيرادات' : 'Revenue'} {sortField === 'rawRevenue' ? (sortAsc ? '▲' : '▼') : ''}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCampaigns.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="empty-row">
                          {isRtl ? 'لا توجد نتائج مطابقة.' : 'No matching campaigns.'}
                        </td>
                      </tr>
                    ) : (
                      sortedCampaigns.map((camp) => (
                        <tr key={camp.id}>
                          <td className="campaign-name">{camp.name}</td>
                          <td className="text-end text-muted">{camp.impressions}</td>
                          <td className="text-end text-muted">{camp.clicks}</td>
                          <td className="text-end text-muted">{camp.ctr}</td>
                          <td className="text-end text-muted">{camp.conversions}</td>
                          <td className="text-end bold-revenue">{camp.revenue}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Grid Area 4: Top Distributions Widgets (3 columns) */}
          <div className="layout-three-columns">
            {/* Top CTR */}
            <div className="top-widget-card glass-card">
              <h4>{t('ad_analytics_top_ctr') || 'Top Ads by CTR'}</h4>
              <div className="distribution-list">
                {TOP_ADS.map((item, idx) => (
                  <div key={idx} className="dist-item">
                    <div className="item-labels">
                      <span className="item-name">{item.name}</span>
                      <span className="item-value">{item.value}</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div 
                        className="progress-bar-fill" 
                        style={{ 
                          width: item.width, 
                          backgroundColor: item.active ? 'var(--color-primary)' : 'var(--text-muted)' 
                        }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Categories */}
            <div className="top-widget-card glass-card">
              <h4>{t('ad_analytics_top_categories') || 'Top Categories'}</h4>
              <div className="distribution-list">
                {TOP_CATEGORIES.map((item, idx) => (
                  <div key={idx} className="dist-item">
                    <div className="item-labels">
                      <span className="item-name">{item.name}</span>
                      <span className="item-value">{item.value}</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div 
                        className="progress-bar-fill" 
                        style={{ 
                          width: item.width, 
                          backgroundColor: item.active ? 'var(--color-primary)' : 'var(--text-muted)' 
                        }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Cities */}
            <div className="top-widget-card glass-card">
              <h4>{t('ad_analytics_top_cities') || 'Top Cities'}</h4>
              <div className="distribution-list">
                {TOP_CITIES.map((item, idx) => (
                  <div key={idx} className="dist-item">
                    <div className="item-labels">
                      <span className="item-name">{item.name}</span>
                      <span className="item-value">{item.value}</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div 
                        className="progress-bar-fill" 
                        style={{ 
                          width: item.width, 
                          backgroundColor: item.active ? 'var(--color-primary)' : 'var(--text-muted)' 
                        }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Grid Area 5: Engagement Heatmap */}
          <div className="heatmap-card glass-card">
            <div className="heatmap-header-row">
              <div className="heatmap-title-block">
                <h3>{t('ad_analytics_heatmap_title') || 'Engagement Heatmap'}</h3>
                <span>{t('ad_analytics_heatmap_subtitle') || 'CTR by day of week and hour of day'}</span>
              </div>

              {/* Heatmap Legend */}
              <div className="heatmap-legend">
                <span>{isRtl ? 'منخفض' : 'Low'}</span>
                <div className="legend-blocks-row">
                  <div className="legend-block heat-level-1" />
                  <div className="legend-block heat-level-2" />
                  <div className="legend-block heat-level-3" />
                  <div className="legend-block heat-level-4" />
                  <div className="legend-block heat-level-5" />
                </div>
                <span>{isRtl ? 'مرتفع' : 'High'}</span>
              </div>
            </div>

            {/* 24-Column Heatmap Grid */}
            <div className="heatmap-grid-scroll-wrapper">
              <div className="heatmap-grid-layout">
                {/* Header corner cell */}
                <div className="heatmap-corner-cell" />

                {/* X-axis labels (Hours 0-23, labeled every 3 hours) */}
                {HEATMAP_HOURS.map((hr) => {
                  const isLabeled = LABELED_HOURS.includes(hr);
                  return (
                    <div key={hr} className="heatmap-hour-label">
                      {isLabeled ? hr : ''}
                    </div>
                  );
                })}

                {/* Rows data */}
                {DAYS.map((day, dIdx) => (
                  <React.Fragment key={dIdx}>
                    {/* Y-axis Day label */}
                    <div className="heatmap-day-label">{day}</div>

                    {/* 24 Heat Cells */}
                    {HEATMAP_HOURS.map((hr) => {
                      const val = HEATMAP_MATRIX[dIdx][hr];
                      const colorClass = getHeatmapColorClass(val);
                      return (
                        <div 
                          key={hr} 
                          className={`heatmap-cell-block ${colorClass}`}
                          onMouseEnter={() => setHoveredCell({ day, hour: hr, val })}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          <span className="cell-hover-val">{val}%</span>
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Hover details tooltip */}
            {hoveredCell && (
              <div className="heatmap-detail-tooltip animate-fade-in">
                <strong>{hoveredCell.day}</strong>, {hoveredCell.hour === 0 ? '12:00 AM' : hoveredCell.hour === 12 ? '12:00 PM' : hoveredCell.hour > 12 ? `${hoveredCell.hour - 12}:00 PM` : `${hoveredCell.hour}:00 AM`} 
                <span> — CTR: <strong>{hoveredCell.val}%</strong></span>
              </div>
            )}
          </div>
        </div>

        <MobileBottomTabs />
      </main>

      {/* Premium Stylesheet matching Figma mockup exactly */}
      <style>{`
        /* ── Base Spacing & Layout Structure ── */
        .analytics-page-body {
          display: flex;
          flex-direction: column;
          gap: 32px;
          margin-bottom: 24px;
          width: 100%;
          box-sizing: border-box;
        }

        .analytics-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          flex-wrap: wrap;
          gap: 16px;
        }

        .page-title {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 4px 0;
          text-align: start;
        }

        .page-subtitle {
          font-size: 14px;
          color: var(--text-muted);
          margin: 0;
          text-align: start;
        }

        .actions-controls-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .select-filter-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .select-filter-btn:hover {
          background: var(--bg-surface-hover);
        }

        .control-chevron {
          color: var(--text-muted);
        }

        .export-download-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .export-download-btn:hover {
          background: var(--bg-surface-hover);
          border-color: var(--color-primary);
          color: var(--color-primary);
        }

        /* ── Glass Cards Style ── */
        .glass-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 24px;
          box-shadow: var(--shadow-sm);
          box-sizing: border-box;
        }

        /* ── Metric Cards Grid ── */
        .stats-cards-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
          width: 100%;
        }

        .stat-metric-card {
          cursor: pointer;
          text-align: start;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .stat-metric-card:hover {
          border-color: var(--color-primary);
        }

        .stat-metric-card.active-outline {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 1px var(--color-primary), 0 0 12px rgba(37, 99, 235, 0.2);
        }

        .stat-metric-card .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .stat-icon-container {
          width: 36px;
          height: 36px;
          background: var(--bg-surface-hover);
          border: 1px solid var(--border-color);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary);
        }

        .trend-green {
          font-size: 12px;
          font-weight: 700;
          color: #4ade80;
        }

        .stat-label {
          font-size: 12px;
          color: var(--text-secondary);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          display: block;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.4px;
        }

        /* ── Performance Trends Chart ── */
        .chart-large-card {
          width: 100%;
          text-align: start;
        }

        .chart-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .chart-title-block h3 {
          margin: 0 0 4px 0;
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .chart-title-block span {
          font-size: 13px;
          color: var(--text-muted);
        }

        .chart-metric-selector-pills {
          display: flex;
          gap: 8px;
          background: transparent;
        }

        .pill-btn {
          border: 1px solid var(--border-color);
          background: var(--bg-base);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .pill-btn:hover {
          border-color: var(--color-primary);
          color: var(--text-primary);
        }

        .pill-btn.active {
          background: var(--color-primary);
          border-color: var(--color-primary);
          color: #FFFFFF;
          box-shadow: 0 1px 4px rgba(37, 99, 235, 0.4);
        }

        .svg-chart-container {
          width: 100%;
          overflow: hidden;
          margin: 12px 0;
        }

        .svg-line-chart {
          width: 100%;
          height: auto;
          overflow: visible;
        }

        .grid-dashed-line {
          stroke: var(--border-color);
          stroke-width: 1;
          stroke-dasharray: 4, 4;
        }

        .svg-chart-line {
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
          transition: stroke 0.3s, stroke-width 0.3s;
        }

        .chart-circle-dot {
          transition: r 0.15s;
        }

        .chart-x-axis-labels {
          display: flex;
          justify-content: space-between;
          padding: 0 40px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          margin-top: 8px;
        }

        .x-label-item {
          width: 60px;
          text-align: center;
        }

        /* ── Layout Split Columns ── */
        .layout-two-columns {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 20px;
          width: 100%;
        }

        .column-funnel-card {
          display: flex;
          flex-direction: column;
          text-align: start;
        }

        .card-header-block h3 {
          margin: 0 0 4px 0;
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .card-header-block span {
          font-size: 13px;
          color: var(--text-muted);
          display: block;
          margin-bottom: 24px;
        }

        .funnel-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex-grow: 1;
          justify-content: center;
        }

        .funnel-step-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .step-label-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: var(--text-primary);
          font-weight: 600;
        }

        .step-raw-val {
          color: var(--text-muted);
        }

        .step-bar-bg {
          height: 36px;
          background: var(--bg-base);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          overflow: hidden;
          position: relative;
        }

        .step-bar-fill {
          height: 100%;
          display: flex;
          align-items: center;
          padding-left: 14px;
          font-size: 12px;
          font-weight: 700;
          color: #FFFFFF;
          border-radius: 7px;
          box-sizing: border-box;
          transition: width 0.3s ease;
        }

        .step-1-fill { background: var(--color-primary); }
        .step-2-fill { background: #6366f1; }
        .step-3-fill { background: #8b5cf6; }

        [dir="rtl"] .step-bar-fill {
          padding-left: 0;
          padding-right: 14px;
          justify-content: flex-end;
        }

        .funnel-arrow-indicator {
          font-size: 14px;
          color: var(--text-muted);
          text-align: start;
          padding-left: 20px;
          margin: 2px 0;
        }

        [dir="rtl"] .funnel-arrow-indicator {
          padding-left: 0;
          padding-right: 20px;
          text-align: end;
        }

        /* ── Campaign Comparison Table ── */
        .column-table-card {
          text-align: start;
        }

        .table-header-block {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .table-header-block h3 {
          margin: 0 0 4px 0;
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .table-header-block span {
          font-size: 13px;
          color: var(--text-muted);
        }

        .table-search-box {
          position: relative;
          width: 240px;
        }

        .table-search-box input {
          width: 100%;
          height: 36px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          padding-left: 36px;
          padding-right: 12px;
          font-size: 13px;
          outline: none;
          box-sizing: border-box;
          background: var(--bg-base);
          color: var(--text-primary);
        }

        [dir="rtl"] .table-search-box input {
          padding-left: 12px;
          padding-right: 36px;
        }

        .table-search-box .search-icon {
          position: absolute;
          top: 50%;
          left: 12px;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        [dir="rtl"] .table-search-box .search-icon {
          left: auto;
          right: 12px;
        }

        .table-scroll-container {
          width: 100%;
          overflow-x: auto;
        }

        .analytics-table {
          width: 100%;
          border-collapse: collapse;
          text-align: start;
        }

        .analytics-table th {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.4px;
          padding: 12px;
          border-bottom: 1px solid var(--border-color);
        }

        .analytics-table th.sortable {
          cursor: pointer;
          user-select: none;
        }

        .analytics-table th.sortable:hover {
          color: var(--text-primary);
        }

        .analytics-table td {
          padding: 14px 12px;
          font-size: 13px;
          color: var(--text-primary);
          border-bottom: 1px solid var(--border-color);
        }

        .analytics-table tr:hover td {
          background: var(--bg-surface-hover);
        }

        .text-start { text-align: start; }
        .text-end { text-align: end; }
        .text-muted { color: var(--text-muted); }
        .bold-revenue { font-weight: 600; color: var(--text-primary); }

        .analytics-table .campaign-name {
          font-weight: 600;
          color: var(--text-primary);
        }

        .analytics-table .empty-row {
          text-align: center;
          color: var(--text-muted);
          padding: 32px 0;
        }

        /* ── Top Lists Grid ── */
        .layout-three-columns {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          width: 100%;
        }

        .top-widget-card {
          text-align: start;
        }

        .top-widget-card h4 {
          margin: 0 0 20px 0;
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .distribution-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .dist-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .item-labels {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          font-weight: 600;
        }

        .item-name {
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 180px;
        }

        .item-value {
          color: var(--text-muted);
        }

        .progress-bar-bg {
          height: 8px;
          background: var(--bg-base);
          border: 1px solid var(--border-color);
          border-radius: 9999px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          border-radius: 9999px;
          transition: width 0.3s ease;
        }

        /* ── Engagement Heatmap ── */
        .heatmap-card {
          width: 100%;
          text-align: start;
          position: relative;
        }

        .heatmap-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .heatmap-title-block h3 {
          margin: 0 0 4px 0;
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .heatmap-title-block span {
          font-size: 13px;
          color: var(--text-muted);
        }

        .heatmap-legend {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 600;
        }

        .legend-blocks-row {
          display: flex;
          gap: 3px;
        }

        .legend-block {
          width: 14px;
          height: 14px;
          border-radius: 2px;
        }

        .heatmap-grid-scroll-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .heatmap-grid-layout {
          display: grid;
          grid-template-columns: 60px repeat(24, 1fr);
          gap: 4px;
          min-width: 760px;
        }

        .heatmap-corner-cell {
          height: 24px;
        }

        .heatmap-hour-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-align: start;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding-left: 2px;
        }

        .heatmap-day-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          height: 24px;
        }

        .heatmap-cell-block {
          height: 24px;
          border-radius: 3px;
          cursor: pointer;
          position: relative;
          transition: transform 0.15s, box-shadow 0.15s;
        }

        .heatmap-cell-block:hover {
          transform: scale(1.15);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
          z-index: 2;
        }

        /* 5 Heat Levels Dark Theme */
        .heat-level-1 { background: rgba(37, 99, 235, 0.08); border: 1px solid var(--border-color); }
        .heat-level-2 { background: rgba(37, 99, 235, 0.25); }
        .heat-level-3 { background: rgba(37, 99, 235, 0.50); }
        .heat-level-4 { background: rgba(37, 99, 235, 0.75); }
        .heat-level-5 { background: #2563eb; box-shadow: 0 0 8px rgba(37, 99, 235, 0.5); }

        .cell-hover-val {
          display: none;
        }

        .heatmap-detail-tooltip {
          margin-top: 16px;
          background: var(--bg-surface-hover);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          font-size: 12px;
          padding: 8px 16px;
          border-radius: 8px;
          display: inline-block;
          animation: fadeIn 0.2s ease;
        }

        /* ── Media Queries (Responsive scaling) ── */
        @media (max-width: 1024px) {
          .stats-cards-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .layout-two-columns {
            grid-template-columns: 1fr;
          }

          .layout-three-columns {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .main-content {
            margin-inline-start: 0 !important;
            padding-top: 0 !important;
            padding-bottom: 84px !important;
            padding-inline-start: 0 !important;
            padding-inline-end: 0 !important;
            width: 100% !important;
          }

          .analytics-page-body {
            padding: 16px 20px !important;
            margin-top: 0 !important;
            gap: 20px !important;
            max-width: 100% !important;
            box-sizing: border-box;
          }

          .stats-cards-grid {
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          .layout-three-columns {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .chart-header-row {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .chart-metric-selector-pills {
            overflow-x: auto;
            white-space: nowrap;
            display: flex;
            padding: 4px 6px;
          }

          .table-header-block {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .table-search-box {
            width: 100%;
          }

          .actions-controls-group {
            width: 100%;
            justify-content: space-between;
          }

          .select-filter-btn {
            flex: 1;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};
