import React from 'react';
import type { Submission, VerificationTab } from '../types';
import { useLanguage } from '../../../context/LanguageContext';

interface ReviewStepTabsProps {
  activeTab: VerificationTab;
  onChange: (tab: VerificationTab) => void;
  submission: Submission;
}

export const ReviewStepTabs: React.FC<ReviewStepTabsProps> = ({
  activeTab,
  onChange,
  submission,
}) => {
  const { t } = useLanguage();
  const steps: {
    key: VerificationTab;
    number: number;
    label: string;
    hasMissingEvidence: boolean;
  }[] = [
    {
      key: 'national_id',
      number: 1,
      label: t('vr_step_national_id'),
      hasMissingEvidence: !submission.idFrontImageUrl && !submission.idFrontUrl && !submission.isVerifiedId,
    },
    {
      key: 'face_match',
      number: 2,
      label: t('vr_step_face_match'),
      hasMissingEvidence: !submission.selfieImageUrl && !submission.selfieUrl && !submission.isVerifiedSelfie,
    },
    {
      key: 'skills',
      number: 3,
      label: t('vr_step_skills'),
      hasMissingEvidence: !submission.skills?.length && !submission.tradeCategory && !submission.isVerifiedCert,
    },
    { key: 'portfolio', number: 4, label: t('vr_step_portfolio'), hasMissingEvidence: false },
    {
      key: 'profile_info',
      number: 5,
      label: t('vr_step_profile_info'),
      hasMissingEvidence: !submission.phoneNumber,
    },
    { key: 'review_decision', number: 6, label: t('vr_step_review_decision'), hasMissingEvidence: false },
  ];

  return (
    <div className="review-step-tabs">
      {steps.map((st) => (
        <button
          key={st.key}
          type="button"
          onClick={() => onChange(st.key)}
          className={`vr-step-tab${activeTab === st.key ? ' vr-step-tab--active' : ''}`}
        >
          <span className="vr-step-tab__num">{st.number}</span>
          <span>{st.label}</span>
          {st.hasMissingEvidence && <span className="vr-step-tab__dot" title={t('vr_missing_evidence')} />}
        </button>
      ))}
    </div>
  );
};

export default ReviewStepTabs;
