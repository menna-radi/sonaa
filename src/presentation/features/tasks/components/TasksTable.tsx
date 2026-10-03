import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Card, DataTable, EmptyState, ErrorState, SearchInput, Segmented } from '../../../components/ui';
import { StatusPill } from '../../../components/ui';
import { pillVariantFor, statusLabelKey } from '../../../components/ui/status';
import { formatMoney } from '../../../../core/utils/format';
import type { Task, TaskFilter } from '../../../../domain/entities/Task';
import type { TasksResult } from '../../../../domain/repositories/TaskRepository';
import { getTasksColumns } from './columns';
import { ClipboardList } from 'lucide-react';

interface TasksTableProps {
  rows: Task[];
  total: number;
  loading: boolean;
  error: Error | null;
  onRetry: () => void;
  filter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  counts: TasksResult['counts'];
  search: string;
  onSearchChange: (q: string) => void;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onSelect: (task: Task) => void;
}

const FILTERS: TaskFilter[] = ['all', 'live', 'emergency', 'disputed', 'done', 'cancelled', 'frozen'];

export const TasksTable: React.FC<TasksTableProps> = ({
  rows,
  total,
  loading,
  error,
  onRetry,
  filter,
  onFilterChange,
  counts,
  search,
  onSearchChange,
  page,
  limit,
  onPageChange,
  onSelect,
}) => {
  const { t, language } = useLanguage();
  const columns = getTasksColumns(t, language);
  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, limit)));

  const countFor = (f: TaskFilter): number | undefined => {
    if (!counts) return undefined;
    return counts[f];
  };

  return (
    <div className="ui-stack">
      <div className="ui-toolbar">
        <Segmented
          value={filter}
          onChange={(v) => onFilterChange(v as TaskFilter)}
          items={FILTERS.map((f) => ({ value: f, label: t(`tasks_filter_${f}`), count: countFor(f) }))}
        />
        <div className="ui-toolbar__grow">
          <SearchInput value={search} onChange={onSearchChange} placeholder={t('tasks_search_ph')} />
        </div>
      </div>
      <Card padding="none">
        {error ? (
          <ErrorState title={t('status_error_title')} message={error.message} onRetry={onRetry} retryLabel={t('btn_retry')} />
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(task) => task.id}
            onRowClick={onSelect}
            rowTone={(task) => (task.isEmergency || task.status === 'DISPUTED' ? 'alert' : undefined)}
            loading={loading}
            empty={<EmptyState icon={<ClipboardList size={20} />} title={t('empty_tasks')} />}
            pagination={{ page, totalPages, totalItems: total, pageSize: limit, onPageChange }}
            mobile={(task: Task) => (
              <div className="task-card" onClick={() => onSelect(task)} role="button" tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(task);
                  }
                }}
              >
                <div className="task-card__top">
                  <span className="task-cell">
                    <bdi className="ui-num task-cell__id">{task.displayId}</bdi>
                    <span className="task-cell__title">{task.title}</span>
                  </span>
                  <StatusPill variant={pillVariantFor('task', task.status)} label={t(statusLabelKey('task', task.status))} />
                </div>
                <div className="task-card__bottom">
                  <span className="ui-caption">
                    {task.customerName}
                    {task.craftsmanName ? ` · ${task.craftsmanName}` : ''}
                  </span>
                  <bdi className="ui-num">{formatMoney(task.amount, 'ILS', language)}</bdi>
                </div>
              </div>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default TasksTable;
