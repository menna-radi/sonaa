import React from 'react';

export type ButtonVariant =
  | 'primary'
  | 'outline'
  | 'ghost'
  | 'soft-danger'
  | 'soft-warning'
  | 'danger'
  | 'link';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconLeading?: React.ReactNode;
  iconEnd?: React.ReactNode;
  iconTrailing?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconLeading,
  iconEnd,
  iconTrailing,
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const leadingIcon = icon ?? iconLeading;
  const trailingIcon = iconEnd ?? iconTrailing;

  const classes = [
    'ui-btn',
    `ui-btn--${variant}`,
    `ui-btn--${size}`,
    loading ? 'ui-btn--loading' : '',
    disabled || loading ? 'ui-btn--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading ? (
        <span
          style={{
            width: 14,
            height: 14,
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      ) : (
        leadingIcon && <span className="ui-btn__icon">{leadingIcon}</span>
      )}
      {children && <span>{children}</span>}
      {!loading && trailingIcon && <span className="ui-btn__icon ui-btn__icon--end">{trailingIcon}</span>}
    </button>
  );
};

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string;
  size?: ButtonSize;
  variant?: ButtonVariant;
  icon: React.ReactNode;
}

export const IconButton: React.FC<IconButtonProps> = ({
  size = 'md',
  variant = 'ghost',
  icon,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`ui-icon-btn ui-icon-btn--${variant} ui-icon-btn--${size} ${className}`}
      {...props}
    >
      {icon}
    </button>
  );
};
