import React from 'react';

export interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  dense?: boolean;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  showLabel = false,
  dense = false,
  size = 'md',
  tone = 'default',
  className = '',
}) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const clamped = Math.max(0, Math.min(100, Math.round(percentage)));

  const sizeClass = size === 'sm' || dense ? 'ui-progress--dense' : '';
  const toneColor =
    tone === 'success'
      ? 'var(--success)'
      : tone === 'warning'
      ? 'var(--warning)'
      : tone === 'danger'
      ? 'var(--danger)'
      : undefined;

  return (
    <div className={`ui-progress ${sizeClass} ${className}`}>
      <div className="ui-progress__track">
        <div
          className="ui-progress__fill"
          style={{ width: `${clamped}%`, backgroundColor: toneColor }}
        />
      </div>
      {showLabel && <span className="ui-progress__label">{clamped}%</span>}
    </div>
  );
};
