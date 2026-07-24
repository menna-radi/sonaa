import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Sidebar } from '../../../../presentation/layouts/Sidebar';
import { Header } from '../../../../presentation/layouts/Header';
import { MobileBottomTabs } from '../../../../presentation/layouts/MobileBottomTabs';
import {
  Search,
  X,
  Check,
  CheckCircle,
  AlertOctagon,
  ShieldAlert,
  UserX,
  Activity,
  Sparkles,
  ChevronLeft,
  Bell,
  Trash2,
  AlertTriangle,
  FileText,
  RefreshCw,
  MessageSquare,
  Phone,
  Send,
  Info,
  ShieldCheck,
  Briefcase,
  UserCheck,
  ExternalLink
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface ReportItem {
  id: string;
  title: string;
  severity: 'high' | 'medium' | 'low';
  reporter: string;
  reporterId?: string;
  reporterPhone?: string;
  subject: string;
  suspectId?: string;
  suspectPhone?: string;
  suspectStatus?: string;
  subjectType: string;
  category: 'fraud' | 'fake_accounts' | 'chats' | 'spam';
  time: string;
  desc: string;
  taskId?: string;
  taskDisplayId?: string;
  taskTitle?: string;
}

type ReportFilter = 'All' | 'Fraud' | 'Fake accounts' | 'Chats' | 'Spam';


import { useDependencies } from '../../../../core/di/DependencyProvider';
import { useEffect, useCallback } from 'react';

export const ReportsPage: React.FC = () => {
  const { t } = useLanguage();
  const { dependencies } = useDependencies();
  const { safetyReportRepository } = dependencies;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string>('');
  const [filter, setFilter] = useState<ReportFilter>('All');
  const [notes, setNotes] = useState<{ [id: string]: string }>({});
  const [mobileView, setMobileView] = useState<'queue' | 'detail'>('queue');

  // Interactive Message & Action States
  const [selectedAction, setSelectedAction] = useState<'dismiss' | 'warning' | 'suspend' | 'ban'>('dismiss');
  const [messageTarget, setMessageTarget] = useState<'reporter' | 'suspect' | 'both'>('reporter');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [sendNotification, setSendNotification] = useState<boolean>(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [showTaskModal, setShowTaskModal] = useState<boolean>(false);

  // Decision States
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [suspendedIds, setSuspendedIds] = useState<Set<string>>(new Set());
  const [bannedIds, setBannedIds] = useState<Set<string>>(new Set());

  const TEMPLATE_PRESETS = [
    {
      id: 'dismiss_safe',
      label: '🟢 Case Safe & Closed',
      action: 'dismiss' as const,
      target: 'reporter' as const,
      text: 'Thank you for reporting. Following a safety investigation, no breach was identified. This case has been marked as resolved.'
    },
    {
      id: 'warning_suspect',
      label: '🟡 Issue Safety Warning',
      action: 'warning' as const,
      target: 'suspect' as const,
      text: 'Safety Warning: Your recent activity on Sonaa (Task #{taskId}) was flagged for violating community guidelines. Please adhere to platform rules.'
    },
    {
      id: 'update_reporter',
      label: '🔵 Update Reporter',
      action: 'dismiss' as const,
      target: 'reporter' as const,
      text: 'Hello {reporter}, your safety report #{id} has been reviewed by Sonaa Admin and appropriate action has been taken. Thank you for keeping Sonaa safe.'
    },
    {
      id: 'suspend_account',
      label: '🟠 Suspend Suspect Account',
      action: 'suspend' as const,
      target: 'both' as const,
      text: 'Notice: Sonaa partner account has been temporarily suspended pending safety audit regarding Report #{id}.'
    },
    {
      id: 'ban_account',
      label: '🔴 Permanent Ban',
      action: 'ban' as const,
      target: 'both' as const,
      text: 'Notice: Sonaa partner account has been permanently blocked due to confirmed severe safety violation in Report #{id}.'
    }
  ];

  const applyTemplate = (preset: typeof TEMPLATE_PRESETS[0], report?: ReportItem) => {
    setSelectedAction(preset.action);
    setMessageTarget(preset.target);
    const targetReport = report || selectedReport;
    if (!targetReport) return;
    const formatted = preset.text
      .replace('{reporter}', targetReport.reporter)
      .replace('{id}', targetReport.id)
      .replace('{taskId}', targetReport.taskDisplayId || targetReport.id);
    setCustomMessage(formatted);
  };

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await safetyReportRepository.getSafetyReports();
      if (result.success) {
        setReports(result.data as ReportItem[]);
        if (result.data.length > 0) {
          setSelectedId(result.data[0].id);
          applyTemplate(TEMPLATE_PRESETS[0], result.data[0] as ReportItem);
        }
      } else {
        setError(result.error.message || 'Failed to fetch safety reports.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch safety reports.');
    } finally {
      setLoading(false);
    }
  }, [safetyReportRepository]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const activeReports = reports.filter(report => {
    const isResolved = dismissedIds.has(report.id) || suspendedIds.has(report.id) || bannedIds.has(report.id);
    if (isResolved) return false;

    if (filter === 'All') return true;
    if (filter === 'Fraud') return report.category === 'fraud';
    if (filter === 'Fake accounts') return report.category === 'fake_accounts';
    if (filter === 'Chats') return report.category === 'chats';
    if (filter === 'Spam') return report.category === 'spam';
    return true;
  });

  const selectedReport = activeReports.find(r => r.id === selectedId) || activeReports[0];

  const handleSelectReport = (report: ReportItem) => {
    setSelectedId(report.id);
    setMobileView('detail');
    setActionSuccess(null);
    applyTemplate(TEMPLATE_PRESETS[0], report);
  };

  const handleSetFilter = (newFilter: ReportFilter) => {
    setFilter(newFilter);
    const filteredList = reports.filter(report => {
      const isResolved = dismissedIds.has(report.id) || suspendedIds.has(report.id) || bannedIds.has(report.id);
      if (isResolved) return false;

      if (newFilter === 'All') return true;
      if (newFilter === 'Fraud') return report.category === 'fraud';
      if (newFilter === 'Fake accounts') return report.category === 'fake_accounts';
      if (newFilter === 'Chats') return report.category === 'chats';
      if (newFilter === 'Spam') return report.category === 'spam';
      return true;
    });
    if (filteredList.length > 0) {
      handleSelectReport(filteredList[0]);
    } else {
      setSelectedId('');
    }
  };

  const handleExecuteAction = async () => {
    if (!selectedReport) return;
    setError(null);
    setActionSuccess(null);
    try {
      const actionToExecute = selectedAction === 'warning' ? 'dismiss' : selectedAction;
      const combinedNotes = customMessage.trim().length > 0 
        ? `${customMessage} (Target: ${messageTarget})`
        : notes[selectedReport.id] || '';

      const result = await safetyReportRepository.moderateReport(selectedReport.id, actionToExecute, combinedNotes);
      if (result.success) {
        if (selectedAction === 'dismiss' || selectedAction === 'warning') {
          setDismissedIds(prev => new Set([...prev, selectedReport.id]));
        } else if (selectedAction === 'suspend') {
          setSuspendedIds(prev => new Set([...prev, selectedReport.id]));
        } else if (selectedAction === 'ban') {
          setBannedIds(prev => new Set([...prev, selectedReport.id]));
        }

        setActionSuccess(`Action '${selectedAction.toUpperCase()}' executed successfully. Automated notification sent to ${messageTarget}.`);

        // Auto-select the next report in the active list
        const remaining = activeReports.filter(r => r.id !== selectedReport.id);
        if (remaining.length > 0) {
          setTimeout(() => {
            handleSelectReport(remaining[0]);
          }, 1200);
        } else {
          setMobileView('queue');
        }
      } else {
        setError(result.error.message || 'Failed to moderate report.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to moderate report.');
    }
  };

  const handleNoteChange = (text: string) => {
    setNotes(prev => ({
      ...prev,
      [selectedId]: text
    }));
  };

  // Get localized string wrapper for severity
  const getSeverityLabel = (severity: 'high' | 'medium' | 'low') => {
    if (severity === 'high') return t('reports_severity_high');
    if (severity === 'medium') return t('reports_severity_medium');
    return t('reports_severity_low');
  };

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
            <h2>{t('reports_title')}</h2>
            <span style={{ fontSize: '11px', color: '#737373', marginTop: '4px' }}>
              {activeReports.length} {t('vr_in_queue')}
            </span>
          </div>
        </div>

        <div className="rp-page-body">
          {/* Desktop/Tablet Page Title Row */}
          <div className="desktop-tablet-page-header desktop-tablet-only">
            <div className="rp-page-header-left">
              <h1 className="rp-page-title" style={{ margin: 0 }}>{t('reports_title')}</h1>
              <p className="rp-page-subtitle" style={{ margin: '4px 0 0 0' }}>{t('reports_subtitle')}</p>
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
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading safety reports...</p>
            </div>
          ) : (
            <>
              {/* Metrics Grid */}
              <div className="rp-metrics-grid animate-fade-in">
            {/* Metric 1 */}
            <div className="rp-metric-card">
              <div className="rp-metric-header">
                <div className="rp-metric-icon-bg">
                  <AlertOctagon size={16} style={{ color: '#737373' }} />
                </div>
              </div>
              <div className="rp-metric-title">{t('reports_open_reports')}</div>
              <div className="rp-metric-value">{activeReports.length}</div>
              <div className="rp-metric-subtext">Active Pending Cases</div>
            </div>

            {/* Metric 2 */}
            <div className="rp-metric-card">
              <div className="rp-metric-header">
                <div className="rp-metric-icon-bg">
                  <ShieldAlert size={16} style={{ color: '#737373' }} />
                </div>
              </div>
              <div className="rp-metric-title">{t('reports_fraud_signals')}</div>
              <div className="rp-metric-value">{reports.filter(r => r.category === 'fraud' || r.title?.toLowerCase().includes('fraud')).length}</div>
              <div className="rp-metric-subtext">Direct User Submissions</div>
            </div>

            {/* Metric 3 */}
            <div className="rp-metric-card">
              <div className="rp-metric-header">
                <div className="rp-metric-icon-bg">
                  <UserX size={16} style={{ color: '#737373' }} />
                </div>
              </div>
              <div className="rp-metric-title">{t('reports_fake_accounts')}</div>
              <div className="rp-metric-value">{reports.filter(r => r.category === 'fake_accounts').length}</div>
              <div className="rp-metric-subtext">Pending Review</div>
            </div>

            {/* Metric 4 */}
            <div className="rp-metric-card">
              <div className="rp-metric-header">
                <div className="rp-metric-icon-bg">
                  <Activity size={16} style={{ color: '#737373' }} />
                </div>
              </div>
              <div className="rp-metric-title">Chat & Communication Reports</div>
              <div className="rp-metric-value">{reports.filter(r => r.category === 'chats').length}</div>
              <div className="rp-metric-subtext">Platform Messages</div>
            </div>
          </div>

          {/* Split Content Area */}
          <div className="rp-content-split">
            {/* Left Queue Panel: Visible on Desktop/Tablet always. On mobile, visible when mobileView === 'queue' */}
            <div className={`rp-queue-panel ${mobileView === 'queue' ? 'mobile-visible-block' : 'mobile-hidden'}`}>
              <div className="rp-queue-card-container">
                {/* Filter Pills */}
                <div className="rp-filter-tabs-row">
                  <div className="rp-filter-tabs-track">
                    {(['All', 'Fraud', 'Fake accounts', 'Chats', 'Spam'] as ReportFilter[]).map((f) => {
                      const isActive = filter === f;
                      let filterLabel = t('reports_filter_all');
                      if (f === 'Fraud') filterLabel = t('reports_filter_fraud');
                      else if (f === 'Fake accounts') filterLabel = t('reports_filter_fake_accounts');
                      else if (f === 'Chats') filterLabel = t('reports_filter_chats');
                      else if (f === 'Spam') filterLabel = t('reports_filter_spam');

                      return (
                        <button
                          key={f}
                          className={`rp-filter-pill-btn ${isActive ? 'active' : ''}`}
                          onClick={() => handleSetFilter(f)}
                        >
                          {filterLabel}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Report Rows List */}
                <div className="rp-reports-list">
                  {activeReports.length === 0 ? (
                    <div className="rp-empty-state">
                      <CheckCircle size={32} style={{ color: '#22c55e', marginBottom: 12 }} />
                      <h3>All caught up!</h3>
                      <p>No pending security alerts or reports need review.</p>
                    </div>
                  ) : (
                    activeReports.map((report) => {
                      const isSelected = report.id === selectedId;
                      const severityClass = `severity-${report.severity}`;

                      return (
                        <button
                          key={report.id}
                          className={`rp-report-item-btn ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleSelectReport(report)}
                        >
                          <div className="rp-report-item-left">
                            <div className={`rp-report-severity-dot-bg severity-bg-${report.severity}`}>
                              {report.severity === 'high' ? (
                                <AlertTriangle size={14} className="icon-red" />
                              ) : report.severity === 'medium' ? (
                                <AlertTriangle size={14} className="icon-orange" />
                              ) : (
                                <FileText size={14} className="icon-gray" />
                              )}
                            </div>
                            <div className="rp-report-item-info">
                              <div className="rp-report-item-title-row">
                                <span className="rp-report-item-title">{report.title}</span>
                                <div className={`rp-report-item-badge ${severityClass}`}>
                                  {getSeverityLabel(report.severity)}
                                </div>
                              </div>
                              <span className="rp-report-item-metadata">
                                {report.reporter} · Report #{report.id}
                              </span>
                            </div>
                          </div>
                          <div className="rp-report-item-right">
                            <span className="rp-report-item-time">{report.time}</span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right Details Inspection Panel: Visible always on Desktop. Tablet stacks below queue. On mobile, visible when mobileView === 'detail' */}
            <div className={`rp-detail-panel ${mobileView === 'detail' ? 'mobile-visible-flex' : 'mobile-hidden'}`}>
              {/* Back Button (Mobile Only) */}
              <button
                className="rp-mobile-back-btn mobile-only"
                onClick={() => setMobileView('queue')}
              >
                <ChevronLeft size={16} className="rtl-flip" />
                <span>{t('reports_back_queue')}</span>
              </button>

              {activeReports.length === 0 ? (
                <div className="rp-detail-card-empty">
                  <ShieldAlert size={48} style={{ color: '#e5e5e5', marginBottom: 12 }} />
                  <p>Select a report from the queue list to inspect the details.</p>
                </div>
              ) : (
                <div className="rp-detail-card">
                  {/* Title Header */}
                  <div className="rp-detail-header">
                    <div className="rp-detail-header-text">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span className="rp-detail-id">Report #{selectedReport.id}</span>
                        <span style={{ fontSize: '0.75rem', color: '#737373', background: '#f5f5f5', padding: '2px 8px', borderRadius: '12px' }}>
                          Category: {selectedReport.category.toUpperCase()}
                        </span>
                      </div>
                      <h2>{selectedReport.title}</h2>
                      <span style={{ fontSize: '0.8rem', color: '#a3a3a3' }}>Submitted {selectedReport.time}</span>
                    </div>
                    <div className={`rp-detail-badge severity-${selectedReport.severity}`}>
                      {getSeverityLabel(selectedReport.severity)}
                    </div>
                  </div>

                  {/* Success Alert Banner */}
                  {actionSuccess && (
                    <div className="glass-card status-success animate-fade-in" style={{ padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', color: '#166534' }}>
                        <CheckCircle size={18} />
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{actionSuccess}</span>
                      </div>
                    </div>
                  )}



                  {/* Parties Contact Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', margin: '16px 0' }}>
                    {/* Reporter Card */}
                    <div style={{ background: '#fafafa', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reporter Profile</span>
                        <span style={{ fontSize: '0.7rem', background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Customer</span>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#171717' }}>{selectedReport.reporter}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#525252', marginTop: '6px' }}>
                        <Phone size={12} />
                        <a href={`tel:${selectedReport.reporterPhone}`} style={{ color: 'inherit', textDecoration: 'none' }}>{selectedReport.reporterPhone}</a>
                      </div>
                    </div>

                    {/* Suspect Card */}
                    <div style={{ background: '#fafafa', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reported Suspect</span>
                        <span style={{ fontSize: '0.7rem', background: selectedReport.suspectStatus === 'BLOCKED' ? '#fee2e2' : selectedReport.suspectStatus === 'SUSPENDED' ? '#fef3c7' : '#dcfce7', color: selectedReport.suspectStatus === 'BLOCKED' ? '#991b1b' : selectedReport.suspectStatus === 'SUSPENDED' ? '#92400e' : '#166534', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                          {selectedReport.suspectStatus || 'ACTIVE'}
                        </span>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#171717' }}>{selectedReport.subject}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#525252', marginTop: '6px' }}>
                        <Phone size={12} />
                        <a href={`tel:${selectedReport.suspectPhone}`} style={{ color: 'inherit', textDecoration: 'none' }}>{selectedReport.suspectPhone}</a>
                      </div>
                    </div>
                  </div>

                  {/* Task / Order Context Card (Interactive) */}
                  <div 
                    onClick={() => setShowTaskModal(true)}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '12px',
                      padding: '14px',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ background: '#e0f2fe', color: '#0284c7', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Briefcase size={20} />
                      </div>
                      <div style={{ textAlign: 'start' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{selectedReport.taskTitle}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Order Reference: <strong style={{ color: '#0284c7' }}>{selectedReport.taskDisplayId}</strong></div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#0284c7', color: '#ffffff', padding: '6px 12px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600 }}>
                      <span>Inspect Order</span>
                      <ExternalLink size={14} />
                    </div>
                  </div>

                  {/* Incident Description */}
                  <div className="rp-detail-section">
                    <span className="rp-section-label">Reported Incident Statement</span>
                    <p className="rp-section-description" style={{ background: '#ffffff', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '12px', fontSize: '0.9rem', color: '#262626' }}>
                      {selectedReport.desc}
                    </p>
                  </div>

                  {/* Ready Response Template Switcher Bar */}
                  <div style={{ marginTop: '20px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span className="rp-section-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                        <MessageSquare size={14} style={{ color: '#171717' }} />
                        Response Templates & Automation Presets
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {TEMPLATE_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => applyTemplate(preset)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            border: '1px solid #e5e5e5',
                            background: selectedAction === preset.action && messageTarget === preset.target ? '#171717' : '#ffffff',
                            color: selectedAction === preset.action && messageTarget === preset.target ? '#ffffff' : '#404040',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Target Audience & Direct Notification Controls */}
                  <div style={{ background: '#fafafa', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#404040' }}>Notification Target Audience:</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {(['reporter', 'suspect', 'both'] as const).map((targ) => (
                          <button
                            key={targ}
                            type="button"
                            onClick={() => setMessageTarget(targ)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              border: '1px solid #d4d4d4',
                              background: messageTarget === targ ? '#262626' : '#ffffff',
                              color: messageTarget === targ ? '#ffffff' : '#525252',
                              cursor: 'pointer'
                            }}
                          >
                            {targ.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Pre-filled Message Textarea */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#737373' }}>Automated Notification Message (Editable):</span>
                      <textarea
                        className="rp-notes-textarea"
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        rows={3}
                        placeholder="Type custom response message to send to party..."
                        style={{ width: '100%', borderRadius: '8px', padding: '10px', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  {/* Primary Decision Action Bar */}
                  <div className="rp-detail-actions-row" style={{ gap: '10px' }}>
                    <button
                      className="rp-action-btn"
                      style={{
                        flex: 1,
                        background: selectedAction === 'dismiss' ? '#16a34a' : selectedAction === 'warning' ? '#d97706' : selectedAction === 'suspend' ? '#ea580c' : '#dc2626',
                        color: '#ffffff',
                        border: 'none',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                      onClick={handleExecuteAction}
                    >
                      <Send size={16} />
                      <span>Execute {selectedAction.toUpperCase()} & Dispatch Notification</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          </>
          )}
        </div>

        {/* Full Order Details Modal */}
        {showTaskModal && selectedReport && (
          <div className="modal-backdrop animate-fade-in" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
            <div className="glass-card" style={{ background: '#ffffff', width: '100%', maxWidth: '580px', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', position: 'relative' }}>
              <button 
                onClick={() => setShowTaskModal(false)}
                style={{ position: 'absolute', top: '16px', right: '16px', background: '#f5f5f5', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Briefcase size={24} style={{ color: '#0284c7' }} />
                <div style={{ textAlign: 'start' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>Linked Order Inspector</h3>
                  <span style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 600 }}>Reference: {selectedReport.taskDisplayId}</span>
                </div>
              </div>

              <div style={{ background: '#fafafa', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '16px', marginBottom: '16px', textAlign: 'start' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#737373', textTransform: 'uppercase', marginBottom: '4px' }}>Order Title</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#171717', marginBottom: '12px' }}>{selectedReport.taskTitle}</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#737373' }}>Category</span>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#262626' }}>{selectedReport.category.toUpperCase()}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#737373' }}>Order Status</span>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0284c7' }}>IN_PROGRESS / DISPUTED</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#737373' }}>Agreed Budget</span>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#16a34a' }}>250.00 SAR</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#737373' }}>Location</span>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#262626' }}>Riyadh, KSA</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px', textAlign: 'start' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>CUSTOMER</span>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>{selectedReport.reporter}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{selectedReport.reporterPhone}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>ASSIGNED CRAFTSMAN</span>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>{selectedReport.subject}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{selectedReport.suspectPhone}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => window.open('/tasks', '_blank')}
                  style={{ flex: 1, padding: '10px', background: '#171717', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <span>Open Tasks Center</span>
                  <ExternalLink size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  style={{ padding: '10px 16px', background: '#f5f5f5', color: '#525252', border: '1px solid #e5e5e5', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <MobileBottomTabs />

      <style>{`


        /* ── Page Layout ── */
        .rp-page-body {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
          text-align: start;
        }

        /* ── Header ── */
        .rp-page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-sm);
        }
        .rp-page-header-left {
          text-align: start;
        }
        .rp-page-title {
          font-size: 24px;
          font-weight: 700;
          color: #171717;
          letter-spacing: -0.48px;
          font-family: var(--font-title);
          margin: 0 0 4px 0;
        }
        .rp-page-subtitle {
          font-size: 14px;
          color: #737373;
          margin: 0;
        }
        
        .rp-ai-toggle-button {
          height: 32px;
          padding: 0 14px;
          background: #f5f5f5;
          border-radius: 8px;
          border: none;
          color: #171717;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .rp-ai-toggle-button.active {
          background: #0a0a0a;
          color: #ffffff;
        }

        /* ── Metrics Grid ── */
        .rp-metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          width: 100%;
        }
        .rp-metric-card {
          background: #ffffff;
          border: 1px solid #e5e5e5;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: start;
          box-shadow: 0px 1px 1.5px rgba(0, 0, 0, 0.04);
        }
        .rp-metric-header {
          height: 32px;
          display: flex;
          align-items: center;
          margin-bottom: 6px;
        }
        .rp-metric-icon-bg {
          background: #f5f5f5;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .rp-metric-title {
          font-size: 10px;
          font-weight: 700;
          color: #737373;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        .rp-metric-value {
          font-size: 24px;
          font-weight: 700;
          color: #171717;
          letter-spacing: -0.48px;
          line-height: 1.2;
          margin-bottom: 4px;
        }
        .rp-metric-subtext {
          font-size: 10px;
          color: #a3a3a3;
        }

        /* ── Split Layout ── */
        .rp-content-split {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          width: 100%;
        }

        /* ── Left Queue Panel ── */
        .rp-queue-panel {
          flex: 1.1;
          min-width: 0;
        }
        .rp-queue-card-container {
          background: #ffffff;
          border: 1px solid #e5e5e5;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          box-shadow: 0px 1px 1.5px rgba(0, 0, 0, 0.04);
          overflow: hidden;
        }
        .rp-filter-tabs-row {
          border-bottom: 1px solid #f5f5f5;
          padding: 20px;
        }
        .rp-filter-tabs-track {
          background: #f5f5f5;
          border-radius: 8px;
          display: flex;
          padding: 2px;
          gap: 2px;
          overflow-x: auto;
        }
        .rp-filter-pill-btn {
          flex: 1;
          height: 42px;
          border-radius: 6px;
          background: transparent;
          border: none;
          color: #737373;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          padding: 0 12px;
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .rp-filter-pill-btn.active {
          background: #ffffff;
          color: #171717;
          box-shadow: 0px 1px 1px rgba(0, 0, 0, 0.05);
        }

        .rp-reports-list {
          display: flex;
          flex-direction: column;
          max-height: 520px;
          overflow-y: auto;
        }

        .rp-report-item-btn {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border: none;
          border-bottom: 1px solid #f5f5f5;
          background: #ffffff;
          cursor: pointer;
          transition: background 0.15s ease;
          width: 100%;
          text-align: start;
        }
        .rp-report-item-btn:hover {
          background: #fafafa;
        }
        .rp-report-item-btn.selected {
          background: #fafafa;
        }
        .rp-report-item-btn:last-child {
          border-bottom: none;
        }

        .rp-report-item-left {
          display: flex;
          gap: 12px;
          align-items: center;
          min-width: 0;
          flex: 1;
        }
        .rp-report-severity-dot-bg {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .severity-bg-high { background: #fef2f2; }
        .severity-bg-medium { background: #fffbeb; }
        .severity-bg-low { background: #f5f5f5; }

        .icon-red { color: #ef4444; }
        .icon-orange { color: #f59e0b; }
        .icon-gray { color: #737373; }

        .rp-report-item-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .rp-report-item-title-row {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .rp-report-item-title {
          font-size: 12px;
          font-weight: 700;
          color: #171717;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .rp-report-item-badge {
          font-size: 8px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .rp-report-item-badge.severity-high { background: #fef2f2; color: #b91c1c; }
        .rp-report-item-badge.severity-medium { background: #fffbeb; color: #b45309; }
        .rp-report-item-badge.severity-low { background: #f5f5f5; color: #404040; }

        .rp-report-item-ai-badge {
          background: #171717;
          border-radius: 4px;
          padding: 2px 6px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #ffffff;
          font-size: 8px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .rp-report-item-metadata {
          font-size: 11px;
          color: #737373;
          text-align: start;
        }

        .rp-report-item-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
          flex-shrink: 0;
          margin-inline-start: 12px;
        }
        .rp-report-item-time {
          font-size: 10px;
          color: #a3a3a3;
        }
        .rp-report-item-risk {
          font-size: 12px;
          font-weight: 700;
          color: #171717;
        }

        /* ── Right Detail Panel ── */
        .rp-detail-panel {
          flex: 0.9;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .rp-detail-card {
          background: #ffffff;
          border: 1px solid #e5e5e5;
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          box-shadow: 0px 1px 1.5px rgba(0, 0, 0, 0.04);
          text-align: start;
        }
        .rp-detail-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          gap: 12px;
        }
        .rp-detail-header-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .rp-detail-id {
          font-size: 10px;
          font-weight: 700;
          color: #737373;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .rp-detail-header-text h2 {
          font-size: 18px;
          font-weight: 700;
          color: #171717;
          margin: 0;
        }
        .rp-detail-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          align-self: flex-start;
        }
        .rp-detail-badge.severity-high { background: #fef2f2; color: #b91c1c; }
        .rp-detail-badge.severity-medium { background: #fffbeb; color: #b45309; }
        .rp-detail-badge.severity-low { background: #f5f5f5; color: #404040; }

        /* AI Risk Score Banner */
        .rp-risk-banner-card {
          background: #171717;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 20px;
        }
        .rp-risk-banner-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .rp-risk-banner-label {
          display: flex;
          align-items: center;
          font-size: 10px;
          font-weight: 700;
          color: #a3a3a3;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .rp-risk-banner-score {
          font-size: 24px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.48px;
        }
        .rp-risk-banner-progress-track {
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 9999px;
          overflow: hidden;
          width: 100%;
        }
        .rp-risk-banner-progress-fill {
          height: 100%;
          background: #ef4444;
          border-radius: 9999px;
        }

        /* Detail sections */
        .rp-detail-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 20px;
        }
        .rp-section-label {
          font-size: 10px;
          font-weight: 700;
          color: #737373;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .rp-section-description {
          font-size: 12px;
          line-height: 1.5;
          color: #404040;
          margin: 0;
        }

        .rp-detail-metadata-divider-row {
          border-top: 1px solid #f5f5f5;
          padding-top: 16px;
          margin-bottom: 20px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .rp-metadata-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .rp-metadata-label {
          font-size: 10px;
          color: #737373;
        }
        .rp-metadata-value {
          font-size: 12px;
          font-weight: 600;
          color: #171717;
        }

        .rp-detail-notes-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 20px;
        }
        .rp-notes-label {
          font-size: 10px;
          font-weight: 700;
          color: #737373;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .rp-notes-textarea {
          background: #fafafa;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          padding: 12px;
          font-size: 12px;
          color: #171717;
          width: 100%;
          resize: none;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.15s ease;
        }
        .rp-notes-textarea:focus {
          border-color: #171717;
        }

        .rp-detail-actions-row {
          display: flex;
          gap: 8px;
          width: 100%;
        }
        .rp-action-btn {
          flex: 1;
          height: 32px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: none;
          transition: background 0.15s ease;
        }
        .rp-action-btn.btn-dismiss {
          background: #f0fdf4;
          color: #15803d;
        }
        .rp-action-btn.btn-dismiss:hover {
          background: #dcfce7;
        }
        .rp-action-btn.btn-suspend {
          background: #fffbeb;
          color: #b45309;
        }
        .rp-action-btn.btn-suspend:hover {
          background: #fef3c7;
        }
        .rp-action-btn.btn-ban {
          background: #fef2f2;
          color: #b91c1c;
        }
        .rp-action-btn.btn-ban:hover {
          background: #fee2e2;
        }

        .rp-detail-card-empty {
          background: #ffffff;
          border: 1px dashed #e5e5e5;
          border-radius: 16px;
          height: 250px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          color: #737373;
          font-size: 12px;
        }

        .rp-empty-state {
          padding: 40px 20px;
          text-align: center;
          color: #737373;
        }
        .rp-empty-state h3 {
          font-size: 14px;
          font-weight: 700;
          color: #171717;
          margin: 0 0 6px 0;
        }
        .rp-empty-state p {
          font-size: 12px;
          margin: 0;
        }

        /* ── Tablet Screens (min-width: 769px and max-width: 1024px) ── */
        @media (min-width: 769px) and (max-width: 1024px) {
          .rp-content-split {
            flex-direction: column !important;
            gap: 16px !important;
          }
          .rp-queue-panel, .rp-detail-panel {
            width: 100% !important;
            flex: none !important;
          }
          .rp-metrics-grid {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }

        /* ── Mobile Screens (max-width: 768px) ── */
        @media (max-width: 768px) {

          .main-content {
            margin-inline-start: 0 !important;
            padding-top: 0 !important;
            padding-bottom: 96px !important;
            padding-inline-start: 0 !important;
            padding-inline-end: 0 !important;
          }
          .rp-page-body {
            padding: 16px !important;
            gap: 12px !important;
          }
          .rp-metrics-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
          }
          .rp-metric-card {
            padding: 14px !important;
            border-radius: 12px !important;
          }
          .rp-content-split {
            flex-direction: column;
            gap: 12px;
            align-items: stretch !important;
          }
          
          .mobile-hidden {
            display: none !important;
          }
          .mobile-visible-block {
            display: block !important;
          }
          .mobile-visible-flex {
            display: flex !important;
          }

          .rp-queue-panel {
            width: 100%;
          }
          .rp-detail-panel {
            width: 100% !important;
          }
          .rp-detail-card {
            padding: 16px !important;
          }

          .rp-filter-tabs-row {
            padding: 12px !important;
          }
          .rp-filter-pill-btn {
            height: 32px !important;
            font-size: 9px !important;
            padding: 0 8px !important;
          }

          .rp-mobile-back-btn {
            display: flex;
            align-items: center;
            padding: 8px 12px;
            border-radius: 8px;
            background: #ffffff;
            border: 1px solid #e5e5e5;
            font-size: 12px;
            font-weight: 600;
            color: #171717;
            cursor: pointer;
            align-self: flex-start;
            margin-bottom: 8px;
            gap: 4px;
          }
          
          .rp-detail-metadata-divider-row {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .rp-detail-actions-row {
            flex-direction: column !important;
            gap: 8px !important;
          }
          .rp-action-btn {
            height: 40px !important;
            width: 100% !important;
          }
        }

        /* ── RTL Alignments ── */
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

export default ReportsPage;
