import React from 'react';
import { ShieldCheck } from 'lucide-react';

export interface VerifiedMarkProps {
  size?: number;
  className?: string;
}

export const VerifiedMark: React.FC<VerifiedMarkProps> = ({ size = 14, className = '' }) => {
  return (
    <span className={`ui-verified-mark ${className}`} title="Verified Provider">
      <ShieldCheck size={size} />
    </span>
  );
};
