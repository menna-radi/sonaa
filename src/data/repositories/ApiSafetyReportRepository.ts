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
          : 'System';
        const suspectName = item.suspect
          ? `${item.suspect.firstName} ${item.suspect.lastName}`
          : 'Unknown';

        return {
          id: item.id,
          title: item.category ? item.category.replace(/_/g, ' ') : 'Safety Alert',
          severity: item.category === 'SAFETY_VIOLATION' ? 'high' : 'medium',
          ai: false,
          reporter: reporterName,
          subject: suspectName,
          subjectType: 'user',
          category,
          time: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent',
          riskScore: 50,
          desc: item.description || 'Discreet report filed.',
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
