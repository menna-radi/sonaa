import React from 'react';
import type { ColumnDef } from '../../../components/ui/DataTable';
import type { Task } from '../../../../domain/entities/Task';
import { StatusPill } from '../../../components/ui';
import { pillVariantFor, statusLabelKey } from '../../../components/ui/status';
import { formatDateTime, formatMoney, formatRelativeTime } from '../../../../core/utils/format';

export const getTasksColumns = (
  t: (k: string) => string,
  language: 'en' | 'ar' | 'he'
): ColumnDef<Task>[] => [
  {
    key: 'job',
    header: t('tasks_col_job'),
    render: (task) => (
      <span className="task-cell">
        <bdi className="ui-num task-cell__id">{task.displayId}</bdi>
        <span className="task-cell__title" title={task.title}>
          {task.title}
        </span>
      </span>
    ),
  },
  {
    key: 'customer',
    header: t('tasks_col_customer'),
    render: (task) => <span>{task.customerName || '—'}</span>,
  },
  {
    key: 'craftsman',
    header: t('tasks_col_craftsman'),
    render: (task) => <span>{task.craftsmanName || '—'}</span>,
  },
  {
    key: 'category',
    header: t('tasks_col_category'),
    render: (task) => <span>{task.category || '—'}</span>,
  },
  {
    key: 'amount',
    header: t('billing_col_amount'),
    align: 'end',
    render: (task) => <bdi className="ui-num">{formatMoney(task.amount, 'ILS', language)}</bdi>,
  },
  {
    key: 'status',
    header: t('billing_col_status'),
    render: (task) => (
      <StatusPill variant={pillVariantFor('task', task.status)} label={t(statusLabelKey('task', task.status))} />
    ),
  },
  {
    key: 'created',
    header: t('tasks_col_created'),
    render: (task) => (
      <span title={task.createdAt ? formatDateTime(task.createdAt, language) : undefined}>
        {task.createdAt ? formatRelativeTime(task.createdAt, language) : '—'}
      </span>
    ),
  },
];
