import { useQuery } from '@tanstack/react-query';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { queryKeys } from '../../../../core/query/queryKeys';
import { unwrap } from '../../../../core/query/unwrap';
import { useAdminMutation } from '../../../../core/query/useAdminMutation';
import type { ReportStatus } from '../../../../domain/repositories/SafetyReportRepository';

export interface UseReportsQuery {
  status?: ReportStatus | 'all';
  page?: number;
  limit?: number;
}

export function useReports(q: UseReportsQuery = {}) {
  const { dependencies } = useDependencies();
  const repo = dependencies.safetyReportRepository;

  const query = useQuery({
    queryKey: queryKeys.reports.list(q),
    queryFn: async () => {
      const res = await repo.getSafetyReports(q);
      return unwrap(res);
    },
  });

  const moderate = useAdminMutation({
    mutationFn: ({
      id,
      action,
      notes,
    }: {
      id: string;
      action: 'dismiss' | 'investigate' | 'suspend' | 'ban';
      notes?: string;
    }) => repo.moderateReport(id, action, notes).then(unwrap),
    invalidate: [queryKeys.reports.all, queryKeys.counts],
    successKey: 'toast_report_moderated',
  });

  const rawData = query.data;
  const reports = rawData?.items ?? (Array.isArray(rawData) ? rawData : []);
  const total = rawData?.total ?? (Array.isArray(rawData) ? rawData.length : 0);

  return {
    ...query,
    reports,
    total,
    counts: rawData?.counts,
    moderate,
  };
}
