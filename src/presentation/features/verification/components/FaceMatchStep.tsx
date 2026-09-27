import React from 'react';
import type { Submission } from '../types';
import { DocumentCard } from './DocumentCard';
import { Card, ProgressBar, StatusPill } from '../../../components/ui';

interface FaceMatchStepProps {
  submission: Submission;
  onZoom: (url: string) => void;
}

export const FaceMatchStep: React.FC<FaceMatchStepProps> = ({ submission, onZoom }) => {
  const idImg = submission.idFrontImageUrl || submission.idFrontUrl || submission.avatar;
  const selfieImg = submission.selfieImageUrl || submission.selfieUrl;
  const matchScore = submission.faceMatchScore ?? submission.faceScore;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
      {/* Biometric Comparison Match Bar (only if matchScore is present) */}
      {matchScore !== undefined && matchScore !== null && (
        <Card padding="md">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
              <span style={{ fontSize: 'var(--fs-caption)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Biometric Face Match Confidence
              </span>
              {submission.livenessPassed !== undefined && (
                <StatusPill
                  variant={submission.livenessPassed ? 'success' : 'warning'}
                  label={submission.livenessPassed ? 'Liveness Confirmed' : 'Liveness Unverified'}
                />
              )}
            </div>
            <span
              style={{
                fontSize: 'var(--fs-body)',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                color: matchScore >= 90 ? 'var(--success)' : matchScore >= 75 ? 'var(--warning)' : 'var(--danger)',
              }}
            >
              {matchScore}% Match
            </span>
          </div>

          <ProgressBar
            value={matchScore}
            max={100}
            size="md"
            tone={matchScore >= 90 ? 'success' : matchScore >= 75 ? 'warning' : 'danger'}
          />
        </Card>
      )}

      {/* Side-by-Side Comparison Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--sp-4)',
        }}
      >
        <DocumentCard
          title="ID Card Photo (Reference)"
          imageUrl={idImg}
          onZoom={onZoom}
          craftsmanName={submission.name}
          fields={[
            { label: 'Document Type', value: submission.idDocumentType || 'National Identity Card' },
            { label: 'Detected Name', value: submission.ocrDetectedName || submission.name },
          ]}
        />

        <DocumentCard
          title="Live Camera Selfie"
          imageUrl={selfieImg}
          onZoom={onZoom}
          craftsmanName={submission.name}
          fields={[
            { label: 'Capture Mode', value: 'Live Camera Capture' },
            ...(submission.livenessPassed !== undefined
              ? [{
                  label: 'Liveness Check',
                  value: submission.livenessPassed ? 'Passed' : 'Pending',
                  tone: submission.livenessPassed ? ('success' as const) : ('warning' as const),
                }]
              : []),
          ]}
        />
      </div>
    </div>
  );
};

export default FaceMatchStep;
