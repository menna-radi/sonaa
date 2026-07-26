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

    const feedEventsFromBackend: ActivityEvent[] = activeTasks.map((t: any) => ({
      id: `evt-${t.id}`,
      type: t.status === 'ACCEPTED' ? 'job_posted' : 'job_completed',
      title: `${t.title || 'Service Job'} (${t.displayId || 'Task'})`,
      subtitle: `Status: ${t.status || 'IN_PROGRESS'} · Craftsman: ${t.craftsmanName || 'Unassigned'}`,
      timestamp: t.createdAt || new Date().toISOString(),
      isSOS: false,
      ageLabel: 'now',
    }));

    const rawFeedEvents = (Array.isArray(model.feed_events)
      ? model.feed_events.map(LiveActivityMapper.toActivityEvent)
      : feedEventsFromBackend).filter((e: ActivityEvent) => !e.isSOS && e.type !== 'sos_triggered');

    const JERUSALEM_COORDS = [
      { zone: 'Beit Hanina', lat: 31.8260, lng: 35.2260 },
      { zone: 'Old City', lat: 31.7767, lng: 35.2345 },
      { zone: 'Jerusalem Center', lat: 31.7800, lng: 35.2150 },
      { zone: 'Shuafat', lat: 31.8080, lng: 35.2330 },
      { zone: 'Sheikh Jarrah', lat: 31.7915, lng: 35.2295 },
      { zone: 'Silwan', lat: 31.7700, lng: 35.2350 },
    ];

    const activeJobsFromBackend: ActiveJob[] = activeTasks.map((t: any, idx: number) => {
      const loc = JERUSALEM_COORDS[idx % JERUSALEM_COORDS.length];
      const realNumber = t.displayId || (typeof t.id === 'string' && t.id.startsWith('SN-') ? t.id : `SN-${t.id || idx + 1}`);
      return {
        id: String(t.id || idx + 1),
        title: t.title || 'Service Job',
        jobNumber: realNumber,
        customer: t.clientName || 'Customer',
        craftsman: t.craftsmanName || 'Unassigned',
        zone: t.zone || loc.zone,
        amountSAR: Number(t.budgetAmount || 350),
        progressPercent: t.status === 'IN_PROGRESS' ? 65 : t.status === 'ACCEPTED' ? 25 : 10,
        status: t.status || 'IN_PROGRESS',
        lat: t.lat || loc.lat,
        lng: t.lng || loc.lng,
      };
    });

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
