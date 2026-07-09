import React from 'react';
import type { MetricStatus } from '../../domain/entities/Metric';

interface GlassCardProps {
  title?: string;
  status?: MetricStatus;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  title,
  status = 'normal',
  children,
  actions,
  className = '',
  onClick,
  style
}) => {
  const isClickable = !!onClick;
  
  // Dynamic status styling classes
  const statusClass = status !== 'normal' ? `status-${status}` : '';
  const interactiveClass = isClickable ? 'clickable' : '';

  return (
    <div 
      className={`glass-card ${statusClass} ${interactiveClass} ${className}`}
      onClick={isClickable ? onClick : undefined}
      style={style}
    >
      {(title || actions) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};
