import React from 'react';
import type { Submission, VerificationTab } from '../types';
import { AlertCircle } from 'lucide-react';

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
  const steps: {
    key: VerificationTab;
    number: number;
    label: string;
    hasMissingEvidence: boolean;
  }[] = [
    {
      key: 'national_id',
      number: 1,
      label: 'National ID',
      hasMissingEvidence: !submission.idFrontImageUrl && !submission.idFrontUrl && !submission.isVerifiedId,
    },
    {
      key: 'face_match',
      number: 2,
      label: 'Face Match',
      hasMissingEvidence: !submission.selfieImageUrl && !submission.selfieUrl && !submission.isVerifiedSelfie,
    },
    {
      key: 'skills',
      number: 3,
      label: 'Trade & Skills',
      hasMissingEvidence: !submission.skills?.length && !submission.tradeCategory && !submission.isVerifiedCert,
    },
    {
      key: 'portfolio',
      number: 4,
      label: 'Portfolio',
      hasMissingEvidence: false,
    },
    {
      key: 'profile_info',
      number: 5,
      label: 'Personal Info',
      hasMissingEvidence: !submission.phoneNumber,
    },
    {
      key: 'review_decision',
      number: 6,
      label: 'Audit & Notes',
      hasMissingEvidence: false,
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--sp-2)',
        overflowX: 'auto',
        paddingBlock: 'var(--sp-2)',
        scrollbarWidth: 'none',
      }}
      className="review-step-tabs"
    >
      {steps.map((st) => {
        const isActive = activeTab === st.key;
        return (
          <button
            key={st.key}
            type="button"
            onClick={() => onChange(st.key)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--sp-2)',
              padding: 'var(--sp-2) var(--sp-3)',
              borderRadius: 'var(--radius-md)',
              border: isActive ? '1px solid var(--text-primary)' : '1px solid var(--border-subtle)',
              background: isActive ? 'var(--text-primary)' : 'var(--surface-raised)',
              color: isActive ? 'var(--surface-raised)' : 'var(--text-secondary)',
              fontSize: 'var(--fs-caption)',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all var(--transition-fast)',
              position: 'relative',
            }}
          >
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: 'var(--radius-full)',
                background: isActive ? 'var(--surface-raised)' : 'var(--surface-sunken)',
                color: isActive ? 'var(--text-primary)' : 'var(--text-faint)',
                fontSize: '11px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {st.number}
            </span>

            <span>{st.label}</span>

            {st.hasMissingEvidence && (
              <span
                title="Missing verification evidence"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--warning)',
                  display: 'inline-block',
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ReviewStepTabs;
