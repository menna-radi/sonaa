import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { unwrap } from '../../../../core/query/unwrap';
import { useToast } from '../../../components/ui/Toast';
import { useLanguage } from '../../../context/LanguageContext';
import { errorMessage } from '../../../../core/errors/errorMessage';
import type { NotificationItem, NotificationCategory } from '../../../../domain/entities/Notification';

export const NOTIFICATIONS_QUERY_KEY = ['notifications'] as const;

export function useNotifications() {
  const { dependencies } = useDependencies();
  const repo = dependencies.notificationRepository;
  const qc = useQueryClient();
  const { error: toastError, success: toastSuccess } = useToast();
  const { t } = useLanguage();

  const query = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: async () => {
      const res = await repo.getNotifications();
      return unwrap(res);
    },
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await repo.markRead(id);
      return unwrap(res);
    },
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      const previous = qc.getQueryData<NotificationItem[]>(NOTIFICATIONS_QUERY_KEY);
      if (previous) {
        qc.setQueryData<NotificationItem[]>(
          NOTIFICATIONS_QUERY_KEY,
          previous.map((n) => (n.id === id ? { ...n, isRead: true, unread: false } : n))
        );
      }
      return { previous };
    },
    onError: (err, _id, context) => {
      if (context?.previous) {
        qc.setQueryData(NOTIFICATIONS_QUERY_KEY, context.previous);
      }
      toastError(errorMessage(err, t));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      qc.invalidateQueries({ queryKey: ['sidebarCounts'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await repo.markAllRead();
      return unwrap(res);
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      const previous = qc.getQueryData<NotificationItem[]>(NOTIFICATIONS_QUERY_KEY);
      if (previous) {
        qc.setQueryData<NotificationItem[]>(
          NOTIFICATIONS_QUERY_KEY,
          previous.map((n) => ({ ...n, isRead: true, unread: false }))
        );
      }
      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(NOTIFICATIONS_QUERY_KEY, context.previous);
      }
      toastError(errorMessage(err, t));
    },
    onSuccess: () => {
      toastSuccess(t('toast_all_read'));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      qc.invalidateQueries({ queryKey: ['sidebarCounts'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await repo.deleteNotification(id);
      return unwrap(res);
    },
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      const previous = qc.getQueryData<NotificationItem[]>(NOTIFICATIONS_QUERY_KEY);
      if (previous) {
        qc.setQueryData<NotificationItem[]>(
          NOTIFICATIONS_QUERY_KEY,
          previous.filter((n) => n.id !== id)
        );
      }
      return { previous };
    },
    onError: (err, _id, context) => {
      if (context?.previous) {
        qc.setQueryData(NOTIFICATIONS_QUERY_KEY, context.previous);
      }
      toastError(errorMessage(err, t));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      qc.invalidateQueries({ queryKey: ['sidebarCounts'] });
    },
  });

  const notifications = query.data ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    ...query,
    notifications,
    unreadCount,
    markRead: (id: string) => markReadMutation.mutate(id),
    markAllRead: () => markAllReadMutation.mutate(),
    deleteNotification: (id: string) => deleteMutation.mutate(id),
    isMarkingAllRead: markAllReadMutation.isPending,
  };
}

export type { NotificationCategory };
export default useNotifications;
