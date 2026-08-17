import React, { useState } from 'react';
import { RefreshCw, AlertTriangle, Play, Pause, Bell, Search } from 'lucide-react';
import { useLiveActivity } from '../hooks/useLiveActivity';
import { Sidebar } from '../../../../presentation/layouts/Sidebar';
import { Header } from '../../../../presentation/layouts/Header';
import { MobileBottomTabs } from '../../../../presentation/layouts/MobileBottomTabs';
import { LiveSummaryCards } from '../components/LiveSummaryCards';
import { SosBanner } from '../components/SosBanner';
import { LiveFeed } from '../components/LiveFeed';
import { BusyZones } from '../components/BusyZones';
import { ActiveJobsList } from '../components/ActiveJobsList';
import { SuspiciousActivity } from '../components/SuspiciousActivity';
import { OperationalMap } from '../components/OperationalMap';

const LiveClock: React.FC = React.memo(() => {
  const [timeStr, setTimeStr] = React.useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  });
  React.useEffect(() => {
    const t = setInterval(() => {
      const d = new Date();
      setTimeStr(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return <span style={{ color: '#71717A', fontFamily: 'monospace' }}>{timeStr}</span>;
});

export const LiveActivityPage: React.FC = () => {
  const {
    summary,
    feedEvents,
    busyZones,
    activeJobs,
    craftsmen,
    suspiciousAlerts,
    loading,
    error,
    isPaused,
    togglePause,
    refresh,
    refreshInterval,
    setRefreshInterval,
  } = useLiveActivity();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Pick the most recent SOS event for the banner
  const sosEvent = feedEvents.find((e) => e.isSOS) ?? null;

  return (
    <div className="app-container">
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
        <div className="mobile-subheader mobile-only">
          <h2>Live Activity</h2>
          <span>Real-time operations dispatch</span>
        </div>

        {/* ── Page title row (desktop/tablet only) ─────────────────────── */}
        <div className="desktop-tablet-page-header desktop-tablet-only">
          <div style={{ textAlign: 'start' }} className="animate-fade-in">
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-title)', color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
              Live Activity Center
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
              Real-time operations dispatch
            </p>
          </div>

          {/* Controls */}
          <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Live badge + Clock combined */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontSize: '0.78rem', 
              fontWeight: 600,
              background: '#FFFFFF', 
              border: '1px solid var(--border-color)', 
              padding: '6px 14px', 
              borderRadius: '20px',
              color: '#18181B',
              boxShadow: '0 1px 2px rgba(0,0,0,0.01)'
            }}>
              <span style={{ 
                width: '6px', 
                height: '6px', 
                background: '#DC2626', 
                borderRadius: '50%', 
                animation: isPaused ? 'none' : 'pulse 2s infinite',
                flexShrink: 0
              }} />
              <span>Live</span>
              <span style={{ color: '#E4E4E7', margin: '0 2px' }}>|</span>
              <LiveClock />
            </div>

            {/* Pause feed button */}
            <button
              onClick={togglePause}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                padding: '6px 14px', 
                background: '#09090b', 
                color: '#FFFFFF', 
                border: 'none', 
                borderRadius: '20px', 
                fontSize: '0.78rem', 
                fontWeight: 700, 
                cursor: 'pointer' 
              }}
            >
              {isPaused ? <Play size={11} fill="#FFFFFF" /> : <Pause size={11} fill="#FFFFFF" />}
              <span>{isPaused ? 'Resume feed' : 'Pause feed'}</span>
            </button>
          </div>
        </div>

        {/* ── Error banner ───────────────────────────────────────────────── */}
        {error && (
          <div className="glass-card animate-fade-in" style={{ padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)', border: '1px solid #FECACA', background: '#FEF2F2', borderRadius: 'var(--border-radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', color: '#DC2626' }}>
              <AlertTriangle size={20} />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{error}</span>
            </div>
          </div>
        )}

        {/* ── Loading state ──────────────────────────────────────────────── */}
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', flexDirection: 'column', gap: '16px' }}>
            <RefreshCw className="animate-spin" size={32} style={{ color: 'var(--color-primary)' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Connecting to live feed…</p>
          </div>
        ) : (
          <div className="animate-fade-in">

            {/* ══════════════════════════════════════════════════════════════
                MOBILE LAYOUT  (≤ 768px)  — stacked, single-column
                ══════════════════════════════════════════════════════════════ */}
            <div className="live-mobile-layout">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <LiveSummaryCards summary={summary} />
                <OperationalMap summary={summary} jobs={activeJobs} craftsmen={craftsmen} refreshInterval={refreshInterval} onRefreshIntervalChange={setRefreshInterval} />
                <LiveFeed events={feedEvents} isPaused={isPaused} onTogglePause={togglePause} />
                <BusyZones zones={busyZones} />
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                TABLET LAYOUT  (769–1024px) — map top, 2-col below
                ══════════════════════════════════════════════════════════════ */}
            <div className="live-tablet-layout">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                {/* Row 1: Map + Feed */}
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', minHeight: '420px' }}>
                  <div style={{ flex: 2 }}>
                    <OperationalMap summary={summary} jobs={activeJobs} craftsmen={craftsmen} refreshInterval={refreshInterval} onRefreshIntervalChange={setRefreshInterval} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <LiveFeed events={feedEvents} isPaused={isPaused} onTogglePause={togglePause} />
                  </div>
                </div>

                {/* Row 2: Active Jobs + Suspicious */}
                <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                  <div style={{ flex: 1 }}>
                    <ActiveJobsList jobs={activeJobs} totalCount={summary?.activeJobs} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <SuspiciousActivity alerts={suspiciousAlerts} />
                  </div>
                </div>

                {/* Row 3: Busy Zones */}
                <BusyZones zones={busyZones} />
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                DESKTOP LAYOUT  (≥ 1025px) — full figma layouts
                ══════════════════════════════════════════════════════════════ */}
            <div className="live-desktop-layout" style={{ padding: '24px 0', width: '100%', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>

                {/* Row 1: Map (552px) + Live Feed (268px) with 16px gap */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <OperationalMap summary={summary} jobs={activeJobs} craftsmen={craftsmen} refreshInterval={refreshInterval} onRefreshIntervalChange={setRefreshInterval} />
                  <LiveFeed events={feedEvents} isPaused={isPaused} onTogglePause={togglePause} />
                </div>

                {/* Row 2: Active Jobs (339px) + Suspicious (268px) + Busy Zones / Status (197px) with 16px gap */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <ActiveJobsList jobs={activeJobs} totalCount={summary?.activeJobs} />
                  <SuspiciousActivity alerts={suspiciousAlerts} />
                  <BusyZones zones={busyZones} />
                </div>

              </div>
            </div>

          </div>
        )}

        {/* Refresh control */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--spacing-xl)', marginBottom: 'var(--spacing-xl)' }}>
          <button
            onClick={refresh}
            style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', padding: '10px 20px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Reload Snapshot</span>
          </button>
        </div>

      </main>

      <MobileBottomTabs />

      {/* Responsive layout visibility */}
      <style>{`
        .live-mobile-layout  { display: block; }
        .live-tablet-layout  { display: none; }
        .live-desktop-layout { display: none; }

        .live-summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          width: 100%;
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .live-mobile-layout  { display: none; }
          .live-tablet-layout  { display: block; }
          .live-desktop-layout { display: none; }
        }

        @media (min-width: 1025px) {
          .live-mobile-layout  { display: none; }
          .live-tablet-layout  { display: none; }
          .live-desktop-layout { display: block; }
        }

        @media (max-width: 768px) {
          .top-header { display: none !important; }
          .mobile-bottom-tabs { display: flex !important; }


          .main-content {
            margin-inline-start: 0 !important;
            padding-bottom: 84px !important;
            padding-inline-start: 0 !important;
            padding-inline-end: 0 !important;
            padding-top: 0 !important;
          }
          .live-mobile-layout {
            padding: 16px 20px !important;
            box-sizing: border-box;
          }
          .live-activity-center-header {
            padding: 0 16px;
            margin-top: 12px !important;
          }
          .busy-zone-name {
            max-width: none !important;
          }
        }

        @media (max-width: 480px) {
          .live-summary-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .live-summary-grid > div:last-child {
            grid-column: span 2 !important;
          }
          .live-feed-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
            padding: 12px 16px !important;
          }
          .live-feed-header-controls {
            width: 100% !important;
            justify-content: space-between !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LiveActivityPage;
