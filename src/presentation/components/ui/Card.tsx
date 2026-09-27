import React from 'react';

export type CardVariant = 'default' | 'inverse' | 'danger';
export type CardPadding = 'md' | 'none';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  headerAction?: React.ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  eyebrow,
  title,
  subtitle,
  actions,
  headerAction,
  variant = 'default',
  padding = 'md',
  children,
  className = '',
  ...props
}) => {
  const finalActions = actions ?? headerAction;
  const hasHeader = eyebrow || title || subtitle || finalActions;

  const classes = [
    'ui-card',
    `ui-card--${variant}`,
    `ui-card--padding-${padding}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...props}>
      {hasHeader && (
        <div className="ui-card__header">
          <div className="ui-card__titles">
            {eyebrow && <span className="ui-card__eyebrow">{eyebrow}</span>}
            {title && <span className="ui-card__title">{title}</span>}
            {subtitle && (
              <span
                className="ui-card__subtitle"
                style={{
                  fontSize: 'var(--fs-caption)',
                  color: 'var(--text-muted)',
                  marginTop: 2,
                }}
              >
                {subtitle}
              </span>
            )}
          </div>
          {finalActions && <div className="ui-card__actions">{finalActions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
