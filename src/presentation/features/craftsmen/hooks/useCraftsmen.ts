import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Craftsman } from '../../../../domain/entities/Craftsman';
export type { Craftsman };
import type { CraftsmanStatusFilter } from '../../../../domain/repositories/CraftsmanRepository';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { queryKeys } from '../../../../core/query/queryKeys';
import { unwrap } from '../../../../core/query/unwrap';
import { useAdminMutation } from '../../../../core/query/useAdminMutation';

const LIMIT = 20;
/** Server page size, shared with the table pagination math. */
export const CRAFTSMEN_PAGE_SIZE = LIMIT;

function readInitialSearch(): string {
  try {
    const v = sessionStorage.getItem('craftsmen_search');
    if (v) {
      sessionStorage.removeItem('craftsmen_search');
      return v;
    }
  } catch {
    // storage unavailable — fall through to empty search
  }
  return '';
}

export const useCraftsmen = () => {
  const { dependencies } = useDependencies();
  const { craftsmanRepository } = dependencies;
  const qc = useQueryClient();

  const [tab, setTabState] = useState<CraftsmanStatusFilter>('all');
  const [page, setPage] = useState(1);
  const [search, setSearchState] = useState(readInitialSearch);
  const [selectedId, setSelectedId] = useState<string>('');

  const query = useQuery({
    queryKey: queryKeys.craftsmen.list({ status: tab, page, search }),
    queryFn: () =>
      craftsmanRepository.getCraftsmen({ q: search || undefined, status: tab, page, limit: LIMIT }).then(unwrap),
    staleTime: 30000,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });

  const rows = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const counts = query.data?.counts ?? { all: 0, verified: 0, pending: 0, suspended: 0 };

  // Suspended-tab safety net: server counts (pre-B12) may disagree with the
  // account statuses on the page — then filter the page client-side.
  const clientSuspended = rows.filter((c) => c.accountStatus !== 'ACTIVE');
  const suspendedMismatch = tab === 'suspended' && counts.suspended !== clientSuspended.length;
  const visibleRows = tab === 'suspended' && suspendedMismatch ? clientSuspended : rows;

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: queryKeys.craftsmen.all });
    void qc.invalidateQueries({ queryKey: queryKeys.counts });
  };

  const setTab = (next: CraftsmanStatusFilter) => {
    setTabState(next);
    setPage(1);
  };

  const setSearch = (next: string) => {
    setSearchState(next);
    setPage(1);
  };

  const suspendMutation = useAdminMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      craftsmanRepository.suspendCraftsman(id, reason).then(unwrap),
    invalidate: [queryKeys.craftsmen.all, queryKeys.counts],
    successKey: 'toast_craftsman_suspended',
  });
  const unsuspendMutation = useAdminMutation({
    mutationFn: (id: string) => craftsmanRepository.unsuspendCraftsman(id).then(unwrap),
    invalidate: [queryKeys.craftsmen.all, queryKeys.counts],
    successKey: 'toast_craftsman_unsuspended',
  });
  const banMutation = useAdminMutation({
    mutationFn: (id: string) => craftsmanRepository.banCraftsman(id).then(unwrap),
    invalidate: [queryKeys.craftsmen.all, queryKeys.counts],
    successKey: 'toast_craftsman_banned',
  });
  const verifyMutation = useAdminMutation({
    mutationFn: ({ id, itemKey, approved }: { id: string; itemKey: string; approved: boolean }) =>
      craftsmanRepository.toggleVerificationItem(id, itemKey, approved).then(unwrap),
    invalidate: [queryKeys.craftsmen.all, queryKeys.counts],
    silentError: true,
  });

  const mutations = {
    suspend: suspendMutation,
    unsuspend: unsuspendMutation,
    ban: banMutation,
    toggleVerification: verifyMutation,
  };

  const selectedCraftsman = visibleRows.find((c) => c.id === selectedId) || visibleRows[0] || null;

  return {
    rows: visibleRows,
    total,
    counts,
    suspendedMismatch,
    loading: query.isLoading,
    isFetching: query.isFetching,
    dataUpdatedAt: query.dataUpdatedAt,
    error: query.error,
    refetch: query.refetch,
    page,
    setPage,
    search,
    setSearch,
    tab,
    setTab,
    mutations,
    // ---- Deprecated aliases (removed in T-F061) ----
    craftsmen: visibleRows,
    searchQuery: search,
    setSearchQuery: setSearch,
    activeTab: tab,
    setActiveTab: setTab,
    selectedId,
    setSelectedId,
    selectedCraftsman,
    tabCounts: counts,
    refresh: () => {
      invalidate();
    },
    suspendCraftsman: async (id: string, reason?: string): Promise<void> => {
      await suspendMutation.mutateAsync({ id, reason });
    },
    unsuspendCraftsman: async (id: string): Promise<void> => {
      await unsuspendMutation.mutateAsync(id);
    },
    banCraftsman: async (id: string): Promise<void> => {
      await banMutation.mutateAsync(id);
    },
    approveVerification: async (id: string, key: keyof Craftsman['verifications'], approved = true): Promise<void> => {
      await verifyMutation.mutateAsync({ id, itemKey: key, approved });
    },
  };
};

export default useCraftsmen;
