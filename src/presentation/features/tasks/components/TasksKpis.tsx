import React from 'react';
import { KpiCard } from '../../../components/ui';
import { formatNumber } from '../../../../core/utils/format';
import { useLanguage } from '../../../context/LanguageContext';
import type { TasksResult } from '../../../../domain/repositories/TaskRepository';
import { Activity, AlertTriangle, Scale, CheckCircle } from 'lucide-react';

interface TasksKpisProps {
  counts: TasksResult['counts'];
  loading?: boolean;
}

export const TasksKpis: React.FC<TasksKpisProps> = ({ counts, loading = false }) => {
  const { t, language } = useLanguage();

  return (
    <div className="ui-kpi-grid ui-kpi-grid--4">
      {counts?.live !== undefined && (
        <KpiCard
          icon={<Activity size={16} />}
          label={t('tasks_kpi_open')}
          value={formatNumber(counts.live, language)}
          loading={loading}
        />
      )}
      {counts?.emergency !== undefined && (
        <KpiCard
          icon={<AlertTriangle size={16} />}
          label={t('tasks_kpi_emergency')}
          value={formatNumber(counts.emergency, language)}
          tone={counts.emergency > 0 ? 'danger' : 'default'}
          loading={loading}
        />
      )}
      {counts?.disputed !== undefined && (
        <KpiCard
          icon={<Scale size={16} />}
          label={t('tasks_kpi_disputed')}
          value={formatNumber(counts.disputed, language)}
          tone={counts.disputed > 0 ? 'danger' : 'default'}
          loading={loading}
        />
      )}
      {counts?.done !== undefined && (
        <KpiCard
          icon={<CheckCircle size={16} />}
          label={t('tasks_kpi_completed')}
          value={formatNumber(counts.done, language)}
          loading={loading}
        />
      )}
    </div>
  );
};

export default TasksKpis;
