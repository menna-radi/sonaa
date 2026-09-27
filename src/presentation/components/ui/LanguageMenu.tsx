import React from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { Dropdown } from './Dropdown';
import type { Language } from '../../context/LanguageContext';

export interface LanguageOption {
  value: Language;
  code: string;
  label: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: 'en', code: 'EN', label: 'English' },
  { value: 'ar', code: 'AR', label: 'العربية' },
  { value: 'he', code: 'HE', label: 'עברית' },
];

interface LanguageMenuProps {
  value: Language;
  onChange: (lang: Language) => void;
  size?: 'sm' | 'md';
}

/**
 * Simple, modern language picker dropdown.
 * Globe + active language pill trigger, native-name options with a check
 * on the active one. RTL-aware (menu aligns to inline-end), closes on
 * outside click / Escape via the shared Dropdown.
 */
export const LanguageMenu: React.FC<LanguageMenuProps> = ({ value, onChange, size = 'md' }) => {
  const active = LANGUAGE_OPTIONS.find((opt) => opt.value === value) ?? LANGUAGE_OPTIONS[0];

  return (
    <Dropdown
      align="end"
      trigger={
        <button
          type="button"
          aria-haspopup="menu"
          aria-label={`Language: ${active.label}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: size === 'sm' ? '7px 11px' : '8px 14px',
            borderRadius: '999px',
            border: '1px solid var(--border)',
            background: 'var(--surface-card)',
            color: 'var(--text-strong)',
            fontSize: 'var(--fs-small, 13px)',
            fontWeight: 600,
            letterSpacing: '0.02em',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-pop)',
            whiteSpace: 'nowrap',
          }}
        >
          <Globe size={15} style={{ color: 'var(--text-muted)' }} />
          <span>{active.code}</span>
          <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
        </button>
      }
      items={LANGUAGE_OPTIONS.map((opt) => ({
        key: opt.value,
        label: (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              gap: '16px',
            }}
          >
            <span>{opt.label}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: 'var(--fs-micro, 11px)', color: 'var(--text-muted)', fontWeight: 600 }}>
                {opt.code}
              </span>
              {opt.value === value && <Check size={14} />}
            </span>
          </span>
        ),
        onClick: () => onChange(opt.value),
      }))}
    />
  );
};

export default LanguageMenu;
