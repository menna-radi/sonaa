import { useQuery } from '@tanstack/react-query';
import { useDependencies } from '../../core/di/DependencyProvider';

export interface SidebarCounts {
  verification: number;
  reports: number;
  disputes: number;
  billing: number;
  payments: number;
  notifications: number;
}

export function useSidebarCounts() {
  const { dependencies } = useDependencies();

  return useQuery<SidebarCounts>({
    queryKey: ['sidebarCounts'],
    queryFn: async () => {
      // 1. Try GET /admin/counts (opt B10)
      try {
        const countsRes = await dependencies.countsRepository.getCounts();
        if (countsRes.success && countsRes.data) {
          return countsRes.data;
        }
      } catch {
        // Fall back to cheap count queries
      }

      // 2. Cheap count queries (limit: 1 totals, no overview-stats, no heavy lists)
      const [
        verificationRes,
        reportsRes,
        disputesRes,
        notifsRes,
        receiptsRes,
        commissionRes,
        withdrawalsRes,
      ] = await Promise.allSettled([
        dependencies.verificationRepository.getVerificationQueue(),
        dependencies.safetyReportRepository.getSafetyReports({ status: 'PENDING', page: 1, limit: 1 }),
        dependencies.disputeRepository.getDisputes({ status: 'PENDING', page: 1, limit: 1 }),
        dependencies.notificationRepository.getNotifications(),
        dependencies.billingRepository.getRequests({ status: 'PENDING_VERIFICATION', page: 1, limit: 1 }),
        dependencies.billingRepository.getCommissionPayments({ status: 'PENDING', page: 1, limit: 1 }),
        dependencies.paymentRepository.getWithdrawals({ status: 'PENDING', page: 1, limit: 1 }),
      ]);

      let verification = 0;
      if (verificationRes.status === 'fulfilled' && verificationRes.value.success) {
        verification = Array.isArray(verificationRes.value.data) ? verificationRes.value.data.length : 0;
      }

      let reports = 0;
      if (reportsRes.status === 'fulfilled' && reportsRes.value.success) {
        reports = reportsRes.value.data.total ?? reportsRes.value.data.items?.length ?? 0;
      }

      let disputes = 0;
      if (disputesRes.status === 'fulfilled' && disputesRes.value.success) {
        disputes = disputesRes.value.data.total ?? disputesRes.value.data.items?.length ?? 0;
      }

      let notifications = 0;
      if (notifsRes.status === 'fulfilled' && notifsRes.value.success) {
        notifications = notifsRes.value.data.filter((n) => !n.isRead).length || 0;
      }

      let billing = 0;
      if (receiptsRes.status === 'fulfilled' && receiptsRes.value.success) {
        billing += receiptsRes.value.data.total || 0;
      }
      if (commissionRes.status === 'fulfilled' && commissionRes.value.success) {
        billing += commissionRes.value.data.total || 0;
      }

      let payments = 0;
      if (withdrawalsRes.status === 'fulfilled' && withdrawalsRes.value.success) {
        payments = withdrawalsRes.value.data.total || 0;
      }

      return {
        verification,
        reports,
        disputes,
        billing,
        notifications,
        payments,
      };
    },
    staleTime: 30000,
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
  });
}

export default useSidebarCounts;
