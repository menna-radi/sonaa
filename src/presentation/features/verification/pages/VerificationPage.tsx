import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Sidebar } from '../../../../presentation/layouts/Sidebar';
import { Header } from '../../../../presentation/layouts/Header';
import { MobileBottomTabs } from '../../../../presentation/layouts/MobileBottomTabs';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import {
  Search,
  Flag,
  X,
  CheckCircle,
  ZoomIn,
  ChevronRight,
  ChevronLeft,
  Bell,
  User,
  Award,
  Check,
  AlertCircle,
  RefreshCw,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Submission {
  id: string;
  name: string;
  role: string;
  submittedAgo: string;
  avatar?: string;
  verificationId: string;
  faceScore: number;
  docsCount: string;
  risk: 'Low' | 'Medium' | 'High';
  status: 'pending' | 'flagged' | 'today';
}

type VerificationTab = 'national_id' | 'face_match' | 'portfolio' | 'skills';



// ── Avatar Component ──────────────────────────────────────────────────────────
const AvatarCircle: React.FC<{ name: string; src?: string; size?: number; borderRadius?: string | number }> = ({ name, src, size = 36, borderRadius = '50%' }) => {
  return src ? (
    <img
      src={src}
      alt={name}
      style={{
        width: size, height: size, borderRadius, objectFit: 'cover',
        flexShrink: 0, background: '#D1D6DB'
      }}
    />
  ) : (
    <div style={{
      width: size, height: size, borderRadius, background: '#D1D5DB',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0
    }} />
  );
};

// ── ID Card Preview ────────────────────────────────────────────────────────────
const IdCardPreview: React.FC = () => (
  <div style={{
    background: '#F5F5F5', borderRadius: 12, padding: 12, overflow: 'hidden'
  }}>
    <div style={{
      background: '#FFFFFF', borderRadius: 8, padding: 12,
      boxShadow: '0px 1px 1px rgba(0,0,0,0.05)'
    }}>
      <div style={{ display: 'flex', gap: 12 }}>
        {/* Photo placeholder */}
        <div style={{ width: 71, height: 116, background: '#E5E5E5', borderRadius: 4, flexShrink: 0 }} />
        {/* Text lines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, flex: 1 }}>
          <div style={{ height: 6, background: '#D4D4D4', borderRadius: 4, width: '75%', marginTop: 8 }} />
          <div style={{ height: 6, background: '#E5E5E5', borderRadius: 4, width: '50%', marginTop: 14 }} />
          <div style={{ height: 6, background: '#E5E5E5', borderRadius: 4, width: '67%', marginTop: 14 }} />
          <div style={{ height: 6, background: '#D4D4D4', borderRadius: 4, width: '50%', marginTop: 14 }} />
        </div>
      </div>
    </div>
  </div>
);

// ── ID Document Card ──────────────────────────────────────────────────────────
const IdDocumentCard: React.FC<{
  title: string;
  fields: { label: string; value: string; valueColor?: string }[];
}> = ({ title, fields }) => (
  <div className="vr-doc-card">
    <div className="vr-doc-card-header">
      <span className="vr-doc-card-title">{title}</span>
      <button className="vr-zoom-btn" title="Zoom in">
        <ZoomIn size={14} />
      </button>
    </div>
    <IdCardPreview />
    <div className="vr-doc-fields">
      {fields.map((f, i) => (
        <div key={i} className="vr-doc-field-row">
          <span className="vr-doc-field-label">{f.label}</span>
          <span className="vr-doc-field-value" style={f.valueColor ? { color: f.valueColor, fontWeight: 700 } : {}}>
            {f.value}
          </span>
        </div>
      ))}
    </div>
  </div>
);

// ── Face Match Tab Content ─────────────────────────────────────────────────────
const FaceMatchContent: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="vr-fm-grid">
      <div className="vr-fm-card">
        <span className="vr-fm-card-title">{t('vr_id_photo') || 'ID photo'}</span>
        <div className="vr-fm-photo-container">
          <div className="vr-id-mockup">
            <div className="vr-id-photo-badge">ID</div>
            <div className="vr-id-photo-avatar">
              <User size={56} style={{ color: '#A3A3A3' }} />
            </div>
            <div className="vr-id-photo-lines">
              <div className="vr-id-line-short" />
              <div className="vr-id-line-long" />
              <div className="vr-id-line-medium" />
            </div>
          </div>
        </div>
      </div>

      <div className="vr-fm-card">
        <span className="vr-fm-card-title">{t('vr_selfie_liveness') || 'Selfie · liveness check'}</span>
        <div className="vr-fm-photo-container">
          <div className="vr-selfie-mockup">
            <div className="vr-selfie-photo-avatar">
              <User size={56} style={{ color: '#171717' }} />
            </div>
            <div className="vr-selfie-liveness-indicator">
              <span className="vr-liveness-dot" /> LIVENESS OK
            </div>
          </div>
        </div>
        {/* Match Score overlay */}
        <div className="vr-score-overlay">
          <div className="vr-score-info">
            <span className="vr-score-label">{t('vr_face_match_score') || 'Face match score'}</span>
            <span className="vr-score-value">96.2%</span>
          </div>
          <div className="vr-score-progress-track">
            <div className="vr-score-progress-bar" style={{ width: '96.2%' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Portfolio Tab Content ──────────────────────────────────────────────────────
const PortfolioContent: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="vr-portfolio-card">
      <span className="vr-portfolio-title">
        {t('vr_portfolio_subtitle') || 'Portfolio submissions · 6 photos'}
      </span>
      <div className="vr-portfolio-grid">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="vr-portfolio-item">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: '#D4D4D4' }}>
              <path d="M5.83333 3.5H22.1667C23.4553 3.5 24.5 4.54467 24.5 5.83333V22.1667C24.5 23.4553 23.4553 24.5 22.1667 24.5H5.83333C4.54467 24.5 3.5 23.4553 3.5 22.1667V5.83333C3.5 4.54467 4.54467 3.5 5.83333 3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8.16 10.495C8.16 9.20542 9.20542 8.16 10.495 8.16C11.7846 8.16 12.83 9.20542 12.83 10.495C12.83 11.7846 11.7846 12.83 10.495 12.83C9.20542 12.83 8.16 11.7846 8.16 10.495Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M24.5 17.0412L20.8997 13.21C19.9885 12.2407 18.5115 12.2407 17.6003 13.21L7 24.49" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="vr-portfolio-overlay">
              <ZoomIn size={20} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Skills Tab Content ─────────────────────────────────────────────────────────
const SkillsContent: React.FC = () => {
  const { t } = useLanguage();

  const SKILLS_ITEMS = [
    {
      key: 'plumbing_cert',
      label: t('vr_skill_plumbing_cert') || 'TVTC Plumbing Certificate · 2021',
      status: 'verified'
    },
    {
      key: 'sce_license',
      label: t('vr_skill_sce_license') || 'Saudi Council of Engineers · License',
      status: 'verified'
    },
    {
      key: 'experience',
      label: t('vr_skill_experience') || 'Pipe burst emergency · 12 years experience',
      status: 'verified'
    },
    {
      key: 'insurance',
      label: t('vr_skill_insurance') || 'Insurance coverage · SAR 500K liability',
      status: 'missing'
    }
  ];

  return (
    <div className="vr-skills-card">
      <span className="vr-skills-title">
        {t('vr_skills_certifications') || 'Skills & certifications'}
      </span>
      <div className="vr-skills-list">
        {SKILLS_ITEMS.map((item) => (
          <div key={item.key} className="vr-skills-item">
            <div className="vr-skills-item-left">
              <Award size={16} className="vr-skill-icon" />
              <span className="vr-skill-label">{item.label}</span>
            </div>
            <div className={`vr-skill-status-badge ${item.status}`}>
              {item.status === 'verified' ? (
                <>
                  <Check size={10} style={{ marginInlineEnd: 4 }} />
                  <span>{t('vr_badge_verified') || 'Verified'}</span>
                </>
              ) : (
                <>
                  <AlertCircle size={10} style={{ marginInlineEnd: 4 }} />
                  <span>{t('vr_badge_missing') || 'Missing'}</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export const VerificationPage: React.FC = () => {
  const { t } = useLanguage();
  const { dependencies } = useDependencies();
  const { verificationRepository } = dependencies;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<VerificationTab>('national_id');
  const [notes, setNotes] = useState('');
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());
  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set());
  const [lastAction, setLastAction] = useState<{
    id: string;
    decision: 'APPROVED' | 'REJECTED' | 'FLAGGED';
    approvedIds: Set<string>;
    rejectedIds: Set<string>;
    notes: string;
  } | null>(null);
  const [mobileView, setMobileView] = useState<'queue' | 'detail'>('queue');
  const [queueFilter, setQueueFilter] = useState<'pending' | 'flagged' | 'today'>('pending');
  const [autoVerifyEnabled, setAutoVerifyEnabled] = useState<boolean>(true);
  const [togglingAutoVerify, setTogglingAutoVerify] = useState<boolean>(false);

  useEffect(() => {
    verificationRepository.getAutoVerification().then(res => {
      if (res.success) {
        setAutoVerifyEnabled(res.data.enabled);
      }
    });
  }, [verificationRepository]);

  const handleToggleAutoVerify = async () => {
    const nextState = !autoVerifyEnabled;
    setTogglingAutoVerify(true);
    try {
      const res = await verificationRepository.toggleAutoVerification(nextState);
      if (res.success) {
        setAutoVerifyEnabled(res.data.enabled);
      }
    } finally {
      setTogglingAutoVerify(false);
    }
  };

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await verificationRepository.getVerificationQueue();
      if (result.success) {
        setSubmissions(result.data);
        if (result.data.length > 0) {
          setSelectedId(result.data[0].id);
        }
      } else {
        setError(result.error.message || 'Failed to fetch verification queue.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch verification queue.');
    } finally {
      setLoading(false);
    }
  }, [verificationRepository]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const selected = submissions.find(s => s.id === selectedId) ?? submissions[0];

  // Scroll details panel back to top when selected craftsman or active tab changes
  useEffect(() => {
    const detailContent = document.querySelector('.vr-detail-scroll-content');
    if (detailContent) {
      detailContent.scrollTop = 0;
    }
  }, [selectedId, activeTab]);

  // Scroll window back to top when mobile view toggles
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [mobileView]);

  const handleModerate = async (decision: 'APPROVED' | 'REJECTED' | 'FLAGGED') => {
    setError(null);
    try {
      setLastAction({
        id: selectedId,
        decision,
        approvedIds: new Set(approvedIds),
        rejectedIds: new Set(rejectedIds),
        notes
      });

      const result = await verificationRepository.moderateVerification(selectedId, decision, notes);
      if (result.success) {
        if (decision === 'APPROVED') {
          setApprovedIds(prev => new Set([...prev, selectedId]));
        } else if (decision === 'REJECTED') {
          setRejectedIds(prev => new Set([...prev, selectedId]));
        }
        setNotes('');
        // Move to next pending
        const pending = submissions.filter(s => !approvedIds.has(s.id) && !rejectedIds.has(s.id) && s.id !== selectedId);
        if (pending.length > 0) setSelectedId(pending[0].id);
      } else {
        setError(result.error.message || 'Failed to moderate verification.');
        setLastAction(null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to moderate verification.');
      setLastAction(null);
    }
  };

  const handleUndo = () => {
    if (!lastAction) return;
    setApprovedIds(lastAction.approvedIds);
    setRejectedIds(lastAction.rejectedIds);
    setSelectedId(lastAction.id);
    setNotes(lastAction.notes);
    setLastAction(null);
  };

  const handleApprove = () => handleModerate('APPROVED');
  const handleReject = () => handleModerate('REJECTED');
  const handleFlag = () => handleModerate('FLAGGED');

  const TABS: { key: VerificationTab; label: string; num: number }[] = [
    { key: 'national_id', label: t('vr_tab_national_id') || 'National ID', num: 1 },
    { key: 'face_match', label: t('vr_tab_face_match') || 'Face match', num: 2 },
    { key: 'portfolio', label: t('vr_tab_portfolio') || 'Portfolio', num: 3 },
    { key: 'skills', label: t('vr_tab_skills') || 'Skills', num: 4 },
  ];

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className="main-content">
        {/* Mobile Header */}
        <div className="mobile-header mobile-only">
          <div className="mobile-header-left">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="mobile-logo-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                textAlign: 'start',
                fontFamily: 'inherit'
              }}
            >
              <div className="mobile-logo">S</div>
              <div className="mobile-logo-text">
                <strong>Sonaa</strong>
                <span>Admin</span>
              </div>
            </button>
          </div>
          <div className="mobile-header-right" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button className="mobile-action-btn"><Search size={16} /></button>
            <button className="mobile-action-btn" style={{ position: 'relative' }}>
              <Bell size={16} />
              <span className="mobile-badge" />
            </button>
          </div>
        </div>

        {/* Mobile Subheader */}
        <div className={`mobile-subheader mobile-only row-layout ${mobileView === 'queue' ? 'mobile-visible-flex' : 'mobile-hidden'}`}>
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'start' }}>
            <h2>{t('nav_verification') || 'Verification'}</h2>
            <span style={{ fontSize: '11px', color: '#737373', marginTop: '4px' }}>
              {submissions.length} {t('vr_in_queue') || 'in queue'} · {t('vr_avg_sla') || 'Avg SLA'} 3h 12m
            </span>
          </div>
          <button className="mobile-subheader-filter-btn" title="Filters" style={{ width: 36, height: 36, borderRadius: '50%', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#171717" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
          </button>
        </div>

        <div className="vr-page-body">
          {/* Desktop/Tablet Header */}
          <div className="desktop-tablet-page-header desktop-tablet-only" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div className="vr-page-header-left">
              <h1 className="vr-page-title" style={{ margin: 0 }}>{t('vr_title') || 'Verification Review'}</h1>
              <p className="vr-page-subtitle" style={{ margin: '4px 0 0 0' }}>{t('vr_subtitle') || 'Moderate craftsman verification submissions'}</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Big Auto Verification Button */}
              <button
                onClick={handleToggleAutoVerify}
                disabled={togglingAutoVerify}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 20px',
                  borderRadius: '14px',
                  border: autoVerifyEnabled ? '1.5px solid #86efac' : '1.5px solid #fde68a',
                  background: autoVerifyEnabled
                    ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
                    : 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                  color: autoVerifyEnabled ? '#15803d' : '#b45309',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s ease',
                  opacity: togglingAutoVerify ? 0.7 : 1,
                  fontFamily: 'inherit'
                }}
              >
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: autoVerifyEnabled ? '#22c55e' : '#f59e0b',
                    boxShadow: autoVerifyEnabled ? '0 0 8px #22c55e' : '0 0 8px #f59e0b'
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span>{autoVerifyEnabled ? '⚡ Auto Verification: ENABLED' : '🔒 Auto Verification: DISABLED'}</span>
                  <span style={{ fontSize: '11px', fontWeight: 500, opacity: 0.85 }}>
                    {autoVerifyEnabled ? 'Craftsmen auto-approved on submit' : 'Requires manual admin approval'}
                  </span>
                </div>
              </button>

              <div className="vr-page-header-meta">
                <span className="vr-queue-count"><strong>{submissions.length}</strong></span>
                <span className="vr-queue-meta">{t('vr_in_queue') || 'in queue'} · {t('vr_avg_sla') || 'Avg SLA'}</span>
                <span className="vr-queue-count"><strong>3h 12m</strong></span>
              </div>
            </div>
          </div>

          {error && (
            <div className="glass-card status-danger animate-fade-in" style={{ padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', color: 'var(--color-danger)' }}>
                <AlertTriangle size={20} />
                <div style={{ textAlign: 'start' }}>
                  <strong style={{ display: 'block' }}>Action Alert</strong>
                  <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>{error}</span>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex-center" style={{ minHeight: '400px', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <RefreshCw className="animate-spin" size={36} style={{ color: 'var(--color-primary)' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading verification queue...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="flex-center glass-card" style={{ minHeight: '400px', color: 'var(--text-muted)' }}>
              No verification requests in queue.
            </div>
          ) : (
            /* Main Content Split */
            <div className="vr-content-split">
              {/* LEFT: Review Queue (Desktop/Tablet) */}
              <div className="vr-queue-panel desktop-tablet-only">
                <div className="vr-queue-header">
                  <span className="vr-queue-header-label">{t('vr_review_queue') || 'Review Queue'}</span>
                  <span className="vr-queue-header-sub">{t('vr_awaiting_mod') || 'Awaiting moderation'}</span>
                </div>
                <div className="vr-queue-list">
                  {submissions.map(sub => {
                    const isApproved = approvedIds.has(sub.id);
                    const isRejected = rejectedIds.has(sub.id);
                    const isSelected = sub.id === selectedId;
                    const roleText = t(`role_${sub.role.toLowerCase().replace(' ', '_')}`) || sub.role;
                    return (
                      <button
                        key={sub.id}
                        className={`vr-queue-item ${isSelected ? 'selected' : ''} ${isApproved ? 'approved' : ''} ${isRejected ? 'rejected' : ''}`}
                        onClick={() => { setSelectedId(sub.id); setActiveTab('national_id'); }}
                      >
                        <AvatarCircle name={sub.name} src={sub.avatar} size={40} />
                        <div className="vr-queue-item-info">
                          <span className="vr-queue-item-name">{sub.name}</span>
                          <span className="vr-queue-item-meta">{roleText} - {sub.submittedAgo}</span>
                        </div>
                        {isApproved && <CheckCircle size={14} style={{ color: '#16A34A', flexShrink: 0 }} />}
                        {isRejected && <X size={14} style={{ color: '#B91C1C', flexShrink: 0 }} />}
                        {!isApproved && !isRejected && isSelected && (
                          <ChevronRight className="rtl-flip" size={16} style={{ color: '#171717', strokeWidth: 2.5, flexShrink: 0 }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* LEFT: Mobile Queue List (Mobile Only) */}
              <div className={`vr-mobile-queue-list ${mobileView === 'queue' ? 'mobile-visible-block' : 'mobile-hidden'}`} style={{ width: '100%' }}>
                {/* Pills filter row */}
                <div className="mobile-filter-pills">
                  <button 
                    className={`mobile-filter-pill ${queueFilter === 'pending' ? 'active' : ''}`}
                    onClick={() => setQueueFilter('pending')}
                  >
                    <span>{t('vr_pending') || 'Pending'}</span>
                    <span className={`mobile-pill-badge ${queueFilter === 'pending' ? 'active' : ''}`}>{submissions.filter(s => s.status === 'pending').length}</span>
                  </button>
                  <button 
                    className={`mobile-filter-pill ${queueFilter === 'flagged' ? 'active' : ''}`}
                    onClick={() => setQueueFilter('flagged')}
                  >
                    <span>{t('vr_flagged') || 'Flagged'}</span>
                    <span className={`mobile-pill-badge ${queueFilter === 'flagged' ? 'active' : ''}`}>{submissions.filter(s => s.status === 'flagged').length}</span>
                  </button>
                  <button 
                    className={`mobile-filter-pill ${queueFilter === 'today' ? 'active' : ''}`}
                    onClick={() => setQueueFilter('today')}
                  >
                    <span>{t('vr_today') || 'Today'}</span>
                    <span className={`mobile-pill-badge ${queueFilter === 'today' ? 'active' : ''}`}>{submissions.filter(s => s.status === 'today').length}</span>
                  </button>
                </div>

                {/* Submission Cards */}
                <div className="mobile-submissions-cards">
                  {submissions.filter(sub => sub.status === queueFilter).map(sub => {
                    const isApproved = approvedIds.has(sub.id);
                    const isRejected = rejectedIds.has(sub.id);
                    
                    return (
                      <div 
                        key={sub.id} 
                        className={`mobile-craftsman-card ${isApproved ? 'approved' : ''} ${isRejected ? 'rejected' : ''}`}
                      >
                        {/* Top profile part */}
                        <div className="mobile-card-top">
                          <div className="mobile-card-profile">
                            <AvatarCircle name={sub.name} src={sub.avatar} size={44} borderRadius={12} />
                            <div className="mobile-card-name-info">
                              <span className="mobile-card-name">{sub.name}</span>
                              <span className="mobile-card-role">{t(`role_${sub.role.toLowerCase().replace(' ', '_')}`) || sub.role} · {sub.submittedAgo}</span>
                            </div>
                          </div>
                          <button 
                            className="mobile-card-options" 
                            title="Review"
                            onClick={() => {
                              setSelectedId(sub.id);
                              setMobileView('detail');
                            }}
                          >
                            <ChevronRight size={16} className="rtl-flip" style={{ color: '#A3A3A3' }} />
                          </button>
                        </div>

                        {/* Middle Stats Row */}
                        <div className="mobile-card-stats-row">
                          <div className="mobile-stat-box">
                            <span className="mobile-stat-label">{t('vr_face') || 'Face'}</span>
                            <span className="mobile-stat-value">{sub.faceScore}%</span>
                          </div>
                          <div className="mobile-stat-box">
                            <span className="mobile-stat-label">{t('vr_docs') || 'Docs'}</span>
                            <span className="mobile-stat-value">{sub.docsCount}</span>
                          </div>
                          <div className="mobile-stat-box">
                            <span className="mobile-stat-label">{t('vr_risk') || 'Risk'}</span>
                            <span className={`mobile-stat-value risk-${sub.risk.toLowerCase()}`}>{sub.risk}</span>
                          </div>
                        </div>

                        {/* Bottom Actions Row */}
                        <div className="mobile-card-actions-row">
                          <button 
                            className="mobile-card-action-btn btn-reject"
                            onClick={() => {
                              setSelectedId(sub.id);
                              handleReject();
                            }}
                          >
                            <XCircle size={11} style={{ marginInlineEnd: 4 }} />
                            <span>{t('vr_reject') || 'Reject'}</span>
                          </button>
                          <button 
                            className="mobile-card-action-btn btn-approve"
                            onClick={() => {
                              setSelectedId(sub.id);
                              handleApprove();
                            }}
                          >
                            <CheckCircle size={11} style={{ marginInlineEnd: 4 }} />
                            <span>{t('vr_approve_all') || 'Approve'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT: Detail Panel */}
              <div className={`vr-detail-panel ${mobileView === 'detail' ? 'mobile-visible-flex' : 'mobile-hidden'}`}>
                {/* Back to Queue Button (Mobile Only) */}
                <button 
                  className="vr-mobile-back-btn mobile-only" 
                  onClick={() => setMobileView('queue')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#FFFFFF',
                    border: '1px solid #E5E5E5',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#171717',
                    cursor: 'pointer',
                    alignSelf: 'flex-start',
                    marginBottom: '8px',
                    gap: '4px'
                  }}
                >
                  <ChevronLeft size={16} className="rtl-flip" />
                  <span>{t('vr_back_queue') || 'Back to Queue'}</span>
                </button>

                {/* Profile Card */}
                {selected ? (
                  <>
                    <div className="vr-profile-card">
                      {/* Top: Avatar + Info + Actions */}
                      <div className="vr-profile-top">
                        <div className="vr-profile-left">
                          <AvatarCircle name={selected.name} src={selected.avatar} size={48} />
                          <div className="vr-profile-info">
                            <span className="vr-profile-name">{selected.name}</span>
                            <span className="vr-profile-meta">
                              {t(`role_${selected.role.toLowerCase().replace(' ', '_')}`) || selected.role} · {t('vr_submitted') || 'Submitted'} {selected.submittedAgo} · ID {selected.verificationId}
                            </span>
                          </div>
                        </div>
                        <div className="vr-profile-actions">
                          <button className="vr-action-btn vr-btn-flag" onClick={handleFlag}>
                            <Flag size={12} />
                            <span>{t('vr_flag') || 'Flag'}</span>
                          </button>
                          <button className="vr-action-btn vr-btn-reject" onClick={handleReject}>
                            <X size={12} />
                            <span>{t('vr_reject') || 'Reject'}</span>
                          </button>
                          <button className="vr-action-btn vr-btn-approve" onClick={handleApprove}>
                            <CheckCircle size={12} />
                            <span>{t('vr_approve_all') || 'Approve all'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Tabs */}
                      <div className="vr-tabs-row">
                        {TABS.map(tab => (
                          <button
                            key={tab.key}
                            className={`vr-tab ${activeTab === tab.key ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                          >
                            <span className={`vr-tab-num ${activeTab === tab.key ? 'active' : ''}`}>{tab.num}</span>
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Scrollable Detail Content Container */}
                    <div className="vr-detail-scroll-content">
                      {/* ID Documents Section */}
                      <div className="vr-docs-area">
                      {activeTab === 'national_id' && (
                        <div className="vr-docs-grid">
                          <IdDocumentCard
                            title={t('vr_front_side') || 'Front side'}
                            fields={[
                              { label: t('vr_doc_type') || 'Document type', value: 'Saudi National ID' },
                              { label: t('vr_detected_name') || 'Detected name', value: selected.name },
                              { label: t('vr_ocr_confidence') || 'OCR confidence', value: '98.4%', valueColor: '#16A34A' },
                            ]}
                          />
                          <IdDocumentCard
                            title={t('vr_back_side') || 'Back side'}
                            fields={[
                              { label: t('vr_doc_type') || 'Document type', value: 'Saudi National ID' },
                              { label: t('vr_detected_name') || 'Detected name', value: selected.name },
                              { label: t('vr_ocr_confidence') || 'OCR confidence', value: '98.4%', valueColor: '#16A34A' },
                              { label: t('vr_expiry') || 'Expiry', value: 'Mar 2031' },
                            ]}
                          />
                        </div>
                      )}
                {activeTab === 'face_match' && <FaceMatchContent />}
                {activeTab === 'portfolio' && <PortfolioContent />}
                {activeTab === 'skills' && <SkillsContent />}
              </div>

                {/* Moderator Notes */}
                <div className="vr-notes-card">
                  <span className="vr-notes-label">{t('vr_moderator_notes') || 'Moderator notes'}</span>
                  <textarea
                    className="vr-notes-textarea"
                    placeholder={t('vr_notes_placeholder') || 'Add a note for the audit log...'}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="vr-placeholder-tab">
              <span className="vr-placeholder-tab-text">Select a request to review</span>
            </div>
          )}
        </div>
      </div>
      )}

      {lastAction && (
        <div style={{
          background: 'var(--color-primary)',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          position: 'fixed',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          fontSize: '0.85rem'
        }}>
          <span>Action: {lastAction.decision} applied successfully.</span>
          <button 
            onClick={handleUndo}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}
          >
            Undo
          </button>
        </div>
      )}
    </div>
  </main>

      <MobileBottomTabs />

      <style>{`
        /* ── Page Body ── */
        .vr-page-body {
          display: flex;
          flex-direction: column;
          gap: 0;
          text-align: start;
          height: calc(100vh - var(--header-height) - var(--spacing-xl));
          overflow: visible;
        }
        .vr-page-body .desktop-tablet-page-header {
          align-items: flex-end !important;
        }

        /* ── Face Match Styles ── */
        .vr-fm-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          width: 100%;
        }
        .vr-fm-card {
          background: #FFFFFF;
          border: 1px solid #E5E5E5;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0px 1px 1.5px rgba(0,0,0,0.04);
          position: relative;
        }
        .vr-fm-card-title {
          font-size: 12px;
          font-weight: 700;
          color: #171717;
          text-align: start;
        }
        .vr-fm-photo-container {
          height: auto;
          min-height: 260px;
          padding: 16px;
          box-sizing: border-box;
          background: #FAFAFA;
          border: 1px dashed #E5E5E5;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .vr-id-mockup, .vr-selfie-mockup {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .vr-id-photo-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: #171717;
          color: #FFFFFF;
          font-size: 9px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }
        html[dir="rtl"] .vr-id-photo-badge {
          left: auto;
          right: 12px;
        }
        .vr-id-photo-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #F3F4F6;
          border: 2px solid #E5E7EB;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .vr-id-photo-lines {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 60%;
          align-items: center;
          margin-top: 16px;
        }
        .vr-id-line-short, .vr-id-line-medium, .vr-id-line-long {
          height: 6px;
          background: #E5E5E5;
          border-radius: 3px;
        }
        .vr-id-line-short { width: 40%; }
        .vr-id-line-medium { width: 60%; }
        .vr-id-line-long { width: 80%; }

        .vr-selfie-photo-avatar {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: #E5E7EB;
          border: 2px solid #D1D5DB;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .vr-selfie-liveness-indicator {
          position: absolute;
          bottom: 12px;
          background: rgba(22, 163, 74, 0.1);
          color: #16A34A;
          border: 1px solid rgba(22, 163, 74, 0.2);
          font-size: 10px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .vr-liveness-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #16A34A;
        }
        .vr-score-overlay {
          background: #171717;
          border-radius: 12px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
          box-sizing: border-box;
        }
        .vr-score-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .vr-score-label {
          font-size: 10px;
          font-weight: 700;
          color: #A3A3A3;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .vr-score-value {
          font-size: 16px;
          font-weight: 700;
          color: #FFFFFF;
        }
        .vr-score-progress-track {
          height: 4px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
          overflow: hidden;
          width: 100%;
        }
        .vr-score-progress-bar {
          height: 100%;
          background: #FFFFFF;
          border-radius: 2px;
        }

        /* ── Portfolio Styles ── */
        .vr-portfolio-card {
          background: #FFFFFF;
          border: 1px solid #E5E5E5;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-shadow: 0px 1px 1.5px rgba(0,0,0,0.04);
        }
        .vr-portfolio-title {
          font-size: 12px;
          font-weight: 700;
          color: #171717;
          text-align: start;
        }
        .vr-portfolio-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          width: 100%;
        }
        .vr-portfolio-item {
          aspect-ratio: 1 / 1;
          background: #F5F5F5;
          border-radius: 12px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .vr-portfolio-item:hover {
          transform: scale(1.02);
          box-shadow: 0px 4px 6px rgba(0,0,0,0.05);
        }
        .vr-portfolio-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.4);
          opacity: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          transition: opacity 0.2s ease;
        }
        .vr-portfolio-item:hover .vr-portfolio-overlay {
          opacity: 1;
        }

        /* ── Skills Styles ── */
        .vr-skills-card {
          background: #FFFFFF;
          border: 1px solid #E5E5E5;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-shadow: 0px 1px 1.5px rgba(0,0,0,0.04);
        }
        .vr-skills-title {
          font-size: 12px;
          font-weight: 700;
          color: #171717;
          text-align: start;
        }
        .vr-skills-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
        }
        .vr-skills-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
          border: 1px solid #E5E5E5;
          border-radius: 12px;
          background: #FFFFFF;
          gap: 16px;
          transition: border-color 0.2s ease;
        }
        .vr-skills-item:hover {
          border-color: #D4D4D4;
        }
        .vr-skills-item-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          flex: 1;
        }
        .vr-skill-icon {
          color: #737373;
          flex-shrink: 0;
        }
        .vr-skill-label {
          font-size: 12.5px;
          font-weight: 600;
          color: #171717;
          text-align: start;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .vr-skill-status-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          flex-shrink: 0;
        }
        .vr-skill-status-badge.verified {
          background: #F0FDF4;
          color: #15803D;
        }
        .vr-skill-status-badge.missing {
          background: #FFFBEB;
          color: #B45309;
        }

        /* ── Desktop Page Header ── */
        .vr-page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: var(--spacing-sm);
        }
        .vr-page-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .vr-page-title {
          font-size: 24px;
          font-weight: 700;
          font-family: var(--font-title);
          color: var(--text-primary);
          letter-spacing: -0.02em;
          margin: 0;
        }
        .vr-page-subtitle {
          color: var(--text-muted);
          font-size: 14px;
          margin: 0;
        }
        .vr-page-header-meta {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: #737373;
          padding-bottom: 2px;
        }
        .vr-queue-count {
          font-size: 0.75rem;
          font-weight: 700;
          color: #171717;
        }
        .vr-queue-meta {
          font-size: 0.75rem;
          color: #737373;
        }

        /* ── Content Split Layout ── */
        .vr-content-split {
          display: flex;
          gap: 16px;
          align-items: stretch;
          flex: 1;
          overflow: hidden;
          min-height: 0;
        }

        /* ── Queue Panel ── */
        .vr-queue-panel {
          width: 280px;
          flex-shrink: 0;
          background: #FFFFFF;
          border: 1px solid #E5E5E5;
          border-radius: 20px;
          box-shadow: 0px 1px 3px rgba(0,0,0,0.02), 0px 8px 24px rgba(0,0,0,0.03);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .vr-queue-header {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 24px 20px 12px 20px;
        }
        .vr-queue-header-label {
          font-size: 11px;
          font-weight: 500;
          color: #8E8E93;
          white-space: nowrap;
        }
        .vr-queue-header-sub {
          font-size: 16px;
          font-weight: 700;
          color: #171717;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .vr-queue-list {
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow-y: auto;
        }
        .vr-queue-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: start;
          transition: background 0.15s ease;
          width: 100%;
        }
        .vr-queue-item:hover {
          background: #F8F8F9;
        }
        .vr-queue-item.selected {
          background: #F4F4F5;
        }
        .vr-queue-item.approved {
          opacity: 0.6;
        }
        .vr-queue-item.rejected {
          opacity: 0.5;
        }
        .vr-queue-item-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
          overflow: hidden;
        }
        .vr-queue-item-name {
          font-size: 14px;
          font-weight: 600;
          color: #171717;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .vr-queue-item-meta {
          font-size: 11px;
          color: #8E8E93;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ── Detail Panel ── */
        .vr-detail-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-width: 0;
          height: 100%;
          overflow: hidden;
        }
        .vr-detail-scroll-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
          flex: 1;
          overflow-y: auto;
          padding-bottom: 24px;
        }

        /* ── Profile Card ── */
        .vr-profile-card {
          background: #FFFFFF;
          border: 1px solid #E5E5E5;
          border-radius: 16px;
          box-shadow: 0px 1px 1.5px rgba(0,0,0,0.04);
          overflow: hidden;
        }
        .vr-profile-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          gap: 16px;
          flex-wrap: wrap;
          border-bottom: 1px solid #F5F5F5;
        }
        .vr-profile-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }
        .vr-profile-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }
        .vr-profile-name {
          font-size: 16px;
          font-weight: 700;
          color: #171717;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .vr-profile-meta {
          font-size: 12px;
          color: #737373;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .vr-profile-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }
        .vr-action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          height: 50px;
          padding: 0 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
          min-width: 60px;
        }
        .vr-btn-flag {
          background: #FFFFFF;
          border: 1px solid #E5E5E5;
          color: #171717;
        }
        .vr-btn-flag:hover {
          background: #F5F5F5;
        }
        .vr-btn-reject {
          background: #FEF2F2;
          border: none;
          color: #B91C1C;
        }
        .vr-btn-reject:hover {
          background: #FEE2E2;
        }
        .vr-btn-approve {
          background: #171717;
          border: none;
          color: #FFFFFF;
          flex-direction: row;
          gap: 6px;
          min-width: 110px;
        }
        .vr-btn-approve:hover {
          background: #404040;
        }

        /* ── Tabs ── */
        .vr-tabs-row {
          display: flex;
          gap: 4px;
          padding: 16px 20px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .vr-tabs-row::-webkit-scrollbar {
          display: none;
        }
        .vr-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          color: #737373;
          background: transparent;
          border: none;
          cursor: pointer;
          white-space: nowrap;
          transition: all var(--transition-fast);
        }
        .vr-tab:hover {
          color: #171717;
          background: #F5F5F5;
        }
        .vr-tab.active {
          background: #171717;
          color: #FFFFFF;
        }
        .vr-tab-num {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #E5E5E5;
          color: #737373;
          font-size: 9px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .vr-tab-num.active {
          background: #FFFFFF;
          color: #171717;
        }

        /* ── Document Cards ── */
        .vr-docs-area {
          flex: 1;
        }
        .vr-docs-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .vr-doc-card {
          background: #FFFFFF;
          border: 1px solid #E5E5E5;
          border-radius: 16px;
          box-shadow: 0px 1px 1.5px rgba(0,0,0,0.04);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .vr-doc-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .vr-doc-card-title {
          font-size: 12px;
          font-weight: 700;
          color: #171717;
        }
        .vr-zoom-btn {
          background: transparent;
          border: none;
          color: #A3A3A3;
          cursor: pointer;
          padding: 2px;
          display: flex;
          align-items: center;
          transition: color var(--transition-fast);
        }
        .vr-zoom-btn:hover {
          color: #171717;
        }
        .vr-doc-fields {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .vr-doc-field-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
        }
        .vr-doc-field-label {
          color: #737373;
          font-weight: 400;
        }
        .vr-doc-field-value {
          color: #171717;
          font-weight: 600;
          text-align: end;
        }

        /* ── Placeholder Tabs ── */
        .vr-placeholder-tab {
          background: #FFFFFF;
          border: 1px solid #E5E5E5;
          border-radius: 16px;
          padding: 48px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 200px;
        }
        .vr-placeholder-tab-text {
          font-size: 14px;
          font-weight: 700;
          color: #404040;
        }
        .vr-placeholder-tab-sub {
          font-size: 12px;
          color: #A3A3A3;
        }

        /* ── Moderator Notes ── */
        .vr-notes-card {
          background: #FFFFFF;
          border: 1px solid #E5E5E5;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .vr-notes-label {
          font-size: 10px;
          font-weight: 700;
          color: #737373;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .vr-notes-textarea {
          width: 100%;
          background: #FAFAFA;
          border: 1px solid transparent;
          border-radius: 12px;
          padding: 12px;
          font-size: 12px;
          font-family: var(--font-current);
          color: var(--text-primary);
          resize: vertical;
          outline: none;
          min-height: 72px;
          box-sizing: border-box;
          transition: border var(--transition-fast);
        }
        .vr-notes-textarea:focus {
          border-color: var(--border-color);
        }
        .vr-notes-textarea::placeholder {
          color: #9CA3AF;
        }

        /* ── Responsive: Desktop/Tablet label ── */


        /* ── Tablet (769px - 1024px) ── */
        @media (min-width: 769px) and (max-width: 1024px) {
          /* Keep side-by-side layout with adjusted widths for collapsed sidebar */
          .vr-content-split {
            flex-direction: row !important;
            gap: 16px !important;
            align-items: flex-start !important;
            width: 100% !important;
          }

          .vr-queue-panel {
            width: 240px !important;
            max-width: none !important;
          }

          .vr-detail-panel {
            width: auto !important;
            max-width: none !important;
            flex: 1 !important;
          }

          .vr-profile-name {
            white-space: normal !important;
            line-height: 1.2 !important;
            font-size: 15px !important;
          }

          .vr-profile-meta {
            white-space: normal !important;
            line-height: 1.3 !important;
            font-size: 11px !important;
          }

          /* Profile Action Buttons: stack vertically/column within each button */
          .vr-profile-actions {
            display: flex !important;
            gap: 8px !important;
            align-items: center !important;
          }

          .vr-action-btn {
            height: 50px !important;
            font-size: 11px !important;
          }

          .vr-btn-flag {
            min-width: 50px !important;
            padding: 0 8px !important;
          }

          .vr-btn-reject {
            min-width: 60px !important;
            padding: 0 8px !important;
          }

          .vr-btn-approve {
            flex-direction: column !important;
            min-width: 74px !important;
            gap: 4px !important;
            padding: 0 8px !important;
          }

          .vr-btn-approve svg {
            margin: 0 !important;
          }

          /* Tab bar adjustments to prevent overflow */
          .vr-tabs-row {
            padding: 16px 12px !important;
            gap: 2px !important;
            justify-content: space-between !important;
          }

          .vr-tab {
            padding: 6px 8px !important;
            font-size: 11px !important;
            gap: 4px !important;
          }

          /* National ID Tab - Stack vertically on tablet due to narrow panel */
          .vr-docs-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }

          .vr-doc-card {
            padding: 16px 12px !important;
            gap: 12px !important;
          }

          .vr-doc-field-row {
            font-size: 11px !important;
            align-items: flex-start !important;
          }

          /* Face Match Tab - Stack vertically on tablet */
          .vr-fm-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }

          .vr-fm-card {
            padding: 16px 12px !important;
            gap: 10px !important;
          }

          .vr-fm-photo-container {
            height: 147px !important;
          }

          .vr-id-photo-avatar {
            width: 48px !important;
            height: 48px !important;
          }

          .vr-id-photo-avatar svg {
            width: 28px !important;
            height: 28px !important;
          }

          .vr-id-photo-lines {
            margin-top: 8px !important;
            gap: 4px !important;
          }

          .vr-id-line-short, .vr-id-line-medium, .vr-id-line-long {
            height: 4px !important;
          }

          .vr-selfie-photo-avatar {
            width: 60px !important;
            height: 60px !important;
          }

          .vr-selfie-photo-avatar svg {
            width: 32px !important;
            height: 32px !important;
          }

          .vr-selfie-liveness-indicator {
            bottom: 8px !important;
            padding: 2px 6px !important;
            font-size: 8px !important;
          }

          .vr-score-overlay {
            padding: 8px 10px !important;
            gap: 4px !important;
            margin-top: 2px !important;
          }

          .vr-score-info {
            flex-direction: row !important;
            align-items: center !important;
          }

          .vr-score-label {
            font-size: 8px !important;
            line-height: 1.2 !important;
          }

          .vr-score-value {
            font-size: 14px !important;
          }

          /* Portfolio Tab */
          .vr-portfolio-card {
            padding: 16px 20px !important;
            gap: 12px !important;
          }

          .vr-portfolio-grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 12px !important;
          }

          /* Skills Tab */
          .vr-skills-card {
            padding: 16px 20px !important;
            gap: 12px !important;
          }

          .vr-skills-list {
            gap: 12px !important;
          }

          .vr-skills-item {
            padding: 12px !important;
            gap: 12px !important;
            flex-direction: row !important;
            align-items: center !important;
          }

          .vr-skill-label {
            white-space: normal !important;
            font-size: 11.5px !important;
            line-height: 1.3 !important;
          }
        }

        /* ── Mobile (max-width: 768px) ── */
        @media (max-width: 768px) {

          .top-header {
            display: none !important;
          }
          .main-content {
            margin-inline-start: 0 !important;
            padding-top: 0 !important;
            padding-bottom: 96px !important;
            padding-inline-start: 0 !important;
            padding-inline-end: 0 !important;
          }
          .vr-page-body {
            padding: 16px !important;
            gap: 12px !important;
            height: auto !important;
            overflow: visible !important;
          }
          .vr-content-split {
            flex-direction: column;
            gap: 12px;
            align-items: stretch !important;
            height: auto !important;
            overflow: visible !important;
          }
          .vr-queue-panel {
            width: 100%;
          }
          .vr-detail-panel {
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }
          .vr-detail-scroll-content {
            height: auto !important;
            overflow: visible !important;
            padding-bottom: 0 !important;
          }
          .vr-tabs-row {
            display: flex !important;
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            justify-content: flex-start !important;
            padding: 12px 16px !important;
            gap: 8px !important;
          }
          .vr-tab {
            flex-shrink: 0 !important;
          }
          .vr-docs-grid {
            grid-template-columns: 1fr;
          }
          .vr-fm-grid {
            grid-template-columns: 1fr;
          }
          .vr-portfolio-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .vr-skills-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          .vr-skill-status-badge {
            align-self: flex-start;
          }
          .vr-profile-top {
            flex-direction: column;
            align-items: stretch !important;
          }
          .vr-profile-actions {
            width: 100%;
            flex-direction: column !important;
            gap: 8px !important;
          }
          .vr-action-btn {
            width: 100% !important;
            height: 44px !important;
            flex-direction: row !important;
            justify-content: center !important;
            gap: 8px !important;
            min-width: 0 !important;
          }
          .vr-profile-info {
            min-width: 0;
            flex: 1;
          }
          .vr-profile-meta {
            white-space: normal !important;
            word-break: break-word;
          }
          .vr-profile-card,
          .vr-doc-card,
          .vr-fm-card,
          .vr-portfolio-card,
          .vr-skills-card,
          .vr-notes-card {
            padding: 16px !important;
          }
          .vr-doc-field-value {
            max-width: 65%;
            word-break: break-word;
          }
          .vr-page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
          .mobile-bottom-tabs {
            display: flex !important;
          }

          /* Duplicate mobile header styles removed (defined in global.css) */

          /* Mobile view visibility toggles */
          .mobile-hidden {
            display: none !important;
          }
          .mobile-visible-block {
            display: block !important;
          }
          .mobile-visible-flex {
            display: flex !important;
          }

          /* Mobile Queue styles */
          .mobile-filter-pills {
            display: flex !important;
            background: #F5F5F5;
            border-radius: 9999px;
            padding: 2px !important;
            width: 100%;
            box-sizing: border-box;
            margin-bottom: 16px;
            direction: ltr; /* keep filters in same direction order */
          }
          html[dir="rtl"] .mobile-filter-pills {
            direction: rtl;
          }

          .mobile-filter-pill {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            height: 29.5px;
            border-radius: 9999px;
            font-size: 10px;
            font-weight: 700;
            color: #737373;
            background: transparent;
            border: none;
            cursor: pointer;
            transition: all var(--transition-fast);
          }

          .mobile-filter-pill.active {
            background: #FFFFFF;
            color: #171717;
            box-shadow: 0px 1px 1px rgba(0,0,0,0.05);
          }

          .mobile-pill-badge {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 17.5px;
            padding: 0 6px;
            border-radius: 4px;
            background: #E5E5E5;
            color: #737373;
            font-size: 9px;
            font-weight: 700;
            min-width: 14px;
          }

          .mobile-pill-badge.active {
            background: #171717;
            color: #FFFFFF;
          }

          .mobile-submissions-cards {
            display: flex;
            flex-direction: column;
            gap: 10px;
            width: 100%;
          }

          .mobile-craftsman-card {
            background: #FFFFFF;
            border: 1px solid #E5E5E5;
            border-radius: 16px;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            box-shadow: 0px 1px 1.5px rgba(0,0,0,0.03);
            text-align: start;
            box-sizing: border-box;
          }

          .mobile-craftsman-card.approved {
            opacity: 0.6;
          }

          .mobile-craftsman-card.rejected {
            opacity: 0.5;
          }

          .mobile-card-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            width: 100%;
          }

          .mobile-card-profile {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .mobile-card-name-info {
            display: flex;
            flex-direction: column;
            gap: 2px;
            text-align: start;
          }

          .mobile-card-name {
            font-size: 14px;
            font-weight: 700;
            color: #171717;
          }

          .mobile-card-role {
            font-size: 11px;
            color: #737373;
          }

          .mobile-card-options {
            background: transparent;
            border: none;
            padding: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          /* Mobile Stats Row */
          .mobile-card-stats-row {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            width: 100%;
          }

          .mobile-stat-box {
            background: #FAFAFA;
            border-radius: 8px;
            padding: 6px 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 2px;
            height: 47.5px;
            box-sizing: border-box;
          }

          .mobile-stat-label {
            font-size: 9px;
            color: #737373;
            text-transform: uppercase;
            letter-spacing: 0.45px;
            font-weight: 700;
          }

          .mobile-stat-value {
            font-size: 12px;
            font-weight: 700;
            color: #171717;
          }

          .mobile-stat-value.risk-low {
            color: #15803D;
          }

          .mobile-stat-value.risk-medium {
            color: #B45309;
          }

          .mobile-stat-value.risk-high {
            color: #B91C1C;
          }

          /* Bottom Actions Row */
          .mobile-card-actions-row {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            width: 100%;
            margin-top: 4px;
          }

          .mobile-card-action-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 32.5px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 700;
            border: none;
            cursor: pointer;
            transition: all var(--transition-fast);
            box-sizing: border-box;
          }

          .mobile-card-action-btn.btn-reject {
            background: #FEF2F2;
            color: #B91C1C;
          }

          .mobile-card-action-btn.btn-reject:hover {
            background: #FEE2E2;
          }

          .mobile-card-action-btn.btn-review {
            background: #F5F5F5;
            color: #171717;
          }

          .mobile-card-action-btn.btn-review:hover {
            background: #E5E5E5;
          }

          .mobile-card-action-btn.btn-approve {
            background: #171717;
            color: #FFFFFF;
          }

          .mobile-card-action-btn.btn-approve:hover {
            background: #404040;
          }
          
        }

        /* Hide mobile queue list on desktop viewports */
        @media (min-width: 769px) {
          .vr-mobile-queue-list {
            display: none !important;
          }
        }

        /* Viewport-independent RTL chevron flip */
        .rtl-flip {
          transform: scaleX(1);
        }
        html[dir="rtl"] .rtl-flip {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
};

export default VerificationPage;
