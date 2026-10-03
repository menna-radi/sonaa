import React, { useRef } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { FormModal } from '../../../components/ui/FormModal';
import type { Campaign } from '../types';
import { CampaignForm, type CampaignFormHandle, type CampaignFormValues } from './CampaignForm';

interface EditCampaignModalProps {
  campaign: Campaign | null;
  onClose: () => void;
  onSave: (
    id: string,
    data: {
      name: string;
      budget: number;
      placement: string;
      description?: string;
      ctaText?: string;
      imageUrl?: string;
      targetUrl?: string;
      startDate?: string;
      endDate?: string | null;
    }
  ) => Promise<void>;
  loading?: boolean;
}

export const EditCampaignModal: React.FC<EditCampaignModalProps> = ({
  campaign,
  onClose,
  onSave,
  loading: externalLoading = false,
}) => {
  const { t } = useLanguage();
  const formRef = useRef<CampaignFormHandle>(null);

  if (!campaign) return null;

  const handleSubmit = (values: CampaignFormValues) => {
    onSave(
      campaign.id,
      {
        name: values.name,
        budget: values.budget,
        placement: values.placement,
        description: values.description,
        ctaText: values.ctaText,
        imageUrl: values.imageUrl,
        targetUrl: values.targetUrl ?? undefined,
        startDate: values.startDate ?? undefined,
        endDate: values.endDate ?? undefined,
      }
    ).then(onClose, () => undefined);
  };

  return (
    <FormModal
      isOpen={true}
      onClose={onClose}
      title={t('campaigns_edit_title')}
      onSubmit={() => formRef.current?.submit()}
      pending={externalLoading}
      size="lg"
    >
      <CampaignForm
        key={campaign.id}
        ref={formRef}
        initial={{
          name: campaign.name,
          budget: campaign.budget,
          placement: campaign.placement,
          imageUrl: campaign.imageUrl,
          description: campaign.description,
          ctaText: campaign.ctaText,
          targetUrl: campaign.targetUrl,
          startDate: campaign.startDate,
          endDate: campaign.endDate,
        }}
        onSubmit={handleSubmit}
      />
    </FormModal>
  );
};

export default EditCampaignModal;
