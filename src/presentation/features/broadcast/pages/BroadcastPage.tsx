import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Sidebar } from '../../../../presentation/layouts/Sidebar';
import { Header } from '../../../../presentation/layouts/Header';
import { MobileBottomTabs } from '../../../../presentation/layouts/MobileBottomTabs';
import { useBroadcast } from '../hooks/useBroadcast';
import {
  Send,
  Eye,
  Calendar,
  Clock,
  Search,
  Trash2,
  Bell,
  Smartphone,
  Mail,
  Users,
  Image as ImageIcon,
  Link as LinkIcon,
  TrendingUp,
  Download,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';


export const BroadcastPage: React.FC = () => {
  const { t } = useLanguage();
  const {
    loading,
    error,
    kpis,
    title,
    setTitle,
    message,
    setMessage,
    imageUrl,
    setImageUrl,
    deepLink,
    setDeepLink,
    targetCity,
    setTargetCity,
    channels,
    setChannels,
    audience,
    setAudience,
    schedule,
    setSchedule,
    date,
    setDate,
    time,
    setTime,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    campaigns,
    audienceInfo,
    channelsText,
    scheduleText,
    estSmsCost,
    addCampaign,
    deleteCampaign,
  } = useBroadcast();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<'overview' | 'compose' | 'history'>('compose');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Toggle Channels
  const handleToggleChannel = (channel: string) => {
    if (channels.includes(channel)) {
      setChannels(channels.filter(c => c !== channel));
    } else {
      setChannels([...channels, channel]);
    }
  };

  // Toast Notification trigger helper
  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 3000);
  };

  // Submissions
  const handleSendNow = async () => {
    const success = await addCampaign();
    if (success) {
      triggerToast('Broadcast sent successfully!');
    }
  };

  const handleSaveDraft = async () => {
    const success = await addCampaign('Draft');
    if (success) {
      triggerToast('Broadcast saved as draft!');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Campaign Title', 'Audience', 'Status', 'Send Date', 'Recipients', 'Open Rate'];
    const rows = campaigns.map(c => [
      `"${c.title.replace(/"/g, '""')}"`,
      `"${c.audience.replace(/"/g, '""')}"`,
      c.status,
      `"${c.sendDate.replace(/"/g, '""')}"`,
      c.recipients,
      c.openRate
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `broadcast_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('CSV Exported successfully!');
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
                fontFamily: 'inherit',
              }}
            >
              <div className="mobile-logo">A</div>
              <div className="mobile-logo-text">
                <strong>Arox</strong>
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
          <h2>{t('nav_broadcast') || 'Broadcast'}</h2>
          <span>{t('broadcast_subtitle') || 'Compose and schedule notifications'}</span>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="toast-notification animate-fade-in">
            <CheckCircle size={18} />
            <span>{successToast}</span>
          </div>
        )}

        <div className="broadcast-page-body">
          {/* Desktop/Tablet Header */}
          <div className="desktop-tablet-page-header desktop-tablet-only">
            <div style={{ textAlign: 'start' }}>
              <h1 className="broadcast-page-title" style={{ margin: 0 }}>
                {t('broadcast_title') || 'Broadcast'}
              </h1>
              <p className="broadcast-page-subtitle" style={{ margin: '4px 0 0 0' }}>
                {t('broadcast_subtitle') || 'Compose and schedule notifications'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button className="secondary-action-btn" onClick={handleSaveDraft}>
                <Eye size={14} />
                <span>{t('btn_save_draft') || 'Preview & Draft'}</span>
              </button>
              <button className="primary-action-btn" onClick={handleSendNow}>
                <Send size={14} />
                <span>{t('btn_send_now') || 'Send now'}</span>
              </button>
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
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading broadcasts...</p>
            </div>
          ) : (
            <>
              {/* Mobile Navigation Toggle Pills */}
          <div className="mobile-section-toggles mobile-only">
            <button
              className={`mobile-section-toggle-btn ${mobileSection === 'overview' ? 'active' : ''}`}
              onClick={() => setMobileSection('overview')}
            >
              {t('tab_overview') || 'Overview'}
            </button>
            <button
              className={`mobile-section-toggle-btn ${mobileSection === 'compose' ? 'active' : ''}`}
              onClick={() => setMobileSection('compose')}
            >
              {t('tab_compose') || 'New Campaign'}
            </button>
            <button
              className={`mobile-section-toggle-btn ${mobileSection === 'history' ? 'active' : ''}`}
              onClick={() => setMobileSection('history')}
            >
              {t('tab_history') || 'History'}
            </button>
          </div>

          {/* Form Error Banner */}
          {error && (
            <div className="glass-card status-danger animate-fade-in" style={{ padding: 'var(--spacing-md)' }}>
              <span>{error}</span>
            </div>
          )}

          {/* 1. KPIs Section */}
          <div className={`broadcast-kpis-grid ${mobileSection !== 'overview' ? 'mobile-hidden' : 'mobile-visible-grid'}`}>
            <div className="broadcast-kpi-card glass-card">
              <div className="kpi-icon-wrapper">
                <Send size={16} />
              </div>
              <span className="kpi-label">{t('broadcast_total_sent') || 'Total sent · 30d'}</span>
              <strong className="kpi-value">{kpis.totalSent}</strong>
              <span className="kpi-sub positive-trend">
                <TrendingUp size={10} /> +18% vs prev
              </span>
            </div>

            <div className="broadcast-kpi-card glass-card">
              <div className="kpi-icon-wrapper">
                <Calendar size={16} />
              </div>
              <span className="kpi-label">{t('broadcast_scheduled') || 'Scheduled'}</span>
              <strong className="kpi-value">{kpis.scheduled}</strong>
              <span className="kpi-sub">{kpis.scheduledSub}</span>
            </div>

            <div className="broadcast-kpi-card glass-card">
              <div className="kpi-icon-wrapper">
                <Eye size={16} />
              </div>
              <span className="kpi-label">{t('broadcast_avg_open_rate') || 'Avg open rate'}</span>
              <strong className="kpi-value">{kpis.avgOpenRate}</strong>
              <span className="kpi-sub positive-trend">
                <TrendingUp size={10} /> +4 pt this month
              </span>
            </div>

            <div className="broadcast-kpi-card glass-card">
              <div className="kpi-icon-wrapper">
                <Users size={16} />
              </div>
              <span className="kpi-label">{t('broadcast_total_reach') || 'Total reach'}</span>
              <strong className="kpi-value">{kpis.totalReach}</strong>
              <span className="kpi-sub">Across all channels</span>
            </div>
          </div>

          {/* 2. Form & Preview Row */}
          <div className={`broadcast-main-row ${mobileSection !== 'compose' ? 'mobile-hidden' : 'mobile-visible-flex'}`}>
            {/* Form Section */}
            <div className="broadcast-form-container glass-card">
              <div className="card-header-with-action">
                <div style={{ textAlign: 'start' }}>
                  <h3 className="card-section-title">{t('broadcast_new_broadcast') || 'New broadcast'}</h3>
                  <p className="card-section-subtitle">{t('broadcast_compose_subtitle') || 'Compose your message, choose target channels, and schedule delivery.'}</p>
                </div>
                <button className="text-action-btn" onClick={handleSaveDraft}>Save draft</button>
              </div>

              {/* Title Input */}
              <div className="form-group">
                <div className="form-label-row">
                  <label htmlFor="broadcast-title">Title</label>
                  <span className="character-counter">{title.length}/80</span>
                </div>
                <input
                  id="broadcast-title"
                  type="text"
                  className="form-input-field"
                  placeholder="Enter notification title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, 80))}
                />
              </div>

              {/* Message Input */}
              <div className="form-group">
                <div className="form-label-row">
                  <label htmlFor="broadcast-message">Message</label>
                  <span className="character-counter">{message.length}/240</span>
                </div>
                <textarea
                  id="broadcast-message"
                  className="form-textarea-field"
                  placeholder="Type notification message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 240))}
                  rows={4}
                />
              </div>

              {/* Rich Push Options: Image URL & Deep-Link URI */}
              <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label htmlFor="broadcast-image-url" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    <ImageIcon size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    Rich Image Banner URL (Optional)
                  </label>
                  <input
                    id="broadcast-image-url"
                    type="text"
                    className="form-input-field"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="broadcast-deeplink" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    <LinkIcon size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    App Screen Deep-Link URI (Optional)
                  </label>
                  <input
                    id="broadcast-deeplink"
                    type="text"
                    className="form-input-field"
                    placeholder="sonaa://offers or sonaa://category/PLUMBER"
                    value={deepLink}
                    onChange={(e) => setDeepLink(e.target.value)}
                  />
                </div>
              </div>

              {/* Target City Selector */}
              <div className="form-group">
                <label className="form-section-label">Target City (Palestine Region)</label>
                <select
                  className="form-input-field"
                  value={targetCity}
                  onChange={(e) => setTargetCity(e.target.value)}
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderRadius: '8px', padding: '10px 14px' }}
                >
                  <option value="All">All Palestine Cities (جميع المدن)</option>
                  <option value="Jerusalem">Jerusalem (القدس)</option>
                  <option value="Ramallah">Ramallah (رام الله)</option>
                  <option value="Bethlehem">Bethlehem (بيت لحم)</option>
                  <option value="Hebron">Hebron (الخليل)</option>
                  <option value="Nablus">Nablus (نابلس)</option>
                  <option value="Jericho">Jericho (أريحا)</option>
                  <option value="Jenin">Jenin (جنين)</option>
                  <option value="Tulkarm">Tulkarm (طولكرم)</option>
                  <option value="Qalqilya">Qalqilya (قلقيلية)</option>
                  <option value="Gaza">Gaza (غزة)</option>
                </select>
              </div>

              {/* Channels Selector */}
              <div className="form-group">
                <label className="form-section-label">Channels</label>
                <div className="selection-cards-grid">
                  <button
                    className={`selector-card ${channels.includes('push') ? 'active' : ''}`}
                    onClick={() => handleToggleChannel('push')}
                  >
                    <div className="selector-card-top">
                      <Smartphone size={16} />
                      <div className="custom-checkbox"><div className="checkmark" /></div>
                    </div>
                    <strong>Push</strong>
                    <span>Instant</span>
                  </button>

                  <button
                    className={`selector-card ${channels.includes('sms') ? 'active' : ''}`}
                    onClick={() => handleToggleChannel('sms')}
                  >
                    <div className="selector-card-top">
                      <Send size={16} />
                      <div className="custom-checkbox"><div className="checkmark" /></div>
                    </div>
                    <strong>SMS</strong>
                    <span>₪ 0.05/msg</span>
                  </button>

                  <button
                    className={`selector-card ${channels.includes('email') ? 'active' : ''}`}
                    onClick={() => handleToggleChannel('email')}
                  >
                    <div className="selector-card-top">
                      <Mail size={16} />
                      <div className="custom-checkbox"><div className="checkmark" /></div>
                    </div>
                    <strong>Email</strong>
                    <span>High open rate</span>
                  </button>
                </div>
              </div>

              {/* Target Audience Selector */}
              <div className="form-group">
                <label className="form-section-label">Target audience</label>
                <div className="selection-cards-grid">
                  <button
                    className={`selector-card audience-card ${audience === 'all' ? 'active' : ''}`}
                    onClick={() => setAudience('all')}
                  >
                    <strong>All users</strong>
                    <span>All active accounts</span>
                  </button>

                  <button
                    className={`selector-card audience-card ${audience === 'customers' ? 'active' : ''}`}
                    onClick={() => setAudience('customers')}
                  >
                    <strong>Customers only</strong>
                    <span>Customer accounts</span>
                  </button>

                  <button
                    className={`selector-card audience-card ${audience === 'craftsmen' ? 'active' : ''}`}
                    onClick={() => setAudience('craftsmen')}
                  >
                    <strong>Craftsmen only</strong>
                    <span>Verified technicians</span>
                  </button>

                  <button
                    className={`selector-card audience-card ${audience === 'region' ? 'active' : ''}`}
                    onClick={() => setAudience('region')}
                  >
                    <strong>By region</strong>
                    <span>Pick zones</span>
                  </button>

                  <button
                    className={`selector-card audience-card ${audience === 'custom' ? 'active' : ''}`}
                    onClick={() => setAudience('custom')}
                  >
                    <strong>Custom segment</strong>
                    <span>New filter</span>
                  </button>
                </div>
              </div>

              {/* Schedule Selector */}
              <div className="form-group">
                <label className="form-section-label">Schedule</label>
                <div className="selection-cards-grid text-cards">
                  <button
                    className={`selector-card text-selector-card ${schedule === 'once' ? 'active' : ''}`}
                    onClick={() => setSchedule('once')}
                  >
                    <strong>Send once</strong>
                    <span>Deliver immediately</span>
                  </button>

                  <button
                    className={`selector-card text-selector-card ${schedule === 'daily' ? 'active' : ''}`}
                    onClick={() => setSchedule('daily')}
                  >
                    <strong>Daily</strong>
                    <span>Every day at 9 AM</span>
                  </button>

                  <button
                    className={`selector-card text-selector-card ${schedule === 'weekly' ? 'active' : ''}`}
                    onClick={() => setSchedule('weekly')}
                  >
                    <strong>Weekly</strong>
                    <span>Every Monday at 10 AM</span>
                  </button>

                  <button
                    className={`selector-card text-selector-card ${schedule === 'monthly' ? 'active' : ''}`}
                    onClick={() => setSchedule('monthly')}
                  >
                    <strong>Monthly</strong>
                    <span>1st of every month</span>
                  </button>

                  <button
                    className={`selector-card text-selector-card ${schedule === 'custom' ? 'active' : ''}`}
                    onClick={() => setSchedule('custom')}
                  >
                    <strong>Custom</strong>
                    <span>Pick date and time</span>
                  </button>
                </div>

                {/* Custom Scheduler inputs */}
                {schedule === 'custom' && (
                  <div className="scheduler-settings-box animate-fade-in">
                    <div className="scheduler-fields-row">
                      <div className="scheduler-field">
                        <label htmlFor="schedule-date">Date</label>
                        <div className="field-input-wrapper">
                          <Calendar size={14} />
                          <input
                            id="schedule-date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="scheduler-field">
                        <label htmlFor="schedule-time">Time</label>
                        <div className="field-input-wrapper">
                          <Clock size={14} />
                          <input
                            id="schedule-time"
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="scheduler-field flex-grow-2">
                        <label>Timezone</label>
                        <div className="timezone-badge">
                          <span>Jerusalem (Palestine) · GMT+3</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sticky Preview & Delivery summary Column */}
            <div className="broadcast-preview-column">
              {/* iPhone Mockup card */}
              <div className="preview-card glass-card">
                <div className="preview-header-row">
                  <span className="preview-label">Preview</span>
                  <span className="device-tag">Android Push Notification</span>
                </div>

                <div className="ios-notification-mockup">
                  <div className="notification-card" style={{ padding: '14px' }}>
                    <div className="notification-top">
                      <div className="app-icon-badge">S</div>
                      <span className="app-name">SONAA • صناع</span>
                      <span className="time-tag">Just now</span>
                    </div>
                    <div className="notification-content" style={{ marginTop: '8px' }}>
                      <strong className="notification-title">{title || 'Welcome offer · 20% off your first task'}</strong>
                      <p className="notification-body" style={{ margin: '4px 0 0 0' }}>{message || 'Get started on Sonaa in Jerusalem with 20% off your first task.'}</p>
                      
                      {imageUrl && (
                        <div style={{ marginTop: '10px', borderRadius: '8px', overflow: 'hidden', maxHeight: '120px' }}>
                          <img src={imageUrl} alt="Notification Attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}

                      {deepLink && (
                        <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <LinkIcon size={12} />
                          <span>Action: {deepLink}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Summary card */}
              <div className="summary-card glass-card">
                <h4 className="summary-title">Delivery summary</h4>
                <div className="summary-list">
                  <div className="summary-item">
                    <span className="summary-label">Audience</span>
                    <strong className="summary-value">{audienceInfo.name}</strong>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Recipients</span>
                    <strong className="summary-value">{audienceInfo.count}</strong>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Channels</span>
                    <strong className="summary-value" style={{ textTransform: 'capitalize' }}>{channelsText}</strong>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Schedule</span>
                    <strong className="summary-value">{scheduleText}</strong>
                  </div>
                  <div className="summary-divider" />
                  <div className="summary-item total-row">
                    <span className="summary-label">Est. SMS cost</span>
                    <strong className="summary-value highlight">{estSmsCost}</strong>
                  </div>
                </div>

                <button
                  className="full-width-send-btn"
                  onClick={handleSendNow}
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send now'}
                </button>
              </div>
            </div>
          </div>

          {/* 3. Broadcast History Table */}
          <div className={`history-card glass-card ${mobileSection !== 'history' ? 'mobile-hidden' : 'mobile-visible-block'}`}>
            <div className="history-header">
              <div style={{ textAlign: 'start' }}>
                <h3 className="card-section-title">{t('broadcast_history') || 'Broadcast history'}</h3>
                <p className="card-section-subtitle">Past, scheduled, and recurring notifications</p>
              </div>

              <div className="history-filters-row">
                {/* Search field */}
                <div className="history-search-input-wrapper">
                  <Search size={14} className="search-field-icon" />
                  <input
                    type="text"
                    placeholder="Search campaigns..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Status Dropdown */}
                <select
                  className="history-status-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All status</option>
                  <option value="sent">Sent</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="draft">Draft</option>
                  <option value="failed">Failed</option>
                </select>

                <button className="history-export-btn" onClick={handleExportCSV}>
                  <Download size={14} />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Campaigns Table */}
            <div className="table-responsive-wrapper">
              <table className="broadcast-history-table">
                <thead>
                  <tr>
                    <th>Campaign</th>
                    <th>Audience</th>
                    <th>Status</th>
                    <th>Send date</th>
                    <th>Recipients</th>
                    <th>Open rate</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-disabled)' }}>
                        No records match the current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    campaigns.map((record) => (
                      <tr key={record.id} className="table-row-animate">
                        <td>
                          <strong className="campaign-table-title">{record.title}</strong>
                        </td>
                        <td>
                          <span className="audience-table-value">{record.audience}</span>
                        </td>
                        <td>
                          <span className={`status-badge-tag status-${record.status.toLowerCase()}`}>
                            {record.status}
                          </span>
                        </td>
                        <td>
                          <span className="date-table-value">{record.sendDate}</span>
                        </td>
                        <td>
                          <span className="count-table-value">{record.recipients}</span>
                        </td>
                        <td>
                          <span className="rate-table-value">{record.openRate}</span>
                        </td>
                        <td>
                          <button
                            className="table-delete-action-btn"
                            onClick={() => {
                              deleteCampaign(record.id);
                              triggerToast('Campaign record removed.');
                            }}
                            title="Delete campaign"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          </>
          )}
        </div>

        <style>{`
          .broadcast-page-body {
            display: flex;
            flex-direction: column;
            gap: 24px;
            text-align: start;
          }

          /* Toast style */
          .toast-notification {
            position: fixed;
            top: 24px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--color-success, #22c55e);
            color: white;
            padding: 12px 24px;
            border-radius: var(--border-radius-md, 8px);
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            font-size: 0.9rem;
            font-weight: 600;
          }

          /* KPI styling */
          .broadcast-kpis-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
          }

          .broadcast-kpi-card {
            background: var(--bg-surface, #fff);
            border: 1px solid var(--border-color, #e5e7eb);
            border-radius: var(--border-radius-lg, 12px);
            padding: 20px;
            display: flex;
            flex-direction: column;
            text-align: start;
            box-shadow: var(--glass-shadow);
            transition: var(--transition-fast, 0.2s);
          }

          .broadcast-kpi-card:hover {
            transform: translateY(-2px);
            border-color: var(--text-primary, #111827);
          }

          .kpi-icon-wrapper {
            width: 32px;
            height: 32px;
            border-radius: var(--border-radius-sm, 6px);
            background: var(--bg-surface-hover, #f3f4f6);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-primary, #111827);
            margin-bottom: 12px;
          }

          .kpi-label {
            font-size: 10px;
            font-weight: 700;
            color: var(--text-muted, #6b7280);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }

          .kpi-value {
            font-size: 24px;
            font-weight: 700;
            color: var(--text-primary, #111827);
            line-height: 1.2;
            margin-bottom: 4px;
          }

          .kpi-sub {
            font-size: 10px;
            color: var(--text-disabled, #9ca3af);
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .positive-trend {
            color: var(--color-success, #22c55e);
            font-weight: 600;
          }

          /* Two-column layout */
          .broadcast-main-row {
            display: flex;
            gap: 16px;
            align-items: flex-start;
          }

          .broadcast-form-container {
            flex: 3;
            background: var(--bg-surface, #fff);
            border: 1px solid var(--border-color, #e5e7eb);
            border-radius: var(--border-radius-lg, 12px);
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .card-header-with-action {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 1px solid var(--border-color, #e5e7eb);
            padding-bottom: 16px;
          }

          .card-section-title {
            font-size: 16px;
            font-weight: 700;
            color: var(--text-primary, #111827);
            margin: 0;
          }

          .card-section-subtitle {
            font-size: 12px;
            color: var(--text-muted, #6b7280);
            margin: 2px 0 0 0;
          }

          .text-action-btn {
            background: transparent;
            border: none;
            color: var(--color-primary, #aa3bff);
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 4px;
            transition: background 0.15s;
          }

          .text-action-btn:hover {
            background: var(--bg-surface-hover, #f3f4f6);
          }

          .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .form-label-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .form-label-row label {
            font-size: 12px;
            font-weight: 700;
            color: var(--text-primary, #111827);
          }

          .character-counter {
            font-size: 10px;
            color: var(--text-disabled, #9ca3af);
            font-weight: 500;
          }

          .form-input-field {
            padding: 10px 14px;
            border-radius: var(--border-radius-sm, 6px);
            border: 1px solid var(--border-color, #e5e7eb);
            background: var(--bg-base, #fff);
            color: var(--text-primary, #111827);
            font-family: inherit;
            font-size: 13px;
            outline: none;
            transition: border-color 0.15s;
          }

          .form-input-field:focus {
            border-color: var(--color-primary, #aa3bff);
          }

          .form-textarea-field {
            padding: 10px 14px;
            border-radius: var(--border-radius-sm, 6px);
            border: 1px solid var(--border-color, #e5e7eb);
            background: var(--bg-base, #fff);
            color: var(--text-primary, #111827);
            font-family: inherit;
            font-size: 13px;
            outline: none;
            resize: vertical;
            transition: border-color 0.15s;
          }

          .form-textarea-field:focus {
            border-color: var(--color-primary, #aa3bff);
          }

          .form-actions-row {
            display: flex;
            gap: 8px;
            margin-top: 4px;
          }

          .icon-helper-btn {
            background: var(--bg-surface-hover, #f3f4f6);
            border: 1px solid var(--border-color, #e5e7eb);
            border-radius: var(--border-radius-xs, 4px);
            padding: 6px 12px;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 11px;
            font-weight: 600;
            color: var(--text-secondary, #475569);
            cursor: pointer;
            transition: border-color 0.15s;
          }

          .icon-helper-btn:hover {
            border-color: var(--text-muted, #6b7280);
            color: var(--text-primary, #111827);
          }

          .form-section-label {
            font-size: 12px;
            font-weight: 700;
            color: var(--text-muted, #6b7280);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }

          /* Selection grid card selector styles */
          .selection-cards-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
          }

          .selector-card {
            background: var(--bg-base, #fff);
            border: 1px solid var(--border-color, #e5e7eb);
            border-radius: var(--border-radius-md, 8px);
            padding: 16px;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            text-align: start;
            cursor: pointer;
            transition: border-color var(--transition-fast, 0.2s), box-shadow var(--transition-fast, 0.2s);
            position: relative;
            outline: none;
          }

          .selector-card:hover {
            border-color: var(--text-muted, #6b7280);
          }

          .selector-card.active {
            border-color: var(--text-primary, #111827);
            background: var(--bg-surface-hover, #f8fafc);
            box-shadow: 0 0 0 1px var(--text-primary, #111827);
          }

          .selector-card-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            margin-bottom: 12px;
            color: var(--text-primary, #111827);
          }

          .custom-checkbox {
            width: 16px;
            height: 16px;
            border-radius: var(--border-radius-xs, 4px);
            border: 1.5px solid var(--border-color, #cbd5e1);
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
          }

          .selector-card.active .custom-checkbox {
            background: var(--text-primary, #111827);
            border-color: var(--text-primary, #111827);
          }

          .selector-card.active .checkmark {
            width: 5px;
            height: 8px;
            border: solid white;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
            margin-bottom: 2px;
          }

          .selector-card strong {
            font-size: 13px;
            font-weight: 700;
            color: var(--text-primary, #111827);
            margin-bottom: 4px;
          }

          .selector-card span {
            font-size: 10px;
            color: var(--text-disabled, #9ca3af);
          }

          /* Audience cards grid adjusts to 5 items */
          .selection-cards-grid.audience-card {
            grid-template-columns: repeat(3, 1fr);
          }

          .selection-cards-grid.text-cards {
            grid-template-columns: repeat(5, 1fr);
          }

          .text-selector-card {
            padding: 12px;
            justify-content: center;
          }

          /* Date/Time fields for custom scheduling */
          .scheduler-settings-box {
            margin-top: 12px;
            padding: 16px;
            background: var(--bg-surface-hover, #f8fafc);
            border: 1px solid var(--border-color, #e5e7eb);
            border-radius: var(--border-radius-md, 8px);
          }

          .scheduler-fields-row {
            display: flex;
            gap: 12px;
          }

          .scheduler-field {
            display: flex;
            flex-direction: column;
            gap: 4px;
            flex: 1;
            text-align: start;
          }

          .flex-grow-2 {
            flex: 1.5 !important;
          }

          .scheduler-field label {
            font-size: 11px;
            font-weight: 700;
            color: var(--text-muted, #6b7280);
          }

          .field-input-wrapper {
            background: white;
            border: 1px solid var(--border-color, #e5e7eb);
            border-radius: 4px;
            padding: 8px 12px;
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--text-muted, #6b7280);
          }

          .field-input-wrapper input {
            border: none;
            outline: none;
            background: transparent;
            font-family: inherit;
            font-size: 12px;
            color: var(--text-primary, #111827);
            width: 100%;
          }

          .timezone-badge {
            background: var(--border-color, #e2e8f0);
            border-radius: 4px;
            padding: 8px 12px;
            display: flex;
            align-items: center;
            font-size: 12px;
            color: var(--text-primary, #111827);
            font-weight: 500;
            height: 18px;
          }

          /* Preview & summary column styling */
          .broadcast-preview-column {
            flex: 2;
            display: flex;
            flex-direction: column;
            gap: 16px;
            position: sticky;
            top: 24px;
            width: 100%;
            max-width: 320px;
          }

          .preview-card {
            background: var(--bg-surface, #fff);
            border: 1px solid var(--border-color, #e5e7eb);
            border-radius: var(--border-radius-lg, 12px);
            padding: 20px;
          }

          .preview-header-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
          }

          .preview-label {
            font-size: 12px;
            font-weight: 700;
            color: var(--text-muted, #6b7280);
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .device-tag {
            font-size: 10px;
            font-weight: 600;
            color: var(--text-disabled, #9ca3af);
          }

          /* iOS notification mockup card */
          .ios-notification-mockup {
            background: var(--bg-surface-hover, #f1f5f9);
            border-radius: 20px;
            padding: 24px 12px;
            display: flex;
            justify-content: center;
            border: 1px solid var(--border-color, #cbd5e1);
          }

          .notification-card {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(10px);
            border-radius: 12px;
            padding: 12px;
            width: 100%;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            border: 0.5px solid rgba(255, 255, 255, 0.5);
            text-align: start;
          }

          .notification-top {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 6px;
          }

          .app-icon-badge {
            width: 18px;
            height: 18px;
            border-radius: 4px;
            background: var(--text-primary, #000);
            color: white;
            font-size: 10px;
            font-weight: 900;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .app-name {
            font-size: 10px;
            font-weight: 700;
            color: #64748b;
            letter-spacing: 0.5px;
          }

          .time-tag {
            font-size: 10px;
            color: #94a3b8;
            margin-inline-start: auto;
          }

          .notification-content {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .notification-title {
            font-size: 12px;
            font-weight: 700;
            color: #0f172a;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .notification-body {
            font-size: 11px;
            line-height: 1.35;
            color: #334155;
            word-break: break-word;
          }

          /* Summary card */
          .summary-card {
            background: var(--bg-surface, #fff);
            border: 1px solid var(--border-color, #e5e7eb);
            border-radius: var(--border-radius-lg, 12px);
            padding: 20px;
            text-align: start;
          }

          .summary-title {
            font-size: 14px;
            font-weight: 700;
            color: var(--text-primary, #111827);
            margin: 0 0 16px 0;
            border-bottom: 1px solid var(--border-color, #e5e7eb);
            padding-bottom: 12px;
          }

          .summary-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .summary-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
          }

          .summary-label {
            color: var(--text-muted, #6b7280);
          }

          .summary-value {
            color: var(--text-primary, #111827);
            font-weight: 600;
          }

          .summary-value.highlight {
            color: var(--color-primary, #aa3bff);
            font-size: 14px;
            font-weight: 700;
          }

          .summary-divider {
            height: 1px;
            background: var(--border-color, #e5e7eb);
            margin: 6px 0;
          }

          .total-row {
            align-items: baseline;
          }

          .full-width-send-btn {
            width: 100%;
            background: var(--color-primary, #aa3bff);
            border: none;
            color: white;
            padding: 10px;
            border-radius: var(--border-radius-sm, 6px);
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            margin-top: 16px;
            transition: opacity 0.15s;
          }

          .full-width-send-btn:hover {
            opacity: 0.9;
          }

          /* History list table */
          .history-card {
            background: var(--bg-surface, #fff);
            border: 1px solid var(--border-color, #e5e7eb);
            border-radius: var(--border-radius-lg, 12px);
            padding: 24px;
          }

          .history-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 16px;
          }

          .history-filters-row {
            display: flex;
            gap: 8px;
            align-items: center;
            flex-wrap: wrap;
          }

          .history-search-input-wrapper {
            background: var(--bg-base, #fff);
            border: 1px solid var(--border-color, #e5e7eb);
            border-radius: var(--border-radius-xs, 4px);
            padding: 6px 12px;
            display: flex;
            align-items: center;
            gap: 8px;
            width: 200px;
            color: var(--text-muted, #6b7280);
          }

          .history-search-input-wrapper input {
            border: none;
            outline: none;
            background: transparent;
            color: var(--text-primary, #111827);
            font-size: 12px;
            width: 100%;
          }

          .history-status-select {
            background: var(--bg-base, #fff);
            border: 1px solid var(--border-color, #e5e7eb);
            border-radius: var(--border-radius-xs, 4px);
            padding: 6px 12px;
            font-size: 12px;
            font-weight: 500;
            color: var(--text-secondary, #475569);
            outline: none;
          }

          .history-export-btn {
            background: var(--bg-surface-hover, #f3f4f6);
            border: 1px solid var(--border-color, #e5e7eb);
            border-radius: var(--border-radius-xs, 4px);
            padding: 6px 12px;
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            font-weight: 600;
            color: var(--text-secondary, #475569);
            cursor: pointer;
          }

          .history-export-btn:hover {
            color: var(--text-primary, #111827);
            border-color: var(--text-muted, #6b7280);
          }

          .table-responsive-wrapper {
            width: 100%;
            overflow-x: auto;
          }

          .broadcast-history-table {
            width: 100%;
            border-collapse: collapse;
            text-align: start;
            font-size: 12px;
          }

          .broadcast-history-table th {
            padding: 12px 16px;
            border-bottom: 2px solid var(--border-color, #cbd5e1);
            color: var(--text-muted, #6b7280);
            font-weight: 700;
            text-transform: uppercase;
            font-size: 10px;
            letter-spacing: 0.5px;
          }

          .broadcast-history-table td {
            padding: 14px 16px;
            border-bottom: 1px solid var(--border-color, #e2e8f0);
            vertical-align: middle;
          }

          .campaign-table-title {
            color: var(--text-primary, #111827);
            font-weight: 600;
            display: block;
          }

          .audience-table-value {
            color: var(--text-secondary, #475569);
          }

          /* Status Badges */
          .status-badge-tag {
            display: inline-block;
            font-size: 10px;
            font-weight: 700;
            padding: 3px 8px;
            border-radius: 4px;
            text-align: center;
          }

          .status-sent {
            color: var(--color-success, #22c55e);
            background: rgba(34, 197, 94, 0.1);
          }

          .status-scheduled {
            color: var(--color-primary, #aa3bff);
            background: rgba(170, 59, 255, 0.1);
          }

          .status-draft {
            color: #64748b;
            background: #f1f5f9;
          }

          .status-failed {
            color: var(--color-danger, #ef4444);
            background: rgba(239, 68, 68, 0.1);
          }

          .date-table-value, .count-table-value, .rate-table-value {
            color: var(--text-muted, #6b7280);
            font-weight: 500;
          }

          .table-delete-action-btn {
            background: transparent;
            border: none;
            color: var(--text-disabled, #94a3b8);
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            transition: color 0.15s, background 0.15s;
          }

          .table-delete-action-btn:hover {
            color: var(--color-danger, #ef4444);
            background: rgba(239, 68, 68, 0.05);
          }

          /* Quick Actions header buttons */
          .primary-action-btn {
            background: var(--color-primary, #aa3bff);
            border: none;
            color: white;
            padding: 8px 16px;
            border-radius: var(--border-radius-sm, 6px);
            font-size: 13px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 6px;
            cursor: pointer;
          }

          .secondary-action-btn {
            background: var(--bg-surface-hover, #f3f4f6);
            border: 1px solid var(--border-color, #e5e7eb);
            color: var(--text-secondary, #475569);
            padding: 8px 16px;
            border-radius: var(--border-radius-sm, 6px);
            font-size: 13px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 6px;
            cursor: pointer;
          }

          .primary-action-btn:hover, .secondary-action-btn:hover {
            opacity: 0.9;
          }

          /* Responsive Tweaks */
          @media (max-width: 1024px) {
            .broadcast-kpis-grid {
              grid-template-columns: repeat(2, 1fr);
              width: 100% !important;
              box-sizing: border-box !important;
            }

            .broadcast-main-row {
              flex-direction: column;
              width: 100% !important;
              box-sizing: border-box !important;
              gap: 16px !important;
            }

            .broadcast-form-container {
              width: 100% !important;
              box-sizing: border-box !important;
              flex: none !important;
            }

            .broadcast-preview-column {
              width: 100% !important;
              max-width: 100% !important;
              box-sizing: border-box !important;
              position: static !important;
            }

            .selection-cards-grid.text-cards {
              grid-template-columns: repeat(3, 1fr);
            }
          }

          @media (max-width: 768px) {
            .mobile-hidden {
              display: none !important;
            }
            .mobile-visible-grid {
              display: grid !important;
            }
            .mobile-visible-flex {
              display: flex !important;
              flex-direction: column;
            }
            .mobile-visible-block {
              display: block !important;
            }

            .main-content {
              margin-inline-start: 0 !important;
              padding-top: 0 !important;
              padding-bottom: 96px !important;
              padding-inline-start: 0 !important;
              padding-inline-end: 0 !important;
            }

            /* Mobile page body padding & wrapper fixes */
            .broadcast-page-body {
              padding: 20px !important;
              gap: 16px !important;
              box-sizing: border-box !important;
              width: 100% !important;
            }

            .broadcast-main-row {
              width: 100% !important;
              box-sizing: border-box !important;
              margin: 0 !important;
              gap: 16px !important;
            }

            /* Mobile Section Toggles style */
            .mobile-section-toggles {
              display: flex !important;
              background: var(--bg-surface-hover, #f3f4f6);
              border: 1px solid var(--border-color, #e5e7eb);
              padding: 4px;
              border-radius: 12px;
              gap: 4px;
              width: 100%;
              box-sizing: border-box;
              margin-top: 4px;
              margin-bottom: 8px;
            }

            .mobile-section-toggle-btn {
              flex: 1;
              border: none;
              background: transparent;
              padding: 8px 6px;
              border-radius: 8px;
              font-size: 11px;
              font-weight: 700;
              color: var(--text-secondary, #475569);
              cursor: pointer;
              text-align: center;
              transition: background var(--transition-fast, 0.2s), color var(--transition-fast, 0.2s);
              white-space: nowrap;
            }

            .mobile-section-toggle-btn.active {
              background: var(--bg-surface, #fff) !important;
              color: var(--text-primary, #111827) !important;
              box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
            }

            /* KPIs in 2 columns */
            .broadcast-kpis-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 12px !important;
              width: 100% !important;
              box-sizing: border-box !important;
            }

            /* Selection cards in 2 columns */
            .selection-cards-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 8px !important;
            }

            .selector-card {
              padding: 12px !important;
              border-radius: 8px !important;
            }

            .selector-card strong {
              font-size: 12px !important;
            }

            /* Card container paddings, width and flex fixes */
            .broadcast-form-container,
            .preview-card,
            .summary-card,
            .history-card {
              padding: 16px !important;
              border-radius: 16px !important;
              width: 100% !important;
              box-sizing: border-box !important;
              flex: none !important;
            }

            .broadcast-preview-column {
              width: 100% !important;
              max-width: 100% !important;
              box-sizing: border-box !important;
              position: static !important;
            }

            .scheduler-fields-row {
              flex-direction: column;
            }
          }
        `}</style>
      </main>

      <MobileBottomTabs />
    </div>
  );
};
