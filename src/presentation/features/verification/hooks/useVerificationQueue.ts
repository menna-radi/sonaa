import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Submission } from '../types';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { queryKeys } from '../../../../core/query/queryKeys';
import { unwrap } from '../../../../core/query/unwrap';
import { useAdminMutation } from '../../../../core/query/useAdminMutation';

export type QueueStatus = 'pending' | 'flagged' | 'approved' | 'all';
export type Decision = 'APPROVED' | 'REJECTED' | 'FLAGGED';

export const QUEUE_PAGE_SIZE = 20;

export const isApproved = (s: Submission) => s.verificationStatus === 'APPROVED' || s.status === 'today' || Boolean(s.isVerifiedId);
export const isRejected = (s: Submission) => s.verificationStatus === 'REJECTED';
export const isFlagged = (s: Submission) =>
  !isApproved(s) && !isRejected(s) && (s.verificationStatus === 'FLAGGED' || s.status === 'flagged');
export const isPending = (s: Submission) => !isApproved(s) && !isRejected(s) && !isFlagged(s);

const matches = (s: Submission, status: QueueStatus) => {
  if (status === 'pending') return isPending(s);
  if (status === 'flagged') return isFlagged(s);
  if (status === 'approved') return isApproved(s);
  return true;
};

const HOUR_MS = 3_600_000;

/** Average hours left until the SLA deadline of undecided submissions (0 when none has a future deadline). */
const averageSlaRemainingHours = (items: Submission[], now: number): number => {
  const left = items
    .filter(isPending)
    .map((s) => (s.slaDeadline ? new Date(s.slaDeadline).getTime() - now : NaN))
    .filter((ms) => !Number.isNaN(ms) && ms > 0);
  return left.length ? left.reduce((a, b) => a + b, 0) / left.length / HOUR_MS : 0;
};

export function useVerificationQueue({ status, page }: { status: QueueStatus; page: number }) {
  const { dependencies } = useDependencies();
  const { verificationRepository } = dependencies;

  const query = useQuery({
    queryKey: queryKeys.verification.queue({}),
    queryFn: async () => unwrap(await verificationRepository.getVerificationQueue()) as Submission[],
  });

  const all = useMemo(() => query.data ?? [], [query.data]);
  const derived = useMemo(() => {
    const filtered = all.filter((s) => matches(s, status));
    const start = (page - 1) * QUEUE_PAGE_SIZE;
    return {
      all,
      items: filtered.slice(start, start + QUEUE_PAGE_SIZE),
      total: filtered.length,
      pageCount: Math.max(1, Math.ceil(filtered.length / QUEUE_PAGE_SIZE)),
      counts: {
        pending: all.filter(isPending).length,
        flagged: all.filter(isFlagged).length,
        approved: all.filter(isApproved).length,
        all: all.length,
      },
      avgSlaRemainingHours: averageSlaRemainingHours(all, query.dataUpdatedAt || 0),
    };
  }, [all, status, page, query.dataUpdatedAt]);

  return { ...derived, ...query };
}

export function useAutoVerification() {
  const { dependencies } = useDependencies();
  const { verificationRepository } = dependencies;
  return useQuery({
    queryKey: queryKeys.settings.autoVerification,
    queryFn: async () => unwrap(await verificationRepository.getAutoVerification()).enabled,
  });
}

export function useModerateVerification(onDone?: (decision: Decision) => void) {
  const { dependencies } = useDependencies();
  const { verificationRepository } = dependencies;
  return useAdminMutation<{ id: string; decision: Decision; notes: string }, boolean>({
    mutationFn: async ({ id, decision, notes }) => unwrap(await verificationRepository.moderateVerification(id, decision, notes)),
    invalidate: [queryKeys.verification.all, queryKeys.counts],
    silentError: true,
    onSuccess: (_d, vars) => onDone?.(vars.decision),
  });
}
