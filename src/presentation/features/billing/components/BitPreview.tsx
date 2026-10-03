import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Card } from '../../../components/ui/Card';
import type { BitSettings } from '../../../../domain/entities/Billing';
import { Copy, Check } from 'lucide-react';

interface BitPreviewProps {
  settings: BitSettings;
}

export const BitPreview: React.FC<BitPreviewProps> = ({ settings }) => {
  const { t, language } = useLanguage();
  const [copied, setCopied] = useState(false);

  const copyPhone = async () => {
    try {
      await navigator.clipboard.writeText(settings.phoneNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
  };

  const instructions = language === 'ar' ? settings.instructionsAr : settings.instructionsEn;
  const steps = instructions
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <Card title={t('settings_bit_preview_title')} className="ov-card-fill">
      <div className="ui-stack">
        <div className="ui-row ui-row--between">
          <bdi className="ui-num ui-text-strong">{settings.phoneNumber || '—'}</bdi>
          <button type="button" className="ov-icon-btn" onClick={() => void copyPhone()} aria-label={t('settings_bit_copy')}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
        {copied && <span className="ui-caption">{t('settings_bit_copied')}</span>}
        <div className="ui-text-strong">{settings.recipientName || '—'}</div>
        {steps.length > 0 && (
          <ol className="billing-steps">
            {steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        )}
      </div>
    </Card>
  );
};

export default BitPreview;
