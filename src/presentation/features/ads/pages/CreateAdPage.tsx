import React, { useRef, useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useNavigation } from '../../../context/NavigationContext';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { unwrap } from '../../../../core/query/unwrap';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../../core/query/queryKeys';
import { useToast } from '../../../components/ui/Toast';
import { errorMessage, fieldErrorsFrom } from '../../../../core/errors/errorMessage';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { AndroidPhoneBannerPreview } from '../components/AndroidPhoneBannerPreview';
import { CampaignForm, type CampaignFormHandle, type CampaignFormValues } from '../components/CampaignForm';
import { ArrowLeft, Sparkles } from 'lucide-react';
import '../ads.css';

export const CreateAdPage: React.FC = () => {
  const { t, isRtl } = useLanguage();
  const { navigate } = useNavigation();
  const { dependencies } = useDependencies();
  const { success, error: toastError } = useToast();
  const qc = useQueryClient();
  const formRef = useRef<CampaignFormHandle>(null);

  const [draft, setDraft] = useState<CampaignFormValues | null>(null);
  const [pending, setPending] = useState(false);

  const handleCreate = async (values: CampaignFormValues) => {
    setPending(true);
    try {
      const res = await dependencies.adRepository.createAd(values.name, values.budget, values.placement, {
        imageUrl: values.imageUrl,
        description: values.description,
        ctaText: values.ctaText,
        targetUrl: values.targetUrl ?? undefined,
        startDate: values.startDate ?? undefined,
        endDate: values.endDate ?? undefined,
        durationHours: values.durationHours,
      });
      unwrap(res);
      await qc.invalidateQueries({ queryKey: queryKeys.ads.all });
      success(t('toast_campaign_saved'));
      navigate('campaigns');
    } catch (e) {
      const server = fieldErrorsFrom(e);
      if (Object.keys(server).length) {
        toastError(Object.values(server)[0]);
      } else {
        toastError(errorMessage(e, t));
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="ui-page">
      <PageHeader
        title={t('campaigns_create_title')}
        subtitle={t('campaigns_create_subtitle')}
        actions={
          <Button variant="outline" size="sm" icon={<ArrowLeft size={14} className="ui-icon--directional" />} onClick={() => navigate('campaigns')}>
            {t('campaigns_back')}
          </Button>
        }
      />
      <div className="ui-split">
        <Card title={t('campaigns_form_title')}>
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              formRef.current?.submit();
            }}
          >
            <CampaignForm ref={formRef} onSubmit={(v) => void handleCreate(v)} onDraftChange={setDraft} />
            <div className="ui-row ui-row--end">
              <Button variant="outline" type="button" disabled={pending} onClick={() => navigate('campaigns')}>
                {t('btn_cancel')}
              </Button>
              <Button variant="primary" type="submit" loading={pending} icon={<Sparkles size={16} />}>
                {t('campaigns_launch')}
              </Button>
            </div>
          </form>
        </Card>
        <div className="campaign-preview">
          <AndroidPhoneBannerPreview
            adTitle={draft?.name}
            description={draft?.description}
            imageUrl={draft?.imageUrl}
            ctaText={draft?.ctaText}
            isRtl={isRtl}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateAdPage;
