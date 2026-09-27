import React from 'react';
import { AlertTriangle, FileText, CheckCircle } from 'lucide-react';
import { Segmented } from '../../../components/ui/Segmented';
import { StatusPill } from '../../../components/ui/StatusPill';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useLanguage } from '../../../context/LanguageContext';
import { ReportItem, ReportFilter } from '../types';

interface ReportsQueueProps {
  reports: ReportItem[];
  selectedId: string;
  filter: ReportFilter;
  onFilterChange: (f: ReportFilter) => void;
  onSelectReport: (report: ReportItem) => void;
}

export const ReportsQueue: React.FC<ReportsQueueProps> = ({
  reports,
  selectedId,
  filter,
  onFilterChange,
  onSelectReport,
}) => {
  const { t } = useLanguage();

  const filterItems = [
    { value: 'All', label: t('reports_filter_all') || 'All' },
    { value: 'Fraud', label: t('reports_filter_fraud') || 'Fraud' },
    { value: 'Fake accounts', label: t('reports_filter_fake_accounts') || 'Fake accounts' },
    { value: 'Chats', label: t('reports_filter_chats') || 'Chats' },
    { value: 'Spam', label: t('reports_filter_spam') || 'Spam' },
  ];

  const getSeverityVariant = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return 'danger' as const;
      case 'medium':
        return 'warning' as const;
      case 'low':
      default:
        return 'neutral' as const;
    }
  };

  const getSeverityLabel = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return t('reports_severity_high') || 'High Severity';
      case 'medium':
        return t('reports_severity_medium') || 'Medium';
      case 'low':
      default:
        return t('reports_severity_low') || 'Low';
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-3)',
        background: 'var(--surface-raised)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--sp-4)',
      }}
    >
      <Segmented
        value={filter}
        onChange={(val) => onFilterChange(val as ReportFilter)}
        items={filterItems}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--sp-2)',
          maxHeight: 'calc(100vh - 360px)',
          overflowY: 'auto',
        }}
      >
        {reports.length === 0 ? (
          <EmptyState
            icon={<CheckCircle size={32} style={{ color: 'var(--success)' }} />}
            title="All caught up!"
            description="No pending security alerts or reports need review."
          />
        ) : (
          reports.map((report) => {
            const isSelected = report.id === selectedId;
            const severityVariant = getSeverityVariant(report.severity);

            return (
              <button
                key={report.id}
                type="button"
                onClick={() => onSelectReport(report)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--sp-3)',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected
                    ? '1px solid var(--border-focus)'
                    : '1px solid var(--border-subtle)',
                  background: isSelected
                    ? 'var(--surface-selected, var(--surface-sunken))'
                    : 'var(--surface-base)',
                  cursor: 'pointer',
                  textAlign: 'start',
                  transition: 'background var(--motion-fast), border-color var(--motion-fast)',
                  gap: 'var(--sp-3)',
                  width: '100%',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--surface-sunken)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color:
                        report.severity === 'high'
                          ? 'var(--danger)'
                          : report.severity === 'medium'
                          ? 'var(--warning)'
                          : 'var(--on-surface-muted)',
                      flexShrink: 0,
                    }}
                  >
                    {report.severity === 'high' || report.severity === 'medium' ? (
                      <AlertTriangle size={16} />
                    ) : (
                      <FileText size={16} />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-1)' }}>
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: 'var(--text-sm)',
                          color: 'var(--on-surface)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {report.title}
                      </span>
                      <StatusPill variant={severityVariant}>
                        {getSeverityLabel(report.severity)}
                      </StatusPill>
                    </div>
                    <div
                      style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--on-surface-muted)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {report.reporter} · #{report.id}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--on-surface-subtle)',
                    flexShrink: 0,
                  }}
                >
                  {report.time}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
