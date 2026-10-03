import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Button, Card, Drawer, EmptyState, ErrorState, KeyValueList, ProofViewer, Skeleton, StatusPill } from '../../../components/ui';
import { pillVariantFor, statusLabelKey } from '../../../components/ui/status';
import { useConfirm } from '../../../components/ui/ConfirmDialog';
import { formatDateTime, formatMoney, formatRelativeTime } from '../../../../core/utils/format';
import type { Task } from '../../../../domain/entities/Task';
import type { Dispute } from '../../../../domain/entities/Dispute';
import { useTasks } from '../hooks/useTasks';
import { useTaskDetail } from '../hooks/useTaskDetail';
import { DispatchBackupModal } from './DispatchBackupModal';
import { Snowflake } from 'lucide-react';

const DISPATCHABLE: Task['status'][] = ['PENDING', 'ACCEPTED', 'PRE_CHAT_PENDING', 'CHAT_OPEN', 'AGREEMENT_PENDING', 'IN_PROGRESS'];

interface TaskDetailDrawerProps {
  task: Task | null;
  onClose: () => void;
  onOpenDisputes: () => void;
  dispute?: Dispute | null;
  onResolveDispute?: (dispute: Dispute) => void;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({ task, onClose, onOpenDisputes, dispute, onResolveDispute }) => {
  const { t, language } = useLanguage();
  const confirm = useConfirm();
  const { mutations } = useTasks();
  const detailQ = useTaskDetail(task?.id);
  const [dispatchOpen, setDispatchOpen] = useState(false);

  const detail = detailQ.data ?? null;
  const view = detail?.task ?? task;
  const busy = mutations.freeze.isPending || mutations.unfreeze.isPending;

  const handleFreezeToggle = async () => {
    if (!view) return;
    const frozen = view.status === 'FROZEN';
    const ok = await confirm({
      title: frozen ? t('tasks_unfreeze_title') : t('tasks_freeze_title'),
      body: frozen ? t('tasks_unfreeze_body') : t('tasks_freeze_body'),
      tone: frozen ? 'default' : 'warning',
    });
    if (!ok) return;
    if (frozen) mutations.unfreeze.mutate(view.id);
    else mutations.freeze.mutate(view.id);
  };

  const timeline: Array<[string, string | undefined]> = detail
    ? [
        [t('tasks_timeline_created'), detail.task.createdAt],
        [t('tasks_timeline_accepted'), detail.task.acceptedAt],
        [t('tasks_timeline_started'), detail.task.startedAt],
        [t('tasks_timeline_completed'), detail.task.completedAt],
      ]
    : [];

  return (
    <>
      <Drawer
        isOpen={!!task}
        onClose={onClose}
        title={view ? `${view.displayId} · ${view.title}` : t('tasks_details_title')}
        subtitle={
          view ? (
            <StatusPill variant={pillVariantFor('task', view.status)} label={t(statusLabelKey('task', view.status))} />
          ) : undefined
        }
      >
        {!view ? (
          <EmptyState title={t('empty_tasks')} />
        ) : detailQ.isLoading ? (
          <Skeleton variant="card" height={320} />
        ) : detailQ.isError ? (
          <ErrorState title={t('status_error_title')} message={detailQ.error.message} onRetry={() => detailQ.refetch()} retryLabel={t('btn_retry')} />
        ) : (
          <div className="ui-stack">
            <KeyValueList
              items={[
                { label: t('tasks_col_customer'), value: detail?.customer ? `${detail.customer.name}${detail.customer.phone ? ` · ${detail.customer.phone}` : ''}` : view.customerName },
                {
                  label: t('tasks_col_craftsman'),
                  value: detail?.craftsman
                    ? `${detail.craftsman.name}${detail.craftsman.phone ? ` · ${detail.craftsman.phone}` : ''}`
                    : (view.craftsmanName ?? '—'),
                },
                { label: t('tasks_col_category'), value: view.category || '—' },
                { label: t('billing_col_amount'), value: <bdi className="ui-num">{formatMoney(view.amount, 'ILS', language)}</bdi> },
                {
                  label: t('tasks_col_created'),
                  value: (
                    <span title={view.createdAt ? formatDateTime(view.createdAt, language) : undefined}>
                      {view.createdAt ? formatRelativeTime(view.createdAt, language) : '—'}
                    </span>
                  ),
                },
              ]}
            />
            <div>
              <div className="ui-eyebrow">{t('tasks_timeline_title')}</div>
              <div className="task-timeline">
                {timeline.map(([label, at]) => (
                  <div key={label} className="ui-row ui-row--between">
                    <span className="ui-caption">{label}</span>
                    <bdi className="ui-num ui-caption">{at ? formatDateTime(at, language) : '—'}</bdi>
                  </div>
                ))}
              </div>
            </div>
            {(detail?.workProof.imageUrls.length ?? 0) > 0 && (
              <div>
                <div className="ui-eyebrow">{t('tasks_work_proof')}</div>
                <div className="task-proof-row">
                  {(detail?.workProof.imageUrls ?? []).map((src) => (
                    <ProofViewer key={src} src={src} alt={view.title} size={64} />
                  ))}
                </div>
              </div>
            )}
            {(detail?.cancel.reason || detail?.cancel.note) && (
              <Card title={t('tasks_cancel_title')}>
                <p className="ui-caption">
                  {[detail?.cancel.reason, detail?.cancel.note].filter(Boolean).join(' · ')}
                </p>
              </Card>
            )}
            {view.hasDispute && (
              <Card
                title={t('sec_pending_disputes')}
                actions={
                  dispute && onResolveDispute ? (
                    <Button size="sm" variant="primary" onClick={() => onResolveDispute(dispute)}>
                      {t('disputes_resolve')}
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={onOpenDisputes}>
                      {t('disputes_open')}
                    </Button>
                  )
                }
              >
                <p className="ui-caption">
                  {dispute
                    ? `${dispute.taskDisplayId} · ${t(`dispute_reason_${dispute.reason.toLowerCase()}`)}`
                    : t('disputes_open_body')}
                </p>
              </Card>
            )}
            <div className="task-drawer-actions">
              <Button
                size="sm"
                variant={view.status === 'FROZEN' ? 'primary' : 'outline'}
                icon={<Snowflake size={14} />}
                disabled={busy}
                onClick={() => void handleFreezeToggle()}
              >
                {view.status === 'FROZEN' ? t('tasks_unfreeze') : t('tasks_freeze')}
              </Button>
              {DISPATCHABLE.includes(view.status) && (
                <Button size="sm" variant="outline" disabled={busy} onClick={() => setDispatchOpen(true)}>
                  {t('tasks_dispatch')}
                </Button>
              )}
            </div>
          </div>
        )}
      </Drawer>
      <DispatchBackupModal task={view} isOpen={dispatchOpen} onClose={() => setDispatchOpen(false)} />
    </>
  );
};

export default TaskDetailDrawer;
