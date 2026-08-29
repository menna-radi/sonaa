import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { Sidebar } from '../../../../presentation/layouts/Sidebar';
import { Header } from '../../../../presentation/layouts/Header';
import { MobileBottomTabs } from '../../../../presentation/layouts/MobileBottomTabs';
import { usePayments } from '../hooks/usePayments';
import { BitSubscriptionManager } from '../components/BitSubscriptionManager';
import {
  Download,
  RefreshCw,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Search,
  Bell,
  Check,
  X,
  RotateCw,
  Plus,
  Users,
} from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const { t } = useLanguage();
  const {
    summary,
    plans,
    failedTransactions,
    withdrawalRequests,
    loading,
    error,
    retryingId,
    refresh,
    onRetry,
    onApprove,
    onReject,
  } = usePayments();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | '90d' | 'ytd'>('30d');
  const [mobileSection, setMobileSection] = useState<'overview' | 'payouts'>('overview');
  const [showAllFailedModal, setShowAllFailedModal] = useState(false);
  const [showAllRequestsModal, setShowAllRequestsModal] = useState(false);

  const { dependencies } = useDependencies();
  const { paymentRepository } = dependencies;

  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [showSubscribersModal, setShowSubscribersModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState(49);
  const [subscribersList, setSubscribersList] = useState<any[]>([]);
  const [subscribersLoading, setSubscribersLoading] = useState(false);

  const handleOpenSubscribers = async () => {
    setShowSubscribersModal(true);
    setSubscribersLoading(true);
    const res = await paymentRepository.getSubscribers();
    if (res.success) {
      setSubscribersList(res.data);
    }
    setSubscribersLoading(false);
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName) return;
    await paymentRepository.createSubscriptionPlan({
      name: newPlanName,
      price: Number(newPlanPrice),
    });
    setNewPlanName('');
    setShowCreatePlanModal(false);
    refresh();
  };

  const handleCancelSubscriber = async (id: string) => {
    await paymentRepository.cancelSubscriber(id);
    handleOpenSubscribers();
  };

  const handleExtendSubscriber = async (id: string) => {
    await paymentRepository.extendSubscriber(id, 30);
    handleOpenSubscribers();
  };

  const handleExportCSV = () => {
    const csvRows = [
      ['ID', 'User', 'Type', 'Amount (ILS)', 'Status', 'Date'],
      ...withdrawalRequests.map((p: any) => [p.id, p.craftsmanName || p.recipient, p.type || 'Payout', String(p.amount), p.status, p.requestedDate || 'Recent'])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sonaa_payments_${timeFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format Helper for Currency (Standardized ILS Shekel)
  const formatCurrency = (val: number): string => {
    if (val >= 1000000) {
      return `₪${(val / 1000000).toFixed(2)}M ILS`;
    }
    if (val >= 1000) {
      return `₪${(val / 1000).toFixed(0)}K ILS`;
    }
    return `₪${val.toLocaleString()} ILS`;
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
        <div className="mobile-subheader mobile-only">
          <h2>{t('nav_payments') || 'Payments'}</h2>
          <span>{t('payments_subtitle') || 'Revenue · commission · payouts · subscriptions'}</span>
        </div>

        <div className="payments-page-body">
          {/* Desktop/Tablet Header */}
          <div className="desktop-tablet-page-header desktop-tablet-only">
            <div className="payments-header-left">
              <h1 className="payments-page-title" style={{ margin: 0 }}>{t('payments_title') || 'Payments & Subscriptions'}</h1>
              <p className="payments-page-subtitle" style={{ margin: '4px 0 0 0' }}>{t('payments_subtitle') || 'Revenue · commission · payouts · subscriptions'}</p>
            </div>
            <div className="payments-header-actions">
              {/* Time Filter Row */}
              <div className="time-filter-pills">
                {(['7d', '30d', '90d', 'ytd'] as const).map(p => (
                  <button
                    key={p}
                    className={`time-filter-pill ${timeFilter === p ? 'active' : ''}`}
                    onClick={() => setTimeFilter(p)}
                  >
                    {p.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Export Button */}
              <button className="payments-export-btn" onClick={handleExportCSV} style={{ cursor: 'pointer' }}>
                <Download size={14} />
                <span>{t('btn_export') || 'Export'}</span>
              </button>
            </div>
          </div>

          {/* System Error Banner */}
          {error && (
            <div className="glass-card status-danger animate-fade-in" style={{ padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', color: 'var(--color-danger)' }}>
                <AlertTriangle size={20} />
                <div style={{ textAlign: 'start' }}>
                  <strong style={{ display: 'block' }}>Telemetry Failure</strong>
                  <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>{error}</span>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex-center" style={{ minHeight: '400px', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <RefreshCw className="animate-spin" size={36} style={{ color: 'var(--color-primary)' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('status_loading') || 'Loading telemetry data...'}</p>
            </div>
          ) : !error && summary ? (
            <div className="payments-content-layout animate-fade-in">

              {/* Bit Subscription Payment Manager & Verification Queue */}
              <BitSubscriptionManager onRefreshNeeded={refresh} />

              {/* Mobile View Navigation Toggle Pills */}
              <div className="mobile-section-toggles mobile-only">
                <button
                  className={`mobile-section-toggle-btn ${mobileSection === 'overview' ? 'active' : ''}`}
                  onClick={() => setMobileSection('overview')}
                >
                  {t('sidebar_dashboard') || 'Overview'}
                </button>
                <button
                  className={`mobile-section-toggle-btn ${mobileSection === 'payouts' ? 'active' : ''}`}
                  onClick={() => setMobileSection('payouts')}
                >
                  {t('tab_payouts')}
                </button>
              </div>

              {/* OVERVIEW SECTION (Desktop/Tablet or Mobile Overview active) */}
              <div className={`payments-overview-section ${mobileSection === 'overview' ? 'mobile-visible-flex' : 'mobile-hidden'}`}>
                {/* 1. Metrics Grid */}
                <div className="payments-metrics-grid">
                  {/* GMV (MTD) */}
                  <div className="payments-metric-card">
                    <div className="payments-metric-header">
                      <span className="payments-metric-label">{t('payments_gmv_mtd') || 'GMV (MTD)'}</span>
                      <span className="payments-metric-trend green">
                        <ArrowUpRight size={10} style={{ marginInlineEnd: 2 }} />
                        {summary.gmvChangePct}%
                      </span>
                    </div>
                    <strong className="payments-metric-value">{formatCurrency(summary.gmvMtd)}</strong>
                  </div>

                  {/* Net Revenue */}
                  <div className="payments-metric-card">
                    <div className="payments-metric-header">
                      <span className="payments-metric-label">{t('payments_net_revenue') || 'Net Revenue'}</span>
                      <span className="payments-metric-trend green">
                        <ArrowUpRight size={10} style={{ marginInlineEnd: 2 }} />
                        {summary.revenueChangePct}%
                      </span>
                    </div>
                    <strong className="payments-metric-value">{formatCurrency(summary.netRevenue)}</strong>
                  </div>

                  {/* Take rate */}
                  <div className="payments-metric-card">
                    <div className="payments-metric-header">
                      <span className="payments-metric-label">{t('payments_take_rate') || 'Take rate'}</span>
                      <span className="payments-metric-trend green">
                        <ArrowUpRight size={10} style={{ marginInlineEnd: 2 }} />
                        +{summary.takeRateChangePct}pt
                      </span>
                    </div>
                    <strong className="payments-metric-value">{summary.takeRate}%</strong>
                  </div>

                  {/* Pending payouts */}
                  <div className="payments-metric-card">
                    <div className="payments-metric-header">
                      <span className="payments-metric-label">{t('payments_pending_payouts') || 'Pending payouts'}</span>
                    </div>
                    <strong className="payments-metric-value">{formatCurrency(summary.pendingPayouts)}</strong>
                    <span className="payments-metric-subtitle">
                      {summary.pendingCraftsmenCount} {t('payments_craftsmen_count') || 'craftsmen'}
                    </span>
                  </div>
                </div>

                {/* 2. Mid Section split: Revenue Chart & Subscription Plans */}
                <div className="payments-mid-split">
                  {/* Left Column: Revenue Line/Area Chart */}
                  <div className="payments-chart-card">
                    <div className="payments-chart-header">
                      <div className="payments-chart-title-area">
                        <strong className="payments-chart-headline">{formatCurrency(summary.netRevenue)}</strong>
                        <span className="payments-chart-subtitle">Net · Commission + subscriptions</span>
                      </div>
                      <div className="payments-chart-badge">
                        <TrendingUp size={12} style={{ marginInlineEnd: 4 }} />
                        <span>Revenue Growth</span>
                      </div>
                    </div>

                    <div className="payments-chart-body">
                      {/* Premium Area SVG Graph */}
                      <svg className="payments-line-chart-svg" width="100%" height="160" viewBox="0 0 500 160" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#171717" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#171717" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {/* Area glow */}
                        <path
                          d="M 0 160 L 0 110 Q 75 115 150 95 T 300 70 Q 400 45 500 20 L 500 160 Z"
                          fill="url(#chartGlow)"
                        />
                        {/* Grid lines */}
                        <line x1="0" y1="40" x2="500" y2="40" stroke="#F3F4F6" strokeWidth="1" />
                        <line x1="0" y1="80" x2="500" y2="80" stroke="#F3F4F6" strokeWidth="1" />
                        <line x1="0" y1="120" x2="500" y2="120" stroke="#F3F4F6" strokeWidth="1" />
                        
                        {/* Line */}
                        <path
                          d="M 0 110 Q 75 115 150 95 T 300 70 Q 400 45 500 20"
                          fill="none"
                          stroke="#171717"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />
                        
                        {/* End Point Dot */}
                        <circle cx="500" cy="20" r="5" fill="#171717" />
                        <circle cx="500" cy="20" r="10" fill="none" stroke="#171717" strokeWidth="1.5" strokeOpacity="0.5" />
                      </svg>
                      {/* X Axis Labels */}
                      <div className="payments-chart-x-axis">
                        <span>W1</span>
                        <span>W2</span>
                        <span>W3</span>
                        <span>W4</span>
                        <span>W5</span>
                        <span>W6</span>
                        <span>W7</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Subscription Plans Summary */}
                  <div className="payments-plans-card">
                    <div className="payments-plans-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <span className="payments-plans-card-title">{t('payments_sub_plans') || 'Active Subscriptions'}</span>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                          MRR {formatCurrency(summary.mrr)}
                        </div>
                      </div>
                      <button
                        className="payments-view-all-btn"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}
                        onClick={() => {
                          const el = document.querySelector('.bit-sub-manager');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        <Users size={14} />
                        <span>Manage Passes</span>
                      </button>
                    </div>

                    <div className="payments-plans-list" style={{ marginTop: '12px' }}>
                      {plans.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>No active plans configured yet.</p>
                      ) : (
                        plans.map(plan => {
                          const totalSubscribers = plans.reduce((acc, p) => acc + (p.subscribersCount || 0), 0);
                          const pct = totalSubscribers > 0 ? ((plan.subscribersCount || 0) / totalSubscribers) * 100 : 0;
                          return (
                            <div key={plan.id} className="payments-plan-item">
                              <div className="payments-plan-row">
                                <span className="payments-plan-name">
                                  {plan.name || plan.nameEn} <span className="payments-plan-price">· ₪{plan.price} ILS / {plan.durationMonths || 1}M</span>
                                </span>
                                <strong className="payments-plan-count">{(plan.subscribersCount || 0).toLocaleString()}</strong>
                              </div>
                              <div className="payments-plan-track">
                                <div className="payments-plan-bar" style={{ width: `${Math.max(pct, 5)}%` }} />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* PAYOUTS SECTION (Desktop/Tablet or Mobile Payouts active) */}
              <div className={`payments-payouts-section ${mobileSection === 'payouts' ? 'mobile-visible-flex' : 'mobile-hidden'}`}>
                {/* 3. Bottom Section split: Failed Transactions & Withdrawal Requests */}
                <div className="payments-bottom-split">
                  {/* Left Column: Failed Transactions Table */}
                  <div className="payments-failed-card">
                    <div className="payments-failed-header">
                      <div className="payments-failed-header-left">
                        <span className="payments-failed-title">{t('payments_failed_tx') || 'Failed Transactions'}</span>
                        <span className="payments-failed-count">
                          {failedTransactions.length} {t('payments_require_attention') || 'require attention'}
                        </span>
                      </div>
                      <button className="payments-view-all-btn" onClick={() => setShowAllFailedModal(true)}>
                        {t('payments_view_all') || 'View all'}
                      </button>
                    </div>

                    <div className="payments-failed-table-wrapper">
                      {failedTransactions.length === 0 ? (
                        <div className="payments-empty-state">
                          <Check size={24} style={{ color: '#16A34A', marginBottom: 8 }} />
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#171717' }}>All failed logs cleared</span>
                        </div>
                      ) : (
                        <table className="payments-failed-table">
                          <thead>
                            <tr>
                              <th>{t('task_header_task') || 'Transaction'}</th>
                              <th>{t('task_header_budget') || 'Amount'}</th>
                              <th>{t('payments_reason') || 'Reason'}</th>
                              <th>{t('payments_retries') || 'Retries'}</th>
                              <th>{t('payments_action') || 'Action'}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {failedTransactions.map(tx => {
                              const isRetrying = retryingId === tx.id;
                              const reasonText = t(tx.reasonKey) || tx.reasonKey.replace('reason_', '').replace('_', ' ');
                              return (
                                <tr key={tx.id}>
                                  <td>
                                    <div className="failed-tx-info">
                                      <strong className="failed-tx-name">{tx.name}</strong>
                                      <span className="failed-tx-meta">{tx.txId} · {tx.bank} · {tx.timeAgo}</span>
                                    </div>
                                  </td>
                                  <td>
                                    <strong className="failed-tx-amount">{tx.amount.toLocaleString()} ILS</strong>
                                  </td>
                                  <td>
                                    <span className="failed-tx-reason">{reasonText}</span>
                                  </td>
                                  <td>
                                    <span className="failed-tx-retries">{tx.retries}</span>
                                  </td>
                                  <td>
                                    <button
                                      className={`failed-tx-retry-btn ${isRetrying ? 'retrying' : ''}`}
                                      onClick={() => onRetry(tx.id)}
                                      disabled={isRetrying}
                                    >
                                      <RotateCw size={11} className={isRetrying ? 'animate-spin' : ''} />
                                      <span>{isRetrying ? '...' : t('payments_btn_retry') || 'Retry'}</span>
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Withdrawal Requests Pending List */}
                  <div className="payments-withdrawals-card">
                    <div className="payments-withdrawals-header">
                      <div className="payments-withdrawals-header-left">
                        <span className="payments-withdrawals-title">{t('payments_withdrawal_reqs') || 'Withdrawal Requests'}</span>
                        <span className="payments-withdrawals-count">
                          {withdrawalRequests.filter(w => w.status === 'pending').length} {t('payments_pending_approval') || 'pending approval'}
                        </span>
                      </div>
                      <button className="payments-view-all-btn" onClick={() => setShowAllRequestsModal(true)}>
                        {t('payments_all_requests') || 'All requests'}
                      </button>
                    </div>

                    <div className="payments-withdrawals-list">
                      {withdrawalRequests.map(req => {
                        const isPending = req.status === 'pending';
                        return (
                          <div key={req.id} className="withdrawal-item">
                            <div className="withdrawal-item-left">
                              <div className="withdrawal-avatar-placeholder" />
                              <div className="withdrawal-user-info">
                                <strong className="withdrawal-user-name">{req.name}</strong>
                                <span className="withdrawal-user-meta">{req.bank} · {req.timeAgo}</span>
                              </div>
                            </div>

                            <div className="withdrawal-item-right">
                              <strong className="withdrawal-amount">{req.amount.toLocaleString()} ILS</strong>

                              {isPending ? (
                                <div className="withdrawal-actions">
                                  <button
                                    className="withdrawal-btn btn-reject"
                                    title="Reject"
                                    onClick={() => onReject(req.id)}
                                  >
                                    <X size={12} />
                                  </button>
                                  <button
                                    className="withdrawal-btn btn-approve"
                                    title="Approve"
                                    onClick={() => onApprove(req.id)}
                                  >
                                    <Check size={12} />
                                  </button>
                                </div>
                              ) : (
                                <span className={`withdrawal-status-badge ${req.status}`}>
                                  {req.status === 'approved' ? 'Approved' : 'Rejected'}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : null}

          {/* Sync Button */}
          {!error && !loading && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
              <button
                onClick={refresh}
                style={{
                  background: 'var(--bg-surface-hover)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: '10px 20px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                <span>Sync Telemetry Nodes</span>
              </button>
            </div>
          )}
        </div>

        {/* 1. View All Failed Transactions Modal */}
        {showAllFailedModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px'
          }} onClick={() => setShowAllFailedModal(false)}>
            <div style={{
              background: 'var(--bg-surface)',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '700px',
              padding: '24px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
              textAlign: 'start',
              position: 'relative',
              maxHeight: '80vh',
              overflowY: 'auto'
            }} onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => setShowAllFailedModal(false)}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--text-muted)' }}
              >
                ×
              </button>
              
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Failed Transactions Log
              </h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Review and trigger retry processes for system payments.
              </p>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>Transaction</th>
                    <th style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>Amount</th>
                    <th style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>Reason</th>
                    <th style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>Retries</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right', color: 'var(--text-secondary)' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {failedTransactions.map(tx => {
                    const isRetrying = retryingId === tx.id;
                    const reasonText = t(tx.reasonKey) || tx.reasonKey.replace('reason_', '').replace('_', ' ');
                    return (
                      <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px 8px' }}>
                          <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{tx.name}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tx.txId} · {tx.bank}</span>
                        </td>
                        <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--text-primary)' }}>{tx.amount.toLocaleString()} ILS</td>
                        <td style={{ padding: '12px 8px', color: '#ef4444' }}>{reasonText}</td>
                        <td style={{ padding: '12px 8px', color: 'var(--text-primary)' }}>{tx.retries}</td>
                        <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                          <button
                            onClick={() => onRetry(tx.id)}
                            disabled={isRetrying}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '6px 10px',
                              borderRadius: '4px',
                              background: '#eff6ff',
                              color: '#2563eb',
                              border: 'none',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: isRetrying ? 'not-allowed' : 'pointer',
                              opacity: isRetrying ? 0.7 : 1
                            }}
                          >
                            <RotateCw size={12} className={isRetrying ? 'animate-spin' : ''} />
                            {isRetrying ? 'Retrying...' : 'Retry'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <button 
                onClick={() => setShowAllFailedModal(false)}
                style={{ marginTop: '20px', width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Close Logs
              </button>
            </div>
          </div>
        )}

        {/* 2. View All Withdrawal Requests Modal */}
        {showAllRequestsModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px'
          }} onClick={() => setShowAllRequestsModal(false)}>
            <div style={{
              background: 'var(--bg-surface)',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '600px',
              padding: '24px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
              textAlign: 'start',
              position: 'relative',
              maxHeight: '80vh',
              overflowY: 'auto'
            }} onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => setShowAllRequestsModal(false)}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--text-muted)' }}
              >
                ×
              </button>
              
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                All Payout Requests
              </h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Approve or reject pending payouts from craftsmen balance.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {withdrawalRequests.map(req => {
                  const isPending = req.status === 'pending';
                  return (
                    <div 
                      key={req.id} 
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px',
                        borderRadius: '8px',
                        background: 'var(--bg-surface-hover)',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      <div>
                        <strong style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{req.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{req.bank} · {req.timeAgo}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{req.amount.toLocaleString()} ILS</strong>
                        {isPending ? (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => onReject(req.id)}
                              style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            >
                              <X size={12} />
                            </button>
                            <button
                              onClick={() => onApprove(req.id)}
                              style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            >
                              <Check size={12} />
                            </button>
                          </div>
                        ) : (
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '4px 8px',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            background: req.status === 'approved' ? '#f0fdf4' : '#fef2f2',
                            color: req.status === 'approved' ? '#15803d' : '#b91c1c'
                          }}>
                            {req.status}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={() => setShowAllRequestsModal(false)}
                style={{ marginTop: '20px', width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e4e4e7', background: '#ffffff', color: '#171717', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Close Requests
              </button>
            </div>
          </div>
        )}
          {/* Create Subscription Plan Modal */}
          {showCreatePlanModal && (
            <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
              <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '440px', width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', position: 'relative' }}>
                <button onClick={() => setShowCreatePlanModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'transparent', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: 700, color: '#171717' }}>Create Subscription Plan</h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#71717a' }}>Add a new dynamic pricing plan for your platform.</p>
                <form onSubmit={handleCreatePlan} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', color: '#171717' }}>Plan Name (e.g. VIP / Business)</label>
                    <input type="text" value={newPlanName} onChange={e => setNewPlanName(e.target.value)} required placeholder="VIP Plan" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e4e4e7' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', color: '#171717' }}>Monthly Price (ILS)</label>
                    <input type="number" value={newPlanPrice} onChange={e => setNewPlanPrice(Number(e.target.value))} required min="0" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e4e4e7' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
                    <button type="button" onClick={() => setShowCreatePlanModal(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e4e4e7', background: '#fff', cursor: 'pointer' }}>Cancel</button>
                    <button type="submit" style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'var(--color-primary)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Create Plan</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Subscribers Inspector Modal */}
          {showSubscribersModal && (
            <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
              <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '640px', width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', position: 'relative', maxHeight: '85vh', overflowY: 'auto' }}>
                <button onClick={() => setShowSubscribersModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'transparent', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: 700, color: '#171717' }}>Active Subscribers Directory</h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#71717a' }}>Inspect and manage active customer & craftsman subscriptions.</p>
                {subscribersLoading ? (
                  <p style={{ color: '#71717a' }}>Loading subscribers...</p>
                ) : subscribersList.length === 0 ? (
                  <p style={{ color: '#71717a' }}>No active subscribers found.</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e4e4e7', textAlign: 'left' }}>
                        <th style={{ padding: '8px', color: '#71717a' }}>User</th>
                        <th style={{ padding: '8px', color: '#71717a' }}>Plan</th>
                        <th style={{ padding: '8px', color: '#71717a' }}>Cycle</th>
                        <th style={{ padding: '8px', color: '#71717a' }}>Status</th>
                        <th style={{ padding: '8px', color: '#71717a', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribersList.map((sub: any) => (
                        <tr key={sub.id} style={{ borderBottom: '1px solid #f4f4f5' }}>
                          <td style={{ padding: '8px' }}>
                            <strong style={{ display: 'block', color: '#171717' }}>{sub.user?.firstName || 'User'} {sub.user?.lastName || ''}</strong>
                            <span style={{ fontSize: '0.75rem', color: '#71717a' }}>{sub.user?.phoneNumber || sub.user?.email || 'N/A'}</span>
                          </td>
                          <td style={{ padding: '8px' }}><span style={{ padding: '2px 6px', background: '#eff6ff', color: '#1d4ed8', borderRadius: '4px', fontWeight: 600 }}>{sub.plan}</span></td>
                          <td style={{ padding: '8px', color: '#171717' }}>{sub.billingCycle}</td>
                          <td style={{ padding: '8px' }}><span style={{ color: sub.status === 'ACTIVE' ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{sub.status}</span></td>
                          <td style={{ padding: '8px', textAlign: 'right', display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                            <button onClick={() => handleExtendSubscriber(sub.id)} style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #e4e4e7', background: '#f4f4f5', color: '#171717', cursor: 'pointer' }}>+30 Days</button>
                            <button onClick={() => handleCancelSubscriber(sub.id)} style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px', border: 'none', background: '#fee2e2', color: '#dc2626', cursor: 'pointer' }}>Cancel</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

      </main>

      <MobileBottomTabs />

      <style>{`
        /* ── Page Layout ── */
        .payments-page-body {
          display: flex;
          flex-direction: column;
          gap: 0;
          text-align: start;
        }

        .payments-page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 16px;
        }

        .payments-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .payments-page-title {
          font-size: 1.8rem;
          font-weight: 700;
          font-family: var(--font-title);
          color: var(--text-primary);
          letter-spacing: -0.02em;
          margin: 0;
        }

        .payments-page-subtitle {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin: 0;
        }

        .payments-header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        /* ── Time filter pills ── */
        .time-filter-pills {
          display: flex;
          background: #F5F5F5;
          border-radius: 8px;
          padding: 2px;
          border: 1px solid #E5E5E5;
        }

        .time-filter-pill {
          padding: 6px 12px;
          font-size: 10px;
          font-weight: 700;
          color: #737373;
          background: transparent;
          border: none;
          cursor: pointer;
          border-radius: 6px;
          transition: all var(--transition-fast);
        }

        .time-filter-pill.active {
          background: #FFFFFF;
          color: #171717;
          box-shadow: 0px 1px 2px rgba(0,0,0,0.05);
        }

        .payments-export-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: #171717;
          color: #FFFFFF;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: background var(--transition-fast);
        }

        .payments-export-btn:hover {
          background: #404040;
        }

        /* ── Content Layout ── */
        .payments-content-layout {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .payments-overview-section,
        .payments-payouts-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* ── Metrics Grid ── */
        .payments-metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .payments-metric-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          box-shadow: 0px 1px 1.5px rgba(0,0,0,0.2);
          text-align: start;
        }

        .payments-metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .payments-metric-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .payments-metric-trend {
          font-size: 10px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          padding: 2px 6px;
          border-radius: 10px;
        }

        .payments-metric-trend.green {
          color: #4ade80;
          background: rgba(34, 197, 94, 0.15);
        }

        .payments-metric-value {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.1;
        }

        .payments-metric-subtitle {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        /* ── Mid Section Split ── */
        .payments-mid-split {
          display: flex;
          gap: 16px;
        }

        .payments-chart-card {
          flex: 2;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-shadow: 0px 1px 2px rgba(0,0,0,0.2);
        }

        .payments-chart-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .payments-chart-title-area {
          display: flex;
          flex-direction: column;
          gap: 4px;
          text-align: start;
        }

        .payments-chart-headline {
          font-size: 32px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.1;
        }

        .payments-chart-subtitle {
          font-size: 11px;
          color: var(--text-muted);
        }

        .payments-chart-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 20px;
          border: 1px solid var(--border-color);
          font-size: 10px;
          font-weight: 700;
          color: #38bdf8;
          background: rgba(56, 189, 248, 0.1);
        }

        .payments-chart-body {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .payments-line-chart-svg {
          width: 100%;
          overflow: visible;
        }

        .payments-chart-x-axis {
          display: flex;
          justify-content: space-between;
          padding: 0 10px;
          font-size: 10px;
          color: var(--text-muted);
          font-weight: 600;
        }

        .payments-plans-card {
          flex: 1;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-shadow: 0px 1px 2px rgba(0,0,0,0.2);
          box-sizing: border-box;
        }

        .payments-plans-header {
          display: flex;
          flex-direction: column;
          gap: 6px;
          text-align: start;
        }

        .payments-plans-card-title {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .payments-plans-mrr {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .payments-plans-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .payments-plan-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .payments-plan-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
        }

        .payments-plan-name {
          font-weight: 700;
          color: var(--text-primary);
        }

        .payments-plan-price {
          font-weight: 500;
          color: var(--text-muted);
        }

        .payments-plan-count {
          color: var(--text-primary);
          font-weight: 700;
        }

        .payments-plan-track {
          height: 6px;
          background: var(--bg-surface-hover);
          border-radius: 3px;
          overflow: hidden;
          width: 100%;
        }

        .payments-plan-bar {
          height: 100%;
          background: #38bdf8;
          border-radius: 3px;
        }

        /* ── Bottom Section Split ── */
        .payments-bottom-split {
          display: flex;
          gap: 16px;
        }

        .payments-failed-card {
          flex: 2;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-shadow: 0px 1px 2px rgba(0,0,0,0.2);
          overflow: hidden;
        }

        .payments-failed-header, .payments-withdrawals-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .payments-failed-header-left, .payments-withdrawals-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
          text-align: start;
        }

        .payments-failed-title, .payments-withdrawals-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .payments-failed-count, .payments-withdrawals-count {
          font-size: 11px;
          color: var(--text-muted);
        }

        .payments-view-all-btn {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-primary);
          background: var(--bg-surface-hover);
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid var(--border-color);
          cursor: pointer;
        }

        .payments-view-all-btn:hover {
          background: var(--border-color);
        }

        .payments-failed-table-wrapper {
          overflow-x: auto;
          width: 100%;
        }

        .payments-failed-table {
          width: 100%;
          border-collapse: collapse;
          text-align: start;
        }

        .payments-failed-table th {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 8px 12px;
          border-bottom: 1px solid var(--border-color);
          text-align: start;
        }

        .payments-failed-table td {
          padding: 14px 12px;
          border-bottom: 1px solid var(--border-color);
          font-size: 12px;
          vertical-align: middle;
          text-align: start;
        }

        .failed-tx-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .failed-tx-name {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .failed-tx-meta {
          font-size: 10px;
          color: var(--text-muted);
        }

        .failed-tx-amount {
          font-weight: 700;
          color: var(--text-primary);
        }

        .failed-tx-reason {
          color: #ef4444;
          font-weight: 600;
        }

        .failed-tx-retries {
          color: var(--text-muted);
          font-weight: 700;
        }

        .failed-tx-retry-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          background: var(--bg-surface-hover);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 10px;
          font-weight: 700;
          color: var(--text-primary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .failed-tx-retry-btn:hover {
          background: var(--border-color);
        }

        .failed-tx-retry-btn.retrying {
          background: var(--bg-surface-hover);
          color: var(--text-muted);
          cursor: not-allowed;
        }

        .payments-withdrawals-card {
          flex: 1;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-shadow: 0px 1px 2px rgba(0,0,0,0.2);
          box-sizing: border-box;
        }

        .payments-withdrawals-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .withdrawal-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          background: var(--bg-surface-hover);
          box-sizing: border-box;
          transition: border-color var(--transition-fast);
        }

        .withdrawal-item:hover {
          border-color: #38bdf8;
        }

        .withdrawal-item-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          flex: 1;
        }

        .withdrawal-avatar-placeholder {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #E5E5E5;
          flex-shrink: 0;
        }

        .withdrawal-user-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
          text-align: start;
        }

        .withdrawal-user-name {
          font-size: 13px;
          font-weight: 700;
          color: #171717;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .withdrawal-user-meta {
          font-size: 10px;
          color: #8E8E93;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .withdrawal-item-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .withdrawal-amount {
          font-size: 13px;
          font-weight: 700;
          color: #171717;
        }

        .withdrawal-actions {
          display: flex;
          gap: 4px;
        }

        .withdrawal-btn {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          transition: background var(--transition-fast);
        }

        .withdrawal-btn.btn-reject {
          background: #FEF2F2;
          color: #B91C1C;
        }

        .withdrawal-btn.btn-reject:hover {
          background: #FEE2E2;
        }

        .withdrawal-btn.btn-approve {
          background: #F0FDF4;
          color: #16A34A;
        }

        .withdrawal-btn.btn-approve:hover {
          background: #DCFCE7;
        }

        .withdrawal-status-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 6px;
          text-transform: uppercase;
        }

        .withdrawal-status-badge.approved {
          background: #F0FDF4;
          color: #15803D;
        }

        .withdrawal-status-badge.rejected {
          background: #FEF2F2;
          color: #B91C1C;
        }

        .payments-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px 12px;
          text-align: center;
        }

        /* Duplicate mobile header styles removed (defined in global.css) */

        /* ── Mobile Toggles & View Routing ── */
        .mobile-section-toggles {
          display: flex;
          background: #F5F5F5;
          border-radius: 9999px;
          padding: 2px;
          width: 100%;
          box-sizing: border-box;
          margin-bottom: 12px;
        }

        .mobile-section-toggle-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 29.5px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 700;
          color: #737373;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .mobile-section-toggle-btn.active {
          background: #FFFFFF;
          color: #171717;
          box-shadow: 0px 1px 1.5px rgba(0,0,0,0.05);
        }

        /* ── Responsive Tablet Layout (769px - 1024px) ── */
        @media (min-width: 769px) and (max-width: 1024px) {
          .payments-metrics-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
          .payments-mid-split, .payments-bottom-split {
            flex-direction: column !important;
            gap: 16px !important;
          }
          .payments-mid-split > div, .payments-bottom-split > div {
            width: 100% !important;
            flex: none !important;
          }
          .payments-plans-card, .payments-withdrawals-card {
            max-width: none !important;
          }
        }

        /* ── Responsive Mobile Layout (max-width: 768px) ── */
        @media (max-width: 768px) {
          .main-content {
            margin-inline-start: 0 !important;
            padding-top: 0 !important;
            padding-bottom: 96px !important;
            padding-inline-start: 0 !important;
            padding-inline-end: 0 !important;
          }

          .payments-page-body {
            padding: 20px !important;
            gap: 12px !important;
          }

          .payments-overview-section,
          .payments-payouts-section {
            gap: 12px !important;
          }

          .payments-metrics-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }

          .payments-metric-card {
            padding: 16px !important;
          }

          .payments-metric-value {
            font-size: 20px !important;
          }

          .payments-mid-split, .payments-bottom-split {
            flex-direction: column !important;
            gap: 12px !important;
          }

          .payments-chart-card,
          .payments-plans-card,
          .payments-failed-card,
          .payments-withdrawals-card {
            padding: 16px !important;
            border-radius: 16px !important;
            flex: none !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }

          .payments-chart-headline {
            font-size: 24px !important;
          }

          .payments-failed-table th:nth-child(4),
          .payments-failed-table td:nth-child(4) {
            display: none !important; /* Hide retries count on mobile to fit screen */
          }

          /* Mobile display section control */
          .mobile-hidden {
            display: none !important;
          }
          .mobile-visible-block {
            display: block !important;
          }
          .mobile-visible-flex {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentsPage;
