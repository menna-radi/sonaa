import { Result } from '../../core/result/Result';

export interface SafetyReport {
  id: string;
  title: string;
  severity: 'high' | 'medium' | 'low';
  reporter: string;
  reporterId?: string;
  reporterPhone?: string;
  reporterPriorReportsCount?: number;
  subject: string;
  suspectId?: string;
  suspectPhone?: string;
  suspectStatus?: string;
  suspectPriorReportsCount?: number;
  subjectType: string;
  category: 'fraud' | 'fake_accounts' | 'chats' | 'spam';
  time: string;
  desc: string;
  taskId?: string;
  taskDisplayId?: string;
  taskTitle?: string;
  orderBudget?: number;
  escrowStatus?: 'RELEASED' | 'FROZEN' | 'REFUNDED';
  chatLogs?: { sender: string; text: string; time: string; flagged?: boolean }[];
  evidenceImages?: string[];
  auditTrail?: { action: string; actor: string; timestamp: string }[];
}

export interface SafetyReportRepository {
  getSafetyReports(): Promise<Result<SafetyReport[]>>;
  moderateReport(
    id: string,
    action: 'dismiss' | 'suspend' | 'ban',
    notes?: string
  ): Promise<Result<boolean>>;
}
