import React from 'react';
import type { Submission } from '../types';
import { DocumentCard } from './DocumentCard';
import { Card, StatTile, StatusPill } from '../../../components/ui';
import { useLanguage } from '../../../context/LanguageContext';
import { formatMoney } from '../../../../core/utils/format';
import { tf } from '../utils';
import { Award, Briefcase, Shield } from 'lucide-react';

interface SkillsStepProps {
  submission: Submission;
  onZoom: (url: string) => void;
}

export const SkillsStep: React.FC<SkillsStepProps> = ({ submission, onZoom }) => {
  const { t, language } = useLanguage();
  const credentials = [
    { label: t('vr_cred_id'), ok: submission.isVerifiedId || Boolean(submission.idFrontImageUrl) },
    { label: t('vr_cred_license'), ok: submission.isVerifiedCert || Boolean(submission.certImageUrl) },
    { label: t('vr_cred_insurance'), ok: Boolean(submission.isInsured) },
    { label: t('vr_cred_liveness'), ok: submission.isVerifiedSelfie || Boolean(submission.selfieImageUrl) },
    { label: t('vr_cred_background'), ok: Boolean(submission.isVerifiedBackground) },
  ];
  const trade = submission.tradeCategory || submission.role;

  return (
    <div className="ui-stack">
      <div className="vr-grid-tiles">
        {trade && <StatTile label={t('vr_skills_trade')} value={trade} icon={<Briefcase size={16} />} />}
        {submission.yearsExperience !== undefined && (
          <StatTile
            label={t('vr_skills_years')}
            value={tf(t, 'vr_skills_years_value', { n: submission.yearsExperience })}
            icon={<Award size={16} />}
          />
        )}
        {submission.certAuthority && (
          <StatTile label={t('vr_skills_board')} value={submission.certAuthority} icon={<Shield size={16} />} />
        )}
        {submission.insuranceLimit ? (
          <StatTile
            label={t('vr_skills_insurance')}
            value={formatMoney(submission.insuranceLimit, 'ILS', language)}
            icon={<Shield size={16} />}
          />
        ) : null}
      </div>

      {submission.skills && submission.skills.length > 0 && (
        <Card title={t('vr_skills_chips_title')} padding="md">
          <div className="vr-chips">
            {submission.skills.map((skill, idx) => (
              <StatusPill key={idx} variant="info" label={skill} />
            ))}
          </div>
        </Card>
      )}

      {submission.bio && (
        <Card title={t('vr_skills_bio_title')} padding="md">
          <p className="vr-bio">{submission.bio}</p>
        </Card>
      )}

      {submission.certImageUrl && (
        <DocumentCard
          title={t('vr_skills_cert_title')}
          imageUrl={submission.certImageUrl}
          onZoom={onZoom}
          craftsmanName={submission.name}
          fields={[
            { label: t('vr_skills_cert_authority'), value: submission.certAuthority },
            { label: t('vr_skills_cert_trade'), value: trade },
          ]}
        />
      )}

      <Card title={t('vr_cred_title')} padding="md">
        <div className="vr-grid-creds">
          {credentials.map((cred, idx) => (
            <div key={idx} className={`vr-cred-row${cred.ok ? ' vr-cred-row--ok' : ''}`}>
              <span className="vr-cred-label">{cred.label}</span>
              <StatusPill
                variant={cred.ok ? 'success' : 'neutral'}
                label={cred.ok ? t('vr_state_verified') : t('vr_state_pending')}
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default SkillsStep;
