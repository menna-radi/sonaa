import React from 'react';
import { ExternalLink } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { useNavigation } from '../../../context/NavigationContext';
import { Button, Card, ErrorState, KeyValueList, Skeleton, Switch } from '../../../components/ui';
import { formatNumber, formatPercentValue } from '../../../../core/utils/format';
import { useAutoVerification, useSetAutoVerification } from '../hooks/usePlatform';

export const PlatformTab: React.FC = () => {
  const { t, language } = useLanguage();
  const { navigate } = useNavigation();
  const q = useAutoVerification();
  const save = useSetAutoVerification();

  const editInBilling = () => {
    sessionStorage.setItem('billing_tab', 'settings');
    navigate('billing');
  };

  if (q.isError) {
    return <ErrorState title={t('status_error')} message={q.error.message} onRetry={() => q.refetch()} />;
  }

  const s = q.data;
  return (
    <div className="ui-stack">
      <Card eyebrow={t('settings_tab_platform')} title={t('settings_platform_verify_title')}>
        {q.isLoading || !s ? (
          <Skeleton height={48} />
        ) : (
          <div className="ui-stack ui-stack--tight">
            <Switch
              checked={s.autoVerifyCraftsmen}
              disabled={save.isPending}
              onChange={(v) => save.mutate(v)}
              label={t('settings_platform_verify_label')}
            />
            <span className="ui-caption">{t('settings_platform_verify_help')}</span>
          </div>
        )}
      </Card>
      <Card
        title={t('settings_platform_billing_title')}
        actions={
          <Button variant="outline" size="sm" icon={<ExternalLink size={14} />} onClick={editInBilling}>
            {t('settings_platform_billing_edit')}
          </Button>
        }
      >
        {q.isLoading || !s ? (
          <Skeleton height={64} />
        ) : (
          <KeyValueList
            items={[
              {
                label: t('settings_free_count'),
                value: <bdi className="ui-num">{formatNumber(s.freeTasksCount, language)}</bdi>,
              },
              {
                label: t('settings_platform_commission_rate'),
                value: <bdi className="ui-num">{formatPercentValue(s.commissionRate * 100)}</bdi>,
              },
            ]}
          />
        )}
      </Card>
      <p className="ui-caption">{t('settings_platform_currency')}</p>
    </div>
  );
};

export default PlatformTab;
