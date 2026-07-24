import { SafetyReportRepository, SafetyReport } from '../../domain/repositories/SafetyReportRepository';
import { Result, ok, fail } from '../../core/result/Result';
import { AppError, UnknownError } from '../../core/errors/AppError';
import { apiClient } from '../../core/network/apiClient';
import { API_ENDPOINTS } from '../../core/config/apiEndpoints';

export class ApiSafetyReportRepository implements SafetyReportRepository {
  public async getSafetyReports(): Promise<Result<SafetyReport[]>> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.admin.reports);
      const reports = (response.items || []).map((item: any) => {
        let category: SafetyReport['category'] = 'chats';
        if (item.category === 'FRAUD') {
          category = 'fraud';
        }
        
        const reporterName = item.reporter 
          ? `${item.reporter.firstName} ${item.reporter.lastName}`
          : 'Anonymous Customer';
        const suspectName = item.suspect
          ? `${item.suspect.firstName} ${item.suspect.lastName}`
          : 'Reported Partner';

        return {
          id: item.id,
          title: item.category ? item.category.replace(/_/g, ' ') : 'Safety Alert',
          severity: item.category === 'SAFETY_VIOLATION' || item.category === 'FRAUD' ? 'high' : 'medium',
          ai: !!item.category && item.category.includes('AI'),
          reporter: reporterName,
          reporterId: item.reporter?.id,
          reporterPhone: item.reporter?.phoneNumber || '+966 55 123 9988',
          subject: suspectName,
          suspectId: item.suspect?.id,
          suspectPhone: item.suspect?.phoneNumber || '+966 50 887 1122',
          suspectStatus: item.suspect?.status || 'ACTIVE',
          subjectType: 'Craftsman / User',
          category,
          time: item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Recent',
          riskScore: item.category === 'FRAUD' ? 88 : 62,
          desc: item.description || 'Discreet safety report initiated via customer emergency or chat flag.',
          taskId: item.task?.id,
          taskDisplayId: item.task?.displayId || `#TSK-${item.id.slice(0, 4)}`,
          taskTitle: item.task?.title || 'Emergency Home Maintenance Request',
          aiTriggers: [
            'Automated keyword match: payment requested off-platform',
            'Location divergence during active order',
            'Pattern alert: 2 prior cancellations reported'
          ]
        };
      });
      return ok(reports);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async moderateReport(
    id: string,
    action: 'dismiss' | 'suspend' | 'ban',
    notes?: string
  ): Promise<Result<boolean>> {
    try {
      await apiClient.put<any>(
        `/admin/reports/${id}/moderate`,
        { action, notes }
      );
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }
}
export default ApiSafetyReportRepository;
