import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useNavigation } from '../../../context/NavigationContext';
import { Card, ListItem, IconCircle, Button } from '../../../components/ui';
import type { PendingReport } from '../../../../domain/repositories/MetricRepository';
import { Scale, CreditCard, ShieldAlert, UserX, AlertTriangle, ArrowRight } from 'lucide-react';

interface PendingReportsProps {
  reports: PendingReport[];
}

export const PendingReports: React.FC<PendingReportsProps> = ({ reports }) => {
  const { t, language } = useLanguage();
  const { navigate } = useNavigation();

  const getReportToneAndIcon = (typeKey: string): { icon: React.ReactNode; tone: 'default' | 'danger' | 'warning' | 'info' } => {
    switch (typeKey) {
      case 'report_service_dispute':
        return { icon: <Scale size={14} />, tone: 'warning' };
      case 'report_payment_issue':
        return { icon: <CreditCard size={14} />, tone: 'danger' };
      case 'report_quality_concern':
        return { icon: <ShieldAlert size={14} />, tone: 'info' };
      case 'report_no_show':
        return { icon: <UserX size={14} />, tone: 'danger' };
      case 'report_inappropriate_conduct':
        return { icon: <AlertTriangle size={14} />, tone: 'danger' };
      default:
        return { icon: <AlertTriangle size={14} />, tone: 'default' };
    }
  };

  return (
    <Card
      title={t('sec_pending_reports')}
      subtitle={`${reports.length} ${t('require_review') || 'require review'}`}
      className="pending-reports-card"
      headerAction={
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('reports')}
          iconTrailing={<ArrowRight size={14} style={{ transform: language === 'ar' || language === 'he' ? 'scaleX(-1)' : 'none' }} />}
        >
          {t('view_all') || 'View all'}
        </Button>
      }
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', flex: 1 }}>
        {reports.map((report) => {
          const { icon, tone } = getReportToneAndIcon(report.typeKey);
          return (
            <ListItem
              key={report.id}
              onClick={() => navigate('reports')}
              leading={<IconCircle icon={icon} tone={tone} size={32} />}
              title={t(report.typeKey)}
              subtitle={report.details}
              trailing={
                <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>
                  {t(report.timeKey)}
                </span>
              }
            />
          );
        })}
      </div>
    </Card>
  );
};

export default PendingReports;
