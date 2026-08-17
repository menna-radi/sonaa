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
  const [craftsmen,         setCraftsmen]          = useState<any[]>([]);
  const [suspiciousAlerts,  setSuspiciousAlerts]   = useState<SuspiciousAlert[]>([]);
  const [loading,           setLoading]            = useState(true);
  const [error,             setError]              = useState<string | null>(null);
  const [isPaused,          setIsPaused]           = useState(false);

  const [refreshInterval, setRefreshInterval] = useState<number>(3000); // 3s real-time auto-polling

  // ── Event batching buffer (useRef — no re-render on push) ─────────────────
  const pendingEventsRef = useRef<ActivityEvent[]>([]);

  // ── Initial & Background snapshot load ──────────────────────────────────
  const loadSnapshot = useCallback(async (isBackground: boolean = false) => {
    if (!isBackground) {
      setLoading(true);
      setError(null);
    }
    try {
      const result = await liveActivityRepository.getSnapshot();
      if (result.success) {
        setSummary(result.data.summary);
        setFeedEvents(result.data.feedEvents);
        setBusyZones(result.data.busyZones);
        setActiveJobs(result.data.activeJobs);
        setCraftsmen(result.data.craftsmen || []);
        setSuspiciousAlerts(result.data.suspiciousAlerts);
      } else if (!isBackground) {
        const errResult = result as { success: false; error: { message: string } };
        setError(errResult.error.message || 'Failed to load live activity.');
      }
    } catch (err: unknown) {
      if (!isBackground) {
        const msg = err instanceof Error ? err.message : 'Failed to load live activity.';
        setError(msg);
      }
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  }, [liveActivityRepository]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSnapshot(false);
  }, [loadSnapshot]);

  // ── Real-time subscription + dynamic background polling ─────────────────
  useEffect(() => {
    if (isPaused || refreshInterval <= 0) return;

    // Silent background auto-polling (no UI flickering)
    const pollInterval = window.setInterval(() => {
      loadSnapshot(true);
    }, refreshInterval);

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
  }, [isPaused, refreshInterval, liveActivityRepository, loadSnapshot]);

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
    craftsmen,
    suspiciousAlerts,
    loading,
    error,
    isPaused,
    togglePause,
    refresh,
    refreshInterval,
    setRefreshInterval,
  };
};

export default useLiveActivity;
