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
      const [metricsRes, reportsRes, notifsRes, receiptsRes, commissionRes, withdrawalsRes] =
        await Promise.allSettled([
          dependencies.metricRepository.getMetrics(),
          dependencies.metricRepository.getPendingReports(),
          dependencies.notificationRepository.getNotifications(),
          dependencies.billingRepository.getRequests({ status: 'PENDING_VERIFICATION', page: 1, limit: 1 }),
          dependencies.billingRepository.getCommissionPayments({ status: 'PENDING', page: 1, limit: 1 }),
          dependencies.paymentRepository.getWithdrawals({ status: 'PENDING', page: 1, limit: 1 }),
        ]);

      let verification = 0;
      if (metricsRes.status === 'fulfilled' && metricsRes.value.success) {
        const vMetric = metricsRes.value.data.find((m) => m.id === 'verification');
        verification = vMetric ? Number(vMetric.value) || 0 : 0;
      }

      let reports = 0;
      if (reportsRes.status === 'fulfilled' && reportsRes.value.success) {
        reports = reportsRes.value.data.length || 0;
      }

      let notifications = 0;
      if (notifsRes.status === 'fulfilled' && notifsRes.value.success) {
        notifications = notifsRes.value.data.filter((n) => n.unread).length || 0;
      }

      // NOTE (T-F030): PaymentRepository is not refactored yet (T-F038), so the
      // payments badge counts locally-filtered pending withdrawals.
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
        disputes: 0,
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
