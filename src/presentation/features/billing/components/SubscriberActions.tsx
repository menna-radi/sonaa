import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Dropdown } from '../../../components/ui/Dropdown';
import type { Subscriber } from '../../../../domain/entities/Billing';
import { CalendarPlus, Gift, UserX, ExternalLink, MoreHorizontal } from 'lucide-react';

interface SubscriberActionsProps {
  row: Subscriber;
  onExtend: (row: Subscriber) => void;
  onFreeTasks: (row: Subscriber) => void;
  onCancel: (row: Subscriber) => void;
  onOpenCraftsman: (row: Subscriber) => void;
}

export const SubscriberActions: React.FC<SubscriberActionsProps> = ({
  row,
  onExtend,
  onFreeTasks,
  onCancel,
  onOpenCraftsman,
}) => {
  const { t } = useLanguage();
  const active = row.subscriptionStatus === 'ACTIVE';

  return (
    <Dropdown
      trigger={
        <button type="button" className="ov-icon-btn" aria-label={t('billing_col_actions')}>
          <MoreHorizontal size={16} />
        </button>
      }
      items={[
        { key: 'extend', label: t('subscribers_extend_title'), icon: <CalendarPlus size={14} />, onClick: () => onExtend(row) },
        { key: 'free', label: t('subscribers_free_title'), icon: <Gift size={14} />, onClick: () => onFreeTasks(row) },
        {
          key: 'cancel',
          label: t('subscribers_cancel_title'),
          icon: <UserX size={14} />,
          tone: 'danger',
          disabled: !active,
          onClick: () => onCancel(row),
        },
        {
          key: 'open',
          label: t('subscribers_open_craftsman'),
          icon: <ExternalLink size={14} />,
          onClick: () => onOpenCraftsman(row),
        },
      ]}
    />
  );
};

export default SubscriberActions;
