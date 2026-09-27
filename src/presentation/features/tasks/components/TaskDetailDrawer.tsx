import React, { useState } from 'react';
import type { Task } from '../../../../domain/entities/Task';
import { Drawer, StatusPill, pillVariantFor, Button, ConfirmDialog, useToast } from '../../../components/ui';
import { formatMoney } from '../../../../core/utils/format';
import { useNavigation } from '../../../context/NavigationContext';
import { Snowflake, MessageSquare, MapPin, User, Wrench, DollarSign, Clock } from 'lucide-react';

interface TaskDetailDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onFreeze?: (id: string) => Promise<void> | void;
  onUnfreeze?: (id: string) => Promise<void> | void;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  task,
  isOpen,
  onClose,
  onFreeze,
  onUnfreeze,
}) => {
  const { navigate } = useNavigation();
  const { success } = useToast();
  const [freezeConfirmOpen, setFreezeConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!task) return null;

  const isFrozen = task.status === 'frozen';

  const handleToggleFreeze = async () => {
    setLoading(true);
    try {
      if (isFrozen) {
        await onUnfreeze?.(task.id);
        success(`Task ${task.jobNumber} unfrozen.`);
      } else {
        await onFreeze?.(task.id);
        success(`Task ${task.jobNumber} frozen.`);
      }
      setFreezeConfirmOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            <span>{task.jobNumber}</span>
            <StatusPill
              variant={pillVariantFor('task', task.status)}
              label={task.status.replace('_', ' ').toUpperCase()}
            />
          </div>
        }
        subtitle={task.title}
        showBackOnMobile
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', padding: 'var(--sp-2) 0' }}>
          {/* Key Facts Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 'var(--sp-3)',
              backgroundColor: 'var(--bg-surface-elevated)',
              padding: 'var(--sp-3)',
              borderRadius: 'var(--r-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div>
              <span style={{ fontSize: 'var(--fs-micro)', color: 'var(--text-muted)' }}>Customer</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <User size={14} style={{ color: 'var(--text-secondary)' }} />
                <strong style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-primary)' }}>
                  {task.customer || '—'}
                </strong>
              </div>
            </div>

            <div>
              <span style={{ fontSize: 'var(--fs-micro)', color: 'var(--text-muted)' }}>Craftsman</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <Wrench size={14} style={{ color: 'var(--text-secondary)' }} />
                <strong style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-primary)' }}>
                  {task.craftsman || 'Unassigned'}
                </strong>
              </div>
            </div>

            <div>
              <span style={{ fontSize: 'var(--fs-micro)', color: 'var(--text-muted)' }}>Location / Zone</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <MapPin size={14} style={{ color: 'var(--text-secondary)' }} />
                <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-primary)' }}>
                  {task.zone || 'Jerusalem'}
                </span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: 'var(--fs-micro)', color: 'var(--text-muted)' }}>Budget</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <DollarSign size={14} style={{ color: 'var(--text-secondary)' }} />
                <strong style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                  {task.amountSAR ? formatMoney(task.amountSAR) : 'Open'}
                </strong>
              </div>
            </div>
          </div>

          {/* Action Tools */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            <span
              style={{
                fontSize: 'var(--fs-micro)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                color: 'var(--text-muted)',
              }}
            >
              Moderation Tools
            </span>

            <Button
              variant={isFrozen ? 'primary' : 'outline'}
              iconLeading={<Snowflake size={14} />}
              onClick={() => setFreezeConfirmOpen(true)}
            >
              {isFrozen ? 'Unfreeze Task' : 'Freeze Task'}
            </Button>

            <Button
              variant="outline"
              iconLeading={<MessageSquare size={14} />}
              onClick={() => {
                onClose();
                navigate('chat');
              }}
            >
              Open Task Chatroom
            </Button>
          </div>
        </div>
      </Drawer>

      <ConfirmDialog
        isOpen={freezeConfirmOpen}
        title={isFrozen ? `Unfreeze Task ${task.jobNumber}?` : `Freeze Task ${task.jobNumber}?`}
        description={
          isFrozen
            ? 'Unfreezing will restore payment processing and communication channels for this task.'
            : 'Freezing will halt in-flight funds, disable craftsman messaging, and place this task under administrative review.'
        }
        confirmLabel={isFrozen ? 'Unfreeze Task' : 'Freeze Task'}
        confirmVariant={isFrozen ? 'primary' : 'danger'}
        isLoading={loading}
        onConfirm={handleToggleFreeze}
        onCancel={() => setFreezeConfirmOpen(false)}
      />
    </>
  );
};

export default TaskDetailDrawer;
