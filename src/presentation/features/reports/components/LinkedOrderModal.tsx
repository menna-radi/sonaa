import React from 'react';
import { Briefcase, ExternalLink } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { formatMoney } from '../../../../core/utils/format';
import { ReportItem } from '../types';

interface LinkedOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ReportItem;
  onOpenTasksCenter: () => void;
}

export const LinkedOrderModal: React.FC<LinkedOrderModalProps> = ({
  isOpen,
  onClose,
  report,
  onOpenTasksCenter,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
          <Briefcase size={20} style={{ color: 'var(--primary)' }} />
          <span>Linked Order #{report.taskDisplayId || report.id}</span>
        </div>
      }
      footer={
        <div style={{ display: 'flex', gap: 'var(--sp-2)', justifyContent: 'flex-end', width: '100%' }}>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" icon={<ExternalLink size={14} />} onClick={onOpenTasksCenter}>
            Open Tasks Center
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
        <div
          style={{
            background: 'var(--surface-sunken)',
            padding: 'var(--sp-4)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              color: 'var(--on-surface-subtle)',
              textTransform: 'uppercase',
              marginBottom: 'var(--sp-1)',
            }}
          >
            Order Title
          </div>
          <div
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 600,
              color: 'var(--on-surface)',
              marginBottom: 'var(--sp-3)',
            }}
          >
            {report.taskTitle || 'Custom Service Order'}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
            <div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--on-surface-subtle)' }}>
                Category
              </span>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--on-surface)' }}>
                {report.category.toUpperCase()}
              </div>
            </div>
            <div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--on-surface-subtle)' }}>
                Order Status
              </span>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--primary)' }}>
                IN_PROGRESS / DISPUTED
              </div>
            </div>
            <div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--on-surface-subtle)' }}>
                Agreed Budget
              </span>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--success)' }}>
                {formatMoney(report.orderBudget || 250)}
              </div>
            </div>
            <div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--on-surface-subtle)' }}>
                Location
              </span>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--on-surface)' }}>
                Jerusalem (القدس)
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
          <div
            style={{
              background: 'var(--surface-sunken)',
              padding: 'var(--sp-3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <span
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--on-surface-subtle)',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Customer
            </span>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--on-surface)' }}>
              {report.reporter}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--on-surface-muted)' }}>
              {report.reporterPhone || '—'}
            </div>
          </div>

          <div
            style={{
              background: 'var(--surface-sunken)',
              padding: 'var(--sp-3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <span
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--on-surface-subtle)',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Assigned Craftsman
            </span>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--on-surface)' }}>
              {report.subject}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--on-surface-muted)' }}>
              {report.suspectPhone || '—'}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
