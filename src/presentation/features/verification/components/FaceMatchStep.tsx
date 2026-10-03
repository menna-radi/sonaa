import React from 'react';
import type { Submission } from '../types';
import { DocumentCard, type DocumentField } from './DocumentCard';
import { Card, ProgressBar, StatusPill } from '../../../components/ui';
import { useLanguage } from '../../../context/LanguageContext';
import { tf } from '../utils';

interface FaceMatchStepProps {
  submission: Submission;
  onZoom: (url: string) => void;
}

export const FaceMatchStep: React.FC<FaceMatchStepProps> = ({ submission, onZoom }) => {
  const { t } = useLanguage();
  const idImg = submission.idFrontImageUrl || submission.idFrontUrl || submission.avatar;
  const selfieImg = submission.selfieImageUrl || submission.selfieUrl;
  const matchScore = submission.faceMatchScore;
  const matchTone = matchScore === undefined ? 'danger' : matchScore >= 90 ? 'success' : matchScore >= 75 ? 'warning' : 'danger';
  const liveness = submission.livenessPassed;

  const selfieFields: DocumentField[] =
    liveness !== undefined
      ? [{ label: t('vr_face_liveness_check'), value: liveness ? t('vr_face_passed') : t('vr_state_pending'), tone: liveness ? 'success' : 'warning' }]
      : [];

  return (
    <div className="ui-stack">
      {matchScore !== undefined && matchScore !== null && (
        <Card padding="md">
          <div className="vr-match-head">
            <div className="vr-match-label-row">
              <span className="vr-match-label">{t('vr_match_label')}</span>
              {liveness !== undefined && (
                <StatusPill
                  variant={liveness ? 'success' : 'warning'}
                  label={liveness ? t('vr_liveness_ok') : t('vr_liveness_no')}
                />
              )}
            </div>
            <span className={`vr-match-value vr-tone-${matchTone} ui-num`}>
              {tf(t, 'vr_match_value', { n: matchScore })}
            </span>
          </div>

          <ProgressBar value={matchScore} max={100} size="md" tone={matchTone} />
        </Card>
      )}

      <div className="vr-grid-docs">
        <DocumentCard
          title={t('vr_face_id_photo')}
          imageUrl={idImg}
          onZoom={onZoom}
          craftsmanName={submission.name}
          fields={[
            { label: t('vr_field_doc_type'), value: submission.idDocumentType },
            { label: t('vr_field_detected_name'), value: submission.ocrDetectedName },
          ]}
        />

        <DocumentCard
          title={t('vr_face_selfie')}
          imageUrl={selfieImg}
          onZoom={onZoom}
          craftsmanName={submission.name}
          fields={selfieFields}
        />
      </div>
    </div>
  );
};

export default FaceMatchStep;
