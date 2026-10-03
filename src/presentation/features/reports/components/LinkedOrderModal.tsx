import React from 'react';
import { Briefcase, ExternalLink } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { useLanguage } from '../../../context/LanguageContext';
import type { SafetyReport } from '../../../../domain/repositories/SafetyReportRepository';

interface LinkedOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: SafetyReport | null;
  onOpenTasksCenter: () => void;
}

export const LinkedOrderModal: React.FC<LinkedOrderModalProps> = ({
  isOpen,
  onClose,
  report,
  onOpenTasksCenter,
}) => {
  const { t } = useLanguage();
  if (!report || !report.task) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="ui-row">
          <Briefcase size={20} className="ui-text-muted" />
          <span>{report.task.displayId}</span>
        </div>
      }
      footer={
        <div className="ui-row ui-row--between" style={{ width: '100%' }}>
          <Button variant="ghost" onClick={onClose}>
            {t('btn_close')}
          </Button>
          <Button
            variant="primary"
            icon={<ExternalLink size={14} className="ui-icon--directional" />}
            onClick={onOpenTasksCenter}
          >
            {t('reports_open_task')}
          </Button>
        </div>
      }
    >
      <div className="ui-stack">
        <div className="reports-task-box">
          <div className="ui-stack ui-stack--tight">
            <span className="ui-eyebrow">{t('tasks_title_label')}</span>
            <span className="ui-text-strong">{report.task.title}</span>
            <span className="ui-caption ui-num">{report.task.displayId}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
