import { Result } from '../../core/result/Result';

export interface SafetyReport {
  id: string;
  title: string;
  severity: 'high' | 'medium' | 'low';
  ai: boolean;
  reporter: string;
  reporterId?: string;
  reporterPhone?: string;
  subject: string;
  suspectId?: string;
  suspectPhone?: string;
  suspectStatus?: string;
  subjectType: string;
  category: 'fraud' | 'fake_accounts' | 'chats' | 'ai_alerts' | 'spam';
  time: string;
  riskScore: number;
  desc: string;
  taskId?: string;
  taskDisplayId?: string;
  taskTitle?: string;
  aiTriggers?: string[];
}

export interface SafetyReportRepository {
  getSafetyReports(): Promise<Result<SafetyReport[]>>;
  moderateReport(
    id: string,
    action: 'dismiss' | 'suspend' | 'ban',
    notes?: string
  ): Promise<Result<boolean>>;
}
