import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Button, Card, StatusPill } from '../../../components/ui';
import { formatMoney } from '../../../../core/utils/format';
import type { SubscriptionPlan } from '../../../../domain/entities/Billing';

interface PlanCardProps {
  plan: SubscriptionPlan;
  onEdit: (plan: SubscriptionPlan) => void;
  onToggleActive: (plan: SubscriptionPlan) => void;
  onDelete: (plan: SubscriptionPlan) => void;
  busy: boolean;
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, onEdit, onToggleActive, onDelete, busy }) => {
  const { t, language } = useLanguage();
  const name = language === 'ar' ? plan.nameAr : plan.nameEn;
  const features = language === 'ar' ? plan.featuresAr : plan.featuresEn;
  const perMonth = plan.durationMonths > 0 ? plan.price / plan.durationMonths : plan.price;

  return (
    <Card
      title={name}
      subtitle={`${plan.durationMonths} ${t('billing_plan_months')}`}
      actions={
        <>
          {!plan.isActive && (
            <StatusPill variant="muted" label={t('plans_inactive')} />
          )}
          {plan.isPopular && <StatusPill variant="info" label={t('plans_popular')} />}
        </>
      }
      className="billing-plan-card"
    >
      <div className="ui-stack">
        <div>
          <span className="billing-plan-price">{formatMoney(plan.price, 'ILS', language)}</span>{' '}
          <span className="ui-caption">
            ({formatMoney(perMonth, 'ILS', language)}/{t('billing_plan_months')})
          </span>
        </div>
        {features.length > 0 && (
          <ul className="billing-plan-features">
            {features.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        )}
        {(plan.subscribersCount !== undefined || plan.pendingRequests !== undefined) && (
          <div className="ui-caption">
            {plan.subscribersCount !== undefined ? (
              <bdi className="ui-num">
                {plan.subscribersCount} {t('billing_plan_subscribers')}
              </bdi>
            ) : (
              ''
            )}
            {plan.subscribersCount !== undefined && plan.pendingRequests !== undefined ? ' · ' : ''}
            {plan.pendingRequests !== undefined ? (
              <bdi className="ui-num">
                {plan.pendingRequests} {t('billing_plan_pending')}
              </bdi>
            ) : (
              ''
            )}
          </div>
        )}
        <div className="ui-row">
          <Button size="sm" variant="outline" disabled={busy} onClick={() => onEdit(plan)}>
            {t('plans_edit')}
          </Button>
          <Button size="sm" variant="ghost" disabled={busy} onClick={() => onToggleActive(plan)}>
            {plan.isActive ? t('plans_deactivate') : t('plans_activate')}
          </Button>
          <Button size="sm" variant="ghost" disabled={busy} onClick={() => onDelete(plan)}>
            {t('billing_delete')}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PlanCard;
