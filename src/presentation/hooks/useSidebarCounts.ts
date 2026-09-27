import { useQuery } from '@tanstack/react-query';
import { useDependencies } from '../../core/di/DependencyProvider';

export interface SidebarCounts {
  verification: number;
  reports: number;
  notifications: number;
  payments: number;
}

export function useSidebarCounts() {
  const { dependencies } = useDependencies();

  return useQuery<SidebarCounts>({
    queryKey: ['sidebarCounts'],
    queryFn: async () => {
      const [metricsRes, reportsRes, notifsRes, paymentsRes] = await Promise.allSettled([
        dependencies.metricRepository.getMetrics(),
        dependencies.metricRepository.getPendingReports(),
        dependencies.notificationRepository.getNotifications(),
        dependencies.paymentRepository.getSubscriptionRequests('PENDING_VERIFICATION'),
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

      let payments = 0;
      if (paymentsRes.status === 'fulfilled' && paymentsRes.value.success) {
        payments = paymentsRes.value.data.length || 0;
      }

      return {
        verification,
        reports,
        notifications,
        payments,
      };
    },
    staleTime: 30000,
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
  });
}
