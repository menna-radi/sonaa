import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useNavigation } from '../../../context/NavigationContext';
import { Sidebar } from '../../../layouts/Sidebar';
import { Header } from '../../../layouts/Header';
import { MobileBottomTabs } from '../../../layouts/MobileBottomTabs';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import {
  Megaphone,
  Search,
  Bell,
  Download,
  TrendingUp,
  Plus,
  Trash2,
  Play,
  Pause,
  ArrowUpRight,
  BarChart3,
  DollarSign,
  Activity,
  CheckCircle2,
  X,
  Sparkles,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  placement: string;
  status: 'Active' | 'Paused';
  impressions: number;
  ctr: number;
  conversions: number;
  budget: number;
}

export const AdsPage: React.FC = () => {
  const { t, isRtl } = useLanguage();
  const { navigate } = useNavigation();
  const { dependencies } = useDependencies();
  const { adRepository } = dependencies;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | '90d' | 'ytd'>('30d');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Loading & error
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // New Campaign Form State
  const [newCampName, setNewCampName] = useState('');
  const [newCampPlacement, setNewCampPlacement] = useState('Home Banner');
  const [newCampBudget, setNewCampBudget] = useState('');

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adRepository.getAds();
      if (result.success) {
        setCampaigns(result.data);
      } else {
        setError(result.error.message || 'Failed to fetch campaigns.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch campaigns.');
    } finally {
      setLoading(false);
    }
  }, [adRepository]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Top Performing Ads (Figma static list for sparkline representation)
  const topPerformingAds = [
    { name: 'Summer Promo 1', imp: '105K imp', ctr: '4.2% CTR', ratio: 95 },
    { name: 'Summer Promo 2', imp: '90K imp', ctr: '3.9% CTR', ratio: 82 },
    { name: 'Summer Promo 3', imp: '75K imp', ctr: '3.6% CTR', ratio: 68 },
    { name: 'Summer Promo 4', imp: '60K imp', ctr: '3.3% CTR', ratio: 55 },
    { name: 'Summer Promo 5', imp: '45K imp', ctr: '3.0% CTR', ratio: 41 },
  ];

  // Dynamic values based on timefilter selection
  const metrics = useMemo(() => {
    switch (timeFilter) {
      case '30d':
      default:
        return {
          impressions: '2.4M',
          clicks: '84.2K',
          ctr: '3.5%',
          conversions: '4,128',
          revenue: '218K ILS',
          active: '24',
          impTrend: '+12.4%',
          clkTrend: '+8.2%',
          ctrTrend: '+0.3pp',
          convTrend: '+18.9%',
          revTrend: '+23%',
          actTrend: '+3'
        };
      case '90d':
        return {
          impressions: '9.6M',
          clicks: '342.8K',
          ctr: '3.6%',
          conversions: '16,920',
          revenue: '890K ILS',
          active: '28',
          impTrend: '+14.1%',
          clkTrend: '+9.4%',
          ctrTrend: '+0.4pp',
          convTrend: '+19.2%',
          revTrend: '+25%',
          actTrend: '+5'
        };
      case 'ytd':
        return {
          impressions: '114.5M',
          clicks: '4.11M',
          ctr: '3.6%',
          conversions: '204,500',
          revenue: '10.8M ILS',
          active: '35',
          impTrend: '+18.3%',
          clkTrend: '+12.6%',
          ctrTrend: '+0.6pp',
          convTrend: '+24.5%',
          revTrend: '+32%',
          actTrend: '+12'
        };
    }
  }, [timeFilter]);

  // Chart path coordinates according to filters
  const chartPaths = useMemo(() => {
    switch (timeFilter) {
      case '30d':
      default:
        return {
          fill: "M0 200V127.84C16.422 118.219 32.844 123.029 49.266 142.272C65.688 161.515 82.11 144.677 98.532 91.76C114.954 38.8427 131.376 46.0587 147.798 113.408C164.22 180.757 180.642 161.515 197.064 55.68C213.486 -50.1547 229.908 -45.344 246.33 70.112C262.752 185.568 279.174 168.731 295.596 19.6C312.018 -129.531 328.44 -122.315 344.862 41.248C361.284 204.811 377.706 185.568 394.128 -16.48C410.55 -218.528 426.972 -213.717 443.394 -2.048C459.816 209.621 476.238 192.784 492.66 -52.56V200H0Z"
        };
      case '90d':
        return {
          fill: "M0 200V140C20 130 40 145 60 110C80 75 100 80 120 120C140 160 160 130 180 80C200 30 220 40 240 90C260 140 280 110 300 50C320 -10 340 0 360 70C380 140 400 110 420 50C440 -10 460 0 492 -30V200H0Z"
        };
      case 'ytd':
        return {
          fill: "M0 200V150C30 130 60 110 90 100C120 90 150 70 180 80C210 90 240 60 270 40C300 20 330 30 360 50C390 70 420 60 450 30C470 10 480 20 492 -10V200H0Z"
        };
    }
  }, [timeFilter]);

  // Handle new campaign submit
  const handleAddCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampName || !newCampBudget) return;
    setLoading(true);
    setError(null);
    try {
      const result = await adRepository.createAd(newCampName, parseFloat(newCampBudget) || 0, newCampPlacement);
      if (result.success) {
        setCampaigns(prev => [result.data, ...prev]);
        setNewCampName('');
        setNewCampBudget('');
        setIsModalOpen(false);
      } else {
        setError(result.error.message || 'Failed to create campaign.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle campaign status
  const toggleCampaignStatus = async (id: string) => {
    const ad = campaigns.find(c => c.id === id);
    if (!ad) return;
    const newStatus = ad.status === 'Active' ? 'Paused' : 'Active';
    setError(null);
    try {
      const result = await adRepository.updateAdStatus(id, newStatus);
      if (result.success) {
        setCampaigns(prev => prev.map(c => c.id === id ? result.data : c));
      } else {
        setError(result.error.message || 'Failed to update campaign status.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update campaign status.');
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    setError(null);
    try {
      const result = await adRepository.deleteAd(id);
      if (result.success) {
        setCampaigns(prev => prev.filter(c => c.id !== id));
      } else {
        setError(result.error.message || 'Failed to delete campaign.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete campaign.');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Campaign ID', 'Name', 'Placement', 'Status', 'Impressions', 'CTR', 'Conversions', 'Budget (ILS)'];
    const rows = campaigns.map(c => [
      c.id,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.placement.replace(/"/g, '""')}"`,
      c.status,
      c.impressions,
      `${c.ctr}%`,
      c.conversions,
      c.budget
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ad_campaigns_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Delete campaign
  const deleteCampaign = (id: string) => {
    setCampaigns(campaigns.filter(c => c.id !== id));
  };

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.placement.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [campaigns, searchQuery]);

  return (
    <div className="app-container" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className="main-content">
        {/* Mobile Header (visible only on mobile) */}
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
              <div className="mobile-logo">S</div>
              <div className="mobile-logo-text">
                <strong>Sonaa</strong>
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
        <div className="mobile-subheader mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ textAlign: 'start' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>{t('ads_title') || 'Ads & Promotions'}</h2>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>{t('ads_subtitle') || 'Manage campaigns, placements and performance'}</span>
          </div>
          
          <div className="time-filter-pills" style={{ display: 'flex', gap: '4px', background: '#F4F4F5', padding: '4px', borderRadius: '8px', width: '100%', boxSizing: 'border-box' }}>
            {([
              { key: '7d', label: t('ads_last_7_days') || 'Last 7 days' },
              { key: '30d', label: '30D' },
              { key: '90d', label: '90D' },
              { key: 'ytd', label: 'YTD' }
            ] as const).map(pill => (
              <button
                key={pill.key}
                onClick={() => setTimeFilter(pill.key)}
                style={{
                  flex: 1,
                  border: 'none',
                  background: timeFilter === pill.key ? '#FFFFFF' : 'transparent',
                  color: timeFilter === pill.key ? '#171717' : '#6B7280',
                  padding: '6px 4px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: timeFilter === pill.key ? '0px 1px 1px rgba(0, 0, 0, 0.05)' : 'none',
                  textAlign: 'center',
                  whiteSpace: 'nowrap'
                }}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop & Tablet Page Header */}
        <div className="desktop-tablet-page-header desktop-tablet-only">
          <div style={{ textAlign: 'start' }}>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 600, letterSpacing: '-0.7px' }}>
              {t('ads_title') || 'Ads & Promotions'}
            </h1>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>
              {t('ads_subtitle') || 'Manage campaigns, placements and performance'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Last 7 Days Filter Pill */}
            <div className="time-filter-pills" style={{ display: 'flex', gap: '4px', background: 'var(--bg-surface-hover)', padding: '4px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}>
              {([
                { key: '7d', label: t('ads_last_7_days') || 'Last 7 days' },
                { key: '30d', label: '30D' },
                { key: '90d', label: '90D' },
                { key: 'ytd', label: 'YTD' }
              ] as const).map(pill => (
                <button
                  key={pill.key}
                  onClick={() => setTimeFilter(pill.key)}
                  style={{
                    border: 'none',
                    background: timeFilter === pill.key ? 'var(--bg-surface)' : 'transparent',
                    color: timeFilter === pill.key ? 'var(--text-primary)' : 'var(--text-secondary)',
                    padding: '6px 12px',
                    borderRadius: 'var(--border-radius-xs)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: timeFilter === pill.key ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Export Button */}
            <button className="ads-secondary-btn" onClick={handleExportCSV}>
              <Download size={14} />
              <span>{t('ads_export') || 'Export'}</span>
            </button>

            {/* New Campaign Button */}
            <button className="ads-primary-btn" onClick={() => navigate('create_ad')}>
              <Plus size={16} />
              <span>{t('ads_new_campaign') || 'New Campaign'}</span>
            </button>
          </div>
        </div>

        {/* Page Content Body */}
        <div className="ads-page-body animate-fade-in">
          {error && (
            <div className="glass-card status-danger animate-fade-in" style={{ padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', color: 'var(--color-danger)' }}>
                <AlertTriangle size={20} />
                <div style={{ textAlign: 'start' }}>
                  <strong style={{ display: 'block' }}>Action Alert</strong>
                  <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>{error}</span>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex-center" style={{ minHeight: '400px', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <RefreshCw className="animate-spin" size={36} style={{ color: 'var(--color-primary)' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading campaigns...</p>
            </div>
          ) : (
            <>
          
          {/* Action Row for Mobile only (New Campaign, Export) */}
          <div className="mobile-actions-row mobile-only" style={{ display: 'flex', gap: '8px', width: '100%', marginBottom: '16px' }}>
            <button className="ads-primary-btn" style={{ flex: 1 }} onClick={() => navigate('create_ad')}>
              <Plus size={16} />
              <span>{t('ads_new_campaign') || 'New Campaign'}</span>
            </button>
            <button className="ads-secondary-btn" style={{ flex: 1 }}>
              <Download size={14} />
              <span>{t('ads_export') || 'Export'}</span>
            </button>
          </div>

          {/* Metrics Dashboard Row */}
          <div className="ads-metrics-grid">
            {/* Impressions */}
            <div className="ads-metric-card glass-card">
              <div className="metric-header">
                <div className="metric-icon-wrap"><BarChart3 size={16} /></div>
                <div className="trend-badge positive">
                  <ArrowUpRight size={12} />
                  <span>{metrics.impTrend}</span>
                </div>
              </div>
              <div className="metric-title">Total Impressions</div>
              <div className="metric-value">{metrics.impressions}</div>
            </div>

            {/* Clicks */}
            <div className="ads-metric-card glass-card">
              <div className="metric-header">
                <div className="metric-icon-wrap"><Activity size={16} /></div>
                <div className="trend-badge positive">
                  <ArrowUpRight size={12} />
                  <span>{metrics.clkTrend}</span>
                </div>
              </div>
              <div className="metric-title">Total Clicks</div>
              <div className="metric-value">{metrics.clicks}</div>
            </div>

            {/* CTR */}
            <div className="ads-metric-card glass-card">
              <div className="metric-header">
                <div className="metric-icon-wrap"><TrendingUp size={16} /></div>
                <div className="trend-badge positive">
                  <ArrowUpRight size={12} />
                  <span>{metrics.ctrTrend}</span>
                </div>
              </div>
              <div className="metric-title">CTR</div>
              <div className="metric-value">{metrics.ctr}</div>
            </div>

            {/* Conversions */}
            <div className="ads-metric-card glass-card">
              <div className="metric-header">
                <div className="metric-icon-wrap"><CheckCircle2 size={16} /></div>
                <div className="trend-badge positive">
                  <ArrowUpRight size={12} />
                  <span>{metrics.convTrend}</span>
                </div>
              </div>
              <div className="metric-title">Conversions</div>
              <div className="metric-value">{metrics.conversions}</div>
            </div>

            {/* Revenue */}
            <div className="ads-metric-card glass-card">
              <div className="metric-header">
                <div className="metric-icon-wrap"><DollarSign size={16} /></div>
                <div className="trend-badge positive">
                  <ArrowUpRight size={12} />
                  <span>{metrics.revTrend}</span>
                </div>
              </div>
              <div className="metric-title">Revenue Generated</div>
              <div className="metric-value">{metrics.revenue}</div>
            </div>

            {/* Active Campaigns */}
            <div className="ads-metric-card glass-card">
              <div className="metric-header">
                <div className="metric-icon-wrap"><Megaphone size={16} /></div>
                <div className="trend-badge positive">
                  <ArrowUpRight size={12} />
                  <span>{metrics.actTrend}</span>
                </div>
              </div>
              <div className="metric-title">Active Campaigns</div>
              <div className="metric-value">{metrics.active}</div>
            </div>
          </div>

          {/* Charts & Top lists middle section */}
          <div className="ads-content-layout">
            {/* Campaign Performance Chart */}
            <div className="ads-chart-card glass-card">
              <div className="chart-header">
                <div style={{ textAlign: 'start' }}>
                  <h3 className="card-title">Campaign Performance</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{metrics.impressions}</span>
                    <span className="trend-indicator-text positive" style={{ display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--color-success)' }}>
                      <ArrowUpRight size={12} />
                      <span>{metrics.impTrend}</span>
                    </span>
                  </div>
                  <span className="card-subtitle">Impressions · Last 30 days</span>
                </div>

                {/* Local switcher */}
                <div className="chart-toggles-row">
                  {(['30d', '90d', 'ytd'] as const).map(d => (
                    <button
                      key={d}
                      className={`chart-toggle-btn ${timeFilter === d || (timeFilter === '7d' && d === '30d') ? 'active' : ''}`}
                      onClick={() => setTimeFilter(d)}
                    >
                      {d.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart SVG wrapper */}
              <div className="chart-visual-wrapper" style={{ position: 'relative', width: '100%', height: '200px' }}>
                <svg viewBox="0 0 492.66 200" width="100%" height="100%" preserveAspectRatio="none" style={{ overflow: 'visible', display: 'block' }}>
                  <defs>
                    <clipPath id="clip0_87_921">
                      <rect width="492.66" height="200" fill="white"/>
                    </clipPath>
                  </defs>

                  <g clipPath="url(#clip0_87_921)">
                    {/* Shaded Area / Solid black wave */}
                    <path
                      d={chartPaths.fill}
                      fill="#171717"
                    />
                  </g>

                  {/* Grid Lines (drawn on top of the wave as in Figma) */}
                  <line x1="0" y1="0" x2="492.66" y2="0" stroke="rgba(229,231,235,0.5)" strokeWidth="1" />
                  <line x1="0" y1="66.33" x2="492.66" y2="66.33" stroke="rgba(229,231,235,0.5)" strokeWidth="1" />
                  <line x1="0" y1="132.67" x2="492.66" y2="132.67" stroke="rgba(229,231,235,0.5)" strokeWidth="1" />
                  <line x1="0" y1="199" x2="492.66" y2="199" stroke="rgba(229,231,235,0.5)" strokeWidth="1" />
                </svg>
              </div>

              {/* Summary Bottom Grid */}
              <div className="chart-metrics-row">
                <div className="chart-sub-metric">
                  <span className="label">Impressions</span>
                  <span className="val">{metrics.impressions}</span>
                </div>
                <div className="chart-sub-metric">
                  <span className="label">Clicks</span>
                  <span className="val">{metrics.clicks}</span>
                </div>
                <div className="chart-sub-metric">
                  <span className="label">Conversions</span>
                  <span className="val">{metrics.conversions}</span>
                </div>
                <div className="chart-sub-metric">
                  <span className="label">Avg. CTR</span>
                  <span className="val">{metrics.ctr}</span>
                </div>
              </div>
            </div>

            {/* Top Performing Ads list */}
            <div className="ads-top-list-card glass-card">
              <h3 className="card-title" style={{ textAlign: 'start' }}>Top Performing Ads</h3>
              <div className="top-list-body" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {topPerformingAds.map((ad, index) => (
                  <div key={index} className="top-list-item" style={{ display: 'flex', alignItems: 'center', justifyItems: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1, textAlign: 'start' }}>
                      <div className="ad-avatar-wrap">
                        <Sparkles size={14} style={{ color: 'var(--text-muted)' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{ad.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{ad.imp} · {ad.ctr}</div>
                      </div>
                    </div>

                    {/* Sparkline mini-graph bar */}
                    <div className="sparkline-bar-container" style={{ width: '60px', height: '24px', display: 'flex', gap: '3px', alignItems: 'flex-end' }}>
                      <div className="spark-bar" style={{ flex: 1, height: `${ad.ratio * 0.4}%`, background: 'var(--text-primary)', borderRadius: '1px' }} />
                      <div className="spark-bar" style={{ flex: 1, height: `${ad.ratio * 0.7}%`, background: 'var(--text-primary)', borderRadius: '1px' }} />
                      <div className="spark-bar" style={{ flex: 1, height: `${ad.ratio * 0.5}%`, background: 'var(--text-primary)', borderRadius: '1px' }} />
                      <div className="spark-bar" style={{ flex: 1, height: `${ad.ratio * 0.8}%`, background: 'var(--text-primary)', borderRadius: '1px' }} />
                      <div className="spark-bar" style={{ flex: 1, height: `${ad.ratio}%`, background: 'var(--text-primary)', borderRadius: '1px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Campaigns Management Table */}
          <div className="campaigns-table-card glass-card">
            <div className="table-header-row">
              <div style={{ textAlign: 'start' }}>
                <h3 className="card-title">Active Campaigns Quick View</h3>
                <span className="card-subtitle">Currently running advertisements across all placements</span>
              </div>

              {/* Table search filter */}
              <div className="table-search-wrapper">
                <Search size={14} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="table-search-input"
                />
              </div>
            </div>

            <div className="table-scroll-container">
              <table className="campaigns-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'start' }}>Campaign</th>
                    <th style={{ textAlign: 'start' }}>Placement</th>
                    <th style={{ textAlign: 'start' }}>Status</th>
                    <th style={{ textAlign: 'end' }}>Impressions</th>
                    <th style={{ textAlign: 'end' }}>CTR</th>
                    <th style={{ textAlign: 'end' }}>Conv.</th>
                    <th style={{ textAlign: 'end' }}>Budget</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="empty-table-cell">No campaigns found matching your query.</td>
                    </tr>
                  ) : (
                    filteredCampaigns.map((camp) => (
                      <tr key={camp.id}>
                        <td style={{ textAlign: 'start', fontWeight: 600 }}>{camp.name}</td>
                        <td style={{ textAlign: 'start', color: 'var(--text-secondary)' }}>{camp.placement}</td>
                        <td style={{ textAlign: 'start' }}>
                          <span className={`status-pill ${camp.status.toLowerCase()}`}>
                            {camp.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'end', fontFamily: 'var(--font-mono)' }}>{camp.impressions.toLocaleString()}</td>
                        <td style={{ textAlign: 'end', fontFamily: 'var(--font-mono)' }}>{camp.ctr > 0 ? `${camp.ctr}%` : '—'}</td>
                        <td style={{ textAlign: 'end', fontFamily: 'var(--font-mono)' }}>{camp.conversions > 0 ? camp.conversions.toLocaleString() : '—'}</td>
                        <td style={{ textAlign: 'end', fontWeight: 600 }}>{camp.budget.toLocaleString()} ILS</td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            <button
                              onClick={() => toggleCampaignStatus(camp.id)}
                              className={`action-icon-btn ${camp.status === 'Active' ? 'pause' : 'play'}`}
                              title={camp.status === 'Active' ? 'Pause Campaign' : 'Resume Campaign'}
                            >
                              {camp.status === 'Active' ? <Pause size={12} /> : <Play size={12} />}
                            </button>
                            <button
                              onClick={() => handleDeleteCampaign(camp.id)}
                              className="action-icon-btn delete"
                              title="Delete Campaign"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          </>
          )}
        </div>

        {/* Modal for adding a new campaign */}
        {isModalOpen && (
          <div className="modal-backdrop animate-fade-in" onClick={() => setIsModalOpen(false)}>
            <div className="modal-content glass-card animate-slide-up" onClick={(e) => e.stopPropagation()} style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
              <div className="modal-header">
                <h3 className="card-title">Launch New Campaign</h3>
                <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}><X size={16} /></button>
              </div>

              <form onSubmit={handleAddCampaign} className="modal-form">
                <div className="form-group">
                  <label className="form-label">Campaign Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jerusalem Plumber Discount Deal"
                    value={newCampName}
                    onChange={(e) => setNewCampName(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Placement</label>
                  <select
                    value={newCampPlacement}
                    onChange={(e) => setNewCampPlacement(e.target.value)}
                    className="form-select"
                  >
                    <option value="Home Banner">Home Banner</option>
                    <option value="Search Results">Search Results</option>
                    <option value="Popups">Popups</option>
                    <option value="Category Page">Category Page</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Budget (ILS)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 5000"
                    value={newCampBudget}
                    onChange={(e) => setNewCampBudget(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="modal-actions-row">
                  <button type="button" className="ads-secondary-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="ads-primary-btn">Create Campaign</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <MobileBottomTabs />
      </main>

      {/* Styled Scoped CSS rules targeting Desktop, Tablet (<1150px), and Mobile (<768px) viewports */}
      <style>{`
        /* Global Page Body and Padding fixes */
        .ads-page-body {
          display: flex;
          flex-direction: column;
          gap: 24px;
          margin-top: 24px;
        }

        /* Desktop Header and styling */
        .ads-primary-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: var(--text-primary);
          color: var(--bg-surface);
          border-radius: var(--border-radius-sm);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity var(--transition-fast);
        }
        .ads-primary-btn:hover {
          opacity: 0.9;
        }

        .ads-secondary-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: var(--bg-surface);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .ads-secondary-btn:hover {
          background: var(--bg-surface-hover);
        }

        /* Metrics grid */
        .ads-metrics-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 16px;
          width: 100%;
        }

        .ads-metric-card {
          padding: 20px;
          text-align: start;
          border-radius: var(--border-radius-lg);
          display: flex;
          flex-direction: column;
        }

        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .metric-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: var(--bg-surface-hover);
          border-radius: var(--border-radius-sm);
          color: var(--text-secondary);
        }

        .trend-badge {
          display: flex;
          align-items: center;
          gap: 2px;
          padding: 2px 6px;
          border-radius: var(--border-radius-full);
          font-size: 10px;
          font-weight: 700;
        }

        .trend-badge.positive {
          background: rgba(34, 197, 94, 0.1);
          color: var(--color-success);
        }

        .metric-title {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .metric-value {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
          margin-top: 4px;
          font-family: var(--font-title);
        }

        /* 2 Column Layout */
        .ads-content-layout {
          display: flex;
          gap: 24px;
          width: 100%;
        }

        .ads-chart-card {
          flex: 5.5; /* Prop match 552:268 */
          padding: 24px;
          border-radius: var(--border-radius-lg);
          display: flex;
          flex-direction: column;
        }

        .ads-top-list-card {
          flex: 2.7; /* Prop match 552:268 */
          padding: 24px;
          border-radius: var(--border-radius-lg);
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .card-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .card-subtitle {
          font-size: 12px;
          color: var(--text-muted);
        }

        .chart-toggles-row {
          display: flex;
          background: #F4F4F5;
          padding: 4px;
          border-radius: 8px;
          gap: 2px;
          border: none;
        }

        .chart-toggle-btn {
          border: none;
          background: transparent;
          color: #6B7280;
          padding: 4px 12px;
          font-size: 12px;
          font-weight: 500;
          border-radius: 6px;
          cursor: pointer;
        }

        .chart-toggle-btn.active {
          background: #FFFFFF;
          color: #171717;
          box-shadow: 0px 1px 1px rgba(0, 0, 0, 0.05);
        }

        .chart-visual-wrapper {
          height: 180px;
          display: flex;
          align-items: center;
          margin-bottom: 16px;
        }

        .chart-metrics-row {
          display: flex;
          justify-content: space-between;
          border-top: 1px solid var(--border-color);
          padding-top: 16px;
          margin-top: auto;
        }

        .chart-sub-metric {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: start;
        }

        .chart-sub-metric .label {
          font-size: 11px;
          color: var(--text-muted);
          text-transform: none;
          letter-spacing: 0.5px;
        }

        .chart-sub-metric .val {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          margin-top: 2px;
        }

        /* Ad List Item */
        .ad-avatar-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: var(--bg-surface-hover);
          border-radius: var(--border-radius-sm);
          border: 1px solid var(--border-color);
        }

        /* Campaign Table component */
        .campaigns-table-card {
          padding: 24px;
          border-radius: var(--border-radius-lg);
          display: flex;
          flex-direction: column;
        }

        .table-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .table-search-wrapper {
          display: flex;
          align-items: center;
          background: var(--bg-surface-hover);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          padding: 6px 12px;
          width: 240px;
          gap: 8px;
        }

        .table-search-wrapper .search-icon {
          color: var(--text-muted);
        }

        .table-search-input {
          background: transparent;
          border: none;
          outline: none;
          font-size: 13px;
          color: var(--text-primary);
          width: 100%;
        }

        .table-scroll-container {
          overflow-x: auto;
          width: 100%;
        }

        .campaigns-table {
          width: 100%;
          border-collapse: collapse;
        }

        .campaigns-table th {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.55px;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-surface-hover);
        }

        .campaigns-table td {
          padding: 16px;
          font-size: 13px;
          border-bottom: 1px solid var(--border-color);
          color: var(--text-primary);
          vertical-align: middle;
        }

        .campaigns-table tr:hover td {
          background: rgba(0,0,0,0.01);
        }

        .empty-table-cell {
          text-align: center;
          padding: 32px !important;
          color: var(--text-muted);
        }

        .status-pill {
          display: inline-block;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: var(--border-radius-full);
          text-transform: capitalize;
        }

        .status-pill.active {
          background: rgba(34, 197, 94, 0.1);
          color: var(--color-success);
        }

        .status-pill.paused {
          background: rgba(0,0,0,0.05);
          color: var(--text-secondary);
        }

        .action-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: var(--border-radius-xs);
          border: 1px solid var(--border-color);
          background: var(--bg-surface);
          color: var(--text-secondary);
          cursor: pointer;
          transition: background var(--transition-fast);
        }

        .action-icon-btn:hover {
          background: var(--bg-surface-hover);
        }

        .action-icon-btn.pause:hover {
          color: var(--color-warning);
        }

        .action-icon-btn.play:hover {
          color: var(--color-success);
        }

        .action-icon-btn.delete:hover {
          color: var(--color-danger);
          border-color: rgba(220,38,38,0.2);
          background: rgba(220,38,38,0.05);
        }

        /* Modal backdrop and contents */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
        }

        .modal-content {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: 24px;
          width: 100%;
          max-width: 440px;
          box-shadow: var(--glass-shadow);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .modal-close-btn {
          border: none;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          align-items: flex-start;
          text-align: start;
        }

        .form-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .form-input, .form-select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--border-color);
          background: var(--bg-base);
          color: var(--text-primary);
          font-size: 13px;
          border-radius: var(--border-radius-sm);
          outline: none;
        }

        .form-input:focus, .form-select:focus {
          border-color: var(--text-primary);
        }

        .modal-actions-row {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 8px;
        }

        /* SVG Line drawing animation */
        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }

        .chart-stroke-animation {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: draw 1.5s ease-out forwards;
        }

        /* Responsive Breakpoint: Tablets (<1150px) and stack vertical */
        @media (max-width: 1150px) {
          .ads-metrics-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
          
          .ads-content-layout {
            flex-direction: column !important;
          }

          .ads-chart-card, .ads-top-list-card {
            width: 100% !important;
            flex: none !important;
          }
        }

        /* Responsive Breakpoint: Mobile (<768px) layout rules */
        @media (max-width: 768px) {
          .main-content {
            margin-inline-start: 0 !important;
            padding-top: 0 !important;
            padding-bottom: 84px !important;
            padding-inline-start: 0 !important;
            padding-inline-end: 0 !important;
          }

          .mobile-subheader {
            height: auto !important;
            padding: 12px 20px !important;
          }

          .ads-page-body {
            padding: 20px !important;
            margin-top: 0 !important;
            gap: 16px !important;
          }

          .ads-metrics-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }

          .ads-metric-card {
            padding: 16px !important;
            border-radius: var(--border-radius-md) !important;
          }

          .metric-value {
            font-size: 20px !important;
          }

          .table-header-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }

          .table-search-wrapper {
            width: 100% !important;
          }

          .chart-header {
            flex-direction: column !important;
            gap: 16px !important;
          }

          .chart-toggles-row {
            width: 100% !important;
            justify-content: space-between !important;
          }

          .chart-toggle-btn {
            flex: 1 !important;
            text-align: center !important;
          }

          .chart-metrics-row {
            grid-template-columns: repeat(2, 1fr) !important;
            display: grid !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdsPage;
