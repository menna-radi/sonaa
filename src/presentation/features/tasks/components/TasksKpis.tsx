import React from 'react';
import { KpiCard } from '../../../components/ui';
import { Activity, AlertTriangle, Scale, Snowflake, CheckCircle } from 'lucide-react';

interface TasksKpisProps {
  metrics: {
    activeTasks: number;
    emergency: number;
    disputed: number;
    frozen: number;
    completedToday: number;
  };
  loading?: boolean;
}

export const TasksKpis: React.FC<TasksKpisProps> = ({ metrics, loading = false }) => {
  return (
    <div
      className="tasks-kpis-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 'var(--sp-3)',
        width: '100%',
      }}
    >
      <KpiCard
        icon={<Activity size={16} />}
        label="Active tasks"
        value={metrics.activeTasks}
        loading={loading}
      />

      <KpiCard
        icon={<AlertTriangle size={16} />}
        label="Emergency alerts"
        value={metrics.emergency}
        tone={metrics.emergency > 0 ? 'danger' : 'default'}
        loading={loading}
      />

      <KpiCard
        icon={<Scale size={16} />}
        label="Disputed"
        value={metrics.disputed}
        loading={loading}
      />

      <KpiCard
        icon={<Snowflake size={16} />}
        label="Frozen"
        value={metrics.frozen}
        loading={loading}
      />

      <KpiCard
        icon={<CheckCircle size={16} />}
        label="Completed today"
        value={metrics.completedToday}
        loading={loading}
      />
    </div>
  );
};

export default TasksKpis;
