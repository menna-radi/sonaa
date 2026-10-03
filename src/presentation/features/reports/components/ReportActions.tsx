import React, { useState } from 'react';
import { Ban, ShieldAlert, Check } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { TextField } from '../../../components/ui/FormFields';
import { useConfirm } from '../../../components/ui/ConfirmDialog';
import { useLanguage } from '../../../context/LanguageContext';
import { validate } from '../../../../domain/validation';
import { reportModerateSchema } from '../../../../domain/validation/ops';
import type { SafetyReport } from '../../../../domain/repositories/SafetyReportRepository';

interface ReportActionsProps {
  report: SafetyReport;
  onModerate: (action: 'dismiss' | 'suspend' | 'ban', notes?: string) => Promise<void>;
  loading?: boolean;
}

export const ReportActions: React.FC<ReportActionsProps> = ({
  report,
  onModerate,
  loading = false,
}) => {
  const { t } = useLanguage();
  const confirm = useConfirm();
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | undefined>();

  const isResolved = report.status === 'RESOLVED' || report.status === 'DISMISSED';

  const handleAction = async (action: 'dismiss' | 'suspend' | 'ban') => {
    setError(undefined);

    // Validate notes
    if ((action === 'suspend' || action === 'ban') && notes.trim().length < 3) {
      setError(t('val_min_len').replace('{n}', '3'));
      return;
    }

    const valResult = validate(reportModerateSchema, { action, notes: notes.trim() || undefined });
    if (!valResult.ok) {
      setError(valResult.errors.notes || valResult.errors.action);
      return;
    }

    if (action === 'ban') {
      const ok = await confirm({
        title: t('reports_confirm_ban_title'),
        body: t('reports_confirm_ban_body'),
        tone: 'danger',
        confirmLabel: t('reports_ban'),
      });
      if (!ok) return;
    }

    await onModerate(action, notes.trim() || undefined);
    setNotes('');
  };

  if (isResolved) return null;

  return (
    <div className="ui-stack ui-stack--tight">
      <TextField
        label={t('reports_notes_label')}
        placeholder={t('reports_notes_placeholder')}
        value={notes}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotes(e.target.value)}
        error={error}
        disabled={loading}
      />
      <div className="reports-actions">
        <Button
          variant="outline"
          size="sm"
          icon={<Check size={14} />}
          loading={loading}
          onClick={() => handleAction('dismiss')}
        >
          {t('reports_dismiss')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          icon={<ShieldAlert size={14} />}
          loading={loading}
          onClick={() => handleAction('suspend')}
        >
          {t('reports_suspend')}
        </Button>
        <Button
          variant="danger"
          size="sm"
          icon={<Ban size={14} />}
          loading={loading}
          onClick={() => handleAction('ban')}
        >
          {t('reports_ban')}
        </Button>
      </div>
    </div>
  );
};
