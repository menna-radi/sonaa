import { useState, useEffect, useCallback, useRef } from 'react';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import type { ActivityEvent, BusyZone, ActiveJob, SuspiciousAlert, LiveActivitySummary } from '../../../../domain/entities/LiveActivity';

const MAX_FEED_EVENTS = 50;
const FLUSH_INTERVAL_MS = 1000; // batch UI updates — max 1 re-render per second

export const useLiveActivity = () => {
  const { dependencies } = useDependencies();
  const { liveActivityRepository } = dependencies;

  // ── State ─────────────────────────────────────────────────────────────────
  const [summary,           setSummary]           = useState<LiveActivitySummary | null>(null);
  const [feedEvents,        setFeedEvents]         = useState<ActivityEvent[]>([]);
  const [busyZones,         setBusyZones]          = useState<BusyZone[]>([]);
  const [activeJobs,        setActiveJobs]         = useState<ActiveJob[]>([]);
  const [suspiciousAlerts,  setSuspiciousAlerts]   = useState<SuspiciousAlert[]>([]);
  const [loading,           setLoading]            = useState(true);
  const [error,             setError]              = useState<string | null>(null);
  const [isPaused,          setIsPaused]           = useState(false);

  // ── Event batching buffer (useRef — no re-render on push) ─────────────────
  const pendingEventsRef = useRef<ActivityEvent[]>([]);

  // ── Initial snapshot load ─────────────────────────────────────────────────
  const loadSnapshot = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await liveActivityRepository.getSnapshot();
      if (result.success) {
        setSummary(result.data.summary);
        setFeedEvents(result.data.feedEvents);
        setBusyZones(result.data.busyZones);
        setActiveJobs(result.data.activeJobs);
        setSuspiciousAlerts(result.data.suspiciousAlerts);
      } else {
        const errResult = result as { success: false; error: { message: string } };
        setError(errResult.error.message || 'Failed to load live activity.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load live activity.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [liveActivityRepository]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSnapshot();
  }, [loadSnapshot]);

  // ── Real-time subscription + 12s auto-polling ─────────────────────────────
  useEffect(() => {
    if (isPaused) return;

    // Background auto-polling every 12 seconds
    const pollInterval = window.setInterval(() => {
      loadSnapshot();
    }, 12000);

    // Events go into a ref buffer — no setState per event
    const cleanupSubscription = liveActivityRepository.subscribeToFeed((event: ActivityEvent) => {
      pendingEventsRef.current.push(event);
    });

    // Flush buffer to UI at most once per second
    const flushTimer = window.setInterval(() => {
      const pending = pendingEventsRef.current;
      if (pending.length > 0) {
        pendingEventsRef.current = [];
        setFeedEvents(prev => {
          const merged = [...pending, ...prev];
          return merged.slice(0, MAX_FEED_EVENTS);
        });
      }
    }, FLUSH_INTERVAL_MS);

    return () => {
      window.clearInterval(pollInterval);
      cleanupSubscription();
      window.clearInterval(flushTimer);
    };
  }, [isPaused, liveActivityRepository, loadSnapshot]);

  // ── Controls ──────────────────────────────────────────────────────────────
  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  const refresh = useCallback(() => {
    pendingEventsRef.current = [];
    loadSnapshot();
  }, [loadSnapshot]);

  return {
    summary,
    feedEvents,
    busyZones,
    activeJobs,
    suspiciousAlerts,
    loading,
    error,
    isPaused,
    togglePause,
    refresh,
  };
};

export default useLiveActivity;
