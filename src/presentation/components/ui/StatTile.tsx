import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export interface StatTileProps {
  label: string;
  value: React.ReactNode;
  caption?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const StatTile: React.FC<StatTileProps> = ({
  label,
  value,
  caption,
  icon,
  className = '',
}) => {
  return (
    <div className={`ui-stat-tile ${className}`}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--sp-2)' }}>
        <span className="ui-stat-tile__label">{label}</span>
        {icon && <span style={{ color: 'var(--text-faint)', display: 'inline-flex' }}>{icon}</span>}
      </div>
      <span className="ui-stat-tile__value">{value}</span>
      {caption && <span className="ui-stat-tile__caption">{caption}</span>}
    </div>
  );
};

export interface ChecklistChipProps {
  label: string;
  checked: boolean;
  onClick?: () => void;
  className?: string;
}

export const ChecklistChip: React.FC<ChecklistChipProps> = ({
  label,
  checked,
  onClick,
  className = '',
}) => {
  return (
    <div
      className={`ui-checklist-chip ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {checked ? (
        <CheckCircle2 size={16} color="var(--text-strong)" />
      ) : (
        <XCircle size={16} color="var(--danger)" />
      )}
      <span>{label}</span>
    </div>
  );
};
