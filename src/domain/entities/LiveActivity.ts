export type ActivityEventType =
  | 'sos_triggered'
  | 'job_posted'
  | 'craftsman_online'
  | 'payment_processed'
  | 'job_completed'
  | 'verification_submitted'
  | 'surge_detected'
  | 'flag_raised';

export type AlertSeverity = 'high' | 'medium' | 'low';

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  title: string;
  subtitle: string;
  timestamp: string; // ISO String for pure data serialization
  isSOS: boolean;
  ageLabel: string;  // Precomputed or updated by mapper/presentation utility
}

export interface BusyZone {
  name: string;
  activeJobs: number;
  maxJobs: number;
  fillPercentage: number; // Precomputed
}

export interface ActiveJob {
  id: string;
  title: string;
  jobNumber: string;
  customer: string;
  craftsman: string;
  zone: string;
  amountSAR: number;
  progressPercent: number;
  status?: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED' | string;
  lat?: number;
  lng?: number;
}

export interface SuspiciousAlert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  minutesAgo: number;
}

export interface LiveActivitySummary {
  activeJobs: number;
  onlineCraftsmen: number;
  sosCount: number;
  busyZonesCount: number;
}

export interface LiveCraftsman {
  id: string;
  name: string;
  title: string;
  lat: number;
  lng: number;
  rating?: number;
  isAvailable?: boolean;
}

export interface LiveActivitySnapshot {
  summary: LiveActivitySummary;
  feedEvents: ActivityEvent[];
  busyZones: BusyZone[];
  activeJobs: ActiveJob[];
  suspiciousAlerts: SuspiciousAlert[];
  craftsmen?: LiveCraftsman[];
}
