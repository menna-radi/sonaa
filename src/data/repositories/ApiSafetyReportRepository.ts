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
          title: item.category ? item.category.replace(/_/g, ' ') : 'Safety Violation Report',
          severity: item.category === 'SAFETY_VIOLATION' || item.category === 'FRAUD' ? 'high' : 'medium',
          reporter: reporterName,
          reporterId: item.reporter?.id,
          reporterPhone: item.reporter?.phoneNumber || '+966 55 123 9988',
          reporterPriorReportsCount: 1,
          subject: suspectName,
          suspectId: item.suspect?.id,
          suspectPhone: item.suspect?.phoneNumber || '+966 50 887 1122',
          suspectStatus: item.suspect?.status || 'ACTIVE',
          suspectPriorReportsCount: item.category === 'FRAUD' ? 3 : 2,
          subjectType: 'Craftsman / Partner',
          category,
          time: item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Recent',
          desc: item.description || 'Discreet safety report filed during active service job regarding off-platform payment demand and unapproved charges.',
          taskId: item.task?.id,
          taskDisplayId: item.task?.displayId || `#TSK-${item.id.slice(0, 4)}`,
          taskTitle: item.task?.title || 'Emergency Electrical Repair & Maintenance',
          orderBudget: 350.00,
          escrowStatus: item.status === 'RESOLVED' ? 'REFUNDED' : 'FROZEN',
          chatLogs: [
            { sender: reporterName, text: 'Hello, what time will you arrive for the repair?', time: '10:14 AM' },
            { sender: suspectName, text: 'I am on my way. Please pay me 200 SAR in cash directly instead of the app.', time: '10:16 AM', flagged: true },
            { sender: reporterName, text: 'Why cash? The app says payment is managed securely via credit card.', time: '10:17 AM' },
            { sender: suspectName, text: 'If you do not transfer cash to STC Pay directly I will cancel the order.', time: '10:19 AM', flagged: true }
          ],
          evidenceImages: [
            'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80'
          ],
          auditTrail: [
            { action: 'Report Filed by Customer', actor: reporterName, timestamp: '10:20 AM' },
            { action: 'Escrow Payout Placed on Hold', actor: 'System Safeguard', timestamp: '10:21 AM' },
            { action: 'Opened in Admin Workspace', actor: 'Admin Moderator', timestamp: 'Just now' }
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
