import React from 'react';

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  wrapperClassName?: string;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  error,
  helperText,
  id,
  className = '',
  wrapperClassName = '',
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`ui-input-wrapper ${wrapperClassName}`}>
      {label && (
        <label htmlFor={inputId} className="ui-input-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`ui-text-field ${className}`}
        style={error ? { borderColor: 'var(--danger)' } : undefined}
        {...props}
      />
      {error && <span className="ui-input-error">{error}</span>}
      {!error && helperText && (
        <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-faint)' }}>
          {helperText}
        </span>
      )}
    </div>
  );
};

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  sunken?: boolean;
  wrapperClassName?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  sunken = false,
  id,
  className = '',
  wrapperClassName = '',
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`ui-input-wrapper ${wrapperClassName}`}>
      {label && (
        <label htmlFor={inputId} className="ui-input-label">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`ui-textarea ${sunken ? 'ui-textarea--sunken' : ''} ${className}`}
        style={error ? { borderColor: 'var(--danger)' } : undefined}
        {...props}
      />
      {error && <span className="ui-input-error">{error}</span>}
    </div>
  );
};

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: { value: string | number; label: string }[];
  wrapperClassName?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  children,
  id,
  className = '',
  wrapperClassName = '',
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`ui-input-wrapper ${wrapperClassName}`}>
      {label && (
        <label htmlFor={inputId} className="ui-input-label">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={`ui-select ${className}`}
        style={error ? { borderColor: 'var(--danger)' } : undefined}
        {...props}
      >
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
      {error && <span className="ui-input-error">{error}</span>}
    </div>
  );
};

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
}) => {
  return (
    <label
      className={`ui-switch ${checked ? 'ui-switch--checked' : ''} ${className}`}
      style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}
    >
      <div
        className="ui-switch__track"
        onClick={() => !disabled && onChange(!checked)}
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            if (!disabled) onChange(!checked);
          }
        }}
      >
        <div className="ui-switch__thumb" />
      </div>
      {label && <span style={{ fontSize: 'var(--fs-small)' }}>{label}</span>}
    </label>
  );
};

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, className = '', ...props }) => {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
      <input
        type="checkbox"
        className={className}
        style={{
          width: 16,
          height: 16,
          accentColor: 'var(--surface-inverse)',
          cursor: 'pointer',
        }}
        {...props}
      />
      {label && <span style={{ fontSize: 'var(--fs-small)', color: 'var(--text-strong)' }}>{label}</span>}
    </label>
  );
};
