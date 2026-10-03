import React, { useState, useEffect } from 'react';
import type { VerificationTab } from '../types';
import {
  PageHeader,
  Button,
  Drawer,
  AlertBanner,
  EmptyState,
  ErrorState,
  useToast,
  useBreakpoint,
  Skeleton,
} from '../../../components/ui';
import { useLanguage } from '../../../context/LanguageContext';
import { errorMessage } from '../../../../core/errors/errorMessage';
import { validate, tError } from '../../../../domain/validation';
import { moderationNotesSchema } from '../../../../domain/validation/ops';
import { formatNumber } from '../../../../core/utils/format';
import {
  useVerificationQueue,
  useAutoVerification,
  useModerateVerification,
  isApproved,
  isRejected,
  isFlagged,
  type QueueStatus,
  type Decision,
} from '../hooks/useVerificationQueue';
import { tf } from '../utils';
import { ReviewQueue } from '../components/ReviewQueue';
import { SubmissionHeader } from '../components/SubmissionHeader';
import { ReviewStepTabs } from '../components/ReviewStepTabs';
import { NationalIdStep } from '../components/NationalIdStep';
import { FaceMatchStep } from '../components/FaceMatchStep';
import { SkillsStep } from '../components/SkillsStep';
import { PortfolioStep } from '../components/PortfolioStep';
import { ProfileInfoStep } from '../components/ProfileInfoStep';
import { ReviewDecisionStep } from '../components/ReviewDecisionStep';
import { ImageLightbox } from '../components/ImageLightbox';
import { ShieldCheck, Users, RefreshCw } from 'lucide-react';
import '../verification.css';

const EVIDENCE_INCOMPLETE = 'VERIFICATION_EVIDENCE_INCOMPLETE';

export const VerificationPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { success, error: toastError } = useToast();
  const { isMobile, isTablet } = useBreakpoint();

  const [selectedId, setSelectedId] = useState('');
  const [activeTab, setActiveTab] = useState<VerificationTab>('national_id');
  const [queueFilter, setQueueFilter] = useState<QueueStatus>('pending');
  const [page, setPage] = useState(1);
  const [mobileView, setMobileView] = useState<'queue' | 'detail'>('queue');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [moderatorNotes, setModeratorNotes] = useState('');
  const [notesError, setNotesError] = useState<string | undefined>();
  const [incompleteWarning, setIncompleteWarning] = useState<string | null>(null);

  const queue = useVerificationQueue({ status: queueFilter, page });
  const autoVerify = useAutoVerification().data ?? true;
  const { items, counts, all } = queue;
  const moderate = useModerateVerification();

  const selected = all.find((s) => s.id === selectedId) || items[0];
  const isSubmitting = moderate.isPending;
  const desktop = !isMobile && !isTablet;

  const changeFilter = (f: QueueStatus) => {
    setQueueFilter(f);
    setPage(1);
  };

  const handleNotesChange = (value: string) => {
    setModeratorNotes(value);
    setNotesError(undefined);
  };

  const handleModerate = (decision: Decision, noteOverride?: string) => {
    if (!selected || isSubmitting) return;
    const notes = noteOverride ?? moderatorNotes;
    const check = validate(moderationNotesSchema(decision !== 'APPROVED'), { notes });
    if (!check.ok) {
      setModeratorNotes(notes);
      setNotesError(tError(t, check.errors.notes));
      setActiveTab('review_decision');
      return;
    }
    setNotesError(undefined);
    setIncompleteWarning(null);
    const name = selected.name;
    const next = items.find((s) => s.id !== selected.id);
    moderate.mutate(
      { id: selected.id, decision, notes },
      {
        onSuccess: () => {
          const key = decision === 'APPROVED' ? 'vr_toast_approved' : decision === 'REJECTED' ? 'vr_toast_rejected' : 'vr_toast_flagged';
          success(tf(t, key, { name }));
          setModeratorNotes('');
          if (next) setSelectedId(next.id);
          if (isMobile) setMobileView('queue');
        },
        onError: (e) => {
          const msg = errorMessage(e, t);
          if ((e as { backendCode?: string }).backendCode === EVIDENCE_INCOMPLETE) setIncompleteWarning(msg);
          else toastError(msg);
        },
      }
    );
  };

  // Keyboard navigation on desktop
  useEffect(() => {
    if (!selected || !desktop) return;
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;
      const idx = items.findIndex((s) => s.id === selected.id);
      if (e.key === 'j' || e.key === 'ArrowDown') {
        if (idx < items.length - 1) setSelectedId(items[idx + 1].id);
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        if (idx > 0) setSelectedId(items[idx - 1].id);
      } else if (e.key === 'a') handleModerate('APPROVED');
      else if (e.key === 'r') handleModerate('REJECTED');
      else if (e.key === 'f') handleModerate('FLAGGED');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  const queueNode = (
    <ReviewQueue
      submissions={items}
      selectedId={selected?.id || ''}
      onSelect={(sub) => {
        setSelectedId(sub.id);
        setNotesError(undefined);
        if (isMobile) setMobileView('detail');
        if (isTablet) setDrawerOpen(false);
      }}
      activeFilter={queueFilter}
      onFilterChange={changeFilter}
      counts={counts}
      page={page}
      pageCount={queue.pageCount}
      onPageChange={setPage}
      autoVerifyEnabled={autoVerify}
    />
  );

  const metaParts = [
    tf(t, 'vr_meta_queue', { n: formatNumber(counts.pending, language) }),
    t(autoVerify ? 'vr_meta_auto_on' : 'vr_meta_auto_off'),
  ];
  if (queue.avgSlaRemainingHours > 0) {
    metaParts.push(tf(t, 'vr_sla_left', { n: formatNumber(Math.round(queue.avgSlaRemainingHours * 10) / 10, language) }));
  }

  return (
    <div className="ui-page verification-page">
      <PageHeader
        title={t('vr_title')}
        subtitle={t('vr_subtitle')}
        meta={metaParts.join(' · ')}
        actions={
          <>
            <Button variant="outline" size="sm" iconLeading={<RefreshCw size={14} />} loading={queue.isFetching} onClick={() => queue.refetch()}>
              {t('btn_sync')}
            </Button>
            {isTablet && (
              <Button variant="outline" size="sm" iconLeading={<Users size={14} />} onClick={() => setDrawerOpen(true)}>
                {t('vr_btn_queue')} ({counts.pending})
              </Button>
            )}
          </>
        }
      />

      {incompleteWarning && <AlertBanner tone="danger" title={t('vr_incomplete_title')} message={incompleteWarning} />}

      {queue.isError ? (
        <ErrorState title={t('status_error_title')} message={errorMessage(queue.error, t)} onRetry={() => queue.refetch()} />
      ) : queue.isLoading ? (
        <div className={`vr-layout vr-layout--loading${!isMobile ? ' vr-layout--split' : ''}`}>
          <Skeleton height={500} />
          <Skeleton height={500} />
        </div>
      ) : isMobile && mobileView === 'queue' ? (
        queueNode
      ) : (
        <div className={`vr-layout${desktop ? ' vr-layout--split' : ''}`}>
          {desktop && queueNode}

          {selected ? (
            <div className="ui-stack">
              <SubmissionHeader
                submission={selected}
                onApprove={() => handleModerate('APPROVED')}
                onReject={(reason) => handleModerate('REJECTED', reason)}
                onFlag={(reason) => handleModerate('FLAGGED', reason)}
                isSubmitting={isSubmitting}
                isApproved={isApproved(selected)}
                isRejected={isRejected(selected)}
                isFlagged={isFlagged(selected)}
                currentNotes={moderatorNotes}
                onBackToList={isMobile ? () => setMobileView('queue') : undefined}
              />

              <ReviewStepTabs activeTab={activeTab} onChange={setActiveTab} submission={selected} />

              <div className="vr-step-content">
                {activeTab === 'national_id' && <NationalIdStep submission={selected} onZoom={setLightboxUrl} />}
                {activeTab === 'face_match' && <FaceMatchStep submission={selected} onZoom={setLightboxUrl} />}
                {activeTab === 'skills' && <SkillsStep submission={selected} onZoom={setLightboxUrl} />}
                {activeTab === 'portfolio' && <PortfolioStep submission={selected} onZoom={setLightboxUrl} />}
                {activeTab === 'profile_info' && <ProfileInfoStep submission={selected} />}
                {activeTab === 'review_decision' && (
                  <ReviewDecisionStep
                    submission={selected}
                    notes={moderatorNotes}
                    onNotesChange={handleNotesChange}
                    notesError={notesError}
                    isApproved={isApproved(selected)}
                    isRejected={isRejected(selected)}
                    isFlagged={isFlagged(selected)}
                    isSubmitting={isSubmitting}
                  />
                )}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<ShieldCheck size={36} className="vr-icon-faint" />}
              title={t('vr_no_selection_title')}
              description={t('vr_no_selection_desc')}
            />
          )}
        </div>
      )}

      {isTablet && (
        <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title={t('vr_drawer_title')} position="left" size="sm">
          {queueNode}
        </Drawer>
      )}

      <ImageLightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
    </div>
  );
};

export default VerificationPage;
