import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface VerifiedMarkProps {
  size?: number;
  className?: string;
}

export const VerifiedMark: React.FC<VerifiedMarkProps> = ({ size = 14, className = '' }) => {
  const { t } = useLanguage();
  return (
    <span className={`ui-verified-mark ${className}`} title={t('verified_provider') || 'Verified Provider'}>
      <ShieldCheck size={size} />
    </span>
  );
};
