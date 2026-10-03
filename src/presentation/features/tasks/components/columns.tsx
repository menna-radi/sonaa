import React from 'react';
import type { ColumnDef } from '../../../components/ui/DataTable';
import type { Task } from '../../../../domain/entities/Task';
import { StatusPill, pillVariantFor, IconButton, Button } from '../../../components/ui';
import { formatMoney } from '../../../../core/utils/format';
import { AlertTriangle, MapPin, Clock, Snowflake, Check, MoreHorizontal } from 'lucide-react';

export interface TasksColumnsOptions {
  onFreeze?: (id: string) => void;
  onUnfreeze?: (id: string) => void;
  onResolve?: (id: string) => void;
  onSelect?: (task: Task) => void;
}

export const getTasksColumns = (options: TasksColumnsOptions = {}): ColumnDef<Task>[] => [
  {
    key: 'task',
    header: 'Task',
    render: (t) => {
      const isUrgent = t.isEmergency || t.status === 'DISPUTED';
      return (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-2)', minWidth: 180 }}>
          {isUrgent && (
            <AlertTriangle
              size={15}
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
              title={t.title}
            >
              {t.title}
            </span>
            <span style={{ fontSize: 'var(--fs-micro)', color: 'var(--text-faint)' }}>
              {t.displayId}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    key: 'customer',
    header: 'Customer',
    hideOnTablet: true,
    render: (t) => (
      <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-primary)', fontWeight: 500 }}>
        {t.customerName || '—'}
      </span>
    ),
  },
  {
    key: 'craftsman',
    header: 'Craftsman',
    render: (t) => (
      <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-secondary)' }}>
        {t.craftsmanName || '—'}
      </span>
    ),
  },
  {
    key: 'zone',
    header: 'Zone',
    hideOnTablet: true,
    render: (t) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <MapPin size={12} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
        <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-muted)' }}>
          {t.address || '—'}
        </span>
      </div>
    ),
  },
  {
    key: 'budget',
    header: 'Budget',
    align: 'end',
    render: (t) => (
      <span
        style={{
          fontVariantNumeric: 'tabular-nums',
          fontWeight: 600,
          fontSize: 'var(--fs-caption)',
          color: 'var(--text-primary)',
        }}
      >
        {t.amount ? formatMoney(t.amount) : 'Open price'}
      </span>
    ),
  },
  {
    key: 'eta',
    header: 'ETA',
    render: (t) => {
      if (t.isEmergency) {
        return (
          <span style={{ fontSize: 'var(--fs-micro)', fontWeight: 700, color: 'var(--danger-text)' }}>
            NOW
          </span>
        );
      }
      if (!t.startedAt && !t.acceptedAt) return <span style={{ color: 'var(--text-faint)' }}>—</span>;
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={12} style={{ color: 'var(--text-faint)' }} />
          <span style={{ fontSize: 'var(--fs-micro)', color: 'var(--text-secondary)' }}>{t.startedAt || t.acceptedAt || ''}</span>
        </div>
      );
    },
  },
  {
    key: 'status',
    header: 'Status',
    render: (t) => {
      const variant = pillVariantFor('task', t.status);
      const label = t.status.replace('_', ' ').toUpperCase();
      return <StatusPill variant={variant} label={label} pulse={t.isEmergency} />;
    },
  },
  {
    key: 'actions',
    header: 'Actions',
    align: 'end',
    render: (t) => {
      const isFrozen = t.status === 'FROZEN';
      return (
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-1)', justifyContent: 'flex-end' }}
          onClick={(e) => e.stopPropagation()}
        >
          {isFrozen ? (
            <IconButton
              aria-label="Unfreeze task"
              icon={<Snowflake size={14} style={{ color: 'var(--info)' }} />}
              size="sm"
              onClick={() => options.onUnfreeze?.(t.id)}
            />
          ) : (
            <IconButton
              aria-label="Freeze task"
              icon={<Snowflake size={14} style={{ color: 'var(--text-muted)' }} />}
              size="sm"
              onClick={() => options.onFreeze?.(t.id)}
            />
          )}

          {t.status === 'DISPUTED' && (
            <IconButton
              aria-label="Resolve dispute"
              icon={<Check size={14} style={{ color: 'var(--success)' }} />}
              size="sm"
              onClick={() => options.onResolve?.(t.id)}
            />
          )}

          <IconButton
            aria-label="More options"
            icon={<MoreHorizontal size={14} />}
            size="sm"
            onClick={() => options.onSelect?.(t)}
          />
        </div>
      );
    },
  },
];
