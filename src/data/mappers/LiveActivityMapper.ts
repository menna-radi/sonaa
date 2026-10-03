import {
  ActivityEvent,
  BusyZone,
  ActiveJob,
  SuspiciousAlert,
} from '../../domain/entities/LiveActivity';
import type { LiveActivitySnapshot, LiveCraftsman } from '../../domain/entities/LiveActivity';
import { LIVE_FABRICATED_FIELDS_TRUSTED } from '../../presentation/features/live_activity/flags';

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
  max_job_capacity: number | null;
}

export interface ApiActiveJobModel {
  job_id: string;
  job_title: string;
  job_number: string;
  customer_name: string;
  craftsman_name: string;
  zone_name: string | null;
  amount_sar?: number;
  amount?: number;
  progress_pct?: number;
  lat?: number | null;
  lng?: number | null;
}

export interface ApiSuspiciousAlertModel {
  alert_id?: string;
  alert_title?: string;
  alert_description?: string;
  id?: string;
  title?: string;
  subtitle?: string;
  occurred_at?: string;
  severity: string;
  minutes_ago?: number;
}

export interface ApiLiveTaskModel {
  id: string;
  displayId?: string | null;
  title?: string | null;
  status?: string | null;
  lat?: number | null;
  lng?: number | null;
  clientName?: string | null;
  craftsmanName?: string | null;
}

export interface ApiLiveCraftsmanModel {
  id: string;
  name?: string | null;
  title?: string | null;
  lat?: number | null;
  lng?: number | null;
  rating?: number | null;
}

export interface ApiLiveSnapshotModel {
  active_jobs?: number;
  online_craftsmen?: number;
  sos_count?: number;
  busy_zones_count?: number;
  feed_events?: ApiActivityEventModel[];
  busy_zones?: ApiBusyZoneModel[];
  active_job_list?: ApiActiveJobModel[];
  suspicious_alerts?: ApiSuspiciousAlertModel[];
  emergencies?: unknown[];
  activeTasks?: ApiLiveTaskModel[];
  activeCraftsmen?: ApiLiveCraftsmanModel[];
}

/** A coordinate counts only when the backend really sent one (null / 0 / NaN are "unknown"). */
const realCoord = (v: unknown): number | undefined => {
  if (v === null || v === undefined || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n !== 0 ? n : undefined;
};

const emptySnapshot = (): LiveActivitySnapshot => ({
  summary: { activeJobs: 0, onlineCraftsmen: 0, sosCount: 0, busyZonesCount: 0 },
  feedEvents: [],
  busyZones: [],
  activeJobs: [],
  suspiciousAlerts: [],
  craftsmen: [],
});

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
      ageLabel: '',
    };
  }

  static toBusyZone(model: ApiBusyZoneModel): BusyZone {
    const max = model.max_job_capacity ?? 0;
    return {
      name: model.zone_name,
      activeJobs: model.active_job_count,
      maxJobs: max,
      fillPercentage: max > 0 ? Math.round((model.active_job_count / max) * 100) : 0,
    };
  }

  /**
   * `amountSAR` / `progressPercent` come from placeholders on the backend until B17: they are
   * only mapped when LIVE_FABRICATED_FIELDS_TRUSTED is true; otherwise amount is `null` (never rendered).
   * The entity types it as `number`, hence the cast.
   */
  static toActiveJob(model: ApiActiveJobModel): ActiveJob {
    const trusted = LIVE_FABRICATED_FIELDS_TRUSTED;
    const amount = model.amount_sar ?? model.amount ?? null;
    return {
      id: model.job_id,
      title: model.job_title,
      jobNumber: model.job_number,
      customer: model.customer_name,
      craftsman: model.craftsman_name,
      zone: model.zone_name ?? '',
      amountSAR: (trusted ? amount : null) as number,
      progressPercent: trusted ? model.progress_pct ?? 0 : 0,
      lat: realCoord(model.lat),
      lng: realCoord(model.lng),
    };
  }

  static toSuspiciousAlert(model: ApiSuspiciousAlertModel): SuspiciousAlert {
    const occurred = model.occurred_at ? new Date(model.occurred_at).getTime() : NaN;
    const minutes =
      model.minutes_ago ?? (Number.isFinite(occurred) ? Math.max(0, Math.round((Date.now() - occurred) / 60000)) : 0);
    return {
      id: model.alert_id ?? model.id ?? '',
      title: model.alert_title ?? model.title ?? '',
      description: model.alert_description ?? model.subtitle ?? '',
      severity: model.severity as SuspiciousAlert['severity'],
      minutesAgo: minutes,
    };
  }

  private static toJobFromTask(task: ApiLiveTaskModel, extra?: ApiActiveJobModel): ActiveJob {
    const base = extra ? LiveActivityMapper.toActiveJob(extra) : null;
    return {
      id: task.id,
      title: task.title ?? base?.title ?? '',
      jobNumber: task.displayId ?? base?.jobNumber ?? '',
      customer: task.clientName ?? base?.customer ?? '—',
      craftsman: task.craftsmanName ?? base?.craftsman ?? '—',
      zone: base?.zone ?? '',
      amountSAR: base?.amountSAR ?? (null as unknown as number),
      progressPercent: base?.progressPercent ?? 0,
      status: task.status ?? undefined,
      lat: realCoord(task.lat),
      lng: realCoord(task.lng),
    };
  }

  static toSnapshot(model: ApiLiveSnapshotModel | null | undefined): LiveActivitySnapshot {
    if (!model) return emptySnapshot();

    const activeTasks = Array.isArray(model.activeTasks) ? model.activeTasks : [];
    const jobList = Array.isArray(model.active_job_list) ? model.active_job_list : [];
    const jobById = new Map(jobList.map((j) => [j.job_id, j]));

    // Tasks carry the real status and coordinates; the job list adds zone (and untrusted amount/progress).
    const activeJobs: ActiveJob[] =
      activeTasks.length > 0
        ? activeTasks.map((t) => LiveActivityMapper.toJobFromTask(t, jobById.get(t.id)))
        : jobList.map(LiveActivityMapper.toActiveJob);

    const busyZones = Array.isArray(model.busy_zones) ? model.busy_zones.map(LiveActivityMapper.toBusyZone) : [];
    const suspiciousAlerts = Array.isArray(model.suspicious_alerts)
      ? model.suspicious_alerts.map(LiveActivityMapper.toSuspiciousAlert)
      : [];
    const feedEvents = Array.isArray(model.feed_events) ? model.feed_events.map(LiveActivityMapper.toActivityEvent) : [];

    const rawCraftsmen = Array.isArray(model.activeCraftsmen) ? model.activeCraftsmen : [];
    const craftsmen: LiveCraftsman[] = [];
    for (const c of rawCraftsmen) {
      const lat = realCoord(c.lat);
      const lng = realCoord(c.lng);
      if (lat === undefined || lng === undefined) continue;
      craftsmen.push({
        id: String(c.id),
        name: c.name ?? '',
        title: c.title ?? '',
        lat,
        lng,
        rating: typeof c.rating === 'number' ? c.rating : undefined,
      });
    }

    const emergencies = Array.isArray(model.emergencies) ? model.emergencies : [];
    return {
      summary: {
        activeJobs: model.active_jobs ?? activeJobs.length,
        onlineCraftsmen: model.online_craftsmen ?? rawCraftsmen.length,
        sosCount: model.sos_count ?? emergencies.length,
        busyZonesCount: model.busy_zones_count ?? busyZones.length,
      },
      feedEvents,
      busyZones,
      activeJobs,
      suspiciousAlerts,
      craftsmen,
    };
  }
}
