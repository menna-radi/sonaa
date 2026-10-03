import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../core/network/apiClient';
import { queryKeys } from '../../../../core/query/queryKeys';
import { useLanguage } from '../../../context/LanguageContext';
import { Card, StatusPill } from '../../../components/ui';

interface HealthResponse {
  status?: string;
  checks?: Record<string, string | undefined>;
  migrations?: {
    status?: 'ok' | 'pending';
    pending?: string[];
  };
}

type Variant = 'success' | 'warning' | 'danger' | 'muted';

const SERVICES: { key: string; labelKey: string }[] = [
  { key: 'api', labelKey: 'live_svc_api' },
  { key: 'database', labelKey: 'live_svc_database' },
  { key: 'redis', labelKey: 'live_svc_realtime' },
  { key: 'push', labelKey: 'live_push' },
];

export const SystemStatus: React.FC = () => {
  const { t } = useLanguage();
  const { data: health, isLoading, isError } = useQuery<HealthResponse>({
    queryKey: [...queryKeys.live, 'health'],
    queryFn: () => apiClient.get<HealthResponse>('/health'),
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
  });

  const serviceStatus = (key: string): { label: string; variant: Variant } => {
    if (isLoading) return { label: t('live_sys_checking'), variant: 'warning' };
    if (isError || !health) return { label: t('live_sys_unknown'), variant: 'muted' };
    const val = health.checks?.[key];
    if (val === 'ok' || val === 'up' || (!val && health.status === 'ok')) {
      return { label: t('live_sys_operational'), variant: 'success' };
    }
    if (val === 'degraded' || val === 'warn') return { label: t('live_sys_degraded'), variant: 'warning' };
    return { label: t('live_sys_down'), variant: 'danger' };
  };

  const migrationStatus = (): { label: string; variant: Variant } => {
    if (isLoading) return { label: t('live_sys_checking'), variant: 'warning' };
    const s = health?.migrations?.status;
    if (s === 'ok') return { label: t('live_migrations_ok'), variant: 'success' };
    if (s === 'pending') return { label: t('live_migrations_pending'), variant: 'danger' };
    return { label: t('live_sys_unknown'), variant: 'muted' };
  };

  const migrations = migrationStatus();

  return (
    <Card eyebrow={t('live_sys_eyebrow')} title={t('live_sys_title')}>
      <div className="live-sys">
        {health?.migrations?.status === 'pending' && <div className="live-sys__warn">{t('live_migrations_pending_warn')}</div>}
        <div>
          {SERVICES.map((svc) => {
            const status = serviceStatus(svc.key);
            return (
              <div key={svc.key} className="live-sys__row">
                <span>{t(svc.labelKey)}</span>
                <StatusPill variant={status.variant} label={status.label} pulse={status.variant === 'danger'} />
              </div>
            );
          })}
          <div className="live-sys__row">
            <span>{t('live_migrations')}</span>
            <StatusPill variant={migrations.variant} label={migrations.label} pulse={migrations.variant === 'danger'} />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SystemStatus;
