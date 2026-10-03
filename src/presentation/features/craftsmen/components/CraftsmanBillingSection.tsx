import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useNavigation } from '../../../context/NavigationContext';
import { Button, KeyValueList, StatusPill } from '../../../components/ui';
import { pillVariantFor, statusLabelKey } from '../../../components/ui/status';
import { formatDate } from '../../../../core/utils/format';
import type { Craftsman } from '../hooks/useCraftsmen';
import type { Subscriber } from '../../../../domain/entities/Billing';
import { ExtendModal } from '../../billing/components/ExtendModal';
import { FreeTasksModal } from '../../billing/components/FreeTasksModal';
import { Lock, LockOpen } from 'lucide-react';

interface CraftsmanBillingSectionProps {
  craftsman: Craftsman;
}

const toSubscriber = (c: Craftsman): Subscriber => ({
  id: c.id,
  name: c.name,
  title: c.trade,
  subscriptionStatus: c.billing?.subscriptionStatus ?? 'EXPIRED',
  expiryDate: c.billing?.subscriptionExpiryDate,
  freeTasksRemaining: c.billing?.freeTasksRemaining ?? 0,
  billingModel: c.billing?.billingModel ?? null,
  commissionLocked: c.billing?.commissionLocked ?? false,
  isAllowedToAcceptTasks: false,
});

export const CraftsmanBillingSection: React.FC<CraftsmanBillingSectionProps> = ({ craftsman }) => {
  const { t, language } = useLanguage();
  const { navigate } = useNavigation();
  const [modal, setModal] = useState<'extend' | 'free' | null>(null);
  const billing = craftsman.billing;
  const subscriber = toSubscriber(craftsman);

  const openInBilling = () => {
    try {
      sessionStorage.setItem('billing_tab', 'subscribers');
      sessionStorage.setItem('billing_search', craftsman.name);
    } catch {
      // storage unavailable — navigation still works
    }
    navigate('billing');
  };

  return (
    <div className="ui-stack ui-stack--tight">
      <KeyValueList
        items={[
          {
            label: t('craftsmen_billing_free'),
            value: <bdi className="ui-num">{billing?.freeTasksRemaining ?? 0}</bdi>,
          },
          {
            label: t('craftsmen_billing_model'),
            value: billing?.billingModel ? (
              <StatusPill
                variant={pillVariantFor('subscription', billing.billingModel)}
                label={t(statusLabelKey('subscription', billing.billingModel))}
              />
            ) : (
              <span className="ui-caption">{t('subscribers_no_plan')}</span>
            ),
          },
          {
            label: t('craftsmen_billing_expiry'),
            value: (
              <bdi className="ui-num">
                {billing?.subscriptionExpiryDate ? formatDate(billing.subscriptionExpiryDate, language) : '—'}
              </bdi>
            ),
          },
          {
            label: t('craftsmen_billing_lock'),
            value: billing?.commissionLocked ? (
              <span className="ui-row">
                <Lock size={14} /> {t('status_locked')}
              </span>
            ) : (
              <span className="ui-row">
                <LockOpen size={14} /> {t('commission_unlocked')}
              </span>
            ),
          },
        ]}
      />
      <div className="ui-row">
        <Button size="sm" variant="outline" onClick={() => setModal('free')}>
          {t('craftsmen_grant_free')}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setModal('extend')}>
          {t('craftsmen_extend')}
        </Button>
        <Button size="sm" variant="ghost" onClick={openInBilling}>
          {t('craftsmen_open_billing')}
        </Button>
      </div>
      {modal === 'extend' ? (
        <ExtendModal key={`extend-${craftsman.id}`} subscriber={subscriber} onClose={() => setModal(null)} />
      ) : modal ? (
        <FreeTasksModal key={`free-${craftsman.id}`} subscriber={subscriber} onClose={() => setModal(null)} />
      ) : null}
    </div>
  );
};

export default CraftsmanBillingSection;
