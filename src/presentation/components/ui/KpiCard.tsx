import React from 'react';
import { Skeleton } from './Skeleton';
import { formatPercent } from '../../../core/utils/format';

export interface KpiCardProps {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  delta?: number | null;
  caption?: string;
  tone?: 'default' | 'danger';
  loading?: boolean;
  className?: string;
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  icon,
  label,
  value,
  delta,
  caption,
  tone = 'default',
  loading = false,
  className = '',
  onClick,
}) => {
  if (loading) {
    return (
      <div className={`ui-kpi-card ${className}`}>
        <div className="ui-kpi-card__top">
          <Skeleton.Circle size={32} />
          <Skeleton width={48} height={18} />
        </div>
        <Skeleton width="60%" height={14} style={{ marginTop: 8 }} />
        <Skeleton width="40%" height={26} style={{ marginTop: 4 }} />
      </div>
    );
  }

  let deltaTone: 'up' | 'down' | 'flat' = 'flat';
  if (delta != null) {
    if (delta > 0) deltaTone = 'up';
    else if (delta < 0) deltaTone = 'down';
  }

  const deltaArrow = delta != null ? (delta > 0 ? '▲ ' : delta < 0 ? '▼ ' : '') : '';

  return (
    <div
      className={`ui-kpi-card ui-kpi-card--${tone} ${className}${onClick ? ' ui-kpi-card--clickable' : ''}`}
      {...(onClick
        ? {
            role: 'button' as const,
            tabIndex: 0,
            onClick,
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            },
          }
        : {})}
    >
      <div className="ui-kpi-card__top">
        {icon && <div className="ui-kpi-card__icon-box">{icon}</div>}
        {delta != null && (
          <span className={`ui-kpi-card__delta ui-kpi-card__delta--${deltaTone}`}>
            {deltaArrow}
            {formatPercent(Math.abs(delta))}
          </span>
        )}
      </div>

      <div className="ui-kpi-card__label">{label}</div>
      <div className="ui-kpi-card__value">{value}</div>
      {caption && <div className="ui-kpi-card__caption">{caption}</div>}
    </div>
  );
};
