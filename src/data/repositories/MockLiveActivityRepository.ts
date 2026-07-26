import {
  ActivityEvent,
  BusyZone,
  ActiveJob,
  SuspiciousAlert,
  LiveActivitySummary,
  LiveActivitySnapshot
} from '../../domain/entities/LiveActivity';
import type { LiveActivityRepository } from '../../domain/repositories/LiveActivityRepository';
import { Result, ok } from '../../core/result/Result';

const nowISO = () => new Date().toISOString();
const minsAgoISO = (m: number) => new Date(Date.now() - m * 60 * 1000).toISOString();
const secsAgoISO = (s: number) => new Date(Date.now() - s * 1000).toISOString();

const SEED_EVENTS: ActivityEvent[] = [
  { id: 'e1', type: 'job_posted', title: 'New job posted · Plumbing Repair', subtitle: 'Old City · 450 ILS', timestamp: nowISO(), isSOS: false, ageLabel: 'now' },
  { id: 'e2', type: 'job_posted', title: 'New job posted · AC Repair', subtitle: 'Beit Hanina · 720 ILS', timestamp: secsAgoISO(14), isSOS: false, ageLabel: '14s ago' },
  { id: 'e3', type: 'craftsman_online', title: 'Craftsman online · Mohammed Z.', subtitle: 'Shuafat · Plumber', timestamp: secsAgoISO(32), isSOS: false, ageLabel: '32s ago' },
  { id: 'e4', type: 'payment_processed', title: 'Payment processed', subtitle: '480 ILS · Job #SN-2415', timestamp: secsAgoISO(48), isSOS: false, ageLabel: '48s ago' },
  { id: 'e5', type: 'flag_raised', title: 'Off-platform link flagged', subtitle: 'Chat #C-2912 · AI · 92%', timestamp: minsAgoISO(1), isSOS: false, ageLabel: '1m ago' },
  { id: 'e6', type: 'job_completed', title: 'Job completed · Smart lock', subtitle: 'Sheikh Jarrah · ⭐ 5.0', timestamp: minsAgoISO(2), isSOS: false, ageLabel: '2m ago' },
  { id: 'e7', type: 'verification_submitted', title: 'Verification submitted', subtitle: 'Yousef Al-Harbi · Plumber', timestamp: minsAgoISO(4), isSOS: false, ageLabel: '4m ago' },
  { id: 'e8', type: 'surge_detected', title: 'Surge detected · Silwan', subtitle: 'AC Repair · +180%', timestamp: minsAgoISO(6), isSOS: false, ageLabel: '6m ago' },
];

const SEED_ZONES: BusyZone[] = [
  { name: 'Old City (البلدة القديمة)', activeJobs: 87, maxJobs: 100, fillPercentage: 87 },
  { name: 'Beit Hanina (بيت حنينا)', activeJobs: 62, maxJobs: 100, fillPercentage: 62 },
  { name: 'Shuafat (شعفاط)', activeJobs: 41, maxJobs: 100, fillPercentage: 41 },
];

const SEED_JOBS: ActiveJob[] = [
  { id: 'j1', title: 'AC unit installation', jobNumber: '#SN-2418', customer: 'Mona Al-Harbi', craftsman: 'Mohammed Z.', zone: 'Shuafat', amountSAR: 720, progressPercent: 60 },
  { id: 'j2', title: 'Ceiling lights install', jobNumber: '#SN-2417', customer: 'Saad Al-Dawsari', craftsman: 'Khalid G.', zone: 'Old City', amountSAR: 350, progressPercent: 90 },
  { id: 'j3', title: 'Bathroom plumbing', jobNumber: '#SN-2415', customer: 'Lina Al-Qahtani', craftsman: 'Yousef H.', zone: 'Beit Hanina', amountSAR: 480, progressPercent: 30 },
  { id: 'j4', title: 'Wall painting · 2 rooms', jobNumber: '#SN-2417', customer: 'Omar Al-Ghamdi', craftsman: 'Hassan M.', zone: 'Sheikh Jarrah', amountSAR: 1500, progressPercent: 45 },
  { id: 'j5', title: 'Generator maintenance', jobNumber: '#SN-2416', customer: 'Faisal Al-Shamri', craftsman: 'Saif G.', zone: 'Silwan', amountSAR: 900, progressPercent: 75 },
];

const SEED_ALERTS: SuspiciousAlert[] = [
  { id: 'a1', title: 'Off-platform payment attempt', description: 'Chat #C-2912 — Customer asked for IBAN outside Sonaa', severity: 'high', minutesAgo: 0 },
  { id: 'a2', title: 'Multiple rapid registrations', description: '4 craftsman accounts from same IP in 12 min', severity: 'high', minutesAgo: 8 },
  { id: 'a3', title: 'Unusual price spike', description: 'AC Repair in Beit Hanina · 3× zone median', severity: 'medium', minutesAgo: 11 },
];

const STREAM_EVENTS = [
  { type: 'job_posted' as const, title: 'New job posted · Plumbing', subtitle: 'Beit Hanina · 350 ILS', isSOS: false },
  { type: 'craftsman_online' as const, title: 'Craftsman online · Khalid R.', subtitle: 'Old City · Electrician', isSOS: false },
  { type: 'payment_processed' as const, title: 'Payment processed', subtitle: '650 ILS · Job #SN-2420', isSOS: false },
  { type: 'job_completed' as const, title: 'Job completed · AC Repair', subtitle: 'Shuafat · ⭐ 4.8', isSOS: false },
  { type: 'verification_submitted' as const, title: 'Verification submitted', subtitle: 'Ahmed Al-Mutairi · Plumber', isSOS: false },
  { type: 'surge_detected' as const, title: 'Surge detected · Sheikh Jarrah', subtitle: 'Cleaning · +90%', isSOS: false },
  { type: 'job_posted' as const, title: 'New job posted · Electrical', subtitle: 'Silwan · 380 ILS', isSOS: false },
];

let streamCounter = 100;

function generateStreamEvent(): ActivityEvent {
  const template = STREAM_EVENTS[Math.floor(Math.random() * STREAM_EVENTS.length)];
  streamCounter++;
  return {
    id: `stream_${streamCounter}`,
    type: template.type,
    title: template.title,
    subtitle: template.subtitle,
    timestamp: nowISO(),
    isSOS: template.isSOS,
    ageLabel: 'now'
  };
}

export class MockLiveActivityRepository implements LiveActivityRepository {
  public async getSnapshot(): Promise<Result<LiveActivitySnapshot>> {
    await new Promise(resolve => setTimeout(resolve, 350));
    return ok({
      summary: { activeJobs: 1238, onlineCraftsmen: 312, sosCount: 3, busyZonesCount: 10 },
      feedEvents: [...SEED_EVENTS],
      busyZones: [...SEED_ZONES],
      activeJobs: [...SEED_JOBS],
      suspiciousAlerts: [...SEED_ALERTS],
    });
  }

  public subscribeToFeed(onEvent: (event: ActivityEvent) => void): () => void {
    const interval = window.setInterval(() => {
      onEvent(generateStreamEvent());
    }, 3500);

    return () => window.clearInterval(interval);
  }
}
export default MockLiveActivityRepository;
