import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useNavigation } from '../../../context/NavigationContext';
import { Card, ListItem, IconCircle, Button, EmptyState } from '../../../components/ui';
import { formatRelativeTime } from '../../../../core/utils/format';
import type { PendingReport } from '../../../../domain/repositories/MetricRepository';
import { Scale, ArrowRight } from 'lucide-react';

interface PendingDisputesProps {
  reports: PendingReport[];
}

export const PendingDisputes: React.FC<PendingDisputesProps> = ({ reports }) => {
  const { t, language } = useLanguage();
  const { navigate } = useNavigation();

  const openDisputes = () => {
    try {
      sessionStorage.setItem('tasks_tab', 'disputes');
    } catch {
      // storage unavailable — navigation still works
    }
    navigate('tasks');
  };

  return (
    <Card
      title={t('sec_pending_disputes')}
      subtitle={`${reports.length} ${t('require_review')}`}
      headerAction={
        <Button
          variant="ghost"
          size="sm"
          onClick={openDisputes}
          iconTrailing={<ArrowRight size={14} className="ui-icon--directional" />}
        >
          {t('view_all')}
        </Button>
      }
      className="ov-card-fill"
    >
      {reports.length === 0 ? (
        <EmptyState title={t('empty_pending_disputes')} />
      ) : (
        <div className="ui-stack ui-stack--tight">
          {reports.map((report) => (
            <ListItem
              key={report.id}
              onClick={openDisputes}
              leading={<IconCircle icon={<Scale size={14} />} tone="warning" size={32} />}
              title={report.title ?? t(report.typeKey)}
              subtitle={report.subtitle ?? report.details}
              trailing={
                <span className="ov-dispute-time">
                  {report.createdAt ? formatRelativeTime(report.createdAt, language) : '—'}
                </span>
              }
            />
          ))}
        </div>
      )}
    </Card>
  );
};

export default PendingDisputes;
