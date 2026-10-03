import {
  SafetyReportRepository,
  SafetyReport,
  SafetyReportsPage,
  ReportStatus,
} from '../../domain/repositories/SafetyReportRepository';
import { Result, ok } from '../../core/result/Result';

const INITIAL_REPORTS: SafetyReport[] = [
  {
    id: 'REP-MOCK-1',
    category: 'INAPPROPRIATE_CONDUCT',
    status: 'PENDING',
    description: '[Mock] Customer reported inappropriate conduct on site during plumbing repair.',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    reporter: { id: 'usr-101', name: 'Layla Mansour', phone: '+972 52 445 6677' },
    suspect: { id: 'crf-201', name: 'Ahmad Al-Otaibi', phone: '+972 54 887 1122' },
    task: { id: 'tsk-301', displayId: '#TSK-1001', title: 'Emergency Plumbing Repair' },
    title: 'Inappropriate conduct',
    severity: 'high',
    subject: 'Ahmad Al-Otaibi',
    time: '1h ago',
    desc: '[Mock] Customer reported inappropriate conduct on site during plumbing repair.',
  },
  {
    id: 'REP-MOCK-2',
    category: 'PROPERTY_DAMAGE',
    status: 'PENDING',
    description: '[Mock] Client reported tile damage during electrical socket installation.',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    reporter: { id: 'usr-102', name: 'Saad Al-Dawsari', phone: '+972 54 123 9988' },
    suspect: { id: 'crf-202', name: 'Tariq Nabulsi', phone: '+972 54 332 9900' },
    task: { id: 'tsk-302', displayId: '#TSK-1002', title: 'Main Distribution Board Circuit' },
    title: 'Property damage',
    severity: 'medium',
    subject: 'Tariq Nabulsi',
    time: '2h ago',
    desc: '[Mock] Client reported tile damage during electrical socket installation.',
  },
  {
    id: 'REP-MOCK-3',
    category: 'VERBAL_ABUSE',
    status: 'RESOLVED',
    description: '[Mock] Verbal dispute regarding pricing disagreement on site.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    resolvedAt: new Date(Date.now() - 43200000).toISOString(),
    moderatorNotes: 'Reviewed chat logs and warned craftsman regarding professional communication.',
    reporter: { id: 'usr-103', name: 'Omar Qadi', phone: '+972 50 776 2211' },
    suspect: { id: 'crf-203', name: 'Yousef Hassan', phone: '+972 50 999 0011' },
    task: { id: 'tsk-303', displayId: '#TSK-1003', title: 'AC Duct Sanitization' },
    resolvedBy: 'Admin Moderator',
    title: 'Verbal abuse',
    severity: 'high',
    subject: 'Yousef Hassan',
    time: '1d ago',
    desc: '[Mock] Verbal dispute regarding pricing disagreement on site.',
  },
  {
    id: 'REP-MOCK-4',
    category: 'OTHER',
    status: 'DISMISSED',
    description: '[Mock] Misunderstanding regarding appointment arrival time.',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    resolvedAt: new Date(Date.now() - 86400000).toISOString(),
    moderatorNotes: 'Both parties agreed arrival window was respected.',
    reporter: { id: 'usr-104', name: 'Kareem Taha', phone: '+972 59 111 8899' },
    suspect: { id: 'crf-204', name: 'Rami Zaid', phone: '+972 54 444 3322' },
    task: { id: 'tsk-304', displayId: '#TSK-1004', title: 'Carpentry Repair' },
    resolvedBy: 'Admin Moderator',
    title: 'Appointment misunderstanding',
    severity: 'low',
    subject: 'Rami Zaid',
    time: '2d ago',
    desc: '[Mock] Misunderstanding regarding appointment arrival time.',
  },
];

export class MockSafetyReportRepository implements SafetyReportRepository {
  private reports: SafetyReport[] = [...INITIAL_REPORTS];

  public async getSafetyReports(q?: {
    status?: ReportStatus | 'all';
    page?: number;
    limit?: number;
  }): Promise<Result<SafetyReportsPage>> {
    let filtered = [...this.reports];
    if (q?.status && q.status !== 'all') {
      filtered = filtered.filter((r) => r.status === q.status);
    }
    const page = q?.page ?? 1;
    const limit = q?.limit ?? 20;
    const items = filtered.slice((page - 1) * limit, page * limit);

    const pending = this.reports.filter((r) => r.status === 'PENDING').length;
    const investigating = this.reports.filter((r) => r.status === 'UNDER_INVESTIGATION').length;
    const resolved = this.reports.filter((r) => r.status === 'RESOLVED').length;
    const dismissed = this.reports.filter((r) => r.status === 'DISMISSED').length;

    const pageObj: SafetyReportsPage = Object.assign([...items], {
      items,
      total: filtered.length,
      counts: {
        all: this.reports.length,
        pending,
        investigating,
        resolved,
        dismissed,
      },
    });

    return ok(pageObj);
  }

  public async moderateReport(
    id: string,
    action: 'dismiss' | 'investigate' | 'suspend' | 'ban',
    notes?: string
  ): Promise<Result<boolean>> {
    const idx = this.reports.findIndex((r) => r.id === id);
    if (idx >= 0) {
      if (action === 'dismiss') {
        this.reports[idx].status = 'DISMISSED';
      } else if (action === 'investigate') {
        this.reports[idx].status = 'UNDER_INVESTIGATION';
      } else {
        this.reports[idx].status = 'RESOLVED';
      }
      this.reports[idx].resolvedAt = new Date().toISOString();
      if (notes) this.reports[idx].moderatorNotes = notes;
    }
    return ok(true);
  }
}
export default MockSafetyReportRepository;
