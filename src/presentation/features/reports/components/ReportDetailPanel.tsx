import React, { useState } from 'react';
import { Briefcase, ExternalLink } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useLanguage } from '../../../context/LanguageContext';
import { useNavigation } from '../../../context/NavigationContext';
import { ReportHeader } from './ReportHeader';
import { PartyCard } from './PartyCard';
import { ReportActions } from './ReportActions';
import { LinkedOrderModal } from './LinkedOrderModal';
import type { SafetyReport } from '../../../../domain/repositories/SafetyReportRepository';

interface ReportDetailPanelProps {
  report: SafetyReport | null;
  onModerate: (action: 'dismiss' | 'suspend' | 'ban', notes?: string) => Promise<void>;
  loading?: boolean;
}

export const ReportDetailPanel: React.FC<ReportDetailPanelProps> = ({
  report,
  onModerate,
  loading = false,
}) => {
  const { t } = useLanguage();
  const { navigate } = useNavigation();
  const [showOrderModal, setShowOrderModal] = useState(false);

  if (!report) {
    return (
      <Card>
        <div className="ui-center" style={{ minHeight: '300px' }}>
          <span className="ui-text-muted">{t('reports_empty_desc')}</span>
        </div>
      </Card>
    );
  }

  const handleOpenTasks = () => {
    setShowOrderModal(false);
    navigate('tasks');
  };

  return (
    <>
      <Card>
        <div className="reports-detail">
          <ReportHeader report={report} />

          <div className="reports-parties-grid">
            <PartyCard
              label={t('reports_reporter')}
              party={report.reporter}
            />
            <PartyCard
              label={t('reports_subject')}
              party={report.suspect}
            />
          </div>

          {report.description && (
            <div className="ui-stack ui-stack--tight">
              <span className="ui-eyebrow">{t('reports_desc')}</span>
              <p className="ui-text-muted" style={{ margin: 0 }}>
                {report.description}
              </p>
            </div>
          )}

          {report.task ? (
            <div className="ui-stack ui-stack--tight">
              <span className="ui-eyebrow">{t('reports_linked_order')}</span>
              <div className="reports-task-box">
                <div className="ui-row">
                  <Briefcase size={16} className="ui-text-muted" />
                  <span className="ui-text-strong">{report.task.title}</span>
                  <span className="ui-caption ui-num">{report.task.displayId}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<ExternalLink size={12} className="ui-icon--directional" />}
                  onClick={() => setShowOrderModal(true)}
                >
                  {t('reports_open_task')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="ui-stack ui-stack--tight">
              <span className="ui-eyebrow">{t('reports_linked_order')}</span>
              <span className="ui-caption ui-text-muted">{t('reports_no_task')}</span>
            </div>
          )}

          {report.moderatorNotes && (
            <div className="ui-stack ui-stack--tight">
              <span className="ui-eyebrow">{t('reports_notes_label')}</span>
              <p className="ui-caption ui-text-muted" style={{ margin: 0 }}>
                {report.moderatorNotes}
              </p>
            </div>
          )}

          <ReportActions
            report={report}
            onModerate={onModerate}
            loading={loading}
          />
        </div>
      </Card>

      <LinkedOrderModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        report={report}
        onOpenTasksCenter={handleOpenTasks}
      />
    </>
  );
};
