import React from 'react';
import type { Submission } from '../types';
import { Card, StatusPill } from '../../../components/ui';
import { ModeratorNotes } from './ModeratorNotes';
import { CheckCircle2, ShieldCheck, Clock } from 'lucide-react';

interface ReviewDecisionStepProps {
  submission: Submission;
  notes: string;
  onNotesChange: (n: string) => void;
  isApproved?: boolean;
  isRejected?: boolean;
  isFlagged?: boolean;
  isSubmitting?: boolean;
}

export const ReviewDecisionStep: React.FC<ReviewDecisionStepProps> = ({
  submission,
  notes,
  onNotesChange,
  isApproved,
  isRejected,
  isFlagged,
  isSubmitting,
}) => {
  const steps = [
    {
      step: 1,
      name: 'Personal Details & Contact',
      status: submission.name && (submission.phoneNumber || submission.email) ? 'complete' : 'pending',
      desc: `${submission.name} · ${submission.city || 'Location registered'}`,
    },
    {
      step: 2,
      name: 'National ID Identification',
      status: submission.idFrontImageUrl || submission.isVerifiedId ? 'complete' : 'pending',
      desc: submission.idDocumentType || 'National ID Card',
    },
    {
      step: 3,
      name: 'Biometric Face Match & Liveness',
      status: submission.selfieImageUrl || submission.isVerifiedSelfie ? 'complete' : 'pending',
      desc: submission.faceMatchScore ? `${submission.faceMatchScore}% match score` : 'Selfie uploaded',
    },
    {
      step: 4,
      name: 'Trade Specialization & Skills',
      status: submission.skills?.length || submission.tradeCategory || submission.isVerifiedCert ? 'complete' : 'pending',
      desc: `${submission.role || 'Craftsman'} · ${submission.yearsExperience ?? 5} yrs exp`,
    },
    {
      step: 5,
      name: 'Compliance Moderation Status',
      status: isApproved || submission.isVerifiedId ? 'complete' : 'pending',
      desc: isApproved
        ? 'Approved'
        : isRejected
        ? 'Rejected'
        : isFlagged
        ? 'Flagged'
        : 'Awaiting Decision',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
      {/* 5-Step Verification Checklist */}
      <Card
        eyebrow="Compliance Audit"
        title="5-Step Verification Audit Checklist"
        padding="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
          {steps.map((st) => {
            const isDone = st.status === 'complete';
            return (
              <div
                key={st.step}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--sp-3)',
                  borderRadius: 'var(--radius-md)',
                  background: isDone ? 'var(--surface-sunken)' : 'var(--surface-raised)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 'var(--radius-full)',
                      background: isDone ? 'var(--text-primary)' : 'var(--surface-sunken)',
                      color: isDone ? 'var(--surface-raised)' : 'var(--text-faint)',
                      fontSize: '11px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {st.step}
                  </span>
                  <div>
                    <div style={{ fontSize: 'var(--fs-caption)', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {st.name}
                    </div>
                    <div style={{ fontSize: 'var(--fs-nano)', color: 'var(--text-faint)' }}>
                      {st.desc}
                    </div>
                  </div>
                </div>

                <StatusPill
                  variant={isDone ? 'success' : 'neutral'}
                  label={isDone ? 'Verified' : 'Pending'}
                />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Moderator Notes */}
      <ModeratorNotes notes={notes} onChange={onNotesChange} disabled={isSubmitting} />
    </div>
  );
};

export default ReviewDecisionStep;
