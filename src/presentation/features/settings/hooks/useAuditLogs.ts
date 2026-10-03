import { useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { queryKeys } from '../../../../core/query/queryKeys';
import { unwrap } from '../../../../core/query/unwrap';
import type { AuditLog } from '../../../../domain/entities/AuditLog';
import type { AuditLogQuery } from '../../../../domain/repositories/AuditRepository';

export const AUDIT_PAGE_SIZE = 20;

export type AuditFilters = Omit<AuditLogQuery, 'limit'>;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Applies the active filters locally — used only when the server ignores them. */
function filterLocally(items: AuditLog[], f: AuditFilters): AuditLog[] {
  const q = f.q?.trim().toLowerCase();
  const actor = f.actor?.trim().toLowerCase();
  const from = f.from ? new Date(f.from).getTime() : null;
  const to = f.to ? new Date(f.to).getTime() + DAY_MS : null;
  return items.filter((l) => {
    if (f.action && l.action !== f.action) return false;
    if (f.targetType && l.targetType !== f.targetType) return false;
    if (actor && !`${l.actorName} ${l.actorEmail ?? ''}`.toLowerCase().includes(actor)) return false;
    const time = new Date(l.createdAt).getTime();
    if (from !== null && !Number.isNaN(from) && time < from) return false;
    if (to !== null && !Number.isNaN(to) && time >= to) return false;
    if (q) {
      const hay = `${l.actorName} ${l.actorEmail ?? ''} ${l.action} ${l.targetType ?? ''} ${l.targetId ?? ''} ${l.ipAddress ?? ''}`;
      if (!hay.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

export const useAuditLogs = (filters: AuditFilters) => {
  const { dependencies } = useDependencies();
  const query: AuditLogQuery = { ...filters, limit: AUDIT_PAGE_SIZE };
  const result = useQuery({
    queryKey: queryKeys.audit.list(query),
    queryFn: () => dependencies.auditRepository.getLogs(query).then(unwrap),
    staleTime: 30000,
    placeholderData: keepPreviousData,
  });

  const data = result.data;
  const serverFiltering = data?.serverFiltering ?? false;
  const items = useMemo(() => {
    if (!data) return [];
    return serverFiltering ? data.items : filterLocally(data.items, filters);
  }, [data, serverFiltering, filters]);

  const actions = useMemo(() => {
    if (data?.filters) return data.filters.actions;
    return Array.from(new Set((data?.items ?? []).map((l) => l.action))).sort();
  }, [data]);

  return {
    items,
    total: data?.total ?? 0,
    actions,
    serverFiltering,
    loading: result.isLoading,
    fetching: result.isFetching,
    error: result.error,
    refetch: result.refetch,
  };
};

export default useAuditLogs;
