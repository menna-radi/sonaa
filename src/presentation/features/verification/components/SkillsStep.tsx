import React from 'react';
import type { Submission } from '../types';
import { DocumentCard } from './DocumentCard';
import { Card, StatTile, StatusPill } from '../../../components/ui';
import { Award, Briefcase, Shield, CheckCircle2, AlertCircle } from 'lucide-react';

interface SkillsStepProps {
  submission: Submission;
  onZoom: (url: string) => void;
}

export const SkillsStep: React.FC<SkillsStepProps> = ({ submission, onZoom }) => {
  const credentials = [
    { label: 'National ID Identity', ok: submission.isVerifiedId || Boolean(submission.idFrontImageUrl) },
    { label: 'Vocational Trade License', ok: submission.isVerifiedCert || Boolean(submission.certImageUrl) },
    { label: 'Liability Insurance', ok: Boolean(submission.isInsured) },
    { label: 'Live Biometrics Liveness', ok: submission.isVerifiedSelfie || Boolean(submission.selfieImageUrl) },
    { label: 'Security Background Check', ok: Boolean(submission.isVerifiedBackground) },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
      {/* Stat Tiles for Trade and Experience */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--sp-3)',
        }}
      >
        <StatTile
          label="Primary Trade"
          value={submission.tradeCategory || submission.role || 'Craftsman'}
          icon={<Briefcase size={16} />}
        />
        <StatTile
          label="Years of Experience"
          value={`${submission.yearsExperience ?? 5} Years`}
          icon={<Award size={16} />}
        />
        <StatTile
          label="Licensing Board"
          value={submission.certAuthority || 'Jerusalem Vocational Board'}
          icon={<Shield size={16} />}
        />
        {submission.insuranceLimit && (
          <StatTile
            label="Insurance Limit"
            value={`₪${submission.insuranceLimit.toLocaleString()}`}
            icon={<Shield size={16} />}
          />
        )}
      </div>

      {/* Skills Chips */}
      {submission.skills && submission.skills.length > 0 && (
        <Card title="Specialized Skills & Competencies" padding="md">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
            {submission.skills.map((skill, idx) => (
              <StatusPill key={idx} variant="info" label={skill} />
            ))}
          </div>
        </Card>
      )}

      {/* Craftsman Bio (only if exists) */}
      {submission.bio && (
        <Card title="Craftsman Bio" padding="md">
          <p
            style={{
              margin: 0,
              fontSize: 'var(--fs-caption)',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
            }}
          >
            {submission.bio}
          </p>
        </Card>
      )}

      {/* Trade Certificate Document Preview (if exists) */}
      {submission.certImageUrl && (
        <DocumentCard
          title="Vocational Trade Certificate / License"
          imageUrl={submission.certImageUrl}
          onZoom={onZoom}
          craftsmanName={submission.name}
          fields={[
            { label: 'Issuing Authority', value: submission.certAuthority || 'Vocational Training Authority' },
            { label: 'Trade Category', value: submission.tradeCategory || submission.role },
          ]}
        />
      )}

      {/* Credentials Compliance Audit Checklist */}
      <Card title="Credentials & Compliance Checklist" padding="md">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--sp-2)',
          }}
        >
          {credentials.map((cred, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--sp-2) var(--sp-3)',
                background: cred.ok ? 'var(--surface-sunken)' : 'var(--surface-raised)',
                border: `1px solid ${cred.ok ? 'var(--border-subtle)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-md)',
              }}
            >
              <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-secondary)' }}>
                {cred.label}
              </span>
              <StatusPill
                variant={cred.ok ? 'success' : 'neutral'}
                label={cred.ok ? 'Verified' : 'Pending'}
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default SkillsStep;
