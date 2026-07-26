import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Star, 
  ShieldCheck, 
  Check, 
  X, 
  Eye, 
  AlertTriangle, 
  Ban,
  MoreHorizontal,
  Bell,
  ChevronLeft,
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import { useCraftsmen, type Craftsman } from '../hooks/useCraftsmen';
import { Sidebar } from '../../../../presentation/layouts/Sidebar';
import { Header } from '../../../../presentation/layouts/Header';
import { MobileBottomTabs } from '../../../../presentation/layouts/MobileBottomTabs';

export const CraftsmenPage: React.FC = () => {
  const {
    craftsmen,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    selectedId,
    setSelectedId,
    selectedCraftsman,
    tabCounts,
    suspendCraftsman,
    unsuspendCraftsman,
    banCraftsman,
    flagCraftsman,
    unflagCraftsman,
    approveVerification,
  } = useCraftsmen();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const [showActionsPopover, setShowActionsPopover] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedTrade, setSelectedTrade] = useState<string>('All');
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [showSuspendModal, setShowSuspendModal] = useState<boolean>(false);
  const [suspendReason, setSuspendReason] = useState<string>('');

  const handleSelectCraftsman = (id: string) => {
    setSelectedId(id);
    setMobileView('detail');
  };

  const uniqueTrades = useMemo(() => {
    const trades = new Set(craftsmen.map(c => c.trade));
    return ['All', ...Array.from(trades)];
  }, [craftsmen]);

  const displayedCraftsmen = useMemo(() => {
    return craftsmen.filter(c => {
      if (selectedTrade !== 'All' && c.trade !== selectedTrade) return false;
      if (statusFilter !== 'All' && c.status !== statusFilter.toLowerCase()) return false;
      return true;
    });
  }, [craftsmen, selectedTrade, statusFilter]);

  // Status Styling Mappings
  const getStatusColor = (status: Craftsman['status']) => {
    switch (status) {
      case 'online':
        return { bg: '#F0FDF4', text: '#15803D', dot: '#22C55E' };
      case 'offline':
        return { bg: '#F4F4F5', text: '#71717A', dot: '#9CA3AF' };
      case 'busy':
        return { bg: '#FFFBEB', text: '#B45309', dot: '#F59E0B' };
      case 'flagged':
        return { bg: '#FEF2F2', text: '#B91C1C', dot: '#EF4444' };
      case 'suspended':
        return { bg: '#FEE2E2', text: '#991B1B', dot: '#DC2626' };
      default:
        return { bg: '#F4F4F5', text: '#71717A', dot: '#9CA3AF' };
    }
  };

  const getCraftsmanTier = (c: Craftsman) => {
    if (c.rating >= 4.8 && c.jobsCount >= 50 && c.verifications.nationalId) {
      return { label: 'GOLD PRO', bg: 'linear-gradient(135deg, #f59e0b, #d97706)', text: '#ffffff', icon: '🏆' };
    }
    if (c.rating >= 4.5 && c.jobsCount >= 20) {
      return { label: 'SILVER', bg: 'linear-gradient(135deg, #94a3b8, #64748b)', text: '#ffffff', icon: '🥈' };
    }
    return { label: 'BRONZE', bg: 'linear-gradient(135deg, #d97706, #b45309)', text: '#ffffff', icon: '🥉' };
  };

  const handleExportDossier = (c?: Craftsman) => {
    const target = c || selectedCraftsman;
    if (!target) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Craftsman Verification Dossier - ${target.name}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; color: #0f172a; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
            .badge { display: inline-block; padding: 6px 14px; background: #0f172a; color: #fff; border-radius: 6px; font-weight: bold; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px; }
            .card { background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 style="margin:0">${target.name}</h1>
              <p style="margin:4px 0; color:#64748b">${target.trade} • Jerusalem, Palestine (القدس، فلسطين)</p>
            </div>
            <div>
              <span class="badge">TRUST SCORE: ${target.trustScore}/100</span>
            </div>
          </div>
          <div class="grid">
            <div class="card">
              <h3>Verification Checklist</h3>
              <p>National ID: ${target.verifications.nationalId ? '✅ VERIFIED' : '❌ PENDING'}</p>
              <p>Trade License: ${target.verifications.tradeLicense ? '✅ VERIFIED' : '❌ PENDING'}</p>
              <p>Selfie Face Match: ${target.verifications.selfieMatch ? '✅ VERIFIED' : '❌ PENDING'}</p>
              <p>Bank IBAN: ${target.verifications.bankIban ? '✅ VERIFIED' : '❌ PENDING'}</p>
              <p>Background Check: ${target.verifications.backgroundCheck ? '✅ VERIFIED' : '❌ PENDING'}</p>
              <p>Insurance: ${target.verifications.insurance ? '✅ VERIFIED' : '❌ PENDING'}</p>
            </div>
            <div class="card">
              <h3>Performance Metrics</h3>
              <p>Rating: ⭐ ${target.rating} / 5.0 (${target.reviewsCount} reviews)</p>
              <p>Jobs Completed: ${target.jobsCount} tasks</p>
              <p>Response Time: ${target.responseTimeMin} mins</p>
              <p>Account Status: ${target.status.toUpperCase()}</p>
            </div>
          </div>
          <p style="margin-top:40px; font-size:12px; color:#94a3b8">Official Sonaa Admin Verification Dossier Export • Printed on ${new Date().toLocaleDateString()}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Sparkline Generator for Earnings Chart
  const generateSparklinePoints = (data: number[], width: number, height: number) => {
    if (data.length === 0) return '';
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    return data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 8) - 4; // padding bottom/top
      return `${x},${y}`;
    }).join(' ');
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
          <h2>Craftsmen</h2>
          <span>Moderate & manage platform service providers</span>
        </div>

        <div className="craftsmen-page-body-content">
          {/* Desktop/Tablet Header row */}
          <div className="desktop-tablet-page-header desktop-tablet-only">
            <div style={{ textAlign: 'start' }} className="animate-fade-in">
              <h1 style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-title)', color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
                Craftsmen
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                Manage registered service providers, check credentials, suspend accounts
              </p>
            </div>

            <div className="animate-fade-in" style={{ display: 'flex', gap: '8px', position: 'relative' }}>
              <button 
                onClick={() => setShowFilterPopover(!showFilterPopover)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  padding: '8px 14px', 
                  background: showFilterPopover ? 'var(--bg-surface-hover)' : 'var(--bg-surface)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 'var(--border-radius-sm)', 
                  fontSize: '0.82rem', 
                  fontWeight: 600, 
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                <SlidersHorizontal size={14} />
                <span>Filters</span>
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
                      value={statusFilter} 
                      onChange={(e) => setStatusFilter(e.target.value)}
                      style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}
                    >
                      <option value="All">All Statuses</option>
                      <option value="Online">Online</option>
                      <option value="Offline">Offline</option>
                      <option value="Busy">Busy</option>
                      <option value="Flagged">Flagged</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Trade</label>
                    <select 
                      value={selectedTrade} 
                      onChange={(e) => setSelectedTrade(e.target.value)}
                      style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.8rem', textTransform: 'capitalize' }}
                    >
                      {uniqueTrades.map(trade => (
                        <option key={trade} value={trade}>{trade}</option>
                      ))}
                    </select>
                  </div>
                  <button 
                    onClick={() => {
                      setStatusFilter('All');
                      setSelectedTrade('All');
                      setShowFilterPopover(false);
                    }}
                    style={{ background: 'transparent', border: 'none', color: '#dc2626', fontSize: '0.75rem', fontWeight: 600, padding: 0, cursor: 'pointer', alignSelf: 'flex-start' }}
                  >
                    Reset Filters
                  </button>
                </div>
              )}

              <button 
                onClick={() => handleExportDossier()}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  padding: '8px 14px', 
                  background: 'var(--color-primary)', 
                  borderRadius: 'var(--border-radius-sm)', 
                  fontSize: '0.82rem', 
                  fontWeight: 600, 
                  color: 'var(--bg-base)' 
                }}
              >
                <Download size={14} />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Error banner */}
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

          {/* Loading */}
          {loading ? (
            <div className="flex-center" style={{ minHeight: '400px', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <RefreshCw className="animate-spin" size={36} style={{ color: 'var(--color-primary)' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading craftsmen...</p>
            </div>
          ) : (
            /* Master-Detail Responsive Layout */
            <div className="craftsmen-layout-container animate-fade-in">
          {/* LEFT COLUMN: List & Filters */}
          <div className={`craftsmen-list-card glass-card ${mobileView === 'list' ? 'mobile-visible-block' : 'mobile-hidden'}`}>
            {/* Search Input */}
            <div style={{ position: 'relative', width: '100%' }}>
              <input 
                type="text" 
                placeholder="Search by name, trade, or ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ 
                  width: '100%', 
                  height: '36px',
                  boxSizing: 'border-box',
                  background: 'var(--bg-surface-hover)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 'var(--border-radius-sm)', 
                  paddingLeft: '36px', 
                  paddingRight: '12px', 
                  fontSize: '0.82rem', 
                  color: 'var(--text-primary)',
                  outline: 'none'
                }} 
              />
              <Search 
                size={14} 
                style={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '12px', 
                  transform: 'translateY(-50%)', 
                  color: 'var(--text-muted)' 
                }} 
              />
            </div>

            {/* Filter Tabs */}
            <div 
              style={{ 
                display: 'flex', 
                background: 'var(--bg-surface-hover)', 
                borderRadius: 'var(--border-radius-sm)', 
                padding: '2px', 
                width: '100%',
                overflowX: 'auto',
                gap: '2px'
              }}
            >
              {(['all', 'verified', 'pending', 'suspended'] as const).map((tab) => {
                const isActive = activeTab === tab;
                const count = tabCounts[tab];
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      background: isActive ? 'var(--bg-surface)' : 'transparent',
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      textTransform: 'capitalize'
                    }}
                  >
                    <span>{tab}</span>
                    <span 
                      style={{ 
                        fontSize: '0.68rem', 
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

            {/* Craftsmen Table */}
            <div style={{ overflowX: 'auto', width: '100%', flexGrow: 1 }} className="desktop-tablet-only">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'start' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface-hover)' }}>
                    <th style={{ padding: '10px 12px', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', width: '50%' }}>Craftsman</th>
                    <th style={{ padding: '10px 8px', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Rating</th>
                    <th style={{ padding: '10px 8px', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Jobs</th>
                    <th style={{ padding: '10px 8px', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Trust</th>
                    <th style={{ padding: '10px 12px', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedCraftsmen.map((c) => {
                    const isSelected = selectedId === c.id;
                    const styleMeta = getStatusColor(c.status);
                    return (
                      <tr 
                        key={c.id} 
                        onClick={() => handleSelectCraftsman(c.id)}
                        className={`craftsman-row ${isSelected ? 'selected' : ''}`}
                        style={{ 
                          borderBottom: '1px solid var(--border-color)',
                          cursor: 'pointer',
                          background: isSelected ? 'var(--bg-surface-hover)' : 'transparent',
                          transition: 'background var(--transition-fast)'
                        }}
                      >
                        {/* Craftsman Col */}
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                              {c.avatarUrl ? (
                                <img 
                                  src={c.avatarUrl} 
                                  alt={c.name} 
                                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} 
                                />
                              ) : (
                                <div 
                                  style={{ 
                                    width: '32px', 
                                    height: '32px', 
                                    borderRadius: '50%', 
                                    background: '#d1d6db', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    color: '#525252' 
                                  }}
                                >
                                  {c.name.split(' ').map(n => n[0]).join('')}
                                </div>
                              )}
                              {/* Status dot */}
                              <span 
                                style={{ 
                                  position: 'absolute', 
                                  bottom: '-2px', 
                                  right: '-2px', 
                                  width: '10px', 
                                  height: '10px', 
                                  borderRadius: '50%', 
                                  background: styleMeta.dot, 
                                  border: '2px solid var(--bg-surface)' 
                                }} 
                              />
                            </div>
                            <div style={{ textAlign: 'start' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</span>
                                <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '4px', background: getCraftsmanTier(c).bg, color: '#fff' }}>
                                  {getCraftsmanTier(c).icon} {getCraftsmanTier(c).label}
                                </span>
                                {c.trustScore >= 95 && (
                                  <ShieldCheck size={12} color="#3b82f6" fill="rgba(59,130,246,0.1)" />
                                )}
                              </div>
                              <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{c.trade}</span>
                            </div>
                          </div>
                        </td>

                        {/* Rating Col */}
                        <td style={{ padding: '12px 8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Star size={11} fill="#F59E0B" color="#F59E0B" />
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{c.rating}</span>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-disabled)' }}>({c.reviewsCount})</span>
                          </div>
                        </td>

                        {/* Jobs Col */}
                        <td style={{ padding: '12px 8px' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{c.jobsCount}</span>
                        </td>

                        {/* Trust Col */}
                        <td style={{ padding: '12px 8px' }}>
                          <div 
                            style={{ 
                              display: 'inline-block',
                              fontSize: '0.68rem', 
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: c.trustScore >= 90 ? 'rgba(34,197,94,0.08)' : c.trustScore >= 80 ? 'var(--bg-surface-hover)' : 'rgba(239,68,68,0.08)',
                              color: c.trustScore >= 90 ? '#15803D' : c.trustScore >= 80 ? 'var(--text-secondary)' : '#B91C1C'
                            }}
                          >
                            {c.trustScore}
                          </div>
                        </td>

                        {/* Status Col */}
                        <td style={{ padding: '12px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: styleMeta.text }}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {displayedCraftsmen.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-disabled)' }}>
                        No craftsmen found matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Craftsmen Cards List */}
            <div className="craftsmen-mobile-list mobile-only">
              {displayedCraftsmen.map((c) => {
                const styleMeta = getStatusColor(c.status);
                return (
                  <div 
                    key={c.id} 
                    className="craftsman-mobile-card"
                    onClick={() => handleSelectCraftsman(c.id)}
                  >
                    <div className="craftsman-mobile-card-top">
                      <div className="craftsman-mobile-avatar-wrapper">
                        {c.avatarUrl ? (
                          <img src={c.avatarUrl} alt={c.name} className="craftsman-mobile-avatar" />
                        ) : (
                          <div className="craftsman-mobile-avatar-placeholder">
                            {c.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        )}
                        <span className="craftsman-mobile-status-dot" style={{ background: styleMeta.dot }} />
                      </div>
                      <div className="craftsman-mobile-info">
                        <div className="craftsman-mobile-name-row">
                          <strong>{c.name}</strong>
                          {c.trustScore >= 95 && (
                            <ShieldCheck size={12} color="#3b82f6" fill="rgba(59,130,246,0.1)" />
                          )}
                        </div>
                        <span className="craftsman-mobile-trade">{c.trade}</span>
                      </div>
                      <span className="craftsman-mobile-status-badge" style={{ background: styleMeta.bg, color: styleMeta.text }}>
                        {c.status}
                      </span>
                    </div>

                    <div className="craftsman-mobile-card-metrics">
                      <div className="mobile-metric-item">
                        <Star size={10} fill="#F59E0B" color="#F59E0B" />
                        <strong>{c.rating}</strong>
                        <span>({c.reviewsCount})</span>
                      </div>
                      <div className="mobile-metric-item">
                        <strong>{c.jobsCount}</strong>
                        <span>jobs</span>
                      </div>
                      <div className="mobile-metric-item">
                        <span>Trust:</span>
                        <strong style={{ 
                          color: c.trustScore >= 90 ? '#15803D' : c.trustScore >= 80 ? 'var(--text-secondary)' : '#B91C1C'
                        }}>{c.trustScore}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
              {displayedCraftsmen.length === 0 && (
                <div className="craftsmen-mobile-empty">
                  No craftsmen found matching filters.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Detail Inspector */}
          {selectedCraftsman ? (
            <div className={`craftsman-detail-card glass-card ${mobileView === 'detail' ? 'mobile-visible-flex' : 'mobile-hidden'}`}>
              {/* Warning Notice Banner */}
              {(selectedCraftsman.status === 'suspended' || selectedCraftsman.status === 'flagged') && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: selectedCraftsman.status === 'suspended' ? '#FEF2F2' : '#FFFBEB',
                  border: `1px solid ${selectedCraftsman.status === 'suspended' ? '#FCA5A5' : '#FDE68A'}`,
                  borderRadius: '8px',
                  padding: '10px 12px',
                  marginBottom: '16px',
                  color: selectedCraftsman.status === 'suspended' ? '#991B1B' : '#92400E',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textAlign: 'start',
                  width: '100%',
                  boxSizing: 'border-box'
                }}>
                  <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                  <span>
                    {selectedCraftsman.status === 'suspended' 
                      ? 'This provider is suspended. Verification details and actions are read-only.' 
                      : 'This provider is flagged for review. Moderation actions are active.'}
                  </span>
                </div>
              )}
              {/* Back Button (Mobile Only) */}
              <button
                className="craftsman-mobile-back-btn mobile-only"
                onClick={() => setMobileView('list')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '0 0 12px 0',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  width: '100%',
                  borderBottom: '1px solid var(--border-color)',
                  marginBottom: '16px'
                }}
              >
                <ChevronLeft size={16} className="rtl-flip" />
                <span>Back to List</span>
              </button>
              {/* Profile Header */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', textAlign: 'start' }}>
                {selectedCraftsman.avatarUrl ? (
                  <img 
                    src={selectedCraftsman.avatarUrl} 
                    alt={selectedCraftsman.name} 
                    style={{ width: '64px', height: '64px', borderRadius: '16px', objectFit: 'cover' }} 
                  />
                ) : (
                  <div 
                    style={{ 
                      width: '64px', 
                      height: '64px', 
                      borderRadius: '16px', 
                      background: '#d1d6db', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '1.4rem',
                      fontWeight: 700,
                      color: '#525252' 
                    }}
                  >
                    {selectedCraftsman.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                      <h2 
                        style={{ 
                          fontSize: '1.1rem', 
                          fontWeight: 700, 
                          color: 'var(--text-primary)', 
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {selectedCraftsman.name}
                      </h2>
                      {selectedCraftsman.trustScore >= 95 && (
                        <ShieldCheck size={14} color="#3b82f6" fill="rgba(59,130,246,0.1)" style={{ flexShrink: 0 }} />
                      )}
                    </div>
                    <div style={{ position: 'relative' }}>
                      <button 
                        onClick={() => setShowActionsPopover(!showActionsPopover)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      
                      {showActionsPopover && (
                        <div style={{
                          position: 'absolute',
                          top: '24px',
                          right: 0,
                          background: '#ffffff',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          padding: '4px',
                          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                          zIndex: 100,
                          width: '140px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px'
                        }}>
                          {[
                            { label: 'Flag Account', action: () => { flagCraftsman(selectedCraftsman.id); setShowActionsPopover(false); } },
                            { label: 'Unflag Account', action: () => { unflagCraftsman(selectedCraftsman.id); setShowActionsPopover(false); } },
                            selectedCraftsman.status === 'suspended'
                              ? { label: 'Unsuspend Account', action: () => { unsuspendCraftsman(selectedCraftsman.id); setShowActionsPopover(false); } }
                              : { label: 'Suspend Account', action: () => { setSuspendReason(''); setShowSuspendModal(true); setShowActionsPopover(false); } },
                            { label: 'Ban Account', action: () => { banCraftsman(selectedCraftsman.id); setShowActionsPopover(false); } }
                          ].map((act, index) => (
                            <button
                              key={index}
                              onClick={act.action}
                              style={{
                                width: '100%',
                                padding: '6px 8px',
                                background: 'transparent',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '0.78rem',
                                fontWeight: 500,
                                textAlign: 'start',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface-hover)'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              {act.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {selectedCraftsman.trade} · Joined {selectedCraftsman.joinedDate}
                  </p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                    <span 
                      style={{ 
                        fontSize: '0.65rem', 
                        fontWeight: 700, 
                        padding: '2px 8px', 
                        borderRadius: '4px',
                        background: getStatusColor(selectedCraftsman.status).bg,
                        color: getStatusColor(selectedCraftsman.status).text,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}
                    >
                      {selectedCraftsman.status}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-disabled)' }}>
                      ID #{selectedCraftsman.idNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div 
                className="detail-metrics-grid"
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(4, 1fr)', 
                  gap: '8px', 
                  marginTop: '16px',
                  width: '100%' 
                }}
              >
                {[
                  { label: 'Rating', val: selectedCraftsman.rating, sub: `${selectedCraftsman.reviewsCount} reviews` },
                  { label: 'Jobs', val: selectedCraftsman.jobsCount, sub: 'completed' },
                  { label: 'Response', val: `${selectedCraftsman.responseTimeMin} min`, sub: 'avg time' },
                  { label: 'Trust', val: selectedCraftsman.trustScore, sub: 'out of 100' },
                ].map((m, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      background: 'var(--bg-surface-hover)', 
                      borderRadius: '12px', 
                      padding: '10px 8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center'
                    }}
                  >
                    <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</span>
                    <strong style={{ fontSize: '1rem', color: 'var(--text-primary)', marginTop: '4px', display: 'block' }}>{m.val}</strong>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-disabled)', marginTop: '2px', whiteSpace: 'nowrap' }}>{m.sub}</span>
                  </div>
                ))}
              </div>

              {/* Verification Checklist */}
              <div style={{ marginTop: '16px', textAlign: 'start' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Verification Checklist</span>
                  <button
                    onClick={() => handleExportDossier(selectedCraftsman)}
                    style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '2px 8px', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Download size={12} />
                    <span>Print Dossier</span>
                  </button>
                </div>
                <div 
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '8px', 
                    marginTop: '8px' 
                  }}
                >
                  {[
                    { key: 'nationalId', label: 'National ID' },
                    { key: 'selfieMatch', label: 'Selfie match' },
                    { key: 'tradeLicense', label: 'Trade license' },
                    { key: 'bankIban', label: 'Bank IBAN' },
                    { key: 'backgroundCheck', label: 'Background check' },
                    { key: 'insurance', label: 'Insurance' },
                  ].map((chk) => {
                    const verified = selectedCraftsman.verifications[chk.key as keyof Craftsman['verifications']];
                    return (
                      <button 
                        key={chk.key} 
                        onClick={() => approveVerification(selectedCraftsman.id, chk.key as keyof Craftsman['verifications'], !verified)}
                        title={`Click to ${verified ? 'unverify' : 'verify'} ${chk.label}`}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          background: verified ? 'rgba(22,163,74,0.06)' : 'var(--bg-surface-hover)', 
                          padding: '8px 12px', 
                          borderRadius: '8px',
                          border: `1px solid ${verified ? 'rgba(22,163,74,0.3)' : 'var(--border-color)'}`,
                          cursor: 'pointer',
                          textAlign: 'start',
                          fontFamily: 'inherit',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {verified ? (
                          <Check size={14} color="#16a34a" style={{ flexShrink: 0 }} />
                        ) : (
                          <X size={14} color="#dc2626" style={{ flexShrink: 0 }} />
                        )}
                        <span style={{ fontSize: '0.75rem', fontWeight: verified ? 600 : 500, color: verified ? '#15803D' : 'var(--text-secondary)' }}>
                          {chk.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Earnings Card */}
              <div 
                style={{ 
                  background: '#171717', 
                  borderRadius: '12px', 
                  padding: '16px', 
                  marginTop: '16px',
                  color: '#FFFFFF',
                  textAlign: 'start',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', color: '#a3a3a3', letterSpacing: '0.1em' }}>
                  Earnings · Last 30 days
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
                  <strong style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-title)' }}>
                    {selectedCraftsman.earnings30Days.toLocaleString()} ILS
                  </strong>
                  <span 
                    style={{ 
                      fontSize: '0.72rem', 
                      fontWeight: 600,
                      color: selectedCraftsman.earningsChangePct >= 0 ? '#4ade80' : '#f87171' 
                    }}
                  >
                    {selectedCraftsman.earningsChangePct >= 0 ? '+' : ''}{selectedCraftsman.earningsChangePct}%
                  </span>
                </div>

                {/* Sparkline Graphic */}
                <div style={{ marginTop: '14px', height: '40px', width: '100%' }}>
                  <svg width="100%" height="40" viewBox="0 0 257 40" preserveAspectRatio="none">
                    <polyline
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      points={generateSparklinePoints(selectedCraftsman.earningsSparkline, 257, 40)}
                    />
                  </svg>
                </div>
              </div>

              {/* Action Buttons */}
              <div 
                style={{ 
                  display: 'flex', 
                  gap: '8px', 
                  marginTop: 'auto', 
                  paddingTop: '16px',
                  width: '100%'
                }}
              >
                <button 
                  onClick={() => setShowViewModal(true)}
                  style={{ 
                    flex: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '4px',
                    padding: '8px 12px', 
                    background: '#f5f5f5', 
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#171717',
                    cursor: 'pointer' 
                  }}
                >
                  <Eye size={12} />
                  <span>View</span>
                </button>
                {selectedCraftsman.status === 'suspended' ? (
                  <button 
                    onClick={() => unsuspendCraftsman(selectedCraftsman.id)}
                    style={{ 
                      flex: 1.2, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '4px',
                      padding: '8px 12px', 
                      background: '#f0fdf4', 
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#15803d',
                      border: '1px solid #bbf7d0',
                      cursor: 'pointer'
                    }}
                  >
                    <Check size={12} />
                    <span>Unsuspend</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => { setSuspendReason(''); setShowSuspendModal(true); }}
                    style={{ 
                      flex: 1.2, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '4px',
                      padding: '8px 12px', 
                      background: '#fffbeb', 
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#b45309',
                      border: '1px solid #fde68a',
                      cursor: 'pointer'
                    }}
                  >
                    <AlertTriangle size={12} />
                    <span>Suspend</span>
                  </button>
                )}
                <button 
                  onClick={() => banCraftsman(selectedCraftsman.id)}
                  disabled={selectedCraftsman.status === 'suspended'}
                  style={{ 
                    flex: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '4px',
                    padding: '8px 12px', 
                    background: selectedCraftsman.status === 'suspended' ? '#fef2f2' : '#fef2f2', 
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: selectedCraftsman.status === 'suspended' ? '#f87171' : '#b91c1c',
                    cursor: selectedCraftsman.status === 'suspended' ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Ban size={12} />
                  <span>Ban</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="craftsman-detail-card glass-card flex-center" style={{ color: 'var(--text-disabled)', minHeight: '400px' }}>
              Select a craftsman to view their details.
            </div>
          )}
        </div>
        )}
      </div>

      {/* Craftsman Profile Details Modal */}
      {showViewModal && selectedCraftsman && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setShowViewModal(false)}
        >
          <div 
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '560px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                {selectedCraftsman.avatarUrl ? (
                  <img src={selectedCraftsman.avatarUrl} alt={selectedCraftsman.name} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#d1d6db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.2rem', color: '#525252' }}>
                    {selectedCraftsman.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
                <div style={{ textAlign: 'start' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedCraftsman.name}</h3>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{selectedCraftsman.trade} · ID #{selectedCraftsman.idNumber}</span>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: getStatusColor(selectedCraftsman.status).bg, color: getStatusColor(selectedCraftsman.status).text, textTransform: 'uppercase' }}>
                      {selectedCraftsman.status}
                    </span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(59,130,246,0.1)', color: '#2563eb' }}>
                      Trust Score {selectedCraftsman.trustScore}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowViewModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            {/* Performance Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', background: '#F8FAFC', borderRadius: '12px', padding: '12px', marginBottom: '20px', textAlign: 'center' }}>
              <div>
                <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Rating</span>
                <strong style={{ display: 'block', fontSize: '1rem', color: '#0F172A', marginTop: '2px' }}>⭐ {selectedCraftsman.rating}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Jobs</span>
                <strong style={{ display: 'block', fontSize: '1rem', color: '#0F172A', marginTop: '2px' }}>{selectedCraftsman.jobsCount}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Response</span>
                <strong style={{ display: 'block', fontSize: '1rem', color: '#0F172A', marginTop: '2px' }}>{selectedCraftsman.responseTimeMin}m</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Joined</span>
                <strong style={{ display: 'block', fontSize: '0.82rem', color: '#0F172A', marginTop: '4px' }}>{selectedCraftsman.joinedDate}</strong>
              </div>
            </div>

            {/* Verification Documents */}
            <div style={{ marginBottom: '20px', textAlign: 'start' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verification Status</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                  { key: 'nationalId', label: 'National ID' },
                  { key: 'selfieMatch', label: 'Selfie Match' },
                  { key: 'tradeLicense', label: 'Trade License' },
                  { key: 'bankIban', label: 'Bank IBAN' },
                  { key: 'backgroundCheck', label: 'Background Check' },
                  { key: 'insurance', label: 'Insurance' },
                ].map(item => {
                  const isVer = selectedCraftsman.verifications[item.key as keyof Craftsman['verifications']];
                  return (
                    <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: isVer ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${isVer ? '#DCFCE7' : '#FEE2E2'}`, borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600, color: isVer ? '#15803D' : '#991B1B' }}>
                      {isVer ? <Check size={14} /> : <X size={14} />}
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 30-Day Earnings */}
            <div style={{ background: '#171717', color: '#FFFFFF', borderRadius: '12px', padding: '16px', marginBottom: '20px', textAlign: 'start' }}>
              <span style={{ fontSize: '0.68rem', color: '#A3A3A3', fontWeight: 700, textTransform: 'uppercase' }}>30-Day Platform Earnings</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '4px' }}>
                {selectedCraftsman.earnings30Days.toLocaleString()} ILS
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {selectedCraftsman.status === 'suspended' ? (
                <button 
                  onClick={() => { unsuspendCraftsman(selectedCraftsman.id); setShowViewModal(false); }} 
                  style={{ flex: 1, padding: '10px', background: '#22C55E', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Unsuspend Account
                </button>
              ) : (
                <button 
                  onClick={() => { suspendCraftsman(selectedCraftsman.id); setShowViewModal(false); }} 
                  style={{ flex: 1, padding: '10px', background: '#F59E0B', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Suspend Account
                </button>
              )}
              <button 
                onClick={() => setShowViewModal(false)} 
                style={{ padding: '10px 20px', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Craftsman Modal */}
      {showSuspendModal && selectedCraftsman && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setShowSuspendModal(false)}
        >
          <div 
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '500px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
              position: 'relative',
              textAlign: 'start'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}>
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Suspend Account</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{selectedCraftsman.name} ({selectedCraftsman.trade})</span>
                </div>
              </div>
              <button onClick={() => setShowSuspendModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#4b5563', margin: '0 0 14px 0', lineHeight: 1.5 }}>
              Specify the reason for suspending this craftsman. This message will be sent directly to the craftsman as a push & system notification.
            </p>

            {/* Quick Reason Preset Chips */}
            <div style={{ marginBottom: '14px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Quick Reasons</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {[
                  'Unverified trade license documents',
                  'Multiple safety or quality dispute reports',
                  'Violation of platform terms of service',
                  'Incomplete profile verification requirements',
                ].map((reasonText, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSuspendReason(reasonText)}
                    style={{
                      background: suspendReason === reasonText ? '#FEF2F2' : '#F4F4F5',
                      border: `1px solid ${suspendReason === reasonText ? '#FCA5A5' : '#E4E4E7'}`,
                      color: suspendReason === reasonText ? '#991B1B' : '#52525B',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '0.72rem',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    {reasonText}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Reason Textarea */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>Notification Message to Craftsman</label>
              <textarea
                rows={3}
                placeholder="Enter custom message or explanation..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  padding: '10px 12px',
                  fontSize: '0.82rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={async () => {
                  await suspendCraftsman(selectedCraftsman.id, suspendReason);
                  setShowSuspendModal(false);
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Confirm Suspend & Send Notification
              </button>
              <button
                type="button"
                onClick={() => setShowSuspendModal(false)}
                style={{
                  padding: '10px 16px',
                  background: 'var(--bg-surface-hover)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      </main>

      <MobileBottomTabs />

      {/* Styled block for scoped layout styling */}
      <style>{`
        .craftsmen-layout-container {
          display: flex;
          gap: 16px;
          width: 100%;
          align-items: stretch;
          box-sizing: border-box;
        }

        .craftsmen-list-card {
          flex: 1.5;
          min-width: 0;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: var(--spacing-md);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .craftsman-detail-card {
          flex: 1.1;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-self: flex-start;
          position: sticky;
          top: calc(var(--header-height) + 16px);
        }

        /* Hover styles */
        .craftsman-row:hover {
          background: var(--bg-surface-hover) !important;
        }



        @media (max-width: 1024px) {
          .craftsmen-layout-container {
            flex-direction: column;
          }
          .craftsman-detail-card {
            position: relative;
            top: 0;
            width: 100%;
          }
        }

        @media (max-width: 768px) {
          .top-header { display: none !important; }
          .mobile-bottom-tabs { display: flex !important; }
          .main-content {
            margin-inline-start: 0 !important;
            padding-bottom: 84px !important;
            padding-inline-start: 0 !important;
            padding-inline-end: 0 !important;
            padding-top: 0 !important;
          }
          .craftsmen-page-header {
            padding: 0 16px;
            margin-top: 12px !important;
          }
          .craftsmen-layout-container {
            padding: 0 16px;
            flex-direction: column;
            gap: 0;
          }
          .craftsmen-list-card.mobile-hidden,
          .craftsman-detail-card.mobile-hidden {
            display: none !important;
          }
          .craftsmen-list-card.mobile-visible-block {
            display: flex !important;
            width: 100% !important;
            border-left: none;
            border-right: none;
            border-radius: 0;
            box-shadow: none;
            background: transparent;
            padding: 0 !important;
          }
          .craftsman-detail-card.mobile-visible-flex {
            display: flex !important;
            width: 100% !important;
            border-left: none;
            border-right: none;
            border-radius: 0;
            box-shadow: none;
            background: transparent;
            padding: 16px !important;
          }
        }

        @media (max-width: 480px) {
          .detail-metrics-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 768px) {
          /* Mobile Craftsmen Card Styles */
          .craftsmen-mobile-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
            width: 100%;
            margin-top: 8px;
          }
          .craftsman-mobile-card {
            background: #FFFFFF;
            border: 1px solid #E5E5E5;
            border-radius: 16px;
            padding: 14px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.02);
            cursor: pointer;
          }
          .craftsman-mobile-card-top {
            display: flex;
            align-items: center;
            gap: 12px;
            width: 100%;
          }
          .craftsman-mobile-avatar-wrapper {
            position: relative;
            flex-shrink: 0;
          }
          .craftsman-mobile-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
          }
          .craftsman-mobile-avatar-placeholder {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #d1d6db;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.9rem;
            font-weight: 700;
            color: #525252;
          }
          .craftsman-mobile-status-dot {
            position: absolute;
            bottom: -1px;
            right: -1px;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            border: 2px solid #FFFFFF;
          }
          .craftsman-mobile-info {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            text-align: start;
            flex-grow: 1;
            min-width: 0;
          }
          .craftsman-mobile-name-row {
            display: flex;
            align-items: center;
            gap: 4px;
            width: 100%;
          }
          .craftsman-mobile-name-row strong {
            font-size: 13px;
            color: #171717;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .craftsman-mobile-trade {
            font-size: 11px;
            color: #737373;
            margin-top: 1px;
          }
          .craftsman-mobile-status-badge {
            font-size: 9px;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 4px;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            flex-shrink: 0;
          }
          .craftsman-mobile-card-metrics {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #FAFAFA;
            border: 1px solid #F5F5F5;
            border-radius: 8px;
            padding: 8px 12px;
            font-size: 11px;
          }
          .mobile-metric-item {
            display: flex;
            align-items: center;
            gap: 4px;
            color: #525252;
          }
          .mobile-metric-item strong {
            color: #171717;
          }
          .mobile-metric-item span {
            color: #8E8E93;
          }
          .craftsmen-mobile-empty {
            text-align: center;
            color: var(--text-muted);
            padding: 32px 16px;
          }

          /* Duplicate mobile header styles removed (defined in global.css) */
        }
      `}</style>
    </div>
  );
};

export default CraftsmenPage;
