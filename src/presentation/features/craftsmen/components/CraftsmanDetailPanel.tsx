import React, { useState } from 'react';
import type { Craftsman } from '../hooks/useCraftsmen';
import { useLanguage } from '../../../context/LanguageContext';
import { Avatar, VerifiedMark, StatusPill, KeyValueList } from '../../../components/ui';
import { pillVariantFor, statusLabelKey } from '../../../components/ui/status';
import { useConfirm } from '../../../components/ui/ConfirmDialog';
import { useToast } from '../../../components/ui/Toast';
import { errorMessage } from '../../../../core/errors/errorMessage';
import { formatDate } from '../../../../core/utils/format';
import { useCraftsmen } from '../hooks/useCraftsmen';
import { CraftsmanActions } from './CraftsmanActions';
import { CraftsmanBillingSection } from './CraftsmanBillingSection';

interface CraftsmanDetailPanelProps {
  craftsman: Craftsman | null;
}

const VERIFY_ITEMS = [
  'nationalId',
  'selfieMatch',
  'tradeLicense',
  'bankIban',
  'backgroundCheck',
  'insurance',
] as const;

export const CraftsmanDetailPanel: React.FC<CraftsmanDetailPanelProps> = ({ craftsman }) => {
  const { t, language } = useLanguage();
  const confirm = useConfirm();
  const toast = useToast();
  const { mutations } = useCraftsmen();
  const [toggling, setToggling] = useState<string | null>(null);

  if (!craftsman) return null;

  const handleToggle = async (itemKey: string, approved: boolean) => {
    const ok = await confirm({
      title: t('craftsmen_verify_title'),
      body: approved ? t('craftsmen_verify_grant_body') : t('craftsmen_verify_revoke_body'),
      tone: approved ? 'default' : 'warning',
    });
    if (!ok) return;
    setToggling(itemKey);
    try {
      await mutations.toggleVerification.mutateAsync({ id: craftsman.id, itemKey, approved });
    } catch (e) {
      toast.error(errorMessage(e, t));
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="craftsman-detail">
      <div>
        <div className="craftsman-detail__section-title">{t('craftsmen_detail_profile')}</div>
        <div className="ui-row">
          <Avatar src={craftsman.avatarUrl} name={craftsman.name} size={48} />
          <div>
            <div className="ui-text-strong">
              {craftsman.name} {craftsman.isVerifiedId ? <VerifiedMark size={16} /> : ''}
            </div>
            <div className="ui-caption">{craftsman.trade}</div>
          </div>
          <StatusPill
            variant={pillVariantFor('craftsman', craftsman.status)}
            label={t(statusLabelKey('craftsman', craftsman.status))}
          />
        </div>
        <KeyValueList
          items={[
            { label: t('billing_col_phone'), value: <bdi className="ui-num">{craftsman.idNumber || '—'}</bdi> },
            {
              label: t('craftsmen_col_joined'),
              value: (
                <bdi className="ui-num">
                  {craftsman.joinedDate ? formatDate(craftsman.joinedDate, language) : '—'}
                </bdi>
              ),
            },
          ]}
        />
      </div>
      <div>
        <div className="craftsman-detail__section-title">{t('craftsmen_detail_verification')}</div>
        {VERIFY_ITEMS.map((key) => {
          const on = craftsman.verifications[key] === true;
          return (
            <div key={key} className="craftsman-verify-row">
              <span>{t(`craftsmen_verify_${key}`)}</span>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={t(`craftsmen_verify_${key}`)}
                disabled={toggling === key}
                className={`billing-switch${on ? ' is-on' : ''}`}
                onClick={() => void handleToggle(key, !on)}
              >
                <span className="billing-switch__track" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
      <div>
        <div className="craftsman-detail__section-title">{t('craftsmen_detail_billing')}</div>
        <CraftsmanBillingSection craftsman={craftsman} />
      </div>
      <div>
        <div className="craftsman-detail__section-title">{t('craftsmen_detail_actions')}</div>
        <CraftsmanActions craftsman={craftsman} />
      </div>
    </div>
  );
};

export default CraftsmanDetailPanel;
