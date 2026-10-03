import React from 'react';
import type { Submission } from '../types';
import { DocumentCard, type DocumentField } from './DocumentCard';
import { useLanguage } from '../../../context/LanguageContext';
import { formatDate } from '../../../../core/utils/format';

interface NationalIdStepProps {
  submission: Submission;
  onZoom: (url: string) => void;
}

export const NationalIdStep: React.FC<NationalIdStepProps> = ({ submission, onZoom }) => {
  const { t, language } = useLanguage();
  const frontImg = submission.idFrontImageUrl || submission.idFrontUrl;
  const backImg = submission.idBackImageUrl;

  const ocr = submission.ocrConfidence;
  const hasOcr = ocr !== undefined && ocr !== null;
  const ocrTone: DocumentField['tone'] = !hasOcr ? 'default' : ocr >= 90 ? 'success' : ocr >= 70 ? 'warning' : 'danger';

  const frontFields: DocumentField[] = [
    { label: t('vr_field_doc_type'), value: submission.idDocumentType },
    { label: t('vr_field_detected_name'), value: submission.ocrDetectedName },
    {
      label: t('vr_field_expiry'),
      value: submission.idExpiryDate ? formatDate(submission.idExpiryDate, language) : undefined,
    },
    { label: t('vr_field_ocr'), value: hasOcr ? `${ocr}%` : undefined, tone: ocrTone },
  ];

  const backFields: DocumentField[] = [
    {
      label: t('vr_field_doc_status'),
      value: submission.isVerifiedId ? t('vr_state_verified') : t('vr_state_pending_review'),
    },
    { label: t('vr_field_city'), value: submission.city },
  ];

  return (
    <div className="vr-grid-docs">
      <DocumentCard
        title={t('vr_id_front')}
        imageUrl={frontImg}
        fields={frontFields}
        onZoom={onZoom}
        craftsmanName={submission.name}
      />

      <DocumentCard
        title={t('vr_id_back')}
        imageUrl={backImg}
        fields={backFields}
        onZoom={onZoom}
        craftsmanName={submission.name}
      />
    </div>
  );
};

export default NationalIdStep;
