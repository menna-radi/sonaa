import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Button, EmptyState, ErrorState, Skeleton } from '../../../components/ui';
import { useConfirm } from '../../../components/ui/ConfirmDialog';
import { useToast } from '../../../components/ui/Toast';
import { errorMessage } from '../../../../core/errors/errorMessage';
import type { AppError } from '../../../../core/errors/AppError';
import type { SubscriptionPlan } from '../../../../domain/entities/Billing';
import { usePlans } from '../hooks/useBilling';
import { useDeletePlan, useSavePlan, useTogglePlanActive } from '../hooks/useBillingMutations';
import { PlanCard } from './PlanCard';
import { PlanFormModal } from './PlanFormModal';
import { Plus, PackageOpen } from 'lucide-react';

export const PlansTab: React.FC = () => {
  const { t } = useLanguage();
  const confirm = useConfirm();
  const toast = useToast();
  const plansQ = usePlans();
  const toggleActive = useTogglePlanActive();
  const remove = useDeletePlan();
  const save = useSavePlan();
  const busy = toggleActive.isPending || remove.isPending || save.isPending;

  // 'new' = create modal, plan object = edit modal, null = closed.
  const [modal, setModal] = useState<SubscriptionPlan | 'new' | null>(null);

  const handleDelete = async (plan: SubscriptionPlan) => {
    const ok = await confirm({
      title: t('plans_delete_title'),
      body: t('plans_delete_body'),
      tone: 'danger',
    });
    if (!ok) return;
    remove.mutate(plan.id, {
      onError: (e: Error) => {
        const status = (e as AppError).status;
        if (status === 409 || (typeof status === 'number' && status >= 500)) {
          toast.error(t('err_plan_in_use'));
        } else {
          toast.error(errorMessage(e, t));
        }
      },
    });
  };

  return (
    <div className="ui-stack">
      <div className="ui-row ui-row--end">
        <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setModal('new')}>
          {t('plans_new')}
        </Button>
      </div>
      {plansQ.isError ? (
        <ErrorState message={plansQ.error.message} onRetry={() => plansQ.refetch()} retryLabel={t('btn_retry')} />
      ) : plansQ.isLoading ? (
        <div className="ui-grid-auto">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="card" height={280} />
          ))}
        </div>
      ) : (plansQ.data ?? []).length === 0 ? (
        <EmptyState icon={<PackageOpen size={20} />} title={t('empty_plans')} />
      ) : (
        <div className="ui-grid-auto">
          {(plansQ.data ?? []).map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              busy={busy}
              onEdit={(p) => setModal(p)}
              onToggleActive={(p) => toggleActive.mutate({ id: p.id, isActive: !p.isActive })}
              onDelete={(p) => void handleDelete(p)}
            />
          ))}
        </div>
      )}
      {modal !== null && (
        <PlanFormModal plan={modal === 'new' ? null : modal} onClose={() => setModal(null)} />
      )}
    </div>
  );
};

export default PlansTab;
