import React from 'react';
import type { Submission } from '../types';
import { Card, StatusPill } from '../../../components/ui';
import { ModeratorNotes } from './ModeratorNotes';
import { useLanguage } from '../../../context/LanguageContext';
import { tf } from '../utils';

interface ReviewDecisionStepProps {
  submission: Submission;
  notes: string;
  onNotesChange: (n: string) => void;
  notesError?: string;
  isApproved?: boolean;
  isRejected?: boolean;
  isFlagged?: boolean;
  isSubmitting?: boolean;
}

export const ReviewDecisionStep: React.FC<ReviewDecisionStepProps> = ({
  submission,
  notes,
  onNotesChange,
  notesError,
  isApproved,
  isRejected,
  isFlagged,
  isSubmitting,
}) => {
  const { t } = useLanguage();

  const decisionLabel = isApproved
    ? t('status_approved')
    : isRejected
    ? t('status_rejected')
    : isFlagged
    ? t('status_flagged')
    : t('vr_audit_awaiting');

  const faceDesc = submission.faceMatchScore
    ? tf(t, 'vr_audit_match', { n: submission.faceMatchScore })
    : t('vr_audit_selfie_uploaded');
  const tradeDesc = [
    submission.role,
    submission.yearsExperience !== undefined ? tf(t, 'vr_audit_years', { n: submission.yearsExperience }) : '',
  ]
    .filter(Boolean)
    .join(' · ');

  const steps = [
    {
      step: 1,
      name: t('vr_audit_1'),
      done: Boolean(submission.name && (submission.phoneNumber || submission.email)),
      desc: [submission.name, submission.city].filter(Boolean).join(' · '),
    },
    {
      step: 2,
      name: t('vr_audit_2'),
      done: Boolean(submission.idFrontImageUrl || submission.isVerifiedId),
      desc: submission.idDocumentType || '',
    },
    {
      step: 3,
      name: t('vr_audit_3'),
      done: Boolean(submission.selfieImageUrl || submission.isVerifiedSelfie),
      desc: faceDesc,
    },
    {
      step: 4,
      name: t('vr_audit_4'),
      done: Boolean(submission.skills?.length || submission.tradeCategory || submission.isVerifiedCert),
      desc: tradeDesc,
    },
    {
      step: 5,
      name: t('vr_audit_5'),
      done: Boolean(isApproved || submission.isVerifiedId),
      desc: decisionLabel,
    },
  ];

  return (
    <div className="ui-stack">
      <Card eyebrow={t('vr_audit_eyebrow')} title={t('vr_audit_title')} padding="md">
        <div className="ui-stack ui-stack--tight">
          {steps.map((st) => (
            <div key={st.step} className={`vr-check-row${st.done ? ' vr-check-row--done' : ''}`}>
              <div className="vr-check-left">
                <span className={`vr-check-num${st.done ? ' vr-check-num--done' : ''}`}>{st.step}</span>
                <div>
                  <div className="vr-check-name">{st.name}</div>
                  {st.desc && <div className="vr-check-desc">{st.desc}</div>}
                </div>
              </div>

              <StatusPill
                variant={st.done ? 'success' : 'neutral'}
                label={st.done ? t('vr_state_verified') : t('vr_state_pending')}
              />
            </div>
          ))}
        </div>
      </Card>

      <ModeratorNotes notes={notes} onChange={onNotesChange} disabled={isSubmitting} error={notesError} />
    </div>
  );
};

export default ReviewDecisionStep;
