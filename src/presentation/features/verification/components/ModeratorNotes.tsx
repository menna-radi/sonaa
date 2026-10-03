import React from 'react';
import { Card, TextArea } from '../../../components/ui';
import { useLanguage } from '../../../context/LanguageContext';

interface ModeratorNotesProps {
  notes: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  error?: string;
}

const PRESET_KEYS = ['vr_preset_1', 'vr_preset_2', 'vr_preset_3', 'vr_preset_4', 'vr_preset_5'];

export const ModeratorNotes: React.FC<ModeratorNotesProps> = ({
  notes,
  onChange,
  disabled = false,
  error,
}) => {
  const { t } = useLanguage();
  return (
    <Card
      eyebrow={t('vr_notes_eyebrow')}
      title={t('vr_notes_title')}
      padding="md"
      className="moderator-notes-card"
    >
      <div className="ui-stack">
        <div className="vr-presets">
          {PRESET_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              className="vr-preset-btn"
              disabled={disabled}
              onClick={() => onChange(t(key))}
            >
              + {t(key)}
            </button>
          ))}
        </div>

        <TextArea
          value={notes}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('vr_notes_placeholder')}
          rows={4}
          disabled={disabled}
          error={error}
          aria-invalid={error ? true : undefined}
        />
        <span className="ui-caption">{t('vr_notes_required_hint')}</span>
      </div>
    </Card>
  );
};

export default ModeratorNotes;
