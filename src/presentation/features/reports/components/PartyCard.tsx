import React from 'react';
import { Avatar } from '../../../components/ui/Avatar';
import { StatusPill } from '../../../components/ui/StatusPill';
import { pillVariantFor, statusLabelKey } from '../../../components/ui/status';
import { useLanguage } from '../../../context/LanguageContext';
import type { SafetyReportParty } from '../../../../domain/repositories/SafetyReportRepository';

interface PartyCardProps {
  label: string;
  party: SafetyReportParty | string | null;
  accountStatus?: string;
}

export const PartyCard: React.FC<PartyCardProps> = ({
  label,
  party,
  accountStatus,
}) => {
  const { t } = useLanguage();
  const name = typeof party === 'string' ? party : party?.name || '—';
  const phone = typeof party === 'object' && party ? party.phone : undefined;

  return (
    <div className="reports-party-card">
      <Avatar name={name} size={40} />
      <div className="reports-party-card__info">
        <span className="ui-eyebrow">{label}</span>
        <span className="ui-text-strong ui-clamp-1">{name}</span>
        {phone ? (
          <bdi className="ui-caption ui-num">{phone}</bdi>
        ) : (
          <span className="ui-caption ui-text-muted">—</span>
        )}
        {accountStatus && (
          <div style={{ marginTop: 'var(--sp-1)' }}>
            <StatusPill
              variant={pillVariantFor('userAccount', accountStatus)}
              label={t(statusLabelKey('userAccount', accountStatus))}
            />
          </div>
        )}
      </div>
    </div>
  );
};
