import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { useNavigation } from '../../../context/NavigationContext';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useBreakpoint } from '../../../components/ui/useBreakpoint';
import { ImageLightbox } from '../../verification/components/ImageLightbox';
import { ReportsKpis } from '../components/ReportsKpis';
import { ReportsQueue } from '../components/ReportsQueue';
import { ReportDetailPanel } from '../components/ReportDetailPanel';
import { LinkedOrderModal } from '../components/LinkedOrderModal';
import { ReportItem, ReportFilter } from '../types';

export const ReportsPage: React.FC = () => {
  const { t, isRtl } = useLanguage();
  const { navigate } = useNavigation();
  const { isMobile } = useBreakpoint();
  const { dependencies } = useDependencies();
  const { safetyReportRepository } = dependencies;

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string>('');
  const [filter, setFilter] = useState<ReportFilter>('All');
  const [mobileView, setMobileView] = useState<'queue' | 'detail'>('queue');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [showOrderModal, setShowOrderModal] = useState<boolean>(false);
  const [aiFilterActive, setAiFilterActive] = useState<boolean>(false);

  // Escrow & Moderation state
  const [escrowStates, setEscrowStates] = useState<{ [id: string]: 'RELEASED' | 'FROZEN' | 'REFUNDED' }>({});
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [suspendedIds, setSuspendedIds] = useState<Set<string>>(new Set());
  const [bannedIds, setBannedIds] = useState<Set<string>>(new Set());

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await safetyReportRepository.getSafetyReports();
      if (result.success) {
        const fetched = result.data as ReportItem[];
        setReports(fetched);
        if (fetched.length > 0 && !selectedId) {
          setSelectedId(fetched[0].id);
        }
      } else {
        setError(result.error.message || 'Failed to fetch safety reports.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch safety reports.');
    } finally {
      setLoading(false);
    }
  }, [safetyReportRepository, selectedId]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const activeReports = reports.filter((report) => {
    const isResolved =
      dismissedIds.has(report.id) || suspendedIds.has(report.id) || bannedIds.has(report.id);
    if (isResolved) return false;

    if (filter === 'All') return true;
    if (filter === 'Fraud') return report.category === 'fraud';
    if (filter === 'Fake accounts') return report.category === 'fake_accounts';
    if (filter === 'Chats') return report.category === 'chats';
    if (filter === 'Spam') return report.category === 'spam';
    return true;
  });

  const selectedReport = activeReports.find((r) => r.id === selectedId) || activeReports[0];

  const handleSelectReport = (report: ReportItem) => {
    setSelectedId(report.id);
    if (isMobile) {
      setMobileView('detail');
    }
  };

  const handleSetFilter = (newFilter: ReportFilter) => {
    setFilter(newFilter);
    const filteredList = reports.filter((report) => {
      const isResolved =
        dismissedIds.has(report.id) || suspendedIds.has(report.id) || bannedIds.has(report.id);
      if (isResolved) return false;

      if (newFilter === 'All') return true;
      if (newFilter === 'Fraud') return report.category === 'fraud';
      if (newFilter === 'Fake accounts') return report.category === 'fake_accounts';
      if (newFilter === 'Chats') return report.category === 'chats';
      if (newFilter === 'Spam') return report.category === 'spam';
      return true;
    });

    if (filteredList.length > 0) {
      setSelectedId(filteredList[0].id);
    } else {
      setSelectedId('');
    }
  };

  const handleToggleEscrow = async (reportId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'FROZEN' ? 'RELEASED' : 'FROZEN';
    setEscrowStates((prev) => ({ ...prev, [reportId]: nextStatus }));
  };

  const handleRefundCustomer = async (reportId: string) => {
    setEscrowStates((prev) => ({ ...prev, [reportId]: 'REFUNDED' }));
  };

  const handleExecuteAction = async (
    action: 'dismiss' | 'warning' | 'suspend' | 'ban',
    target: 'reporter' | 'suspect' | 'both',
    message: string,
    reason: string
  ) => {
    if (!selectedReport) return;

    const actionToExecute = action === 'warning' ? 'dismiss' : action;
    const combinedNotes = `${message} (Target: ${target}) [Reason: ${reason}]`;

    const result = await safetyReportRepository.moderateReport(
      selectedReport.id,
      actionToExecute,
      combinedNotes
    );

    if (result.success) {
      if (action === 'dismiss' || action === 'warning') {
        setDismissedIds((prev) => new Set([...prev, selectedReport.id]));
      } else if (action === 'suspend') {
        setSuspendedIds((prev) => new Set([...prev, selectedReport.id]));
      } else if (action === 'ban') {
        setBannedIds((prev) => new Set([...prev, selectedReport.id]));
      }

      const remaining = activeReports.filter((r) => r.id !== selectedReport.id);
      if (remaining.length > 0) {
        setSelectedId(remaining[0].id);
      } else {
        setSelectedId('');
        if (isMobile) {
          setMobileView('queue');
        }
      }
    } else {
      throw new Error(result.error.message || 'Failed to moderate report.');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-4)',
        direction: isRtl ? 'rtl' : 'ltr',
      }}
    >
      <PageHeader
        title={t('reports_title') || 'Reports & Safety Center'}
        subtitle={
          t('reports_subtitle') ||
          'Real-time moderation, incident alerts, dispute management, and community safety enforcement'
        }
        actions={
          <Button
            size="sm"
            variant={aiFilterActive ? 'primary' : 'outline'}
            icon={<Sparkles size={14} />}
            onClick={() => setAiFilterActive(!aiFilterActive)}
          >
            {aiFilterActive ? 'AI Risk Filter Active' : 'Enable AI Risk Filter'}
          </Button>
        }
      />

      <ReportsKpis reports={reports} activeCount={activeReports.length} loading={loading} />

      {loading ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 300,
            flexDirection: 'column',
            gap: 'var(--sp-3)',
          }}
        >
          <RefreshCw className="animate-spin" size={32} style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--on-surface-subtle)' }}>
            Loading safety reports...
          </span>
        </div>
      ) : error ? (
        <EmptyState
          title="Failed to Load Reports"
          description={error}
          action={<Button variant="outline" onClick={fetchReports}>Retry</Button>}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '360px 1fr',
            gap: 'var(--sp-4)',
            alignItems: 'start',
          }}
        >
          {/* Queue (Visible on desktop/tablet, or mobile if view === 'queue') */}
          {(!isMobile || mobileView === 'queue') && (
            <ReportsQueue
              reports={activeReports}
              selectedId={selectedId}
              filter={filter}
              onFilterChange={handleSetFilter}
              onSelectReport={handleSelectReport}
            />
          )}

          {/* Details (Visible on desktop/tablet, or mobile if view === 'detail') */}
          {(!isMobile || mobileView === 'detail') && (
            <>
              {selectedReport ? (
                <ReportDetailPanel
                  report={selectedReport}
                  escrowStatus={
                    escrowStates[selectedReport.id] || selectedReport.escrowStatus || 'FROZEN'
                  }
                  onToggleEscrow={handleToggleEscrow}
                  onRefundCustomer={handleRefundCustomer}
                  onExecuteAction={handleExecuteAction}
                  onOpenOrderModal={() => setShowOrderModal(true)}
                  onOpenLightbox={(img) => setLightboxImage(img)}
                  onBackToQueue={isMobile ? () => setMobileView('queue') : undefined}
                />
              ) : (
                <EmptyState
                  title="No Report Selected"
                  description="Select an incident from the queue on the left to inspect logs, evidence, and moderation tools."
                />
              )}
            </>
          )}
        </div>
      )}

      {/* Linked Order Modal */}
      {showOrderModal && selectedReport && (
        <LinkedOrderModal
          isOpen={showOrderModal}
          onClose={() => setShowOrderModal(false)}
          report={selectedReport}
          onOpenTasksCenter={() => {
            setShowOrderModal(false);
            navigate('tasks');
          }}
        />
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <ImageLightbox url={lightboxImage} onClose={() => setLightboxImage(null)} />
      )}
    </div>
  );
};
