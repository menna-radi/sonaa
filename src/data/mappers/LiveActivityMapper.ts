import {
  ActivityEvent,
  BusyZone,
  ActiveJob,
  SuspiciousAlert,
  LiveActivitySummary,
} from '../../domain/entities/LiveActivity';
import type { LiveActivitySnapshot } from '../../domain/entities/LiveActivity';

// ── Raw API shape (as returned by backend) ───────────────────────────────────
export interface ApiActivityEventModel {
  event_id: string;
  event_type: string;
  event_title: string;
  event_subtitle: string;
  occurred_at: string; // ISO 8601
  is_sos: boolean;
}

export interface ApiBusyZoneModel {
  zone_name: string;
  active_job_count: number;
  max_job_capacity: number;
}

export interface ApiActiveJobModel {
  job_id: string;
  job_title: string;
  job_number: string;
  customer_name: string;
  craftsman_name: string;
  zone_name: string;
  amount_sar: number;
  progress_pct: number;
}

export interface ApiSuspiciousAlertModel {
  alert_id: string;
  alert_title: string;
  alert_description: string;
  severity: string;
  minutes_ago: number;
}

export interface ApiLiveSnapshotModel {
  active_jobs: number;
  online_craftsmen: number;
  sos_count: number;
  busy_zones_count: number;
  feed_events: ApiActivityEventModel[];
  busy_zones: ApiBusyZoneModel[];
  active_job_list: ApiActiveJobModel[];
  suspicious_alerts: ApiSuspiciousAlertModel[];
}

// ── Mapper ───────────────────────────────────────────────────────────────────
export class LiveActivityMapper {
  static toActivityEvent(model: ApiActivityEventModel): ActivityEvent {
    return {
      id: model.event_id,
      type: model.event_type as ActivityEvent['type'],
      title: model.event_title,
      subtitle: model.event_subtitle,
      timestamp: model.occurred_at,
      isSOS: model.is_sos,
      ageLabel: 'now',
    };
  }

  static toBusyZone(model: ApiBusyZoneModel): BusyZone {
    return {
      name: model.zone_name,
      activeJobs: model.active_job_count,
      maxJobs: model.max_job_capacity,
      fillPercentage: model.max_job_capacity > 0
        ? Math.round((model.active_job_count / model.max_job_capacity) * 100)
        : 0,
    };
  }

  static toActiveJob(model: ApiActiveJobModel): ActiveJob {
    return {
      id: model.job_id,
      title: model.job_title,
      jobNumber: model.job_number,
      customer: model.customer_name,
      craftsman: model.craftsman_name,
      zone: model.zone_name,
      amountSAR: model.amount_sar,
      progressPercent: model.progress_pct,
    };
  }

  static toSuspiciousAlert(model: ApiSuspiciousAlertModel): SuspiciousAlert {
    return {
      id: model.alert_id,
      title: model.alert_title,
      description: model.alert_description,
      severity: model.severity as SuspiciousAlert['severity'],
      minutesAgo: model.minutes_ago,
    };
  }

  static toSnapshot(model: any): LiveActivitySnapshot {
    if (!model) {
      return {
        summary: { activeJobs: 0, onlineCraftsmen: 0, sosCount: 0, busyZonesCount: 0 },
        feedEvents: [],
        busyZones: [],
        activeJobs: [],
        suspiciousAlerts: [],
      };
    }

    const emergencies = Array.isArray(model.emergencies) ? model.emergencies : [];
    const activeTasks = Array.isArray(model.activeTasks) ? model.activeTasks : [];
    const activeCraftsmen = Array.isArray(model.activeCraftsmen) ? model.activeCraftsmen : [];

    const feedEventsFromBackend: ActivityEvent[] = emergencies.map((e: any) => ({
      id: e.id,
      type: 'emergency',
      title: `SOS Emergency by ${e.clientName || 'Customer'}`,
      subtitle: `Status: ${e.status} · Craftsman: ${e.craftsmanName || 'Unassigned'}`,
      timestamp: e.createdAt || new Date().toISOString(),
      isSOS: true,
      ageLabel: 'now',
    }));

    const activeJobsFromBackend: ActiveJob[] = activeTasks.map((t: any) => ({
      id: t.id,
      title: t.title || 'Service Job',
      jobNumber: t.displayId || `#TSK-${t.id?.slice(0, 4)}`,
      customer: t.clientName || 'Customer',
      craftsman: t.craftsmanName || 'Unassigned',
      zone: 'Jerusalem',
      amountSAR: 350,
      progressPercent: 50,
    }));

    const rawFeedEvents = Array.isArray(model.feed_events) ? model.feed_events.map(LiveActivityMapper.toActivityEvent) : feedEventsFromBackend;
    const rawActiveJobs = Array.isArray(model.active_job_list) ? model.active_job_list.map(LiveActivityMapper.toActiveJob) : activeJobsFromBackend;
    const rawBusyZones = Array.isArray(model.busy_zones) ? model.busy_zones.map(LiveActivityMapper.toBusyZone) : [];
    const rawSuspicious = Array.isArray(model.suspicious_alerts) ? model.suspicious_alerts.map(LiveActivityMapper.toSuspiciousAlert) : [];

    return {
      summary: {
        activeJobs: model.active_jobs ?? activeTasks.length,
        onlineCraftsmen: model.online_craftsmen ?? activeCraftsmen.length,
        sosCount: model.sos_count ?? emergencies.length,
        busyZonesCount: model.busy_zones_count ?? 3,
      },
      feedEvents: rawFeedEvents,
      busyZones: rawBusyZones,
      activeJobs: rawActiveJobs,
      suspiciousAlerts: rawSuspicious,
    };
  }
}
