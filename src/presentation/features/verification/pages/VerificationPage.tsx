import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Submission, VerificationTab } from '../types';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import {
  PageHeader,
  Button,
  Drawer,
  AlertBanner,
  EmptyState,
  useToast,
  useBreakpoint,
  Skeleton,
} from '../../../components/ui';
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
import { ShieldCheck, Users, HelpCircle } from 'lucide-react';

export const VerificationPage: React.FC = () => {
  const { dependencies } = useDependencies();
  const { verificationRepository } = dependencies;
  const { success, error: toastError } = useToast();
  const { isMobile, isTablet } = useBreakpoint();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [activeTab, setActiveTab] = useState<VerificationTab>('national_id');
  const [queueFilter, setQueueFilter] = useState<'pending' | 'flagged' | 'approved' | 'all'>('pending');
  const [autoVerify, setAutoVerify] = useState(true);
  const [mobileView, setMobileView] = useState<'queue' | 'detail'>('queue');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [moderatorNotes, setModeratorNotes] = useState('');
  const [incompleteWarning, setIncompleteWarning] = useState<string | null>(null);

  const isApproved = (s: Submission) => s.verificationStatus === 'APPROVED' || s.status === 'today' || Boolean(s.isVerifiedId);
  const isRejected = (s: Submission) => s.verificationStatus === 'REJECTED';
  const isFlagged = (s: Submission) => !isApproved(s) && !isRejected(s) && (s.verificationStatus === 'FLAGGED' || s.status === 'flagged');
  const isPending = (s: Submission) => !isApproved(s) && !isRejected(s) && !isFlagged(s);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const [queueRes, autoRes] = await Promise.all([
        verificationRepository.getVerificationQueue(),
        verificationRepository.getAutoVerification(),
      ]);
      if (queueRes.success) {
        setSubmissions(queueRes.data);
        if (queueRes.data.length > 0 && !selectedId) {
          setSelectedId(queueRes.data[0].id);
        }
      }
      if (autoRes.success) setAutoVerify(autoRes.data.enabled);
    } catch (e: any) {
      toastError(e.message || 'Failed to fetch verification queue');
    } finally {
      setLoading(false);
    }
  }, [verificationRepository, selectedId, toastError]);

  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  const filtered = useMemo(() => submissions.filter((s) => {
    if (queueFilter === 'pending') return isPending(s);
    if (queueFilter === 'flagged') return isFlagged(s);
    if (queueFilter === 'approved') return isApproved(s);
    return true;
  }), [submissions, queueFilter]);

  const counts = useMemo(() => ({
    pending: submissions.filter(isPending).length,
    flagged: submissions.filter(isFlagged).length,
    approved: submissions.filter(isApproved).length,
    all: submissions.length,
  }), [submissions]);

  const selected = submissions.find((s) => s.id === selectedId) || filtered[0];

  const handleModerate = async (decision: 'APPROVED' | 'REJECTED' | 'FLAGGED', noteOverride?: string) => {
    if (!selected || isSubmitting) return;
    const noteToSend = noteOverride ?? moderatorNotes;
    setIsSubmitting(true);
    setIncompleteWarning(null);

    try {
      const res = await verificationRepository.moderateVerification(selected.id, decision, noteToSend);
      if (res.success) {
        success(`${selected.name} marked as ${decision.toLowerCase()}`);
        setSubmissions((prev) => prev.map((s) => (s.id === selected.id ? { ...s, verificationStatus: decision, isVerifiedId: decision === 'APPROVED' } : s)));
        setModeratorNotes('');
        const remaining = filtered.filter((s) => s.id !== selected.id);
        if (remaining.length > 0) setSelectedId(remaining[0].id);
        if (isMobile) setMobileView('queue');
        fetchQueue();
      } else {
        const msg = res.error?.message || '';
        if (msg.includes('409') || msg.includes('ALREADY_DECIDED')) {
          toastError('Already decided by another moderator');
          fetchQueue();
        } else if (msg.includes('INCOMPLETE')) {
          setIncompleteWarning(msg);
        } else {
          toastError(msg || 'Failed to submit decision');
        }
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to moderate verification');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard navigation on desktop
  useEffect(() => {
    if (!selected || isMobile || isTablet) return;
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;
      if (e.key === 'j' || e.key === 'ArrowDown') {
        const idx = filtered.findIndex((s) => s.id === selected.id);
        if (idx < filtered.length - 1) setSelectedId(filtered[idx + 1].id);
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        const idx = filtered.findIndex((s) => s.id === selected.id);
        if (idx > 0) setSelectedId(filtered[idx - 1].id);
      } else if (e.key === 'a') handleModerate('APPROVED');
      else if (e.key === 'r') handleModerate('REJECTED');
      else if (e.key === 'f') handleModerate('FLAGGED');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selected, filtered, isMobile, isTablet]);

  const queueNode = (
    <ReviewQueue
      submissions={filtered}
      selectedId={selected?.id || ''}
      onSelect={(sub) => {
        setSelectedId(sub.id);
        if (isMobile) setMobileView('detail');
        if (isTablet) setDrawerOpen(false);
      }}
      activeFilter={queueFilter}
      onFilterChange={setQueueFilter}
      counts={counts}
      autoVerifyEnabled={autoVerify}
    />
  );

  return (
    <div className="verification-page" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
      <PageHeader
        title="Verification Review"
        subtitle="Moderate craftsman identity and credential submissions"
        meta={`${counts.pending} in queue · Auto-verification: ${autoVerify ? 'Active' : 'Disabled'}`}
        actions={
          isTablet ? (
            <Button variant="outline" size="sm" iconLeading={<Users size={14} />} onClick={() => setDrawerOpen(true)}>
              Queue ({counts.pending})
            </Button>
          ) : undefined
        }
      />

      {incompleteWarning && (
        <AlertBanner tone="danger" title="Incomplete Verification Evidence" message={incompleteWarning} />
      )}

      {loading && submissions.length === 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '280px 1fr', gap: 'var(--sp-4)' }}>
          <Skeleton height={500} />
          <Skeleton height={500} />
        </div>
      ) : isMobile && mobileView === 'queue' ? (
        queueNode
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: isTablet || isMobile ? '1fr' : '280px 1fr', gap: 'var(--sp-4)', alignItems: 'start' }}>
          {!isTablet && !isMobile && queueNode}

          {selected ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', minWidth: 0 }}>
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
                    onNotesChange={setModeratorNotes}
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
              icon={<ShieldCheck size={36} style={{ color: 'var(--text-faint)' }} />}
              title="No submission selected"
              description="Select an application from the review queue to inspect documents."
            />
          )}
        </div>
      )}

      {isTablet && (
        <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="Review Queue" position="left" size="sm">
          {queueNode}
        </Drawer>
      )}

      <ImageLightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
    </div>
  );
};

export default VerificationPage;
