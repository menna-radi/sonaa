import React from 'react';
import { Search, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  kbdShortcut?: string; // e.g. '⌘K'
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onClear,
  kbdShortcut,
  placeholder,
  className = '',
  ...props
}) => {
  const { t } = useLanguage();
  return (
    <div className={`ui-search-input ${className}`}>
      <Search size={16} color="var(--text-muted)" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || t('search_ph_default') || 'Search...'}
        {...props}
      />
      {value ? (
        <button
          type="button"
          onClick={() => {
            onChange('');
            onClear?.();
          }}
          aria-label={t('header_aria_clear') || 'Clear search'}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--text-muted)',
          }}
        >
          <X size={14} />
        </button>
      ) : kbdShortcut ? (
        <kbd
          style={{
            fontSize: '11px',
            padding: '2px 5px',
            borderRadius: 'var(--radius-xs)',
            border: '1px solid var(--border)',
            color: 'var(--text-faint)',
            background: 'var(--surface-card)',
            userSelect: 'none',
          }}
        >
          {kbdShortcut}
        </kbd>
      ) : null}
    </div>
  );
};
