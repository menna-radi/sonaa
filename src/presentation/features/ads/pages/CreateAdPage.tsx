import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useNavigation } from '../../../context/NavigationContext';
import { Sidebar } from '../../../../presentation/layouts/Sidebar';
import { Header } from '../../../../presentation/layouts/Header';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import {
  ArrowLeft,
  Upload,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  FileImage,
  Globe,
  Search,
  Bell,
  Link as LinkIcon,
  ChevronDown,
  X,
  User,
  Wrench
} from 'lucide-react';

interface City {
  name: string;
  selected: boolean;
  reach: number;
}

interface Category {
  name: string;
  selected: boolean;
}

interface Placement {
  id: string;
  label: string;
  selected: boolean;
}

export const CreateAdPage: React.FC = () => {
  const { navigate } = useNavigation();
  const { isRtl } = useLanguage();
  const { dependencies } = useDependencies();
  const { adRepository } = dependencies;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileActiveTab, setMobileActiveTab] = useState<'creative' | 'schedule' | 'placement' | 'targeting'>('creative');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Creative States
  const [adTitle, setAdTitle] = useState('Summer AC Repair Special');
  const [description, setDescription] = useState('Get 20% off on all AC maintenance and repair services this summer.');
  const [ctaText, setCtaText] = useState('Book Now');
  const [destinationUrl, setDestinationUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // New Creative Fields: URL, Link Type, and Entity Selection
  const [adUrl, setAdUrl] = useState('');
  const [linkType, setLinkType] = useState<'task' | 'craftsman'>('task');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [selectedEntityLabel, setSelectedEntityLabel] = useState<string | null>(null);
  const [entitySearchQuery, setEntitySearchQuery] = useState('');
  const [entityDropdownOpen, setEntityDropdownOpen] = useState(false);
  const [tasksList, setTasksList] = useState<{id: string; label: string}[]>([]);
  const [craftsmenList, setCraftsmenList] = useState<{id: string; label: string}[]>([]);
  const entityDropdownRef = useRef<HTMLDivElement>(null);

  // Schedule States
  const [startDate, setStartDate] = useState('2026-07-02');
  const [endDate, setEndDate] = useState('2026-08-02');
  const [runContinuously, setRunContinuously] = useState(false);
  const [budget, setBudget] = useState('5000');

  // Placement States
  const [placements, setPlacements] = useState<Placement[]>([
    { id: 'home_banner', label: 'Home Page Banner', selected: true },
    { id: 'search_results', label: 'Search Results', selected: false },
    { id: 'category_pages', label: 'Category Pages', selected: false },
    { id: 'craftsmen_listing', label: 'Craftsmen Listing Pages', selected: false },
    { id: 'task_details', label: 'Task Details Pages', selected: false },
    { id: 'notifications', label: 'Notifications Section', selected: false },
    { id: 'popups', label: 'Promotional Popups', selected: false },
    { id: 'featured_slots', label: 'Featured Craftsman Slots', selected: false },
  ]);

  // Targeting States
  const [userType, setUserType] = useState<'Customers' | 'Craftsmen' | 'Both'>('Customers');
  
  const [categories, setCategories] = useState<Category[]>([
    { name: 'Electricians', selected: false },
    { name: 'Plumbers', selected: false },
    { name: 'AC Repair', selected: true },
    { name: 'Painting', selected: false },
    { name: 'Cleaning', selected: false },
    { name: 'Maintenance', selected: false },
    { name: 'Carpenters', selected: false },
    { name: 'Movers', selected: false },
  ]);

  const [locationType, setLocationType] = useState<'All' | 'Cities' | 'Districts'>('Cities');

  const [cities, setCities] = useState<City[]>([
    { name: 'Jerusalem (القدس)', selected: true, reach: 45000 },
    { name: 'Old City (البلدة القديمة)', selected: true, reach: 15000 },
    { name: 'Beit Hanina (بيت حنينا)', selected: true, reach: 12000 },
    { name: 'Shuafat (شعفاط)', selected: false, reach: 10000 },
    { name: 'Sheikh Jarrah (الشيخ جراح)', selected: false, reach: 8000 },
    { name: 'Silwan (سلوان)', selected: false, reach: 9000 },
    { name: 'Ramallah (رام الله)', selected: false, reach: 25000 },
    { name: 'Bethlehem (بيت لحم)', selected: false, reach: 18000 },
    { name: 'Hebron (الخليل)', selected: false, reach: 20000 },
  ]);

  // Alert/Notification State on Submit
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch tasks and craftsmen lists for the entity dropdown
  useEffect(() => {
    const fetchEntities = async () => {
      const tasksResult = await dependencies.taskRepository.getTasks();
      if (tasksResult.success) {
        setTasksList(tasksResult.data.map(t => ({ id: t.id, label: `${t.jobNumber} — ${t.title}` })));
      }
      const craftsmenResult = await dependencies.craftsmanRepository.getCraftsmen();
      if (craftsmenResult.success) {
        setCraftsmenList(craftsmenResult.data.map(c => ({ id: c.id, label: `${c.idNumber} — ${c.name} (${c.trade})` })));
      }
    };
    fetchEntities();
  }, [dependencies.taskRepository, dependencies.craftsmanRepository]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (entityDropdownRef.current && !entityDropdownRef.current.contains(e.target as Node)) {
        setEntityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset selection when link type changes
  useEffect(() => {
    setSelectedEntityId(null);
    setSelectedEntityLabel(null);
    setEntitySearchQuery('');
    setEntityDropdownOpen(false);
  }, [linkType]);

  // Filtered entity list based on search
  const filteredEntities = useMemo(() => {
    const list = linkType === 'task' ? tasksList : craftsmenList;
    if (!entitySearchQuery.trim()) return list;
    return list.filter(item => item.label.toLowerCase().includes(entitySearchQuery.toLowerCase()));
  }, [linkType, tasksList, craftsmenList, entitySearchQuery]);

  const handleSelectEntity = (id: string, label: string) => {
    setSelectedEntityId(id);
    setSelectedEntityLabel(label);
    setEntityDropdownOpen(false);
    setEntitySearchQuery('');
  };

  const handleClearEntity = () => {
    setSelectedEntityId(null);
    setSelectedEntityLabel(null);
  };

  // File Upload Handlers
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Toggle handlers
  const togglePlacement = (id: string) => {
    setPlacements(prev =>
      prev.map(p => (p.id === id ? { ...p, selected: !p.selected } : p))
    );
  };

  const toggleCategory = (name: string) => {
    setCategories(prev =>
      prev.map(c => (c.name === name ? { ...c, selected: !c.selected } : c))
    );
  };

  const toggleCity = (name: string) => {
    setCities(prev =>
      prev.map(c => (c.name === name ? { ...c, selected: !c.selected } : c))
    );
  };

  // Dynamic Reach Calculation
  const reachMetrics = useMemo(() => {
    let baseReach = 50000; // base national reach

    if (locationType === 'Cities') {
      const selectedCities = cities.filter(c => c.selected);
      if (selectedCities.length === 0) {
        baseReach = 0;
      } else {
        baseReach = selectedCities.reduce((sum, c) => sum + c.reach, 0);
      }
    } else if (locationType === 'All') {
      baseReach = 180000;
    } else {
      // Districts
      baseReach = 45000;
    }

    // Category multiplier
    const selectedCats = categories.filter(c => c.selected).length;
    const catMultiplier = selectedCats === 0 ? 0.2 : 0.8 + selectedCats * 0.1;

    // Placement multiplier
    const selectedPlacements = placements.filter(p => p.selected).length;
    const placementMultiplier = selectedPlacements === 0 ? 0.5 : 0.9 + selectedPlacements * 0.1;

    const totalReach = Math.round(baseReach * catMultiplier * placementMultiplier);

    // Format cities list for reach subtext
    const citiesListStr = locationType === 'All' 
      ? 'All Jerusalem & Palestine (القدس والضفة)' 
      : cities.filter(c => c.selected).map(c => c.name).join(' and ') || 'No cities selected';

    // Format categories list
    const catsListStr = categories.filter(c => c.selected).map(c => c.name).join(', ') || 'No category';

    return {
      formattedReach: totalReach >= 1000 ? `${Math.round(totalReach / 1000)}K` : totalReach.toString(),
      summaryText: `Based on your selected targeting: ${catsListStr} category in ${citiesListStr}.`
    };
  }, [locationType, cities, categories, placements]);

  // Form Submit Action
  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const placementLabel = placements.find(p => p.selected)?.label || 'Home Banner';
      const numericBudget = parseFloat(budget.replace(/[^0-9.]/g, '')) || 5000;
      const result = await adRepository.createAd(adTitle, numericBudget, placementLabel);
      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          navigate('ads');
        }, 2000);
      } else {
        const errResult = result as { success: false; error: { message: string } };
        setError(errResult.error.message || 'Failed to launch campaign.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to launch campaign.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('campaigns');
  };

  const selectedCities = cities.filter(c => c.selected);

  return (
    <div className="app-container" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <main className="main-content">
        {/* Banner success overlay */}
        {showSuccess && (
          <div className="success-toast">
            <CheckCircle2 size={20} color="#10B981" />
            <span>Campaign created and queued for launch successfully!</span>
          </div>
        )}

        {error && (
          <div className="glass-card status-danger animate-fade-in" style={{ padding: 'var(--spacing-md)', margin: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', color: 'var(--color-danger)' }}>
              <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>{error}</span>
            </div>
          </div>
        )}

        {/* Mobile Header */}
        <div className="mobile-header mobile-only">
          <div className="mobile-header-left">
            <button
              type="button"
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
              <div className="mobile-logo">A</div>
              <div className="mobile-logo-text">
                <strong>Arox</strong>
                <span>Admin</span>
              </div>
            </button>
          </div>
          <div className="mobile-header-right" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button type="button" className="mobile-action-btn"><Search size={16} /></button>
            <button type="button" className="mobile-action-btn" style={{ position: 'relative' }}>
              <Bell size={16} />
              <span className="mobile-badge" />
            </button>
          </div>
        </div>

        {/* Desktop & Tablet Page Header (Transparent background, no borders) */}
        <div className="create-ad-header-row desktop-tablet-only">
          <button 
            type="button" 
            onClick={handleCancel} 
            className="back-circle-btn"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              transition: 'background-color 0.2s ease, border-color 0.2s ease',
              boxShadow: 'var(--shadow-sm)',
              padding: 0,
              flexShrink: 0
            }}
          >
            <ArrowLeft size={18} />
          </button>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'start' }}>
            <h1 className="create-ad-title" style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: '1.2' }}>
              Create Advertisement
            </h1>
            <p className="create-ad-subtitle" style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>
              Set up a new ad campaign
            </p>
          </div>
        </div>

        <div className="create-ad-page-body">
          {/* Mobile Header Row (Transparent background, no borders) */}
          <div className="create-ad-header-row mobile-only" style={{ margin: '0 0 24px 0', paddingTop: 0, paddingBottom: 0 }}>
            <button 
              type="button" 
              onClick={handleCancel} 
              className="back-circle-btn"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                transition: 'background-color 0.2s ease, border-color 0.2s ease',
                boxShadow: 'var(--shadow-sm)',
                padding: 0,
                flexShrink: 0
              }}
            >
              <ArrowLeft size={18} />
            </button>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'start' }}>
              <h1 className="create-ad-title" style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: '1.2' }}>
                Create Advertisement
              </h1>
              <p className="create-ad-subtitle" style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                Set up a new ad campaign
              </p>
            </div>
          </div>

          {/* Two Column Layout matching Figma */}
          <div className="create-ad-layout">
          {/* Left Form Column */}
          <form onSubmit={handleLaunch} className="create-ad-form">
            
            {/* Mobile Tabs Switcher Bar */}
            <div className="mobile-only mobile-tabs-bar">
              {(['creative', 'schedule', 'placement', 'targeting'] as const).map(tab => (
                <button
                  type="button"
                  key={tab}
                  className={`mobile-tab-btn ${mobileActiveTab === tab ? 'active' : ''}`}
                  onClick={() => setMobileActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            
            {/* Section 1: Creative */}
            <div className={`form-card mobile-tab-content ${mobileActiveTab === 'creative' ? 'mobile-tab-active' : ''}`}>
              <h2 className="form-card-title">Creative</h2>
              <p className="form-card-subtitle">Upload your ad assets and define the content</p>
              
              <div className="form-group">
                <label className="form-label-styled">Ad Image</label>
                <div 
                  className="image-dropzone" 
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <input 
                    type="file" 
                    id="ad-image-upload" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    className="hidden-file-input"
                  />
                  <label htmlFor="ad-image-upload" className="dropzone-label">
                    {imagePreview ? (
                      <div className="dropzone-preview-container">
                        <img src={imagePreview} alt="Ad Preview" className="dropzone-preview-img" />
                        <div className="dropzone-preview-overlay">
                          <Upload size={20} />
                          <span>Change Image</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload size={32} className="upload-icon" />
                        <span className="upload-primary-text">Drop image or click to upload</span>
                        <span className="upload-sub-text">1200×400 recommended · PNG, JPG up to 5MB</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label-styled">Ad Title</label>
                <input 
                  type="text" 
                  required
                  value={adTitle}
                  onChange={(e) => setAdTitle(e.target.value)}
                  className="form-text-input"
                  placeholder="e.g. Summer AC Repair Special"
                />
              </div>

              <div className="form-group">
                <label className="form-label-styled">Description</label>
                <textarea 
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-textarea-input"
                  placeholder="Describe your offer..."
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label-styled">CTA Button Text</label>
                  <input 
                    type="text" 
                    required
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="form-text-input"
                    placeholder="e.g. Book Now"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label-styled">Destination URL</label>
                  <input 
                    type="text" 
                    value={destinationUrl}
                    onChange={(e) => setDestinationUrl(e.target.value)}
                    className="form-text-input"
                    placeholder="e.g. https://sonaa.com/promo"
                  />
                </div>
              </div>

              {/* ── New Fields: Ad URL, Link Type, Entity Selection ── */}
              <div className="creative-link-section">
                <div className="link-section-header">
                  <LinkIcon size={16} color="#6B7280" />
                  <span className="link-section-title">Ad Link Settings</span>
                </div>

                {/* Field 1: Ad URL */}
                <div className="form-group">
                  <label className="form-label-styled">Ad URL</label>
                  <div className="input-with-icon">
                    <LinkIcon size={16} className="input-icon" />
                    <input 
                      type="url" 
                      value={adUrl}
                      onChange={(e) => setAdUrl(e.target.value)}
                      className="form-text-input icon-padding"
                      placeholder="e.g. https://sonaa.com/ad/summer-deal"
                    />
                  </div>
                </div>

                {/* Field 2: Link Type Toggle (Task / Craftsman) */}
                <div className="form-group">
                  <label className="form-label-styled">Link To</label>
                  <div className="link-type-toggle">
                    <button
                      type="button"
                      className={`link-type-btn ${linkType === 'task' ? 'active' : ''}`}
                      onClick={() => setLinkType('task')}
                    >
                      <Wrench size={14} />
                      <span>Task</span>
                    </button>
                    <button
                      type="button"
                      className={`link-type-btn ${linkType === 'craftsman' ? 'active' : ''}`}
                      onClick={() => setLinkType('craftsman')}
                    >
                      <User size={14} />
                      <span>Craftsman</span>
                    </button>
                  </div>
                </div>

                {/* Field 3: Entity Dropdown (Task ID / Craftsman ID) */}
                <div className="form-group">
                  <label className="form-label-styled">
                    {linkType === 'task' ? 'Select Task' : 'Select Craftsman'}
                  </label>
                  <div className="entity-dropdown-wrapper" ref={entityDropdownRef}>
                    {/* Selected entity pill or trigger */}
                    {selectedEntityId ? (
                      <div className="entity-selected-pill">
                        <div className="entity-pill-icon">
                          {linkType === 'task' ? <Wrench size={14} color="#6B7280" /> : <User size={14} color="#6B7280" />}
                        </div>
                        <span className="entity-pill-text">{selectedEntityLabel}</span>
                        <button type="button" className="entity-pill-clear" onClick={handleClearEntity}>
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="entity-dropdown-trigger"
                        onClick={() => setEntityDropdownOpen(!entityDropdownOpen)}
                      >
                        <span className="entity-trigger-placeholder">
                          {linkType === 'task' ? 'Choose a task...' : 'Choose a craftsman...'}
                        </span>
                        <ChevronDown size={16} className={`entity-chevron ${entityDropdownOpen ? 'open' : ''}`} />
                      </button>
                    )}

                    {/* Dropdown panel */}
                    {entityDropdownOpen && (
                      <div className="entity-dropdown-panel">
                        {/* Search input */}
                        <div className="entity-search-box">
                          <Search size={14} className="entity-search-icon" />
                          <input
                            type="text"
                            value={entitySearchQuery}
                            onChange={(e) => setEntitySearchQuery(e.target.value)}
                            className="entity-search-input"
                            placeholder={linkType === 'task' ? 'Search tasks...' : 'Search craftsmen...'}
                            autoFocus
                          />
                        </div>
                        {/* Options list */}
                        <div className="entity-options-list">
                          {filteredEntities.length === 0 ? (
                            <div className="entity-no-results">No results found</div>
                          ) : (
                            filteredEntities.map(item => (
                              <button
                                type="button"
                                key={item.id}
                                className={`entity-option ${selectedEntityId === item.id ? 'selected' : ''}`}
                                onClick={() => handleSelectEntity(item.id, item.label)}
                              >
                                <div className="entity-option-icon">
                                  {linkType === 'task' ? <Wrench size={14} /> : <User size={14} />}
                                </div>
                                <span className="entity-option-label">{item.label}</span>
                                {selectedEntityId === item.id && <Check size={14} color="#10B981" />}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Schedule */}
            <div className={`form-card mobile-tab-content ${mobileActiveTab === 'schedule' ? 'mobile-tab-active' : ''}`}>
              <h2 className="form-card-title">Schedule</h2>
              <p className="form-card-subtitle">Set when your campaign should start and end</p>
              
              <div className="form-row-2" style={{ marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label-styled">Start Date</label>
                  <div className="input-with-icon">
                    <CalendarIcon size={16} className="input-icon" />
                    <input 
                      type="date" 
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="form-text-input icon-padding"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className={`form-label-styled ${runContinuously ? 'disabled-label' : ''}`}>End Date</label>
                  <div className="input-with-icon">
                    <CalendarIcon size={16} className={`input-icon ${runContinuously ? 'disabled-icon' : ''}`} />
                    <input 
                      type="date" 
                      required={!runContinuously}
                      disabled={runContinuously}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="form-text-input icon-padding"
                      style={{ 
                        backgroundColor: runContinuously ? 'var(--bg-surface-hover)' : 'var(--bg-base)',
                        borderColor: 'var(--border-color)',
                        color: runContinuously ? 'var(--text-muted)' : 'var(--text-primary)',
                        cursor: runContinuously ? 'not-allowed' : 'text'
                      }}
                    />
                  </div>
                </div>
              </div>

              <label className="checkbox-container">
                <input 
                  type="checkbox" 
                  checked={runContinuously} 
                  onChange={(e) => setRunContinuously(e.target.checked)}
                  className="checkbox-input"
                />
                <span className="checkbox-label">Run continuously (no end date)</span>
              </label>
            </div>

            {/* Section 3: Placement */}
            <div className={`form-card mobile-tab-content ${mobileActiveTab === 'placement' ? 'mobile-tab-active' : ''}`}>
              <h2 className="form-card-title">Placement</h2>
              <p className="form-card-subtitle">Choose where your ad will appear across Sonaa App</p>
              
              <div className="placement-grid">
                {placements.map(p => (
                  <div 
                    key={p.id}
                    onClick={() => togglePlacement(p.id)}
                    className={`placement-item ${p.selected ? 'selected' : ''}`}
                  >
                    <div className={`placement-radio ${p.selected ? 'checked' : ''}`}>
                      {p.selected && <Check size={10} color="#FFFFFF" strokeWidth={3} />}
                    </div>
                    <span className="placement-label-text">{p.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Targeting */}
            <div className={`form-card mobile-tab-content ${mobileActiveTab === 'targeting' ? 'mobile-tab-active' : ''}`}>
              <h2 className="form-card-title">Targeting</h2>
              <p className="form-card-subtitle">Define who should see this advertisement</p>

              {/* User Type */}
              <div className="form-group-spaced">
                <label className="form-label-styled">User Type</label>
                <div className="radio-group">
                  {(['Customers', 'Craftsmen', 'Both'] as const).map(type => (
                    <label key={type} className="radio-label">
                      <input 
                        type="radio" 
                        name="userType"
                        checked={userType === type}
                        onChange={() => setUserType(type)}
                        className="radio-input"
                      />
                      <span className="radio-text">{type === 'Both' ? 'Both' : `${type} only`}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="form-group-spaced">
                <label className="form-label-styled">Categories</label>
                <div className="tag-cloud">
                  {categories.map(c => (
                    <button
                      type="button"
                      key={c.name}
                      onClick={() => toggleCategory(c.name)}
                      className={`tag-btn ${c.selected ? 'selected' : ''}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Type */}
              <div className="form-group-spaced" style={{ marginBottom: '16px' }}>
                <label className="form-label-styled">Location</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="locationType"
                      checked={locationType === 'All'}
                      onChange={() => setLocationType('All')}
                      className="radio-input"
                    />
                    <span className="radio-text">{isRtl ? 'القدس والضفة الغربية (الكل)' : 'All Jerusalem & West Bank'}</span>
                  </label>
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="locationType"
                      checked={locationType === 'Cities'}
                      onChange={() => setLocationType('Cities')}
                      className="radio-input"
                    />
                    <span className="radio-text">Specific Cities</span>
                  </label>
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="locationType"
                      checked={locationType === 'Districts'}
                      onChange={() => setLocationType('Districts')}
                      className="radio-input"
                    />
                    <span className="radio-text">Specific Districts</span>
                  </label>
                </div>
              </div>

              {/* Cities panel - active when locationType is 'Cities' */}
              {locationType === 'Cities' && (
                <div className="cities-box">
                  {/* Selected Cities */}
                  <div className="selected-cities-row">
                    {selectedCities.length === 0 ? (
                      <span className="no-cities-placeholder">Click cities below to add...</span>
                    ) : (
                      selectedCities.map(c => (
                        <div key={c.name} className="city-pill">
                          <span>{c.name}</span>
                          <button 
                            type="button" 
                            onClick={() => toggleCity(c.name)}
                            className="city-pill-close"
                          >
                            &times;
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {/* Available Cities Grid */}
                  <div className="available-cities-grid">
                    {cities.map(c => (
                      <button
                        type="button"
                        key={c.name}
                        onClick={() => toggleCity(c.name)}
                        className={`city-select-btn ${c.selected ? 'selected' : ''}`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
              <button 
                type="button" 
                onClick={handleCancel}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-launch"
              >
                Launch Campaign
              </button>
            </div>
          </form>

          {/* Right Preview Column */}
          <div className="create-ad-preview-col">
            
            {/* Live Preview Panel */}
            <div className="preview-sticky">
              <h3 className="preview-section-title">Live Preview</h3>
              
              {/* Mobile Viewport Wrapper */}
              <div className="mobile-viewport">
                {/* Mobile screen header mockup */}
                <div className="mobile-header">
                  <span className="mobile-header-title">Home</span>
                </div>
                
                {/* Mobile screen body */}
                <div className="mobile-body">
                  <div className="preview-card">
                    {/* Image */}
                    {imagePreview ? (
                      <img src={imagePreview} alt="Ad Preview Image" className="preview-card-img" />
                    ) : (
                      <div className="preview-card-img-placeholder">
                        <FileImage size={24} color="#A1A1AA" />
                      </div>
                    )}
                    
                    {/* Details block */}
                    <div className="preview-card-details">
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <span className="ad-badge">Ad</span>
                        <h4 className="preview-card-title-text">{adTitle || 'Ad Title'}</h4>
                      </div>
                      <p className="preview-card-desc-text">
                        {description || 'Ad description will display here...'}
                      </p>
                      
                      {/* CTA Button */}
                      <button type="button" className="preview-card-cta-btn">
                        {ctaText || 'CTA Text'}
                      </button>
                    </div>
                  </div>

                  {/* Dummy content background items */}
                  <div className="dummy-mobile-item"></div>
                  <div className="dummy-mobile-item"></div>
                </div>
              </div>

              {/* Estimated Reach Panel */}
              <div className="reach-panel">
                <div className="reach-header">
                  <Globe size={16} color="#6B7280" />
                  <span className="reach-title">Estimated Reach</span>
                </div>
                <div className="reach-metric-row">
                  <span className="reach-number">{reachMetrics.formattedReach}</span>
                  <span className="reach-label">users / day</span>
                </div>
                <p className="reach-description">
                  {reachMetrics.summaryText}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Embedded Style Block for CreateAdPage */}
        <style>{`
          .mobile-tabs-bar {
            display: none;
          }
          
          .mobile-tab-content {
            display: block;
          }

          .create-ad-header-row {
            display: flex;
            align-items: center;
            gap: 16px;
            padding-top: 36px;
            padding-bottom: 12px;
            margin-bottom: 24px;
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            text-align: start;
            box-sizing: border-box;
          }

          .create-ad-title {
            font-size: 24px;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0 0 4px 0;
          }

          .create-ad-subtitle {
            font-size: 14px;
            color: var(--text-muted);
            margin: 0;
          }

          .back-nav-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            background: none;
            border: none;
            color: var(--text-muted);
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            padding: 0;
            transition: color 0.2s ease;
          }

          .back-nav-btn:hover {
            color: var(--text-primary);
          }

          .create-ad-layout {
            display: grid;
            grid-template-columns: 1fr 340px;
            gap: 32px;
            align-items: start;
            margin-top: 16px;
          }

          @media (max-width: 991px) {
            .create-ad-layout {
              grid-template-columns: 1fr;
            }
          }

          /* Cards styling */
          .form-card {
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 24px;
            box-sizing: border-box;
            box-shadow: var(--shadow-sm);
          }

          .form-card-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--text-primary);
            margin: 0 0 4px 0;
          }

          .form-card-subtitle {
            font-size: 13px;
            color: var(--text-muted);
            margin: 0 0 20px 0;
          }

          /* Form group and fields */
          .form-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-bottom: 16px;
            width: 100%;
            box-sizing: border-box;
          }

          .form-group-spaced {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 20px;
          }

          .form-row-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }

          @media (max-width: 576px) {
            .form-row-2 {
              grid-template-columns: 1fr;
            }
          }

          .form-label-styled {
            font-size: 13px;
            font-weight: 500;
            color: var(--text-primary);
          }

          .disabled-label {
            color: var(--text-muted);
          }

          .form-text-input {
            width: 100%;
            box-sizing: border-box;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 10px 14px;
            font-size: 13px;
            color: var(--text-primary);
            outline: none;
            background: var(--bg-base);
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
          }

          .form-text-input:focus {
            border-color: var(--color-primary);
            box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
          }

          .form-textarea-input {
            width: 100%;
            box-sizing: border-box;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 10px 14px;
            font-size: 13px;
            color: var(--text-primary);
            outline: none;
            resize: vertical;
            font-family: inherit;
            background: var(--bg-base);
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
          }

          .form-textarea-input:focus {
            border-color: var(--color-primary);
            box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
          }

          .input-with-icon {
            position: relative;
            width: 100%;
          }

          .input-icon {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-muted);
            pointer-events: none;
          }

          [dir="rtl"] .input-icon {
            left: auto;
            right: 12px;
          }

          .disabled-icon {
            color: var(--border-color);
          }

          .icon-padding {
            padding-left: 36px;
          }

          [dir="rtl"] .icon-padding {
            padding-left: 14px;
            padding-right: 36px;
          }

          /* Dropzone image styling */
          .image-dropzone {
            width: 100%;
            border: 2px dashed var(--border-color);
            border-radius: 12px;
            background: var(--bg-base);
            box-sizing: border-box;
            transition: border-color 0.2s ease, background 0.2s ease;
            cursor: pointer;
            overflow: hidden;
          }

          .image-dropzone:hover {
            border-color: var(--color-primary);
            background: var(--bg-surface-hover);
          }

          .hidden-file-input {
            display: none;
          }

          .dropzone-label {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 32px 16px;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            cursor: pointer;
          }

          .upload-icon {
            color: var(--text-muted);
            margin-bottom: 12px;
          }

          .upload-primary-text {
            font-size: 13px;
            font-weight: 500;
            color: var(--text-primary);
            margin-bottom: 4px;
          }

          .upload-sub-text {
            font-size: 11px;
            color: var(--text-muted);
            text-align: center;
          }

          .dropzone-preview-container {
            position: relative;
            width: 100%;
            height: 160px;
            overflow: hidden;
            border-radius: 8px;
          }

          .dropzone-preview-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .dropzone-preview-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0,0,0,0.6);
            color: #FFFFFF;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-size: 13px;
            font-weight: 500;
            opacity: 0;
            transition: opacity 0.2s ease;
          }

          .dropzone-preview-container:hover .dropzone-preview-overlay {
            opacity: 1;
          }

          /* Checkbox Container */
          .checkbox-container {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            user-select: none;
          }

          .checkbox-input {
            width: 16px;
            height: 16px;
            border-radius: 4px;
            border: 1px solid var(--border-color);
            cursor: pointer;
            accent-color: var(--color-primary);
          }

          .checkbox-label {
            font-size: 13px;
            color: var(--text-primary);
          }

          /* Radio Buttons */
          .radio-group {
            display: flex;
            gap: 20px;
            align-items: center;
          }

          .radio-label {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
          }

          .radio-input {
            width: 16px;
            height: 16px;
            cursor: pointer;
            accent-color: var(--color-primary);
          }

          .radio-text {
            font-size: 13px;
            color: var(--text-primary);
          }

          /* Tag clouds / buttons selection */
          .tag-cloud {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }

          .tag-btn {
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 6px 12px;
            font-size: 13px;
            color: var(--text-secondary);
            font-weight: 500;
            cursor: pointer;
            box-sizing: border-box;
            transition: all 0.15s ease;
          }

          .tag-btn:hover {
            border-color: var(--color-primary);
            color: var(--text-primary);
          }

          .tag-btn.selected {
            background: var(--color-primary);
            border-color: var(--color-primary);
            color: #FFFFFF;
            box-shadow: 0 1px 4px rgba(37, 99, 235, 0.4);
          }

          /* Cities selection layout */
          .cities-box {
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 16px;
            background: var(--bg-base);
            box-sizing: border-box;
            margin-top: 12px;
          }

          .selected-cities-row {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            min-height: 33px;
            align-items: center;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 12px;
            margin-bottom: 12px;
          }

          .no-cities-placeholder {
            font-size: 12px;
            color: var(--text-muted);
            font-style: italic;
          }

          .city-pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            padding: 4px 8px;
            font-size: 12px;
            font-weight: 500;
            color: var(--text-primary);
          }

          .city-pill-close {
            background: none;
            border: none;
            font-size: 16px;
            line-height: 1;
            color: var(--text-muted);
            cursor: pointer;
            padding: 0;
            display: flex;
            align-items: center;
          }

          .city-pill-close:hover {
            color: #f87171;
          }

          .available-cities-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
            gap: 8px;
          }

          .city-select-btn {
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            padding: 6px;
            font-size: 12px;
            font-weight: 500;
            color: var(--text-secondary);
            cursor: pointer;
            box-sizing: border-box;
            text-align: center;
            transition: all 0.15s ease;
          }

          .city-select-btn:hover {
            border-color: var(--color-primary);
            color: var(--text-primary);
          }

          .city-select-btn.selected {
            background: var(--color-primary);
            border-color: var(--color-primary);
            color: #FFFFFF;
          }

          /* Placement layout */
          .placement-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          @media (max-width: 576px) {
            .placement-grid {
              grid-template-columns: 1fr;
            }
          }

          .placement-item {
            display: flex;
            align-items: center;
            gap: 10px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 12px;
            cursor: pointer;
            box-sizing: border-box;
            background: var(--bg-surface);
            transition: all 0.15s ease;
          }

          .placement-item:hover {
            border-color: var(--color-primary);
          }

          .placement-item.selected {
            border-color: var(--color-primary);
            background: var(--bg-surface-hover);
          }

          .placement-radio {
            width: 16px;
            height: 16px;
            border: 1px solid var(--border-color);
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.15s ease;
          }

          .placement-radio.checked {
            background: var(--color-primary);
            border-color: var(--color-primary);
          }

          .placement-label-text {
            font-size: 13px;
            font-weight: 500;
            color: var(--text-primary);
          }

          /* Form Actions */
          .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            padding: 16px 0;
            border-top: 1px solid var(--border-color);
          }

          .btn-cancel {
            background: transparent;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            color: var(--text-secondary);
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            padding: 8px 16px;
            transition: all 0.15s ease;
          }

          .btn-cancel:hover {
            background: var(--bg-surface-hover);
            color: var(--text-primary);
          }

          .btn-launch {
            background: var(--color-primary);
            border: none;
            color: #FFFFFF;
            border-radius: 8px;
            padding: 10px 20px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: opacity 0.2s ease;
          }

          .btn-launch:hover {
            opacity: 0.9;
          }

          /* Success Toast */
          .success-toast {
            position: fixed;
            top: 24px;
            right: 24px;
            background: var(--bg-surface);
            border: 1px solid #10B981;
            border-radius: 12px;
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            font-size: 13px;
            font-weight: 500;
            color: var(--text-primary);
            animation: slideInRight 0.3s ease;
          }

          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          /* Preview Column sticky */
          .create-ad-preview-col {
            position: relative;
            width: 100%;
            height: 100%;
          }

          .preview-sticky {
            position: sticky;
            top: 24px;
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .preview-section-title {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-primary);
            margin: 0;
          }

          /* Mobile Viewport styling */
          .mobile-viewport {
            width: 100%;
            max-width: 320px;
            height: 520px;
            border: 10px solid var(--border-color);
            border-radius: 36px;
            background: var(--bg-base);
            box-shadow: var(--shadow-lg);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            margin: 0 auto;
          }

          .mobile-header {
            background: var(--bg-surface);
            border-bottom: 1px solid var(--border-color);
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .mobile-header-title {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-primary);
          }

          .mobile-body {
            flex: 1;
            padding: 12px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          /* Mock ad card in mobile screen */
          .preview-card {
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: var(--shadow-sm);
            display: flex;
            flex-direction: column;
            width: 100%;
            box-sizing: border-box;
          }

          .preview-card-img {
            width: 100%;
            height: 110px;
            object-fit: cover;
            background: var(--bg-surface-hover);
          }

          .preview-card-img-placeholder {
            width: 100%;
            height: 110px;
            background: var(--bg-surface-hover);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .preview-card-details {
            padding: 12px;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
          }

          .ad-badge {
            background: var(--bg-surface-hover);
            border: 1px solid var(--border-color);
            color: var(--text-secondary);
            font-size: 9px;
            font-weight: 600;
            padding: 2px 6px;
            border-radius: 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            line-height: 1.2;
            margin-top: 2px;
          }

          .preview-card-title-text {
            font-size: 13px;
            font-weight: 600;
            color: var(--text-primary);
            margin: 0;
            line-height: 1.3;
            word-break: break-word;
            flex: 1;
          }

          .preview-card-desc-text {
            font-size: 11px;
            color: var(--text-muted);
            margin: 0 0 10px 0;
            line-height: 1.4;
            word-break: break-word;
          }

          .preview-card-cta-btn {
            width: 100%;
            background: var(--color-primary);
            border: none;
            color: #FFFFFF;
            border-radius: 6px;
            padding: 8px 12px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            text-align: center;
            box-sizing: border-box;
          }

          .dummy-mobile-item {
            height: 72px;
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            opacity: 0.6;
          }

          /* Reach Panel */
          .reach-panel {
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 18px;
            box-sizing: border-box;
            box-shadow: var(--shadow-sm);
          }

          .reach-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
          }

          .reach-title {
            font-size: 12px;
            font-weight: 600;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .reach-metric-row {
            display: flex;
            align-items: baseline;
            gap: 6px;
            margin-bottom: 8px;
          }

          .reach-number {
            font-size: 32px;
            font-weight: 700;
            color: var(--text-primary);
            line-height: 1;
          }

          .reach-label {
            font-size: 13px;
            color: var(--text-muted);
            font-weight: 500;
          }

          .reach-description {
            font-size: 12px;
            color: var(--text-muted);
            margin: 0;
            line-height: 1.5;
          }

          /* Creative Link Section Styling */
          .creative-link-section {
            margin-top: 24px;
            padding-top: 24px;
            border-top: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .link-section-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 4px;
            text-align: start;
          }

          .link-section-title {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-primary);
          }

          .link-type-toggle {
            display: flex;
            gap: 8px;
            background: var(--bg-base);
            padding: 4px;
            border-radius: 8px;
            border: 1px solid var(--border-color);
          }

          .link-type-btn {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            background: transparent;
            border: none;
            border-radius: 6px;
            padding: 8px 12px;
            font-size: 13px;
            font-weight: 500;
            color: var(--text-muted);
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .link-type-btn:hover {
            color: var(--text-primary);
          }

          .link-type-btn.active {
            background: var(--bg-surface);
            color: var(--text-primary);
            box-shadow: var(--shadow-sm);
            font-weight: 600;
          }

          .entity-dropdown-wrapper {
            position: relative;
            width: 100%;
          }

          .entity-dropdown-trigger {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: var(--bg-base);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 10px 14px;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: start;
            color: var(--text-primary);
          }

          .entity-dropdown-trigger:focus {
            border-color: var(--color-primary);
            box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
            outline: none;
          }

          .entity-trigger-placeholder {
            color: var(--text-muted);
          }

          .entity-chevron {
            color: var(--text-muted);
            transition: transform 0.2s ease;
          }

          .entity-chevron.open {
            transform: rotate(180deg);
          }

          .entity-selected-pill {
            display: flex;
            align-items: center;
            gap: 8px;
            background: var(--bg-surface-hover);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 8px 12px;
            width: 100%;
            box-sizing: border-box;
            text-align: start;
          }

          .entity-pill-icon {
            display: flex;
            align-items: center;
          }

          .entity-pill-text {
            font-size: 13px;
            font-weight: 500;
            color: var(--text-primary);
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            text-align: start;
          }

          .entity-pill-clear {
            background: none;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            padding: 2px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
          }

          .entity-pill-clear:hover {
            background: var(--bg-surface);
            color: var(--text-primary);
          }

          .entity-dropdown-panel {
            position: absolute;
            top: calc(100% + 4px);
            left: 0;
            right: 0;
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            z-index: 50;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            max-height: 250px;
          }

          .entity-search-box {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            border-bottom: 1px solid var(--border-color);
            background: var(--bg-surface-hover);
          }

          .entity-search-icon {
            color: var(--text-muted);
          }

          .entity-search-input {
            width: 100%;
            border: none;
            background: transparent;
            font-size: 13px;
            color: var(--text-primary);
            outline: none;
            padding: 4px 0;
          }

          .entity-options-list {
            overflow-y: auto;
            flex: 1;
            max-height: 200px;
          }

          .entity-option {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 12px;
            background: transparent;
            border: none;
            cursor: pointer;
            text-align: start;
            color: var(--text-primary);
            transition: background 0.15s ease;
          }

          .entity-option:hover {
            background: var(--bg-surface-hover);
          }

          .entity-option.selected {
            background: var(--bg-surface-hover);
            font-weight: 600;
          }

          .entity-option-icon {
            color: var(--text-muted);
            display: flex;
            align-items: center;
          }

          .entity-option-label {
            font-size: 13px;
            color: var(--text-primary);
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            text-align: start;
          }

          .entity-no-results {
            padding: 16px;
            text-align: center;
            color: var(--text-muted);
            font-size: 13px;
          }

          /* Responsive adjustments */
          .create-ad-page-body {
            padding: 0;
            box-sizing: border-box;
          }

          @media (max-width: 1024px) {
            .main-content {
              margin-inline-start: var(--sidebar-collapsed-width) !important;
              padding: 24px var(--spacing-md) !important;
              width: calc(100% - var(--sidebar-collapsed-width)) !important;
            }
          }

          @media (max-width: 768px) {
            .main-content {
              margin-inline-start: 0 !important;
              padding-top: 0 !important;
              padding-bottom: 84px !important;
              padding-inline-start: 0 !important;
              padding-inline-end: 0 !important;
              width: 100% !important;
            }

            .create-ad-page-body {
              padding: 12px 16px 16px !important;
            }

            .mobile-subheader {
              height: auto !important;
              padding: 14px 20px !important;
            }

            .create-ad-header-row {
              padding-top: 24px !important;
              padding-bottom: 8px !important;
              margin-bottom: 20px !important;
            }

            .mobile-tabs-bar {
              display: flex !important;
              gap: 8px;
              overflow-x: auto;
              padding: 4px 0 16px 0;
              margin-bottom: 8px;
              scrollbar-width: none;
            }

            .mobile-tabs-bar::-webkit-scrollbar {
              display: none;
            }

            .mobile-tab-btn {
              flex: 1;
              min-width: 80px;
              background: var(--bg-surface);
              border: 1px solid var(--border-color);
              border-radius: 8px;
              padding: 8px 12px;
              font-size: 13px;
              font-weight: 500;
              color: var(--text-muted);
              cursor: pointer;
              white-space: nowrap;
              transition: all 0.2s ease;
              text-align: center;
            }

            .mobile-tab-btn.active {
              background: var(--color-primary);
              border-color: var(--color-primary);
              color: #FFFFFF;
              font-weight: 600;
            }

            .mobile-tab-content {
              display: none;
            }

            .mobile-tab-content.mobile-tab-active {
              display: block;
            }
          }
        `}</style>
      </div>
      </main>
    </div>
  );
};

export default CreateAdPage;
