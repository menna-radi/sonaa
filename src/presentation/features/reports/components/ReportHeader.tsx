import React from 'react';
import { StatusPill } from '../../../components/ui/StatusPill';
import { pillVariantFor, statusLabelKey } from '../../../components/ui/status';
import { formatDateTime } from '../../../../core/utils/format';
import { useLanguage } from '../../../context/LanguageContext';
import type { SafetyReport } from '../../../../domain/repositories/SafetyReportRepository';

interface ReportHeaderProps {
  report: SafetyReport;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({ report }) => {
  const { t, language } = useLanguage();

  const categoryKey = `report_cat_${report.category.toLowerCase()}`;
  const categoryLabel = t(categoryKey) || report.category.replace(/_/g, ' ');

  return (
    <div className="ui-stack ui-stack--tight">
      <div className="ui-row ui-row--between">
        <span className="ui-eyebrow">{categoryLabel}</span>
        <StatusPill
          variant={pillVariantFor('report', report.status)}
          label={t(statusLabelKey('report', report.status))}
        />
      </div>
      <span className="ui-caption">
        {formatDateTime(report.createdAt, language)}
      </span>
      {report.resolvedAt && (
        <span className="ui-caption ui-text-muted">
          {t('status_resolved')} · {formatDateTime(report.resolvedAt, language)}
          {report.resolvedBy ? ` · ${report.resolvedBy}` : ''}
        </span>
      )}
    </div>
  );
};
