import React from 'react';
import type { Task, TaskFilter } from '../../../../domain/entities/Task';
import {
  Card,
  SearchInput,
  Segmented,
  DataTable,
  EmptyState,
  StatusPill,
  pillVariantFor,
} from '../../../components/ui';
import { getTasksColumns } from './columns';
import { formatMoney } from '../../../../core/utils/format';
import { CheckSquare, AlertTriangle, MapPin } from 'lucide-react';

interface TasksTableProps {
  tasks: Task[];
  loading?: boolean;
  selectedTask: Task | null;
  onSelectTask: (task: Task) => void;
  searchTerm: string;
  onSearchChange: (q: string) => void;
  activeFilter: TaskFilter;
  onFilterChange: (f: TaskFilter) => void;
  filterCounts: {
    all: number;
    live: number;
    emergency: number;
    disputed: number;
    completed: number;
  };
  onFreeze?: (id: string) => void;
  onUnfreeze?: (id: string) => void;
  onResolve?: (id: string) => void;
}

export const TasksTable: React.FC<TasksTableProps> = ({
  tasks,
  loading = false,
  selectedTask,
  onSelectTask,
  searchTerm,
  onSearchChange,
  activeFilter,
  onFilterChange,
  filterCounts,
  onFreeze,
  onUnfreeze,
  onResolve,
}) => {
  const columns = getTasksColumns({
    onFreeze,
    onUnfreeze,
    onResolve,
    onSelect: onSelectTask,
  });

  const filterTabs = [
    { value: 'all', label: 'All', count: filterCounts.all },
    { value: 'live', label: 'Live', count: filterCounts.live },
    { value: 'emergency', label: 'Emergency', count: filterCounts.emergency, tone: 'danger' as const },
    { value: 'disputed', label: 'Disputed', count: filterCounts.disputed },
    { value: 'completed', label: 'Completed', count: filterCounts.completed },
  ];

  const renderMobileRow = (t: Task) => {
    const isUrgent = t.isEmergency || t.status === 'DISPUTED';
    const isSelected = selectedTask?.id === t.id;

    return (
      <div
        key={t.id}
        onClick={() => onSelectTask(t)}
        style={{
          padding: 'var(--sp-3)',
          borderRadius: 'var(--r-md)',
          border: '1px solid var(--border-subtle)',
          backgroundColor: isSelected ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--sp-2)',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-2)', minWidth: 0 }}>
            {isUrgent && (
              <AlertTriangle
                size={16}
                style={{
                  color: t.isEmergency ? 'var(--danger)' : 'var(--warning)',
                  flexShrink: 0,
                  marginTop: 2,
                }}
              />
            )}
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span
                style={{
                  fontWeight: 600,
                  fontSize: 'var(--fs-caption)',
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {t.title}
              </span>
              <span style={{ fontSize: 'var(--fs-micro)', color: 'var(--text-faint)' }}>{t.displayId}</span>
            </div>
          </div>

          <span
            style={{
              fontSize: 'var(--fs-caption)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {t.amount ? formatMoney(t.amount, 'ILS') : 'Open'}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--fs-micro)', color: 'var(--text-muted)' }}>
            <MapPin size={12} style={{ color: 'var(--text-faint)' }} />
            <span>{t.address} · {t.customerName}</span>
          </div>

          <StatusPill
            variant={pillVariantFor('task', t.status)}
            label={t.status.replace('_', ' ').toUpperCase()}
            pulse={t.isEmergency}
          />
        </div>
      </div>
    );
  };

  return (
    <Card
      padding="none"
      className="tasks-table-card"
      style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}
    >
      {/* Controls Header */}
      <div
        style={{
          padding: 'var(--sp-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--sp-3)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
          <Segmented
            value={activeFilter}
            onChange={(val) => onFilterChange(val as TaskFilter)}
            items={filterTabs}
          />
          <div style={{ width: '100%', maxWidth: 300 }}>
            <SearchInput
              value={searchTerm}
              onChange={onSearchChange}
              placeholder="Search by ID, customer, title…"
            />
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <DataTable
          columns={columns}
          rows={tasks}
          rowKey={(t) => t.id}
          selectedKey={selectedTask?.id}
          onRowClick={onSelectTask}
          rowTone={(t) => (t.isEmergency || t.status === 'DISPUTED' ? 'alert' : undefined)}
          loading={loading}
          mobile={renderMobileRow}
          empty={
            <EmptyState
              icon={<CheckSquare size={32} />}
              title="No tasks match the filter"
              description="Adjust your search keywords or toggle between the filter tabs to view tasks."
            />
          }
        />
      </div>
    </Card>
  );
};

export default TasksTable;
