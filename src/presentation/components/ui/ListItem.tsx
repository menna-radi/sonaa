import React from 'react';

export interface IconCircleProps {
  icon: React.ReactNode;
  tone?: 'default' | 'danger' | 'warning' | 'success' | 'info';
  size?: number;
  className?: string;
}

export const IconCircle: React.FC<IconCircleProps> = ({
  icon,
  tone = 'default',
  size = 32,
  className = '',
}) => {
  return (
    <div
      className={`ui-icon-circle ui-icon-circle--${tone} ${className}`}
      style={{ width: size, height: size }}
    >
      {icon}
    </div>
  );
};

export interface ListItemProps {
  leading?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  meta?: React.ReactNode;
  trailing?: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export const ListItem: React.FC<ListItemProps> = ({
  leading,
  title,
  subtitle,
  meta,
  trailing,
  selected = false,
  onClick,
  className = '',
}) => {
  const classes = [
    'ui-list-item',
    selected ? 'ui-list-item--selected' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} onClick={onClick} role={onClick ? 'button' : undefined}>
      {leading}
      <div className="ui-list-item__content">
        <div className="ui-list-item__title">{title}</div>
        {subtitle && <div className="ui-list-item__subtitle">{subtitle}</div>}
      </div>
      {meta && <div className="ui-list-item__meta">{meta}</div>}
      {trailing}
    </div>
  );
};
