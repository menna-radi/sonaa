import React from 'react';
import type { Submission } from '../types';
import { DocumentCard } from './DocumentCard';

interface NationalIdStepProps {
  submission: Submission;
  onZoom: (url: string) => void;
}

export const NationalIdStep: React.FC<NationalIdStepProps> = ({ submission, onZoom }) => {
  const frontImg = submission.idFrontImageUrl || submission.idFrontUrl;
  const backImg = submission.idBackImageUrl;

  // OCR confidence tone calculation
  let ocrTone: 'success' | 'warning' | 'danger' = 'success';
  if (submission.ocrConfidence !== undefined && submission.ocrConfidence !== null) {
    if (submission.ocrConfidence >= 90) ocrTone = 'success';
    else if (submission.ocrConfidence >= 70) ocrTone = 'warning';
    else ocrTone = 'danger';
  }

  const frontFields = [
    { label: 'Document Type', value: submission.idDocumentType || 'National ID Card' },
    { label: 'Detected Name', value: submission.ocrDetectedName || submission.name },
    ...(submission.idExpiryDate ? [{ label: 'Expiry Date', value: submission.idExpiryDate }] : []),
    ...(submission.ocrConfidence !== undefined && submission.ocrConfidence !== null
      ? [{ label: 'OCR Confidence', value: `${submission.ocrConfidence}%`, tone: ocrTone }]
      : []),
  ];

  const backFields = [
    { label: 'Document Status', value: submission.isVerifiedId ? 'Verified' : 'Pending Review' },
    { label: 'Issuing Region', value: submission.city || 'Jerusalem / West Bank' },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 'var(--sp-4)',
      }}
    >
      <DocumentCard
        title="Front Side"
        imageUrl={frontImg}
        fields={frontFields}
        onZoom={onZoom}
        craftsmanName={submission.name}
      />

      <DocumentCard
        title="Back Side"
        imageUrl={backImg}
        fields={backFields}
        onZoom={onZoom}
        craftsmanName={submission.name}
      />
    </div>
  );
};

export default NationalIdStep;
