import { Result } from '../../core/result/Result';

export type ReportCategory =
  | 'INAPPROPRIATE_CONDUCT'
  | 'VEHICLE_SAFETY'
  | 'VERBAL_ABUSE'
  | 'THEFT'
  | 'PROPERTY_DAMAGE'
  | 'OTHER';

export type ReportStatus = 'PENDING' | 'UNDER_INVESTIGATION' | 'RESOLVED' | 'DISMISSED';

export interface SafetyReportParty {
  id: string;
  name: string;
  phone?: string;
}

export interface SafetyReportTask {
  id: string;
  displayId: string;
  title: string;
}

export interface SafetyReport {
  id: string;
  category: ReportCategory;
  status: ReportStatus;
  description?: string;
  createdAt: string;
  resolvedAt?: string;
  moderatorNotes?: string;
  reporter: SafetyReportParty | string | null;
  suspect: SafetyReportParty | string | null;
  task?: SafetyReportTask;
  resolvedBy?: string;
  // Backward compatibility fields for legacy components
  title?: string;
  severity?: 'high' | 'medium' | 'low';
  time?: string;
  desc?: string;
  subject?: string;
  subjectType?: string;
  reporterPhone?: string;
  reporterId?: string;
  reporterPriorReportsCount?: number;
  suspectPhone?: string;
  suspectId?: string;
  suspectStatus?: string;
  suspectPriorReportsCount?: number;
  taskDisplayId?: string;
  taskTitle?: string;
  orderBudget?: number;
  escrowStatus?: 'RELEASED' | 'FROZEN' | 'REFUNDED';
  chatLogs?: { sender: string; text: string; time: string; flagged?: boolean }[];
  evidenceImages?: string[];
  auditTrail?: { action: string; actor: string; timestamp: string }[];
}

export interface SafetyReportsPage extends Array<SafetyReport> {
  items: SafetyReport[];
  total: number;
  counts?: {
    all?: number;
    pending?: number;
    investigating?: number;
    resolved?: number;
    dismissed?: number;
  };
}

export interface SafetyReportRepository {
  getSafetyReports(q?: {
    status?: ReportStatus | 'all';
    page?: number;
    limit?: number;
  }): Promise<Result<SafetyReportsPage>>;
  moderateReport(
    id: string,
    action: 'dismiss' | 'investigate' | 'suspend' | 'ban',
    notes?: string
  ): Promise<Result<boolean>>;
}
