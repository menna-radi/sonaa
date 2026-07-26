import { SafetyReportRepository, SafetyReport } from '../../domain/repositories/SafetyReportRepository';
import { Result, ok } from '../../core/result/Result';

export class MockSafetyReportRepository implements SafetyReportRepository {
  private reports: SafetyReport[] = [
    {
      id: 'R-2001',
      title: 'Off-platform payment',
      severity: 'high',
      reporter: 'Saad Al-Dawsari',
      reporterPhone: '+972 54 123 9988',
      reporterPriorReportsCount: 1,
      subject: 'Chat #C-2912',
      suspectPhone: '+972 54 887 1122',
      suspectStatus: 'ACTIVE',
      suspectPriorReportsCount: 3,
      subjectType: 'chat',
      category: 'fraud',
      time: '34s ago',
      desc: 'Customer asked craftsman for IBAN outside Sonaa to avoid commission',
      taskId: 'T-1001',
      taskDisplayId: '#TSK-2001',
      taskTitle: 'Emergency Plumbing Repair',
      orderBudget: 350.00,
      escrowStatus: 'FROZEN'
    },
    {
      id: 'R-2002',
      title: 'Multiple rapid registrations',
      severity: 'high',
      reporter: 'System Safeguard',
      reporterPhone: 'N/A',
      subject: 'IP 81.10.x.x',
      suspectPhone: 'N/A',
      suspectStatus: 'SUSPENDED',
      suspectPriorReportsCount: 2,
      subjectType: 'ip',
      category: 'fake_accounts',
      time: '6m ago',
      desc: 'Multiple accounts created from the same IP address in under 2 minutes. High probability of bot behavior.'
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
