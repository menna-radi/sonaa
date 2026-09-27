import React from 'react';
import { Card, TextArea } from '../../../components/ui';

interface ModeratorNotesProps {
  notes: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

const PRESETS = [
  'Verified national ID and selfie match successfully.',
  'ID document photo is blurry; please re-upload clear photos.',
  'Selfie does not match photo on national ID card.',
  'Trade certification verified with local licensing board.',
  'Applicant approved for marketplace dispatch.',
];

export const ModeratorNotes: React.FC<ModeratorNotesProps> = ({
  notes,
  onChange,
  disabled = false,
}) => {
  return (
    <Card
      eyebrow="Audit Log"
      title="Moderator Notes"
      padding="md"
      className="moderator-notes-card"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        {/* Quick Presets */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
          {PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => onChange(preset)}
              style={{
                fontSize: 'var(--fs-nano)',
                padding: 'var(--sp-1) var(--sp-2)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--surface-sunken)',
                color: 'var(--text-secondary)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'background var(--transition-fast)',
              }}
            >
              + {preset}
            </button>
          ))}
        </div>

        <TextArea
          value={notes}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Add a note for the audit log…"
          rows={4}
          disabled={disabled}
        />
      </div>
    </Card>
  );
};

export default ModeratorNotes;
