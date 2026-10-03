import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { ErrorState } from '../../../components/ui/EmptyState';
import { Drawer } from '../../../components/ui/Drawer';
import { useBreakpoint } from '../../../components/ui/useBreakpoint';
import { useLanguage } from '../../../context/LanguageContext';
import { formatRelativeTime } from '../../../../core/utils/format';
import { useReports } from '../hooks/useReports';
import { ReportsKpis } from '../components/ReportsKpis';
import { ReportsQueue } from '../components/ReportsQueue';
import { ReportDetailPanel } from '../components/ReportDetailPanel';
import type { SafetyReport, ReportStatus } from '../../../../domain/repositories/SafetyReportRepository';
import '../reports.css';

export const ReportsPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { isMobile } = useBreakpoint();
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('PENDING');
  const [selectedIdState, setSelectedIdState] = useState<string>('');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const { reports, counts, isLoading, isError, error, isFetching, refetch, dataUpdatedAt, moderate } = useReports({
    status: statusFilter,
    page: 1,
    limit: 50,
  });

  const activeId = (reports.some((r) => r.id === selectedIdState) ? selectedIdState : '') || reports[0]?.id || '';
  const selectedReport: SafetyReport | null = reports.find((r) => r.id === activeId) || null;

  const handleSelectReport = (report: SafetyReport) => {
    setSelectedIdState(report.id);
    if (isMobile) {
      setMobileDrawerOpen(true);
    }
  };

  const handleModerate = async (action: 'dismiss' | 'suspend' | 'ban', notes?: string) => {
    if (!activeId) return;
    await moderate.mutateAsync({ id: activeId, action, notes });
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  };

  return (
    <div className="ui-page">
      <PageHeader
        title={t('reports_title')}
        subtitle={t('reports_subtitle')}
        meta={dataUpdatedAt ? `${t('updated')} ${formatRelativeTime(dataUpdatedAt, language)}` : undefined}
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw size={14} className={isFetching ? 'spin' : ''} />}
            loading={isFetching}
            onClick={() => refetch()}
          >
            {t('btn_refresh')}
          </Button>
        }
      />

      {isError ? (
        <ErrorState
          title={t('status_error')}
          message={error?.message || t('err_generic')}
          onRetry={() => refetch()}
        />
      ) : (
        <>
          <ReportsKpis counts={counts} loading={isLoading} />

          <div className="ui-split">
            <ReportsQueue
              reports={reports}
              selectedId={activeId}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              onSelectReport={handleSelectReport}
              loading={isLoading}
            />

            {!isMobile && (
              <ReportDetailPanel
                report={selectedReport}
                onModerate={handleModerate}
                loading={moderate.isPending}
              />
            )}
          </div>
        </>
      )}

      {isMobile && (
        <Drawer
          isOpen={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          title={selectedReport?.category ? selectedReport.category.replace(/_/g, ' ') : t('reports_title')}
          size="lg"
        >
          <ReportDetailPanel
            report={selectedReport}
            onModerate={handleModerate}
            loading={moderate.isPending}
          />
        </Drawer>
      )}
    </div>
  );
};
export default ReportsPage;
