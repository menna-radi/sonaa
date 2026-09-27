import React from 'react';
import { RefreshCw, AlertTriangle, Play, Pause } from 'lucide-react';
import { useLiveActivity } from '../hooks/useLiveActivity';
import { PageHeader, Button, AlertBanner, Skeleton } from '../../../components/ui';
import { SosBanner } from '../components/SosBanner';
import { LiveFeed } from '../components/LiveFeed';
import { BusyZones } from '../components/BusyZones';
import { ActiveJobsList } from '../components/ActiveJobsList';
import { SuspiciousActivity } from '../components/SuspiciousActivity';
import { OperationalMap } from '../components/OperationalMap';
import { SystemStatus } from '../components/SystemStatus';

const LiveClock: React.FC = React.memo(() => {
  const [timeStr, setTimeStr] = React.useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  });

  React.useEffect(() => {
    const updateTime = () => {
      if (document.visibilityState === 'visible') {
        const d = new Date();
        setTimeStr(
          `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
        );
      }
    };
    const t = setInterval(updateTime, 1000);
    return () => clearInterval(t);
  }, []);

  return <span style={{ fontFamily: 'monospace', fontVariantNumeric: 'tabular-nums' }}>{timeStr}</span>;
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

  // Pick the most recent SOS event for the banner
  const sosEvent = feedEvents.find((e) => e.isSOS) ?? null;

  return (
    <div
      className="live-activity-page"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-4)',
        width: '100%',
      }}
    >
      <PageHeader
        title="Live Activity Center"
        subtitle="Real-time operations dispatch"
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--sp-2)',
                padding: 'var(--sp-1) var(--sp-3)',
                borderRadius: 'var(--r-full)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-surface-elevated)',
                fontSize: 'var(--fs-caption)',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: isPaused ? 'var(--text-muted)' : 'var(--danger-text)',
                  animation: isPaused ? 'none' : 'pulse 2s infinite',
                }}
              />
              <span>Live</span>
              <span style={{ color: 'var(--border-strong)' }}>|</span>
              <LiveClock />
            </div>

            <Button
              variant={isPaused ? 'primary' : 'outline'}
              size="sm"
              iconLeading={isPaused ? <Play size={12} /> : <Pause size={12} />}
              onClick={togglePause}
            >
              {isPaused ? 'Resume feed' : 'Pause feed'}
            </Button>
          </div>
        }
      />

      {sosEvent && <SosBanner event={sosEvent} />}

      {error && (
        <AlertBanner
          title="Live Stream Error"
          body={error}
          icon={<AlertTriangle size={18} />}
        />
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <Skeleton variant="card" height={560} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sp-4)' }}>
            <Skeleton variant="card" height={360} />
            <Skeleton variant="card" height={360} />
            <Skeleton variant="card" height={360} />
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          {/* Row 1: Map (2fr) + Feed (1fr) */}
          <div
            className="live-row-1"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: 'var(--sp-4)',
              alignItems: 'stretch',
            }}
          >
            <div style={{ minWidth: 0, minHeight: 560 }}>
              <OperationalMap
                summary={summary}
                jobs={activeJobs}
                craftsmen={craftsmen}
                refreshInterval={refreshInterval}
                onRefreshIntervalChange={setRefreshInterval}
              />
            </div>
            <div style={{ minWidth: 0 }}>
              <LiveFeed
                events={feedEvents}
                isPaused={isPaused}
                onTogglePause={togglePause}
              />
            </div>
          </div>

          {/* Row 2: Active Jobs | Suspicious | Busy Zones + System Status */}
          <div
            className="live-row-2"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--sp-4)',
              alignItems: 'stretch',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <ActiveJobsList jobs={activeJobs} totalCount={summary?.activeJobs} />
            </div>
            <div style={{ minWidth: 0 }}>
              <SuspiciousActivity alerts={suspiciousAlerts} />
            </div>
            <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
              <BusyZones zones={busyZones} />
              <SystemStatus />
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', margin: 'var(--sp-4) 0' }}>
        <Button
          variant="outline"
          size="sm"
          iconLeading={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
          onClick={refresh}
        >
          Reload Snapshot
        </Button>
      </div>
    </div>
  );
};

export default LiveActivityPage;
