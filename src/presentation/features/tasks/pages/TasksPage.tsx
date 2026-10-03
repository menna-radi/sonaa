import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { PageHeader, Button, EmptyState, Segmented, Skeleton, ErrorState } from '../../../components/ui';
import { formatRelativeTime } from '../../../../core/utils/format';
import { toCsv, downloadCsv } from '../../../../core/utils/csv';
import { useTasks, TASKS_PAGE_SIZE } from '../hooks/useTasks';
import type { Task, TaskFilter } from '../../../../domain/entities/Task';
import { TasksKpis } from '../components/TasksKpis';
import { TasksTable } from '../components/TasksTable';
import { EmergencyBanner } from '../components/EmergencyBanner';
import { TaskDetailDrawer } from '../components/TaskDetailDrawer';
import { Download, RefreshCw, ClipboardList } from 'lucide-react';
import '../tasks.css';

type PageSegment = 'tasks' | 'disputes';

function readSegment(): PageSegment {
  try {
    if (sessionStorage.getItem('tasks_tab') === 'disputes') {
      sessionStorage.removeItem('tasks_tab');
      return 'disputes';
    }
  } catch {
    // storage unavailable — default to tasks
  }
  return 'tasks';
}

export const TasksPage: React.FC = () => {
  const { t, language } = useLanguage();
  const q = useTasks();
  const [segment, setSegment] = useState<PageSegment>(readSegment);
  const [selected, setSelected] = useState<Task | null>(null);

  const openTask = (task: Task) => {
    setSelected(task);
  };

  const closeTask = () => {
    setSelected(null);
  };

  const openDisputes = () => setSegment('disputes');
  const emergencyTask = q.rows.find((row) => row.isEmergency) ?? null;

  const handleExport = () => {
    const rows: (string | number | null)[][] = [
      ['ID', 'Title', 'Customer', 'Craftsman', 'Amount (ILS)', 'Status', 'Created'],
      ...q.rows.map((row) => [
        row.displayId,
        row.title,
        row.customerName,
        row.craftsmanName,
        row.amount,
        row.status,
        row.createdAt,
      ]),
    ];
    downloadCsv('sonaa_tasks.csv', toCsv(rows));
  };

  return (
    <div className="ui-page">
      <PageHeader
        title={t('tasks_title')}
        subtitle={t('tasks_subtitle')}
        meta={q.dataUpdatedAt ? `${t('updated')} ${formatRelativeTime(q.dataUpdatedAt, language)}` : undefined}
        actions={
          <>
            <Button variant="outline" size="sm" icon={<Download size={14} />} onClick={handleExport}>
              {t('btn_export_csv')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw size={14} />}
              loading={q.isFetching}
              onClick={() => q.refetch()}
            >
              {t('btn_refresh')}
            </Button>
          </>
        }
      />
      <div>
        <Segmented
          value={segment}
          onChange={(v) => setSegment(v as PageSegment)}
          items={[
            { value: 'tasks', label: t('tasks_seg_tasks') },
            { value: 'disputes', label: t('tasks_seg_disputes') },
          ]}
        />
      </div>
      {segment === 'disputes' ? (
        <EmptyState icon={<ClipboardList size={20} />} title={t('coming_soon')} />
      ) : q.error && q.rows.length === 0 ? (
        <ErrorState
          title={t('status_error_title')}
          message={q.error.message}
          onRetry={() => q.refetch()}
          retryLabel={t('btn_retry')}
        />
      ) : q.loading ? (
        <div className="ui-stack">
          <div className="ui-kpi-grid ui-kpi-grid--4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="card" height={120} />
            ))}
          </div>
          <Skeleton variant="card" height={320} />
        </div>
      ) : (
        <>
          <TasksKpis counts={q.counts} loading={false} />
          <EmergencyBanner task={emergencyTask} onOpen={openTask} />
          <TasksTable
            rows={q.rows}
            total={q.total}
            loading={false}
            error={null}
            onRetry={() => q.refetch()}
            filter={q.filter}
            onFilterChange={(f: TaskFilter) => q.setFilter(f)}
            counts={q.counts}
            search={q.search}
            onSearchChange={q.setSearch}
            page={q.page}
            limit={TASKS_PAGE_SIZE}
            onPageChange={q.setPage}
            onSelect={openTask}
          />
        </>
      )}
      <TaskDetailDrawer task={selected} onClose={closeTask} onOpenDisputes={openDisputes} />
    </div>
  );
};

export default TasksPage;
