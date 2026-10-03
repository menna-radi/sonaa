import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Segmented } from '../../../components/ui/Segmented';
import { StatusPill } from '../../../components/ui/StatusPill';
import { EmptyState } from '../../../components/ui/EmptyState';
import { pillVariantFor, statusLabelKey } from '../../../components/ui/status';
import { formatRelativeTime } from '../../../../core/utils/format';
import { useLanguage } from '../../../context/LanguageContext';
import type { SafetyReport, ReportStatus } from '../../../../domain/repositories/SafetyReportRepository';

interface ReportsQueueProps {
  reports: SafetyReport[];
  selectedId: string;
  statusFilter: ReportStatus | 'all';
  onStatusFilterChange: (status: ReportStatus | 'all') => void;
  onSelectReport: (report: SafetyReport) => void;
  loading?: boolean;
}

export const ReportsQueue: React.FC<ReportsQueueProps> = ({
  reports,
  selectedId,
  statusFilter,
  onStatusFilterChange,
  onSelectReport,
}) => {
  const { t, language } = useLanguage();

  const filterItems = [
    { value: 'PENDING', label: t('reports_kpi_pending') },
    { value: 'UNDER_INVESTIGATION', label: t('reports_kpi_investigating') },
    { value: 'RESOLVED', label: t('reports_kpi_resolved') },
    { value: 'DISMISSED', label: t('reports_kpi_dismissed') },
    { value: 'all', label: t('reports_filter_all') },
  ];

  return (
    <Card>
      <div className="reports-queue">
        <Segmented
          value={statusFilter}
          onChange={(val) => onStatusFilterChange(val as ReportStatus | 'all')}
          items={filterItems}
        />

        <div className="reports-queue__list">
          {reports.length === 0 ? (
            <EmptyState
              icon={<CheckCircle size={32} className="ui-text-muted" />}
              title={t('reports_empty_title')}
              description={t('reports_empty_desc')}
            />
          ) : (
            reports.map((report) => {
              const isSelected = report.id === selectedId;
              const catKey = `report_cat_${report.category.toLowerCase()}`;
              const catLabel = t(catKey) || report.category.replace(/_/g, ' ');
              const reporterName = typeof report.reporter === 'string'
                ? report.reporter
                : report.reporter?.name || t('common_anonymous');
              const suspectName = typeof report.suspect === 'string'
                ? report.suspect
                : report.suspect?.name || t('reports_subject');

              return (
                <button
                  key={report.id}
                  type="button"
                  onClick={() => onSelectReport(report)}
                  className={`reports-queue-item ${isSelected ? 'reports-queue-item--selected' : ''}`}
                >
                  <div className="ui-row ui-row--between">
                    <span className="ui-eyebrow">{catLabel}</span>
                    <StatusPill
                      variant={pillVariantFor('report', report.status)}
                      label={t(statusLabelKey('report', report.status))}
                    />
                  </div>
                  <div className="ui-row">
                    <span className="ui-text-strong ui-clamp-1">{reporterName}</span>
                    <span className="ui-text-muted">→</span>
                    <span className="ui-text-strong ui-clamp-1">{suspectName}</span>
                  </div>
                  {report.description && (
                    <span className="ui-caption ui-clamp-1 ui-text-muted">
                      {report.description}
                    </span>
                  )}
                  <span className="ui-caption ui-text-faint">
                    {formatRelativeTime(report.createdAt, language)}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </Card>
  );
};
