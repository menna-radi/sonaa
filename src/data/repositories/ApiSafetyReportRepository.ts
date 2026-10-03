import {
  SafetyReportRepository,
  SafetyReport,
  SafetyReportsPage,
  ReportCategory,
  ReportStatus,
} from '../../domain/repositories/SafetyReportRepository';
import { Result, ok, fail } from '../../core/result/Result';
import { AppError } from '../../core/errors/AppError';
import { apiClient } from '../../core/network/apiClient';
import { API_ENDPOINTS } from '../../core/config/apiEndpoints';

const KNOWN_CATEGORIES = new Set<string>([
  'INAPPROPRIATE_CONDUCT',
  'VEHICLE_SAFETY',
  'VERBAL_ABUSE',
  'THEFT',
  'PROPERTY_DAMAGE',
  'OTHER',
]);

export class ApiSafetyReportRepository implements SafetyReportRepository {
  public async getSafetyReports(q?: {
    status?: ReportStatus | 'all';
    page?: number;
    limit?: number;
  }): Promise<Result<SafetyReportsPage>> {
    try {
      const params: Record<string, string | number> = {};
      if (q?.status && q.status !== 'all') {
        params.status = q.status;
      }
      if (q?.page) params.page = q.page;
      if (q?.limit) params.limit = q.limit;

      const response = await apiClient.get<{ items?: unknown[]; total?: number; counts?: Record<string, number> } | unknown[]>(
        API_ENDPOINTS.admin.reports,
        params
      );

      const rawItems = Array.isArray(response)
        ? response
        : (response as { items?: unknown[] })?.items || [];

      const items: SafetyReport[] = (rawItems as Record<string, unknown>[]).map((item): SafetyReport => {
        const rawCat = typeof item.category === 'string' ? item.category.toUpperCase() : '';
        let cat: ReportCategory = 'OTHER';
        if (KNOWN_CATEGORIES.has(rawCat)) {
          cat = rawCat as ReportCategory;
        } else if (rawCat === 'FRAUD') {
          cat = 'THEFT';
        } else if (rawCat === 'SAFETY_VIOLATION') {
          cat = 'VEHICLE_SAFETY';
        }

        const repObj = item.reporter as { id?: string; firstName?: string; lastName?: string; phoneNumber?: string } | undefined;
        const susObj = item.suspect as { id?: string; firstName?: string; lastName?: string; phoneNumber?: string; status?: string } | undefined;
        const taskObj = item.task as { id?: string; displayId?: string; title?: string } | undefined;

        const reporterName = repObj
          ? `${repObj.firstName || ''} ${repObj.lastName || ''}`.trim() || 'Anonymous'
          : null;
        const suspectName = susObj
          ? `${susObj.firstName || ''} ${susObj.lastName || ''}`.trim() || 'Suspect'
          : null;

        const reporter = reporterName
          ? {
              id: repObj?.id || '',
              name: reporterName,
              phone: repObj?.phoneNumber,
            }
          : null;

        const suspect = suspectName
          ? {
              id: susObj?.id || '',
              name: suspectName,
              phone: susObj?.phoneNumber,
            }
          : null;

        const task = taskObj?.id
          ? {
              id: taskObj.id,
              displayId: taskObj.displayId || `#TSK-${taskObj.id.slice(0, 6)}`,
              title: taskObj.title || '',
            }
          : undefined;

        const createdAt = typeof item.createdAt === 'string' ? new Date(item.createdAt).toISOString() : new Date().toISOString();
        const description = typeof item.description === 'string' ? item.description : '';

        return {
          id: String(item.id || ''),
          category: cat,
          status: (item.status as ReportStatus) || 'PENDING',
          description,
          createdAt,
          resolvedAt: typeof item.resolvedAt === 'string' ? item.resolvedAt : undefined,
          moderatorNotes: typeof item.moderatorNotes === 'string' ? item.moderatorNotes : undefined,
          reporter,
          suspect,
          task,
          resolvedBy: typeof item.resolvedBy === 'string' ? item.resolvedBy : undefined,
          title: cat.replace(/_/g, ' '),
          severity: cat === 'THEFT' || cat === 'INAPPROPRIATE_CONDUCT' ? 'high' : 'medium',
          reporterPhone: reporter?.phone,
          reporterId: reporter?.id,
          reporterPriorReportsCount: 0,
          subject: suspect?.name || '',
          suspectId: suspect?.id,
          suspectPhone: suspect?.phone,
          suspectStatus: susObj?.status || 'ACTIVE',
          suspectPriorReportsCount: 0,
          subjectType: 'Craftsman / Partner',
          time: createdAt,
          desc: description,
          taskDisplayId: task?.displayId,
          taskTitle: task?.title,
          orderBudget: 0,
          escrowStatus: item.status === 'RESOLVED' ? 'RELEASED' : 'FROZEN',
        };
      });

      const total = Array.isArray(response)
        ? items.length
        : (response as { total?: number })?.total ?? items.length;
      const counts = Array.isArray(response)
        ? undefined
        : (response as { counts?: Record<string, number> })?.counts;

      const page: SafetyReportsPage = Object.assign([...items], {
        items,
        total,
        counts,
      });

      return ok(page);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async moderateReport(
    id: string,
    action: 'dismiss' | 'investigate' | 'suspend' | 'ban',
    notes?: string
  ): Promise<Result<boolean>> {
    try {
      await apiClient.put<unknown>(`/admin/reports/${id}/moderate`, { action, notes });
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }
}
export default ApiSafetyReportRepository;
