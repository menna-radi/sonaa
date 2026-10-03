import type {
  SafetyReport,
  ReportCategory,
  ReportStatus,
  SafetyReportParty,
  SafetyReportTask,
  SafetyReportsPage,
} from '../../../domain/repositories/SafetyReportRepository';

export type {
  SafetyReport,
  ReportCategory,
  ReportStatus,
  SafetyReportParty,
  SafetyReportTask,
  SafetyReportsPage,
};

export interface ReportItem {
  id: string;
  title: string;
  severity: 'high' | 'medium' | 'low';
  status?: ReportStatus;
  createdAt?: string;
  reporter: string;
  reporterId?: string;
  reporterPhone?: string;
  reporterPriorReportsCount?: number;
  subject: string;
  suspect?: string;
  suspectId?: string;
  suspectPhone?: string;
  suspectStatus?: string;
  suspectPriorReportsCount?: number;
  subjectType: string;
  category: 'fraud' | 'fake_accounts' | 'chats' | 'spam' | ReportCategory;
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
  description?: string;
  resolvedAt?: string;
  moderatorNotes?: string;
  task?: SafetyReportTask | { id?: string; displayId?: string; title?: string } | null;
  resolvedBy?: string;
}

export type ReportFilter = 'All' | 'Fraud' | 'Fake accounts' | 'Chats' | 'Spam' | 'Pending' | 'Investigating' | 'Resolved' | 'Dismissed';

export interface TemplatePreset {
  id: string;
  label: string;
  action: 'dismiss' | 'warning' | 'suspend' | 'ban';
  target: 'reporter' | 'suspect' | 'both';
  text: string;
}
