import React from 'react';
import { RefreshCw, Play, Pause } from 'lucide-react';
import { useLiveActivity } from '../hooks/useLiveActivity';
import { PageHeader, Button, ErrorState, Skeleton } from '../../../components/ui';
import { useLanguage } from '../../../context/LanguageContext';
import { formatRelativeTime } from '../../../../core/utils/format';
import { LIVE_FABRICATED_FIELDS_TRUSTED } from '../flags';
import { SosBanner } from '../components/SosBanner';
import { LiveSummaryCards } from '../components/LiveSummaryCards';
import { LiveFeed } from '../components/LiveFeed';
import { BusyZones } from '../components/BusyZones';
import { ActiveJobsList } from '../components/ActiveJobsList';
import { SuspiciousActivity } from '../components/SuspiciousActivity';
import { OperationalMap } from '../components/OperationalMap';
import { SystemStatus } from '../components/SystemStatus';
import '../live_activity.css';

export const LiveActivityPage: React.FC = () => {
  const { t, language } = useLanguage();
  const live = useLiveActivity();

  // The most recent SOS event feeds the banner.
  const sosEvent = live.feedEvents.find((e) => e.isSOS) ?? null;
  const showSuspicious = live.suspiciousAlerts.length > 0;

  return (
    <div className="ui-page">
      <PageHeader
        title={t('live_title')}
        subtitle={t('live_subtitle')}
        meta={live.dataUpdatedAt ? `${t('updated')} ${formatRelativeTime(live.dataUpdatedAt, language)}` : undefined}
        actions={
          <div className="ui-row">
            <span className={`live-badge${live.isPaused ? ' is-paused' : ''}`}>
              <span className="live-badge__dot" />
              <span>{live.isPaused ? t('live_feed_paused') : t('live_live')}</span>
            </span>
            <Button
              variant={live.isPaused ? 'primary' : 'outline'}
              size="sm"
              iconLeading={live.isPaused ? <Play size={12} /> : <Pause size={12} />}
              onClick={live.togglePause}
            >
              {live.isPaused ? t('live_resume') : t('live_pause')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconLeading={<RefreshCw size={14} />}
              loading={live.isFetching}
              onClick={() => live.refetch()}
            >
              {t('btn_refresh')}
            </Button>
          </div>
        }
      />

      {sosEvent && <SosBanner event={sosEvent} />}

      {live.error ? (
        <ErrorState title={t('status_error_title')} message={live.error.message} onRetry={() => live.refetch()} />
      ) : live.loading ? (
        <>
          <LiveSummaryCards summary={null} loading />
          <div className="ui-split">
            <Skeleton variant="card" height={560} />
            <Skeleton variant="card" height={560} />
          </div>
          <div className="ui-grid-auto">
            <Skeleton variant="card" height={320} />
            <Skeleton variant="card" height={320} />
          </div>
        </>
      ) : (
        <>
          <LiveSummaryCards summary={live.summary} />
          <div className="ui-split">
            <OperationalMap summary={live.summary} jobs={live.activeJobs} craftsmen={live.craftsmen} />
            <LiveFeed events={live.feedEvents} isPaused={live.isPaused} onTogglePause={live.togglePause} />
          </div>
          <div className="ui-grid-auto">
            <ActiveJobsList jobs={live.activeJobs} totalCount={live.summary?.activeJobs} />
            {showSuspicious && <SuspiciousActivity alerts={live.suspiciousAlerts} />}
            <div className="live-stack">
              {LIVE_FABRICATED_FIELDS_TRUSTED && <BusyZones zones={live.busyZones} />}
              <SystemStatus />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LiveActivityPage;
