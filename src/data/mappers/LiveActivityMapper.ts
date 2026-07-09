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

  static toSnapshot(model: ApiLiveSnapshotModel): LiveActivitySnapshot {
    return {
      summary: {
        activeJobs: model.active_jobs,
        onlineCraftsmen: model.online_craftsmen,
        sosCount: model.sos_count,
        busyZonesCount: model.busy_zones_count,
      },
      feedEvents: model.feed_events.map(LiveActivityMapper.toActivityEvent),
      busyZones: model.busy_zones.map(LiveActivityMapper.toBusyZone),
      activeJobs: model.active_job_list.map(LiveActivityMapper.toActiveJob),
      suspiciousAlerts: model.suspicious_alerts.map(LiveActivityMapper.toSuspiciousAlert),
    };
  }
}
