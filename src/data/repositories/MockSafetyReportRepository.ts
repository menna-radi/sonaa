import { SafetyReportRepository, SafetyReport } from '../../domain/repositories/SafetyReportRepository';
import { Result, ok } from '../../core/result/Result';

export class MockSafetyReportRepository implements SafetyReportRepository {
  private reports: SafetyReport[] = [
    {
      id: 'R-2001',
      title: 'Off-platform payment',
      severity: 'high',
      ai: true,
      reporter: 'Saad Al-Dawsari',
      subject: 'Chat #C-2912',
      subjectType: 'chat',
      category: 'fraud',
      time: '34s ago',
      riskScore: 92,
      desc: 'Customer asked craftsman for IBAN outside Sonaa to avoid commission'
    },
    {
      id: 'R-2002',
      title: 'Multiple rapid registrations',
      severity: 'high',
      ai: true,
      reporter: 'System',
      subject: 'IP 81.10.x.x',
      subjectType: 'ip',
      category: 'fake_accounts',
      time: '6m ago',
      riskScore: 87,
      desc: 'Multiple accounts created from the same IP address in under 2 minutes. High probability of bot behavior.'
    },
    {
      id: 'R-2003',
      title: 'Unusual price spike',
      severity: 'medium',
      ai: true,
      reporter: 'System',
      subject: 'AC Repair · Al Aqiq',
      subjectType: 'task',
      category: 'fraud',
      time: '11m ago',
      riskScore: 71,
      desc: 'A transaction price was recorded at 350% above the average marketplace rate for AC Repair in Riyadh.'
    },
    {
      id: 'R-2004',
      title: 'Quality dispute',
      severity: 'medium',
      ai: false,
      reporter: 'Lina Al-Qahtani',
      subject: 'Khalid Al-Qahtani',
      subjectType: 'user',
      category: 'chats',
      time: '24m ago',
      riskScore: 58,
      desc: 'Customer complains that the work delivered did not match the agreed details in the contract and refuses payment.'
    },
    {
      id: 'R-2005',
      title: 'Inappropriate language',
      severity: 'low',
      ai: false,
      reporter: 'Omar Al-Ghamdi',
      subject: 'Chat #C-2814',
      subjectType: 'chat',
      category: 'chats',
      time: '42m ago',
      riskScore: 42,
      desc: 'Violent or offensive language was reported in conversation #C-2814 between customer and craftsman.'
    },
    {
      id: 'R-2006',
      title: 'Fake portfolio photos',
      severity: 'medium',
      ai: true,
      reporter: 'AI Vision',
      subject: 'Bandar Al-Omari',
      subjectType: 'user',
      category: 'spam',
      time: '1h ago',
      riskScore: 68,
      desc: 'Uploaded portfolio images were flagged by AI Vision API as being copied from stock image catalogs.'
    },
    {
      id: 'R-2007',
      title: 'No-show pattern',
      severity: 'high',
      ai: true,
      reporter: 'System',
      subject: 'Hassan Al-Mutairi',
      subjectType: 'user',
      category: 'spam',
      time: '2h ago',
      riskScore: 84,
      desc: 'User has failed to attend the last three scheduled service appointments without notifying the client.'
    }
  ];

  public async getSafetyReports(): Promise<Result<SafetyReport[]>> {
    return ok(this.reports);
  }

  public async moderateReport(
    id: string,
    action: 'dismiss' | 'suspend' | 'ban',
    _notes?: string
  ): Promise<Result<boolean>> {
    this.reports = this.reports.filter((r) => r.id !== id);
    return ok(true);
  }
}
export default MockSafetyReportRepository;
