import React from 'react';
import { StatusPillVariant } from './status';

export interface StatusPillProps {
  variant?: StatusPillVariant;
  dot?: boolean;
  pulse?: boolean;
  label?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  variant = 'neutral',
  dot = false,
  pulse = false,
  label,
  children,
  className = '',
}) => {
  const content = label ?? children;
  const classes = [
    'ui-pill',
    `ui-pill--${variant}`,
    pulse ? 'ui-pill--pulse' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes}>
      {(dot || pulse) && (
        <span
          className="ui-pill--dot"
          style={pulse ? { animation: 'pulse 1.5s infinite' } : undefined}
        />
      )}
      {content}
    </span>
  );
};
