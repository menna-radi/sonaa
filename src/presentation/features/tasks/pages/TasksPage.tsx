import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useTasks } from '../hooks/useTasks';
import { Sidebar } from '../../../../presentation/layouts/Sidebar';
import { Header } from '../../../../presentation/layouts/Header';
import { MobileBottomTabs } from '../../../../presentation/layouts/MobileBottomTabs';
import { GlassCard } from '../../../components/GlassCard';
import { 
  Search, 
  Download, 
  SlidersHorizontal, 
  MapPin, 
  Clock, 
  AlertTriangle,
  Eye, 
  Lock, 
  Unlock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Bell,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import type { Task } from '../../../../domain/entities/Task';

export const TasksPage: React.FC = () => {
  const { t, isRtl } = useLanguage();
  const {
    tasks,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    activeFilter,
    setActiveFilter,
    metrics,
    filterCounts,
    handleFreeze,
    handleUnfreeze,
    refresh
  } = useTasks();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDetailTask, setSelectedDetailTask] = useState<Task | null>(null);
  const [showDispatchConfirm, setShowDispatchConfirm] = useState(false);
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [emergencyIndex, setEmergencyIndex] = useState(0);

  const emergencyTasksList = useMemo(() => tasks.filter(t => t.status === 'emergency'), [tasks]);
  const activeEmergency = emergencyTasksList[emergencyIndex % (emergencyTasksList.length || 1)];
  const displayedTasks = useMemo(() => {
    return tasks.filter(t => {
      if (selectedCategory !== 'All') {
        const titleLower = t.title.toLowerCase();
        const catLower = selectedCategory.toLowerCase();
        if (!titleLower.includes(catLower)) return false;
      }
      if (selectedStatus !== 'All') {
        if (selectedStatus === 'Emergency' && t.status !== 'emergency') return false;
        if (selectedStatus === 'Live' && t.status === 'completed') return false;
        if (selectedStatus === 'Completed' && t.status !== 'completed') return false;
        if (selectedStatus === 'Disputed' && t.status !== 'disputed') return false;
        if (selectedStatus === 'Frozen' && t.status !== 'frozen') return false;
      }
      return true;
    });
  }, [tasks, selectedCategory, selectedStatus]);
  const formatEta = (eta: string) => {
    if (eta === 'NOW') return t('eta_now') || 'NOW';
    if (eta === 'Done') return t('eta_done') || 'Done';
    if (eta.includes('min')) {
      const mins = eta.replace(/min(s)?/, '').trim();
      return `${mins} ${t('eta_mins') || 'min'}`;
    }
    return eta;
  };

  const handleExportTasksReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Jerusalem Tasks Audit Report</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; color: #0f172a; }
            .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 10px 14px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
            th { background: #f8fafc; font-weight: 700; color: #475569; }
            .badge { padding: 3px 8px; border-radius: 4px; font-weight: 700; font-size: 11px; }
            .emergency { background: #fee2e2; color: #991b1b; }
            .progress { background: #dbeafe; color: #1e40af; }
            .disputed { background: #fef3c7; color: #92400e; }
            .completed { background: #dcfce7; color: #166534; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Jerusalem Service Tasks & Dispatch Audit Report</h2>
            <p style="color: #64748b; margin: 4px 0 0 0;">Location: Jerusalem, Palestine (القدس، فلسطين) • Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Task Title</th>
                <th>Customer</th>
                <th>Craftsman</th>
                <th>Status</th>
                <th>Location</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${displayedTasks.map(t => `
                <tr>
                  <td><strong>${t.jobNumber}</strong></td>
                  <td>${t.title}</td>
                  <td>${t.customer}</td>
                  <td>${t.craftsman}</td>
                  <td><span class="badge ${t.status}">${t.status.toUpperCase()}</span></td>
                  <td>${t.zone || 'Jerusalem'}</td>
                  <td>${t.amountSAR} ILS</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Status Badge Helper
  const renderStatusBadge = (status: Task['status']) => {
    switch (status) {
      case 'in_progress':
        return (
          <span className="badge badge-progress">
            {t('status_in_progress') || 'In Progress'}
          </span>
        );
      case 'emergency':
        return (
          <span 
            className="badge badge-emergency animate-pulse" 
            style={{ 
              backgroundColor: '#fee2e2', 
              color: '#dc2626', 
              border: '1px solid #fca5a5', 
              fontWeight: 800, 
              padding: '4px 12px', 
              borderRadius: '9999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              boxShadow: '0 0 10px rgba(220, 38, 38, 0.25)'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#dc2626', display: 'inline-block' }} />
            {t('status_emergency') || 'Emergency'}
          </span>
        );
      case 'disputed':
        return (
          <span className="badge badge-disputed">
            {t('status_disputed') || 'Disputed'}
          </span>
        );
      case 'frozen':
        return (
          <span className="badge badge-frozen">
            {t('status_frozen') || 'Frozen'}
          </span>
        );
      case 'completed':
        return (
          <span className="badge badge-completed">
            {t('status_completed') || 'Completed'}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className="main-content">
        {/* Mobile Header (visible only on mobile) */}
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
          <h2>{t('tasks_title') || 'Tasks'}</h2>
          <span>{t('tasks_mobile_subtitle') || 'Monitor & resolve disputes'}</span>
        </div>

        <div className="tasks-page-body-content">
          {/* Desktop/Tablet Header row */}
          <div className="desktop-tablet-page-header desktop-tablet-only">
            <div style={{ textAlign: 'start' }} className="animate-fade-in">
              <h1 style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-title)', color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
                {t('tasks_title') || 'Tasks'}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                {t('tasks_subtitle') || 'Monitor live tasks, freeze suspicious activity, resolve disputes'}
              </p>
            </div>

            <div className="animate-fade-in" style={{ display: 'flex', gap: '8px', position: 'relative' }}>
              <button 
                onClick={() => setShowFilterPopover(!showFilterPopover)}
                className="header-action-btn"
                style={{ background: showFilterPopover ? 'var(--bg-surface-hover)' : 'var(--bg-surface)' }}
              >
                <SlidersHorizontal size={14} />
                <span>{t('filters') || 'Filters'}</span>
              </button>
              
              {showFilterPopover && (
                <div style={{
                  position: 'absolute',
                  top: '40px',
                  right: '80px',
                  background: '#ffffff',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                  zIndex: 100,
                  width: '220px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  textAlign: 'start'
                }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Status</label>
                    <select 
                      value={selectedStatus} 
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}
                    >
                      <option value="All">All Statuses</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Live">Live / Active</option>
                      <option value="Completed">Completed</option>
                      <option value="Disputed">Disputed</option>
                      <option value="Frozen">Frozen</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Category</label>
                    <select 
                      value={selectedCategory} 
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}
                    >
                      <option value="All">All Categories</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="Cleaning">Cleaning</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Repair">Repair</option>
                    </select>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedStatus('All');
                      setSelectedCategory('All');
                      setShowFilterPopover(false);
                    }}
                    style={{ background: 'transparent', border: 'none', color: '#dc2626', fontSize: '0.75rem', fontWeight: 600, padding: 0, cursor: 'pointer', alignSelf: 'flex-start' }}
                  >
                    Reset Filters
                  </button>
                </div>
              )}

              <button className="header-action-btn primary-btn" onClick={handleExportTasksReport}>
                <Download size={14} />
                <span>{t('btn_export') || 'Export'}</span>
              </button>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="glass-card status-danger animate-fade-in" style={{ padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', color: 'var(--color-danger)' }}>
                <AlertTriangle size={20} />
                <div style={{ textAlign: 'start' }}>
                  <strong style={{ display: 'block' }}>System Failure</strong>
                  <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>{error}</span>
                </div>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex-center" style={{ minHeight: '400px', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <RefreshCw className="animate-spin" size={36} style={{ color: 'var(--color-primary)' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('status_loading') || 'Loading tasks...'}</p>
            </div>
          ) : (
            <div className="tasks-content-layout animate-fade-in">

              {/* 1. Metrics Grid */}
              <div className="tasks-metrics-grid">
                <GlassCard className="stat-card" status="normal">
                  <span className="stat-label">{t('active_tasks_lbl') || 'Active tasks'}</span>
                  <div className="stat-value-container">
                    <strong className="stat-val">{metrics.activeTasks.toLocaleString()}</strong>
                    <span className="stat-trend positive">
                      <TrendingUp size={10} />
                      +5.6%
                    </span>
                  </div>
                </GlassCard>

                <GlassCard className="stat-card stat-card-emergency" status="normal">
                  <span className="stat-label">{t('emergency_lbl') || 'Emergency'}</span>
                  <div className="stat-value-container">
                    <strong className="stat-val val-danger">{metrics.emergency.toLocaleString()}</strong>
                    <span className="stat-trend positive text-danger">
                      <TrendingUp size={10} />
                      +23%
                    </span>
                  </div>
                </GlassCard>

                <GlassCard className="stat-card" status="normal">
                  <span className="stat-label">{t('disputed_lbl') || 'Disputed'}</span>
                  <div className="stat-value-container">
                    <strong className="stat-val">{metrics.disputed.toLocaleString()}</strong>
                    <span className="stat-trend negative">
                      <TrendingDown size={10} />
                      -8%
                    </span>
                  </div>
                </GlassCard>

                <GlassCard className="stat-card" status="normal">
                  <span className="stat-label">{t('frozen_lbl') || 'Frozen'}</span>
                  <div className="stat-value-container">
                    <strong className="stat-val">{metrics.frozen.toLocaleString()}</strong>
                    <span className="stat-trend neutral">
                      0%
                    </span>
                  </div>
                </GlassCard>

                <GlassCard className="stat-card" status="normal">
                  <span className="stat-label">{t('completed_today_lbl') || 'Completed today'}</span>
                  <div className="stat-value-container">
                    <strong className="stat-val">{metrics.completedToday.toLocaleString()}</strong>
                    <span className="stat-trend positive">
                      <TrendingUp size={10} />
                      +14%
                    </span>
                  </div>
                </GlassCard>
              </div>

              {/* 2. Controls & List Container */}
              <div className="tasks-list-container">
                <div className="tasks-list-header">
                  <div className="search-bar-wrapper">
                    <Search size={14} className="search-icon" />
                    <input 
                      type="text" 
                      placeholder={t('search_tasks_placeholder') || 'Search by task ID...'}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                  </div>

                  <div className="filter-tabs" style={{ display: 'flex', width: '100%', overflowX: 'auto', gap: '2px', padding: '2px', background: '#F5F5F5', borderRadius: '8px' }}>
                    {(['all', 'live', 'emergency', 'disputed', 'completed'] as const).map((filterKey) => {
                      const isActive = activeFilter === filterKey;
                      const count = filterCounts ? filterCounts[filterKey] : 0;
                      
                      // Label translation
                      let label = '';
                      if (filterKey === 'all') label = t('all_filter') || 'All';
                      else if (filterKey === 'live') label = t('live_filter') || 'Live';
                      else if (filterKey === 'emergency') label = t('emergency_lbl') || 'Emergency';
                      else if (filterKey === 'disputed') label = t('disputed_lbl') || 'Disputed';
                      else if (filterKey === 'completed') label = t('completed_filter') || 'Completed';

                      return (
                        <button
                          key={filterKey}
                          className={`filter-tab ${isActive ? 'active' : ''}`}
                          onClick={() => setActiveFilter(filterKey)}
                          style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            background: isActive ? '#FFFFFF' : 'transparent',
                            color: isActive ? '#171717' : '#737373',
                            boxShadow: isActive ? '0px 1px 1px rgba(0, 0, 0, 0.05)' : 'none',
                            fontSize: '10px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            border: 'none',
                            outline: 'none',
                          }}
                        >
                          <span>{label}</span>
                          <span
                            style={{
                              fontSize: '8px',
                              fontWeight: 700,
                              padding: '1px 5px',
                              borderRadius: '4px',
                              background: isActive ? 'var(--color-primary)' : 'var(--border-color)',
                              color: isActive ? 'var(--bg-base)' : 'var(--text-secondary)',
                              transition: 'var(--transition-fast)'
                            }}
                          >
                            {count.toLocaleString()}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Desktop/Tablet Table Grid */}
                <div className="tasks-table-responsive desktop-tablet-only">
                  <table className="tasks-table">
                    <thead>
                      <tr>
                        <th>{t('task_header_task') || 'Task'}</th>
                        <th>{t('task_header_customer') || 'Customer'}</th>
                        <th>{t('task_header_craftsman') || 'Craftsman'}</th>
                        <th>{t('task_header_zone') || 'Zone'}</th>
                        <th>{t('task_header_budget') || 'Budget'}</th>
                        <th>{t('task_header_eta') || 'ETA'}</th>
                        <th>{t('task_header_status') || 'Status'}</th>
                        <th style={{ textAlign: isRtl ? 'left' : 'right' }}>{t('task_header_actions') || 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedTasks.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="no-data-cell">
                            No tasks match the active filters.
                          </td>
                        </tr>
                      ) : (
                        displayedTasks.map((task) => (
                          <tr 
                            key={task.id} 
                            className={task.status === 'emergency' ? 'row-emergency' : ''}
                            onClick={() => setSelectedDetailTask(task)}
                            style={{ cursor: 'pointer' }}
                          >
                            {/* Task Column */}
                            <td className="task-cell">
                              <div>
                                <span className="task-title">{task.title}</span>
                                <span className="task-id">{task.jobNumber}</span>
                              </div>
                            </td>
                            {/* Customer */}
                            <td>{task.customer}</td>
                            {/* Craftsman */}
                            <td>{task.craftsman}</td>
                            {/* Zone */}
                            <td>
                              <div className="zone-cell">
                                <MapPin size={10} />
                                <span>{task.zone}</span>
                              </div>
                            </td>
                            {/* Budget */}
                            <td>
                              <strong>SAR {task.amountSAR}</strong>
                            </td>
                            {/* ETA */}
                            <td>
                              <div className="eta-cell">
                                <Clock size={10} />
                                <span className={task.eta === 'NOW' ? 'text-danger font-bold' : ''}>
                                  {formatEta(task.eta)}
                                </span>
                              </div>
                            </td>
                            {/* Status */}
                            <td>{renderStatusBadge(task.status)}</td>
                            {/* Actions */}
                            <td style={{ textAlign: isRtl ? 'left' : 'right' }}>
                              <div className="actions-cell" onClick={(e) => e.stopPropagation()}>
                                <button 
                                  className="action-icon-btn" 
                                  onClick={() => setSelectedDetailTask(task)}
                                  title={t('view_details') || 'View Details'}
                                >
                                  <Eye size={12} />
                                </button>
                                {task.status !== 'completed' && (
                                  task.status === 'frozen' ? (
                                    <button 
                                      className="action-icon-btn active" 
                                      onClick={() => handleUnfreeze(task.id)}
                                      title={t('unfreeze') || 'Unfreeze Task'}
                                    >
                                      <Unlock size={12} />
                                    </button>
                                  ) : (
                                    <button 
                                      className="action-icon-btn" 
                                      onClick={() => handleFreeze(task.id)}
                                      title={t('freeze') || 'Freeze Task'}
                                    >
                                      <Lock size={12} />
                                    </button>
                                  )
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Task Cards List */}
                <div className="tasks-mobile-list mobile-only">
                  {/* Mobile Emergency Alert SOS Banner */}
                  {tasks.some(t => t.status === 'emergency') && (
                    <div className="mobile-emergency-banner animate-pulse">
                      <div className="mobile-emergency-left">
                        <div className="mobile-emergency-icon">
                          <AlertTriangle size={14} />
                        </div>
                        <div className="mobile-emergency-content">
                          <strong className="mobile-emergency-title">
                            {tasks.filter(t => t.status === 'emergency').length} {t('emergency_in_progress') || 'emergency in progress'}
                          </strong>
                          <span className="mobile-emergency-text">
                            {tasks.find(t => t.status === 'emergency')?.title} · {tasks.find(t => t.status === 'emergency')?.zone}
                          </span>
                        </div>
                      </div>
                      <button className="mobile-emergency-btn" onClick={() => setShowDispatchConfirm(true)}>
                        {t('dispatch') || 'Dispatch'}
                      </button>
                    </div>
                  )}

                  {displayedTasks.length === 0 ? (
                    <div className="no-data-mobile">
                      No tasks match the active filters.
                    </div>
                  ) : (
                    displayedTasks.map((task) => {
                      // Custom mobile badge rendering
                      const renderMobileStatusBadge = () => {
                        switch (task.status) {
                          case 'in_progress':
                            return <span className="mobile-badge-live">{t('mobile_badge_live')}</span>;
                          case 'emergency':
                            return <span className="mobile-badge-sos">{t('mobile_badge_sos')}</span>;
                          case 'disputed':
                            return <span className="mobile-badge-disputed">{t('status_disputed') || 'Disputed'}</span>;
                          case 'frozen':
                            return <span className="mobile-badge-frozen">{t('status_frozen') || 'Frozen'}</span>;
                          case 'completed':
                            return <span className="mobile-badge-completed">{t('status_completed') || 'Completed'}</span>;
                          default:
                            return null;
                        }
                      };

                      // Custom progress percentage
                      const getProgressPercentage = () => {
                        switch (task.status) {
                          case 'in_progress': return 65;
                          case 'emergency': return 30;
                          case 'disputed': return 50;
                          case 'frozen': return 15;
                          case 'completed': return 100;
                          default: return 0;
                        }
                      };

                      return (
                        <div 
                          key={task.id} 
                          className={`task-mobile-card ${task.status === 'emergency' ? 'card-emergency' : ''}`}
                          onClick={() => setSelectedDetailTask(task)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="card-top">
                            <div className="mobile-id-row">
                              <span className="mobile-task-id">{task.jobNumber}</span>
                              {renderMobileStatusBadge()}
                            </div>
                            <button 
                              className="mobile-top-details-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDetailTask(task);
                              }}
                            >
                              <Eye size={14} />
                            </button>
                          </div>

                          <div className="card-title-row">
                            <strong className="mobile-task-title">{task.title}</strong>
                          </div>

                          <div className="card-mid-capsules">
                            <div className="mid-capsule">
                              <MapPin size={9} />
                              <span>{task.zone}</span>
                            </div>
                            <div className="mid-capsule">
                              <Clock size={9} />
                              <span className={task.eta === 'NOW' ? 'text-danger font-bold' : ''}>
                                {formatEta(task.eta)}
                              </span>
                            </div>
                            <strong className="mid-capsule-budget">SAR {task.amountSAR}</strong>
                          </div>

                          <div className="card-transition-box">
                            <span className="transition-name customer">
                              <bdi>{task.customer.split(' ')[0]} {task.customer.split(' ')[1] ? task.customer.split(' ')[1][0] + '.' : ''}</bdi>
                            </span>
                            <span className="transition-arrow">
                              {isRtl ? <ArrowLeft size={12} /> : <ArrowRight size={12} />}
                            </span>
                            <span className="transition-name font-semibold craftsman">
                              <bdi>{task.craftsman.split(' ')[0]} {task.craftsman.split(' ')[1] ? task.craftsman.split(' ')[1][0] + '.' : ''}</bdi>
                            </span>
                          </div>

                          <div className="card-progress-bar-row">
                            <div className="progress-bar-track">
                              <div 
                                className={`progress-bar-fill ${task.status === 'emergency' ? 'fill-danger' : ''}`} 
                                style={{ width: `${getProgressPercentage()}%` }} 
                              />
                            </div>
                            <span className="progress-percentage-label">{getProgressPercentage()}%</span>
                          </div>

                          <div className="card-actions">
                            <button className={`mobile-action-btn-text ${task.status === 'completed' ? 'full-width' : ''}`}>
                              <Eye size={12} />
                              <span>{t('details') || 'Details'}</span>
                            </button>
                            {task.status !== 'completed' && (
                              task.status === 'frozen' ? (
                                <button className="mobile-action-btn-text active" onClick={() => handleUnfreeze(task.id)}>
                                  <Unlock size={12} />
                                  <span>{t('unfreeze') || 'Unfreeze'}</span>
                                </button>
                              ) : (
                                <button className="mobile-action-btn-text" onClick={() => handleFreeze(task.id)}>
                                  <Lock size={12} />
                                  <span>{t('freeze') || 'Freeze'}</span>
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

              </div>

              {/* Emergency Alert SOS Banner */}
              {emergencyTasksList.length > 0 && activeEmergency && (
                <div className="emergency-alert-banner">
                  <div className="emergency-alert-left">
                    <div className="emergency-icon-wrapper">
                      <AlertTriangle size={18} />
                    </div>
                    <div className="emergency-details">
                      <div className="emergency-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="emergency-title">
                          Emergency in progress ({emergencyTasksList.length} Active SOS)
                        </span>
                        <span className="emergency-badge">SOS</span>
                        {emergencyTasksList.length > 1 && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '8px' }}>
                            <button 
                              onClick={() => setEmergencyIndex(prev => (prev > 0 ? prev - 1 : emergencyTasksList.length - 1))}
                              style={{ background: '#fee2e2', border: 'none', borderRadius: '4px', color: '#dc2626', cursor: 'pointer', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 700 }}
                            >
                              ◀
                            </button>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#991b1b' }}>
                              {emergencyIndex + 1} of {emergencyTasksList.length}
                            </span>
                            <button 
                              onClick={() => setEmergencyIndex(prev => (prev + 1) % emergencyTasksList.length)}
                              style={{ background: '#fee2e2', border: 'none', borderRadius: '4px', color: '#dc2626', cursor: 'pointer', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 700 }}
                            >
                              ▶
                            </button>
                          </div>
                        )}
                      </div>
                      <span className="emergency-text">
                        {activeEmergency.title} · {activeEmergency.zone} · Customer: {activeEmergency.customer} · Craftsman: {activeEmergency.craftsman}
                      </span>
                    </div>
                  </div>
                  <div className="emergency-actions">
                    <button className="emergency-btn emergency-btn-secondary" onClick={() => setSelectedDetailTask(activeEmergency)}>
                      View Details
                    </button>
                    <button className="emergency-btn emergency-btn-primary" onClick={() => setShowDispatchConfirm(true)}>
                      {t('dispatch_backup') || 'Dispatch backup'}
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Sync Telemetry */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--spacing-xl)', marginBottom: 'var(--spacing-xl)' }}>
            <button onClick={refresh} className="sync-telemetry-btn">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Sync Telemetry Nodes</span>
            </button>
          </div>

        </div>

        {/* 1. Task Details Modal Dialog */}
        {selectedDetailTask && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px'
          }} onClick={() => setSelectedDetailTask(null)}>
            <div style={{
              background: '#ffffff',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '500px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
              textAlign: 'start',
              position: 'relative'
            }} onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => setSelectedDetailTask(null)}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#71717a' }}
              >
                ×
              </button>
              
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: 700, color: '#171717' }}>
                {selectedDetailTask.title}
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#71717a', fontWeight: 600 }}>
                Job #{selectedDetailTask.jobNumber}
              </span>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px', borderTop: '1px solid #f4f4f5', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#71717a' }}>Customer</span>
                  <strong style={{ color: '#171717' }}>{selectedDetailTask.customer}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#71717a' }}>Craftsman</span>
                  <strong style={{ color: '#171717' }}>{selectedDetailTask.craftsman}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#71717a' }}>Zone / Location</span>
                  <strong style={{ color: '#171717' }}>{selectedDetailTask.zone}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#71717a' }}>Budget Amount</span>
                  <strong style={{ color: '#171717' }}>SAR {selectedDetailTask.amountSAR}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#71717a' }}>ETA Status</span>
                  <strong style={{ color: '#171717' }}>{formatEta(selectedDetailTask.eta)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', alignItems: 'center' }}>
                  <span style={{ color: '#71717a' }}>Status</span>
                  {renderStatusBadge(selectedDetailTask.status)}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '24px', borderTop: '1px solid #f4f4f5', paddingTop: '16px' }}>
                <button 
                  onClick={() => setSelectedDetailTask(null)}
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #e4e4e7', background: '#ffffff', color: '#171717', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Close Details
                </button>
                {selectedDetailTask.status !== 'completed' && (
                  selectedDetailTask.status === 'frozen' ? (
                    <button 
                      onClick={() => { handleUnfreeze(selectedDetailTask.id); setSelectedDetailTask(null); }}
                      style={{ flex: 1.2, padding: '10px', borderRadius: '6px', border: 'none', background: '#171717', color: '#ffffff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      Unfreeze Task
                    </button>
                  ) : (
                    <button 
                      onClick={() => { handleFreeze(selectedDetailTask.id); setSelectedDetailTask(null); }}
                      style={{ flex: 1.2, padding: '10px', borderRadius: '6px', border: 'none', background: '#ef4444', color: '#ffffff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      Freeze Task
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. SOS Dispatch Confirmation Dialog */}
        {showDispatchConfirm && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
            padding: '16px'
          }} onClick={() => setShowDispatchConfirm(false)}>
            <div style={{
              background: '#ffffff',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '400px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
              textAlign: 'center',
              position: 'relative'
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#fee2e2',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <AlertTriangle size={24} />
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 700, color: '#171717' }}>
                Dispatch SOS Emergency Backup?
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#71717a', lineHeight: '1.4' }}>
                This will trigger emergency dispatch units and notify local service teams in Hittin zone.
              </p>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                <button 
                  onClick={() => setShowDispatchConfirm(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #e4e4e7', background: '#ffffff', color: '#171717', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    alert('SOS dispatch units successfully triggered!');
                    setShowDispatchConfirm(false);
                  }}
                  style={{ flex: 1.5, padding: '10px', borderRadius: '6px', border: 'none', background: '#ef4444', color: '#ffffff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Confirm Dispatch
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      <MobileBottomTabs />

      {/* Styled overrides matching exact Figma specifications */}
      <style>{`
        /* Desktop/Tablet Header buttons */
        .header-action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          transition: background var(--transition-fast);
        }
        .header-action-btn:hover {
          background: var(--bg-surface-hover);
        }
        .header-action-btn.primary-btn {
          background: var(--color-primary);
          color: var(--bg-base);
          border: none;
        }
        .header-action-btn.primary-btn:hover {
          opacity: 0.9;
        }

        .tasks-content-layout {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
          text-align: start;
        }

        /* Metrics grid */
        .tasks-metrics-grid {
          display: flex;
          gap: 16px;
          width: 100%;
          box-sizing: border-box;
        }
        .stat-card {
          flex: 1;
          height: 97px;
          background: #FFFFFF !important;
          border: 1px solid #E5E5E5 !important;
          border-radius: 16px !important;
          padding: 20px !important;
          box-shadow: 0px 1px 1.5px rgba(0, 0, 0, 0.04) !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: space-between !important;
          box-sizing: border-box !important;
          overflow: hidden !important;
        }
        .stat-card-emergency {
          background: #FEF2F2 !important;
          border: 1px solid #FEE2E2 !important;
        }
        .stat-label {
          font-size: 10px;
          font-weight: 700;
          color: #737373;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .stat-value-container {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-top: 4px;
        }
        .stat-val {
          font-size: 24px;
          font-weight: 700;
          color: #171717;
          letter-spacing: -0.48px;
        }
        .stat-val.val-danger {
          color: #B91C1C;
        }
        .stat-trend {
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 2px;
          color: #16A34A;
        }
        .stat-trend.negative {
          color: #EF4444;
        }
        .stat-trend.neutral {
          color: #737373;
        }

        /* Container list */
        .tasks-list-container {
          background: #FFFFFF;
          border: 1px solid #E5E5E5;
          border-radius: 16px;
          box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          width: 100%;
          box-sizing: border-box;
        }

        .tasks-list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #F5F5F5;
          gap: var(--spacing-md);
          flex-wrap: wrap;
        }

        /* Tabs */
        .filter-tabs {
          display: flex;
          background: #F5F5F5;
          padding: 2px;
          border-radius: 8px;
          gap: 2px;
        }
        .filter-tab {
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 700;
          color: #737373;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: background var(--transition-fast), color var(--transition-fast);
        }
        .filter-tab.active {
          background: #FFFFFF;
          color: #171717;
          box-shadow: 0px 1px 1px rgba(0, 0, 0, 0.05);
        }

        /* Search input */
        .search-bar-wrapper {
          position: relative;
          width: 256px;
        }
        .search-icon {
          position: absolute;
          inset-inline-start: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9CA3AF;
          pointer-events: none;
        }
        .search-input {
          width: 100%;
          height: 32px;
          background: #FAFAFA;
          border: 1px solid transparent;
          border-radius: 8px;
          padding-inline-start: 36px;
          padding-inline-end: 12px;
          font-size: 12px;
          color: var(--text-primary);
          outline: none;
          box-sizing: border-box;
          transition: border var(--transition-fast);
        }
        .search-input:focus {
          border-color: var(--border-color);
        }

        /* Table */
        .tasks-table-responsive {
          width: 100%;
          overflow-x: auto;
        }
        .tasks-table {
          width: 100%;
          border-collapse: collapse;
          text-align: start;
        }
        .tasks-table th {
          background: #FAFAFA;
          padding: 12px 20px;
          font-size: 10px;
          font-weight: 700;
          color: #737373;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #F5F5F5;
        }
        .tasks-table td {
          padding: 14px 20px;
          font-size: 12px;
          color: #404040;
          border-bottom: 1px solid #F5F5F5;
          vertical-align: middle;
        }
        .tasks-table tr:last-child td {
          border-bottom: none;
        }
        .tasks-table tr:hover td {
          background: #FAFAFA;
        }
        .tasks-table tr.row-emergency td {
          background: rgba(254, 242, 242, 0.3);
        }
        .tasks-table tr.row-emergency:hover td {
          background: rgba(254, 242, 242, 0.5);
        }

        /* Table cells layout */
        .task-cell {
          font-family: var(--font-sans);
        }
        .task-title {
          display: block;
          font-weight: 600;
          color: #171717;
          line-height: 1.3;
        }
        .task-id {
          display: block;
          font-family: monospace;
          font-size: 10px;
          color: #A3A3A3;
          margin-top: 2px;
        }
        .zone-cell {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #737373;
        }
        .eta-cell {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #737373;
        }
        .text-danger {
          color: #DC2626 !important;
        }
        .font-bold {
          font-weight: 700 !important;
        }

        /* Badges */
        .badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 4px;
          white-space: nowrap;
        }
        .badge-progress {
          background: #E5E5E5;
          color: #171717;
        }
        .badge-emergency {
          background: #FEE2E2;
          color: #B91C1C;
        }
        .badge-disputed {
          background: #FEF3C7;
          color: #B45309;
        }
        .badge-frozen {
          background: #171717;
          color: #FFFFFF;
        }
        .badge-completed {
          background: #DCFCE7;
          color: #15803D;
        }

        /* Actions cell buttons */
        .actions-cell {
          display: flex;
          gap: 6px;
          justify-content: flex-end;
        }
        .action-icon-btn {
          width: 28px;
          height: 28px;
          border-radius: 4px;
          background: transparent;
          border: none;
          color: #737373;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background var(--transition-fast), color var(--transition-fast);
        }
        .action-icon-btn:hover {
          background: #F5F5F5;
          color: #171717;
        }
        .action-icon-btn.active {
          color: #B91C1C;
        }
        .action-icon-btn.active:hover {
          background: #FEF2F2;
        }

        /* Sync Telemetry Button */
        .sync-telemetry-btn {
          background: var(--bg-surface-hover);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          padding: 10px 20px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: background var(--transition-fast);
        }
        .sync-telemetry-btn:hover {
          background: #E5E5E5;
        }

        /* Mobile task card */
        .tasks-mobile-list {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .task-mobile-card {
          background: #FFFFFF;
          border: 1px solid #E5E5E5;
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0px 1px 2px rgba(0,0,0,0.02);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .task-mobile-card.card-emergency {
          border-color: #FEE2E2;
          background: rgba(254, 242, 242, 0.2);
        }
        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .mobile-task-title {
          font-size: 13px;
          font-weight: 600;
          color: #171717;
          line-height: 1.3;
        }
        .mobile-task-id {
          font-family: monospace;
          font-size: 10px;
          color: #A3A3A3;
          margin-top: 1px;
        }
        .card-mid {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 8px 0;
          border-top: 1px solid #FAFAFA;
          border-bottom: 1px solid #FAFAFA;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
        }
        .info-label {
          color: #737373;
        }
        .info-value {
          color: #171717;
          font-weight: 500;
          display: flex;
          align-items: center;
        }
        .card-actions {
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }
        .mobile-action-btn-text {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          height: 32px;
          border-radius: 8px;
          background: #FAFAFA;
          border: 1px solid #E5E5E5;
          font-size: 11px;
          font-weight: 600;
          color: #404040;
          cursor: pointer;
        }
        .mobile-action-btn-text.active {
          color: #B91C1C;
          background: #FEF2F2;
          border-color: #FEE2E2;
        }

        .no-data-cell {
          text-align: center;
          color: var(--text-muted);
          padding: 40px !important;
        }
        .no-data-mobile {
          text-align: center;
          color: var(--text-muted);
          padding: 40px 20px;
        }



        /* Emergency Alert Banner */
        .emergency-alert-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #FEF2F2;
          border: 1px solid #FEE2E2;
          border-radius: 16px;
          padding: 20px;
          margin-top: 16px;
          box-sizing: border-box;
          gap: 16px;
          text-align: start;
        }
        .emergency-alert-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }
        .emergency-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(239, 68, 68, 0.1);
          width: 40px;
          height: 40px;
          border-radius: 12px;
          color: #B91C1C;
          flex-shrink: 0;
        }
        .emergency-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .emergency-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .emergency-title {
          font-size: 14px;
          font-weight: 700;
          color: #B91C1C;
        }
        .emergency-badge {
          background: #FEE2E2;
          color: #B91C1C;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .emergency-text {
          font-size: 12px;
          color: #DC2626;
          line-height: 1.4;
        }
        .emergency-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }
        .emergency-btn {
          height: 48px;
          padding: 0 16px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .emergency-btn-secondary {
          background: #FFFFFF;
          border: 1px solid #FECACA;
          color: #B91C1C;
        }
        .emergency-btn-secondary:hover {
          background: #FFF5F5;
        }
        .emergency-btn-primary {
          background: #DC2626;
          border: none;
          color: #FFFFFF;
        }
        .emergency-btn-primary:hover {
          background: #B91C1C;
        }

        /* ── Responsive Viewport Adjustments ── */

        /* Tablet Views (769px to 1024px) */
        @media (min-width: 769px) and (max-width: 1024px) {
          .tasks-metrics-grid {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 12px !important;
          }
          .stat-card {
            padding: 16px !important;
            height: 90px !important;
          }
          .stat-card:nth-child(n+4) {
            grid-column: span 1.5; /* Spread remaining columns */
          }
          .tasks-list-header {
            padding: 16px !important;
          }
          .tasks-table th, .tasks-table td {
            padding: 12px 14px !important;
          }
        }

        /* Mobile Views (max-width: 768px) */
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
          .tasks-page-body-content {
            padding: 0 !important;
          }
          .tasks-metrics-grid {
            display: flex !important;
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            gap: 12px !important;
            padding-block: 16px !important;
            padding-inline: 0 !important;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
          }
          .tasks-metrics-grid > *:first-child {
            margin-inline-start: 20px !important;
          }
          .tasks-metrics-grid > *:last-child {
            margin-inline-end: 20px !important;
          }
          .tasks-metrics-grid::-webkit-scrollbar {
            display: none; /* Hide scrollbars for slick slider look */
          }
          .stat-card {
            flex: 0 0 140px !important;
            scroll-snap-align: start;
            height: 97px !important;
            padding: 16px !important;
          }
          .tasks-list-container {
            border-left: none;
            border-right: none;
            border-radius: 0;
            box-shadow: none;
            background: transparent;
          }
          .tasks-mobile-list {
            padding-inline: 20px !important;
            padding-block: 16px !important;
            box-sizing: border-box !important;
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 12px !important;
          }
          .tasks-list-header {
            padding: 16px 20px !important;
            flex-direction: column !important;
            align-items: stretch !important;
            background: #FFFFFF;
            border-top: 1px solid #F5F5F5;
            gap: 12px !important;
          }
          .filter-tabs {
            overflow-x: auto;
            white-space: nowrap;
            padding: 4px !important;
            -webkit-overflow-scrolling: touch;
          }
          .filter-tabs::-webkit-scrollbar {
            display: none;
          }
          .filter-tab {
            flex: 0 0 auto;
          }
          .search-bar-wrapper {
            width: 100% !important;
          }
           /* Duplicate mobile header styles removed (defined in global.css) */          }
          .mobile-bottom-tabs {
            display: flex !important;
          }
          .emergency-alert-banner {
            flex-direction: column !important;
            align-items: stretch !important;
            height: auto !important;
            padding: 16px !important;
            margin: 0 16px 16px 16px !important;
          }
          .emergency-actions {
            width: 100%;
            margin-top: 12px;
          }
          .emergency-btn {
            flex: 1;
            height: 40px;
          }
        }

        /* Mobile Specific Style Overrides (Figma Perfect) */
        .mobile-id-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .mobile-badge-live {
          background: #171717;
          color: #FFFFFF;
          font-size: 8px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          letter-spacing: 0.4px;
        }
        .mobile-badge-sos {
          background: #EF4444;
          color: #FFFFFF;
          font-size: 8px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          letter-spacing: 0.4px;
        }
        .mobile-badge-disputed {
          background: #FEF3C7;
          color: #B45309;
          font-size: 8px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .mobile-badge-frozen {
          background: #171717;
          color: #FFFFFF;
          font-size: 8px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .mobile-badge-completed {
          background: #DCFCE7;
          color: #15803D;
          font-size: 8px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .mobile-top-details-btn {
          background: transparent;
          border: none;
          color: #A3A3A3;
          cursor: pointer;
        }
        .card-title-row {
          margin-top: 4px;
          text-align: start;
        }
        .card-mid-capsules {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
          flex-wrap: wrap;
        }
        .mid-capsule {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #FAFAFA;
          border: 1px solid #E5E5E5;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 10px;
          color: #737373;
        }
        .mid-capsule-budget {
          font-size: 10px;
          color: #171717;
          margin-inline-start: auto; /* Push budget to end of row */
        }
        .card-transition-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #FAFAFA;
          border-radius: 8px;
          padding: 6px 12px;
          margin-top: 8px;
          font-size: 10px;
          color: #404040;
          border: 1px solid #F5F5F5;
        }
        .transition-name {
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .transition-name.customer {
          text-align: start;
        }
        .transition-name.craftsman {
          text-align: end;
        }
        .transition-arrow {
          color: #A3A3A3;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 8px;
          flex-shrink: 0;
        }
        .card-progress-bar-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 10px;
          width: 100%;
        }
        .progress-bar-track {
          flex: 1;
          height: 4px;
          background: #F5F5F5;
          border-radius: 9999px;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          background: #171717;
          border-radius: 9999px;
          transition: width 0.3s ease;
        }
        .progress-bar-fill.fill-danger {
          background: #EF4444;
        }
        .progress-percentage-label {
          font-size: 9px;
          font-weight: 700;
          color: #737373;
          min-width: 24px;
          text-align: right;
        }
        
        /* Mobile Emergency Alert Banner */
        .mobile-emergency-banner {
          background: #FEF2F2;
          border: 1px solid #FEE2E2;
          border-radius: 16px;
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          margin-top: 4px;
          box-sizing: border-box;
          width: 100%;
          margin-left: 0;
          margin-right: 0;
        }
        .mobile-emergency-left {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }
        .mobile-emergency-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #EF4444;
          width: 30px;
          height: 30px;
          border-radius: 10px;
          color: #FFFFFF;
          flex-shrink: 0;
        }
        .mobile-emergency-content {
          display: flex;
          flex-direction: column;
          text-align: start;
        }
        .mobile-emergency-title {
          font-size: 11px;
          font-weight: 700;
          color: #B91C1C;
        }
        .mobile-emergency-text {
          font-size: 9px;
          color: #DC2626;
          margin-top: 1px;
        }
        .mobile-emergency-btn {
          background: #FFFFFF;
          border: 1px solid #FECACA;
          color: #B91C1C;
          font-size: 9px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 4px;
          cursor: pointer;
          white-space: nowrap;
        }
        .mobile-emergency-btn:hover {
          background: #FFF5F5;
        }
        .mobile-action-btn-text.full-width {
          flex: 1 1 100% !important;
        }

        /* Swapped Grid Values for Mobile Stat capsules */
        @media (max-width: 768px) {
          .tasks-metrics-grid {
            display: flex !important;
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            gap: 12px !important;
            padding-block: 16px !important;
            padding-inline: 0 !important;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
          }
          .tasks-metrics-grid > *:first-child {
            margin-inline-start: 20px !important;
          }
          .tasks-metrics-grid > *:last-child {
            margin-inline-end: 20px !important;
          }
          .tasks-metrics-grid::-webkit-scrollbar {
            display: none;
          }
          .stat-card {
            flex: 0 0 140px !important;
            min-width: 140px !important;
            scroll-snap-align: start;
            height: 97px !important;
            padding: 16px !important;
            border-radius: 16px !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            align-items: stretch !important;
            text-align: start !important;
            box-sizing: border-box !important;
          }
          .stat-label {
            font-size: 10px !important;
            font-weight: 700 !important;
            color: #737373 !important;
            letter-spacing: 0.5px !important;
            text-transform: uppercase !important;
            margin-top: 0 !important;
          }
          .stat-value-container {
            display: flex !important;
            align-items: baseline !important;
            justify-content: space-between !important;
            width: 100% !important;
            margin-top: 4px !important;
          }
          .stat-val {
            font-size: 24px !important;
            font-weight: 700 !important;
            color: #171717 !important;
            letter-spacing: -0.48px !important;
          }
          .stat-trend {
            font-size: 10px !important;
            font-weight: 700 !important;
            display: flex !important;
            align-items: center !important;
            gap: 2px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TasksPage;
