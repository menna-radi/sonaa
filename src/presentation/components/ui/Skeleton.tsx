import React from 'react';

export interface SkeletonProps {
  variant?: 'text' | 'circle' | 'card' | 'default';
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> & {
  Text: React.FC<{ width?: string | number; lines?: number; className?: string }>;
  Circle: React.FC<{ size?: number; className?: string }>;
  Card: React.FC<{ height?: number | string; className?: string }>;
} = ({ variant = 'default', width, height, borderRadius, className = '', style }) => {
  let defaultRadius = borderRadius;
  if (!defaultRadius) {
    if (variant === 'circle') defaultRadius = '50%';
    else if (variant === 'card') defaultRadius = 'var(--r-lg)';
  }

  const classes = [
    'ui-skeleton',
    variant !== 'default' ? `ui-skeleton--${variant}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      style={{
        width,
        height,
        borderRadius: defaultRadius,
        ...style,
      }}
    />
  );
};

Skeleton.Text = ({ width = '100%', lines = 1, className = '' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width }}>
    {Array.from({ length: lines }).map((_, idx) => (
      <div
        key={idx}
        className={`ui-skeleton ui-skeleton--text ${className}`}
        style={{ width: idx === lines - 1 && lines > 1 ? '70%' : '100%' }}
      />
    ))}
  </div>
);

Skeleton.Circle = ({ size = 32, className = '' }) => (
  <div
    className={`ui-skeleton ui-skeleton--circle ${className}`}
    style={{ width: size, height: size, flexShrink: 0 }}
  />
);

Skeleton.Card = ({ height = 120, className = '' }) => (
  <div
    className={`ui-skeleton ${className}`}
    style={{ width: '100%', height, borderRadius: 'var(--r-lg)' }}
  />
);
