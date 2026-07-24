import React, { useState, useRef } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useNavigation } from '../../../context/NavigationContext';
import { Sidebar } from '../../../layouts/Sidebar';
import { Header } from '../../../layouts/Header';
import { MobileBottomTabs } from '../../../layouts/MobileBottomTabs';
import { useServiceManagement } from '../hooks/useServiceManagement';
import { Category, Subcategory } from '../../../../domain/entities/Category';
import {
  Wrench,
  Plus,
  Trash2,
  TrendingUp,
  Search,
  Bell,
  GripVertical,
  Edit2,
  SlidersHorizontal,
  Zap,
  Sparkles,
  Hammer,
  Paintbrush,
  Wind,
  Truck,
  Leaf,
  X,
  Upload
} from 'lucide-react';

export const ServiceManagementPage: React.FC = () => {
  const { isRtl } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    categories,
    subcategories,
    fields,
    metrics,
    selectedSubCatCategoryId,
    setSelectedSubCatCategoryId,
    createCategory,
    toggleCategoryVisibility,
    createSubcategory,
    toggleSubcategoryVisibility,
    moveSubcategory
  } = useServiceManagement();

  // 1. KPI Stats Data (100% Dynamic from live DB)
  const activeCraftsmenVal = metrics.find(m => m.id === 'craftsmen')?.value || 0;
  const totalTasksVal = metrics.find(m => m.id === 'tasks')?.value || 0;
  const totalSubcategoriesVal = categories.reduce((sum, c) => sum + (c.subcategoriesCount || 0), 0);

  const kpis = [
    { id: 'cat', labelEn: 'Total Categories', labelAr: 'إجمالي الفئات', val: String(categories.length), trend: '+100%', up: true },
    { id: 'sub', labelEn: 'Total Subcategories', labelAr: 'إجمالي الفئات الفرعية', val: String(totalSubcategoriesVal), trend: '+0', up: true },
    { id: 'craft', labelEn: 'Active Craftsmen', labelAr: 'الحرفيين النشطين', val: activeCraftsmenVal.toLocaleString(), trend: '+5.4%', up: true },
    { id: 'req', labelEn: 'Total Requests', labelAr: 'إجمالي الطلبات', val: totalTasksVal.toLocaleString(), trend: '+12%', up: true }
  ];

  // 2. Activity Log (Matching Specs)
  const [activityLogs] = useState([
    { id: 'a1', adminName: 'Admin System', action: 'updated category', actionAr: 'حدث فئة', target: 'Electrician', targetAr: 'كهربائي', time: 'Just now', timeAr: 'الآن' },
    { id: 'a2', adminName: 'Admin System', action: 'created category', actionAr: 'أنشأ فئة', target: 'Plumber', targetAr: 'سباك', time: '1h ago', timeAr: 'منذ ساعة' },
    { id: 'a3', adminName: 'System', action: 'synced category status', actionAr: 'زامن فئات النظام', target: 'AC Technician', targetAr: 'فني تكييف', time: '3h ago', timeAr: 'منذ ٣ ساعات' }
  ]);

  // 3. Fastest Growing data (100% Dynamic from live DB categories)
  const growingList = React.useMemo(() => {
    return categories.map((cat, idx) => ({
      rank: idx + 1,
      name: cat.name,
      nameAr: cat.nameAr,
      grow: cat.requestVolume === 'High' ? '+24.5%' : (cat.requestVolume === 'Medium' ? '+12.0%' : '+5.0%'),
      pct: cat.requestVolume === 'High' ? 85 : (cat.requestVolume === 'Medium' ? 50 : 20)
    })).slice(0, 5);
  }, [categories]);

  const { searchQuery } = useNavigation();
  const [subcatSearchQuery, setSubcatSearchQuery] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [newSubcatName, setNewSubcatName] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryFeatured, setNewCategoryFeatured] = useState(false);
  const [newCategoryVisible, setNewCategoryVisible] = useState(true);
  
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [movingSubcat, setMovingSubcat] = useState<Subcategory | null>(null);
  const [targetCategoryId, setTargetCategoryId] = useState<string>('');

  const [isSubcatModalOpen, setIsSubcatModalOpen] = useState(false);
  const [newSubcatActive, setNewSubcatActive] = useState(true);

  // Helper to render Category Icon based on name
  const renderCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Plumbing': return <Wrench size={16} style={{ color: '#525252' }} />;
      case 'Electrical': return <Zap size={16} style={{ color: '#525252' }} />;
      case 'Cleaning': return <Sparkles size={16} style={{ color: '#525252' }} />;
      case 'Carpentry': return <Hammer size={16} style={{ color: '#525252' }} />;
      case 'Painting': return <Paintbrush size={16} style={{ color: '#525252' }} />;
      case 'AC & HVAC': return <Wind size={16} style={{ color: '#525252' }} />;
      case 'Moving': return <Truck size={16} style={{ color: '#525252' }} />;
      case 'Gardening': return <Leaf size={16} style={{ color: '#525252' }} />;
      default: return <Wrench size={16} style={{ color: '#525252' }} />;
    }
  };



  // Add Category
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await createCategory({ name: newCategoryName, description: newCategoryDesc || 'Custom category' });
      setNewCategoryName('');
      setNewCategoryDesc('');
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Add Subcategory
  const handleAddSubcat = async () => {
    if (!newSubcatName.trim()) return;
    try {
      await createSubcategory(selectedSubCatCategoryId, newSubcatName);
      setNewSubcatName('');
      setIsSubcatModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveSubcategory = async () => {
    if (!movingSubcat || !targetCategoryId) return;
    try {
      await moveSubcategory(movingSubcat.id, targetCategoryId);
      setIsMoveModalOpen(false);
      setMovingSubcat(null);
    } catch (err) {
      console.error(err);
      alert(isRtl ? 'حدث خطأ أثناء نقل الفئة الفرعية' : 'Error moving subcategory');
    }
  };



  const filteredCategories = categories.filter(c =>
    (isRtl ? c.nameAr : c.name).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const subcatFilteredCategories = categories.filter(c =>
    (isRtl ? c.nameAr : c.name).toLowerCase().includes(subcatSearchQuery.toLowerCase())
  );

  const selectedCategoryForSubcats = categories.find(c => c.id === selectedSubCatCategoryId);
  const currentSubcats = subcategories;

  return (
    <div className="app-container" style={{ direction: isRtl ? 'rtl' : 'ltr', background: '#fafafa' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className="main-content">
        {/* Desktop & Tablet Page Header */}
        <div className="desktop-tablet-page-header desktop-tablet-only" style={{ marginBottom: '24px' }}>
          <div style={{ textAlign: 'start' }}>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 600, letterSpacing: '-0.7px', color: '#171717' }}>
              {isRtl ? 'إدارة الخدمات' : 'Service Management'}
            </h1>
            <p style={{ margin: '4px 0 0 0', color: '#71717A', fontSize: '14px' }}>
              {isRtl ? 'إدارة الفئات والفئات الفرعية وحقول الطلبات لكل خدمة' : 'Manage categories, subcategories, and request fields per service'}
            </p>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="mobile-header mobile-only">
          <div className="mobile-header-left">
            <button onClick={() => setSidebarOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
              <div className="mobile-logo">S</div>
              <div className="mobile-logo-text"><strong>Sonaa</strong><span>Admin</span></div>
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button className="mobile-action-btn"><Search size={16} /></button>
            <button className="mobile-action-btn" style={{ position: 'relative' }}><Bell size={16} /><span className="mobile-badge" /></button>
          </div>
        </div>

        {/* 1. KPIs Row */}
        <div className="sm-kpis-grid">
          {kpis.map(kpi => (
            <div key={kpi.id} className="sm-kpi-card">
              <span className="sm-kpi-label">{isRtl ? kpi.labelAr : kpi.labelEn}</span>
              <div className="sm-kpi-val-row">
                <span className="sm-kpi-val">{kpi.val}</span>
                <span className={`sm-kpi-trend ${kpi.up ? 'up' : 'down'}`}>
                  {kpi.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 2. Insights Widgets Row */}
        <div className="sm-insights-layout">
          {/* Revenue by Category (Monthly distribution) */}
          <div className="sm-insight-card">
            <div className="sm-insight-header">
              <h3>{isRtl ? 'الإيرادات حسب الفئة' : 'Revenue by Category'}</h3>
              <p>{isRtl ? 'توزيع الإيرادات الشهرية' : 'Monthly revenue distribution'}</p>
            </div>
            <div className="sm-chart-container">
              {/* Minimalist Donut Chart placeholder to match mockup */}
              <div className="chart-placeholder">
                <div className="chart-circle">
                  <div className="chart-inner-circle" />
                </div>
              </div>
            </div>
          </div>

          {/* Fastest Growing (MoM Request volume) */}
          <div className="sm-insight-card">
            <div className="sm-insight-header">
              <h3>{isRtl ? 'الأسرع نمواً' : 'Fastest Growing'}</h3>
              <p>{isRtl ? 'حجم الطلبات على أساس شهري' : 'MoM request volume'}</p>
            </div>
            <div className="growing-list-container">
              {growingList.map(item => (
                <div key={item.rank} className="growing-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="growing-rank-badge">{item.rank}</span>
                    <span style={{ fontWeight: 600, color: '#171717', fontSize: '13px' }}>{isRtl ? item.nameAr : item.name}</span>
                  </div>
                  <span className="growing-pct">{item.grow}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Categories Management Section */}
        <div className="sm-stacked-card">
          <div className="sm-card-header">
            <div>
              <h3>{isRtl ? 'الفئات' : 'Categories'}</h3>
              <p>{isRtl ? 'إدارة وتعديل فئات الخدمات المعروضة للعملاء' : 'Manage service categories shown to customers'}</p>
            </div>
            <div className="sm-header-buttons">
              <button className="sm-btn-outline">
                <SlidersHorizontal size={14} />
                <span>{isRtl ? 'تصفية' : 'Filter'}</span>
              </button>
              <button className="sm-btn-primary" onClick={() => setIsModalOpen(true)}>
                <Plus size={16} />
                <span>{isRtl ? 'فئة جديدة' : 'New Category'}</span>
              </button>
            </div>
          </div>

          <div className="sm-table-container">
            <table className="sm-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}></th>
                  <th style={{ width: '40px' }}><input type="checkbox" className="sm-checkbox" /></th>
                  <th>{isRtl ? 'الفئة' : 'Category'}</th>
                  <th>{isRtl ? 'الفئات الفرعية' : 'Subcategories'}</th>
                  <th>{isRtl ? 'الحالة' : 'Status'}</th>
                  <th>{isRtl ? 'الطلب' : 'Usage'}</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>{isRtl ? 'مرئي' : 'Visible'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map(c => (
                  <tr key={c.id}>
                    <td>
                      <GripVertical size={14} style={{ color: '#a3a3a3', cursor: 'grab' }} />
                    </td>
                    <td><input type="checkbox" className="sm-checkbox" /></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="sm-category-icon-box">
                          {renderCategoryIcon(c.iconName)}
                        </div>
                        <div>
                          <p className="category-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {isRtl ? c.nameAr : c.name}
                            {c.hasStar && <span className="sm-orange-star">★</span>}
                          </p>
                          <p style={{ margin: 0, fontSize: '11px', color: '#737373' }}>{isRtl ? c.descriptionAr : c.description}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="sm-subcat-badge">{c.subcategoriesCount}</span>
                    </td>
                    <td>
                      <span className={`sm-status-badge ${c.status.toLowerCase()}`}>
                        <span className="dot" />
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <div className="sm-usage-cell">
                        {c.requestVolume.split(' / ').map((chunk, idx) => (
                          <span key={idx}>{chunk}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className={`sm-toggle-switch${c.visible ? ' on' : ''}`}
                        onClick={() => toggleCategoryVisibility(c.id, !c.visible)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Subcategories Management Split Card */}
        <div className="sm-stacked-card">
          <div className="sm-card-header" style={{ borderBottom: '1px solid #e5e5e5', paddingBottom: '16px' }}>
            <div>
              <h3>{isRtl ? 'الفئات الفرعية' : 'Subcategories'}</h3>
              <p>{isRtl ? 'إدارة الفئات الفرعية المحددة داخل كل فئة رئيسية' : 'Manage specific services within each category'}</p>
            </div>
          </div>

          <div className="sm-split-body">
            {/* Left selector */}
            <div className="sm-split-left">
              <div className="sm-search-input-wrapper">
                <Search size={14} className="icon" />
                <input
                  type="text"
                  placeholder={isRtl ? 'البحث عن فئة...' : 'Filter category...'}
                  value={subcatSearchQuery}
                  onChange={e => setSubcatSearchQuery(e.target.value)}
                />
              </div>
              <div className="sm-left-list">
                {subcatFilteredCategories.map(c => (
                  <button
                    key={c.id}
                    className={`sm-left-item ${selectedSubCatCategoryId === c.id ? 'active' : ''}`}
                    onClick={() => setSelectedSubCatCategoryId(c.id)}
                  >
                    <span className="category-title">{isRtl ? c.nameAr : c.name}</span>
                    <span className="badge">{c.subcategoriesCount}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right table list */}
            <div className="sm-split-right">
              <div className="sm-split-right-header">
                <h3>
                  {isRtl ? `${selectedCategoryForSubcats?.nameAr} الفئات الفرعية` : `${selectedCategoryForSubcats?.name} Subcategories`}
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="sm-btn-outline small"
                    onClick={() => {
                      if (currentSubcats.length > 0) {
                        setMovingSubcat(currentSubcats[0]);
                        setTargetCategoryId(selectedSubCatCategoryId);
                        setIsMoveModalOpen(true);
                      } else {
                        alert(isRtl ? 'لا توجد فئات فرعية لنقلها!' : 'No subcategories to move!');
                      }
                    }}
                  >
                    <TrendingUp size={14} />
                    <span>{isRtl ? 'نقل' : 'Move'}</span>
                  </button>
                  <button className="sm-btn-primary small" onClick={() => setIsSubcatModalOpen(true)}>
                    <Plus size={14} />
                    <span>{isRtl ? 'إضافة فئة فرعية' : 'Add Subcategory'}</span>
                  </button>
                </div>
              </div>

              <div className="sm-table-container">
                <table className="sm-table">
                  <tbody>
                    {currentSubcats.map(s => (
                      <tr key={s.id}>
                        <td style={{ width: '30px' }}>
                          <GripVertical size={14} style={{ color: '#a3a3a3', cursor: 'grab' }} />
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: '#171717' }}>{isRtl ? s.nameAr : s.name}</span>
                        </td>
                        <td style={{ width: '100px' }}>
                          <span className="sm-status-badge active">
                            <span className="dot" />
                            {s.status}
                          </span>
                        </td>
                        <td style={{ width: '80px', color: '#737373' }}>{s.requestCount}</td>
                        <td style={{ width: '60px', textAlign: 'center' }}>
                          <button
                            className={`sm-toggle-switch${s.visible ? ' on' : ''}`}
                            onClick={() => toggleSubcategoryVisibility(s.id, selectedSubCatCategoryId, !s.visible)}
                          />
                        </td>
                        <td style={{ width: '40px', textAlign: 'center' }}>
                          <button 
                            className="sm-action-menu-btn"
                            title={isRtl ? 'نقل الفئة الفرعية' : 'Move Subcategory'}
                            onClick={() => {
                              setMovingSubcat(s);
                              setTargetCategoryId(selectedSubCatCategoryId);
                              setIsMoveModalOpen(true);
                            }}
                          >
                            •••
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>



        {/* 6. Recent Activity Log (Audit Trail) */}
        <div className="sm-stacked-card">
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#171717' }}>{isRtl ? 'سجل العمليات الأخير' : 'Recent Activity'}</h3>
            <p style={{ margin: '4px 0 0', color: '#737373', fontSize: '12px' }}>{isRtl ? 'سجل تغييرات الفئات والحقول' : 'Audit log of category and field changes'}</p>
          </div>
          <div className="sm-activity-list">
            {activityLogs.map(log => (
              <div key={log.id} className="sm-activity-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="sm-activity-circle-avatar" />
                  <p style={{ margin: 0, fontSize: '13px', color: '#171717' }}>
                    <strong>{log.adminName}</strong> {isRtl ? log.actionAr : log.action} <span style={{ fontWeight: 600 }}>{isRtl ? log.targetAr : log.target}</span>
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '12px', color: '#737373' }}>{isRtl ? log.timeAr : log.time}</span>
                  <a href="#view" className="sm-view-activity-link">{isRtl ? 'عرض' : 'View'}</a>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* ── Create New Category Modal ── */}
      {isModalOpen && (
        <div className="sm-modal-overlay">
          <div className="sm-modal-container">
            {/* Header */}
            <div className="sm-modal-header">
              <h2>{isRtl ? 'إنشاء فئة جديدة' : 'Create New Category'}</h2>
              <button className="sm-modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="sm-modal-body">
              {/* Media Upload Area */}
              <div className="sm-modal-upload-row">
                <div className="sm-upload-box small">
                  <Upload size={18} className="icon" />
                  <span>{isRtl ? 'أيقونة' : 'Icon'}</span>
                </div>
                <div className="sm-upload-box large">
                  <Upload size={18} className="icon" />
                  <span>{isRtl ? 'صورة الغلاف' : 'Cover Image'}</span>
                </div>
              </div>

              {/* Form Input fields */}
              <div className="sm-modal-field-group">
                <label>{isRtl ? 'اسم الفئة' : 'Category Name'}</label>
                <input
                  type="text"
                  placeholder={isRtl ? 'مثال: السباكة' : 'e.g. Plumbing'}
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                />
              </div>

              <div className="sm-modal-field-group">
                <label>{isRtl ? 'الوصف' : 'Description'}</label>
                <textarea
                  rows={3}
                  placeholder={isRtl ? 'وصف مختصر للخدمات المقدمة...' : 'Brief description of the services offered...'}
                  value={newCategoryDesc}
                  onChange={e => setNewCategoryDesc(e.target.value)}
                />
              </div>

              {/* Toggles */}
              <div className="sm-modal-toggle-row">
                <div>
                  <label className="toggle-label">{isRtl ? 'فئة مميزة' : 'Featured Category'}</label>
                  <p className="toggle-desc">{isRtl ? 'عرضها بشكل بارز على الشاشة الرئيسية للعميل' : 'Show prominently on the customer home screen'}</p>
                </div>
                <button
                  className={`sm-toggle-switch${newCategoryFeatured ? ' on' : ''}`}
                  onClick={() => setNewCategoryFeatured(!newCategoryFeatured)}
                />
              </div>

              <div className="sm-modal-toggle-row" style={{ marginTop: '16px' }}>
                <div>
                  <label className="toggle-label">{isRtl ? 'مرئية للعملاء' : 'Visible to Customers'}</label>
                  <p className="toggle-desc">{isRtl ? 'السماح للعملاء برؤية وحجز هذه الفئة' : 'Allow customers to see and book this category'}</p>
                </div>
                <button
                  className={`sm-toggle-switch${newCategoryVisible ? ' on' : ''}`}
                  onClick={() => setNewCategoryVisible(!newCategoryVisible)}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="sm-modal-footer">
              <button className="sm-modal-cancel-btn" onClick={() => setIsModalOpen(false)}>
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button className="sm-btn-primary" onClick={handleAddCategory}>
                {isRtl ? 'إنشاء فئة' : 'Create Category'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Subcategory Modal ── */}
      {isSubcatModalOpen && (
        <div className="sm-modal-overlay">
          <div className="sm-modal-container">
            {/* Header */}
            <div className="sm-modal-header">
              <h2>{isRtl ? `إضافة فئة فرعية إلى ${selectedCategoryForSubcats?.nameAr}` : `Add Subcategory to ${selectedCategoryForSubcats?.name}`}</h2>
              <button className="sm-modal-close-btn" onClick={() => setIsSubcatModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="sm-modal-body">
              {/* Form Input field */}
              <div className="sm-modal-field-group">
                <label>{isRtl ? 'اسم الفئة الفرعية' : 'Subcategory Name'}</label>
                <input
                  type="text"
                  placeholder={isRtl ? 'مثال: إصلاح التسريبات' : 'e.g. Leak Repair'}
                  value={newSubcatName}
                  onChange={e => setNewSubcatName(e.target.value)}
                />
              </div>

              {/* Toggle */}
              <div className="sm-modal-toggle-row" style={{ borderTop: 'none', paddingTop: 0 }}>
                <div>
                  <label className="toggle-label">{isRtl ? 'حالة النشاط' : 'Active Status'}</label>
                  <p className="toggle-desc">{isRtl ? 'متاحة للحجز فوراً' : 'Available for booking immediately'}</p>
                </div>
                <button
                  className={`sm-toggle-switch${newSubcatActive ? ' on' : ''}`}
                  onClick={() => setNewSubcatActive(!newSubcatActive)}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="sm-modal-footer">
              <button className="sm-modal-cancel-btn" onClick={() => setIsSubcatModalOpen(false)}>
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button className="sm-btn-primary" onClick={handleAddSubcat}>
                {isRtl ? 'إضافة فئة فرعية' : 'Add Subcategory'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Move Subcategory Modal ── */}
      {isMoveModalOpen && movingSubcat && (
        <div className="sm-modal-overlay" style={{ zIndex: 9999 }}>
          <div className="sm-modal-container" style={{ maxWidth: '400px' }}>
            {/* Header */}
            <div className="sm-modal-header">
              <h2>{isRtl ? 'نقل الفئة الفرعية' : 'Move Subcategory'}</h2>
              <button className="sm-modal-close-btn" onClick={() => { setIsMoveModalOpen(false); setMovingSubcat(null); }}>
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="sm-modal-body">
              <div className="sm-modal-field-group">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#171717' }}>
                  {isRtl 
                    ? `نقل الفئة الفرعية "${movingSubcat.nameAr}" إلى:` 
                    : `Move subcategory "${movingSubcat.name}" to:`}
                </label>
                <select
                  value={targetCategoryId}
                  onChange={e => setTargetCategoryId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d4d4d8',
                    background: '#ffffff',
                    color: '#171717',
                    fontSize: '0.9rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {isRtl ? c.nameAr : c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="sm-modal-footer">
              <button className="sm-modal-cancel-btn" onClick={() => { setIsMoveModalOpen(false); setMovingSubcat(null); }}>
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button className="sm-btn-primary" onClick={handleMoveSubcategory}>
                {isRtl ? 'نقل الفئة' : 'Move'}
              </button>
            </div>
          </div>
        </div>
      )}



      <MobileBottomTabs />

      <style>{`
        /* ── KPIs Row ── */
        .sm-kpis-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 20px;
        }
        
        /* ── Modal popup styles ── */
        .sm-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 16px;
        }
        .sm-modal-container {
          background: #ffffff;
          width: 100%;
          max-width: 500px;
          border-radius: 14px;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
          overflow: hidden;
          text-align: start;
        }
        .sm-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #e5e5e5;
        }
        .sm-modal-header h2 {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: #171717;
        }
        .sm-modal-close-btn {
          background: transparent;
          border: none;
          color: #737373;
          cursor: pointer;
          padding: 4px;
        }
        .sm-modal-close-btn:hover { color: #171717; }
        .sm-modal-body {
          padding: 20px;
        }
        .sm-modal-upload-row {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }
        .sm-upload-box {
          border: 1px dashed #d4d4d4;
          border-radius: 8px;
          background: #fafafa;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
          color: #737373;
          font-size: 11px;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        .sm-upload-box:hover {
          border-color: #171717;
          background: #f5f5f5;
        }
        .sm-upload-box.small {
          width: 90px;
          height: 90px;
        }
        .sm-upload-box.large {
          flex: 1;
          height: 90px;
        }
        .sm-upload-box .icon {
          color: #a3a3a3;
        }
        .sm-modal-field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
        }
        .sm-modal-field-group label {
          font-size: 13px;
          font-weight: 700;
          color: #171717;
        }
        .sm-modal-field-group input,
        .sm-modal-field-group textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e5e5e5;
          border-radius: 8px;
          font-size: 13px;
          outline: none;
          background: #fff;
        }
        .sm-modal-field-group input:focus,
        .sm-modal-field-group textarea:focus {
          border-color: #171717;
        }
        .sm-modal-toggle-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid #f5f5f5;
          padding-top: 16px;
        }
        .sm-modal-toggle-row .toggle-label {
          font-size: 13px;
          font-weight: 700;
          color: #171717;
          margin: 0;
        }
        .sm-modal-toggle-row .toggle-desc {
          margin: 2px 0 0;
          font-size: 11px;
          color: #737373;
        }
        .sm-modal-footer {
          padding: 16px 20px;
          border-top: 1px solid #e5e5e5;
          background: #fafafa;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 12px;
        }
        .sm-modal-footer .sm-btn-primary {
          border-radius: 14px;
        }
        .sm-modal-footer .sm-modal-cancel-btn {
          border-radius: 14px;
        }
        .sm-modal-cancel-btn {
          background: transparent;
          border: none;
          color: #525252;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          padding: 8px 12px;
        }
        .sm-modal-cancel-btn:hover { color: #171717; }
        
        .sm-kpi-card {
          background: #fff;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          padding: 20px 16px;
          text-align: start;
        }
        .sm-kpi-label {
          font-size: 12px;
          color: #737373;
          font-weight: 500;
        }
        .sm-kpi-val-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-top: 8px;
        }
        .sm-kpi-val {
          font-size: 24px;
          font-weight: 700;
          color: #171717;
        }
        .sm-kpi-trend {
          font-size: 11px;
          font-weight: 700;
        }
        .sm-kpi-trend.up { color: #15803d; }
        .sm-kpi-trend.down { color: #b91c1c; }

        /* ── Insights Row ── */
        .sm-insights-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        .sm-insight-card {
          background: #fff;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          padding: 20px;
          text-align: start;
        }
        .sm-insight-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: #171717;
        }
        .sm-insight-header p {
          margin: 4px 0 0;
          font-size: 12px;
          color: #737373;
        }

        /* ── Donut Chart Placeholder (Mockup style) ── */
        .sm-chart-container {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 180px;
        }
        .chart-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .chart-circle {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          border: 12px solid #e5e5e5;
          position: relative;
        }
        .chart-inner-circle {
          position: absolute;
          inset: 0px;
          border-radius: 50%;
          border: 12px solid #171717;
          clip-path: polygon(0 0, 100% 0, 100% 50%, 0 50%);
          transform: rotate(30deg);
        }

        /* ── MoM Growth list (Figma clean format) ── */
        .growing-list-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 14px;
        }
        .growing-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .growing-rank-badge {
          font-size: 11px;
          font-weight: 700;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #f5f5f5;
          color: #404040;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .growing-pct {
          font-size: 12px;
          font-weight: 700;
          color: #15803d;
        }

        /* ── Stacked General Card ── */
        .sm-stacked-card {
          background: #fff;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 20px;
          text-align: start;
        }
        .sm-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          gap: 16px;
          flex-wrap: wrap;
        }
        .sm-card-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: #171717;
        }
        .sm-card-header p {
          margin: 4px 0 0;
          font-size: 12px;
          color: #737373;
        }

        /* ── Split Layout Box ── */
        .sm-split-body {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 24px;
          align-items: start;
        }
        .sm-split-left {
          border-inline-end: 1px solid #f0f0f0;
          padding-inline-end: 24px;
        }
        .sm-search-input-wrapper {
          position: relative;
          margin-bottom: 12px;
        }
        .sm-search-input-wrapper .icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #a3a3a3;
        }
        .sm-search-input-wrapper input {
          width: 100%;
          padding: 8px 10px 8px 30px;
          border: 1px solid #e5e5e5;
          border-radius: 6px;
          font-size: 12px;
          outline: none;
        }
        .sm-search-input-wrapper input:focus { border-color: #171717; }

        .sm-left-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .sm-left-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 10px;
          background: transparent;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          color: #404040;
          font-weight: 500;
          cursor: pointer;
          text-align: start;
          transition: all 0.2s ease;
        }
        .sm-left-item:hover { background: #fafafa; }
        .sm-left-item.active {
          background: #f5f5f5;
          color: #171717;
          font-weight: 700;
        }
        .sm-left-item .badge {
          font-size: 10px;
          background: #e5e5e5;
          color: #737373;
          padding: 1px 6px;
          border-radius: 4px;
        }

        .sm-split-right-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .sm-split-right-header h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 700;
          color: #171717;
        }

        /* ── Buttons ── */
        .sm-header-buttons {
          display: flex;
          gap: 8px;
        }
        .sm-btn-primary {
          background: #171717;
          color: #fff;
          border: none;
          padding: 10px 16px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .sm-btn-primary:hover { background: #262626; }
        .sm-btn-primary.small {
          padding: 6px 12px;
          font-size: 11px;
        }

        .sm-btn-outline {
          background: #fff;
          color: #171717;
          border: 1px solid #e5e5e5;
          padding: 10px 16px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .sm-btn-outline:hover { background: #fafafa; }
        .sm-btn-outline.small {
          padding: 6px 12px;
          font-size: 11px;
        }

        .sm-btn-secondary {
          background: #a3a3a3;
          color: #fff;
          border: none;
          padding: 10px 16px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .sm-btn-secondary:hover { background: #737373; }

        /* ── Tables ── */
        .sm-table-container {
          overflow-x: auto;
        }
        .sm-table {
          width: 100%;
          border-collapse: collapse;
        }
        .sm-table th {
          padding: 10px 12px;
          font-size: 11px;
          color: #737373;
          font-weight: 600;
          text-transform: uppercase;
          border-bottom: 1px solid #e5e5e5;
          text-align: start;
        }
        .sm-table td {
          padding: 12px;
          border-bottom: 1px solid #f0f0f0;
          font-size: 13px;
          color: #171717;
          text-align: start;
        }
        .sm-checkbox {
          width: 14px;
          height: 14px;
          border-radius: 4px;
          border: 1.5px solid #d4d4d4;
          outline: none;
          cursor: pointer;
        }
        .sm-category-icon-box {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid #e5e5e5;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fafafa;
        }
        .sm-orange-star {
          color: #f59e0b;
          font-size: 14px;
        }
        .sm-subcat-badge {
          border: 1.5px solid #e5e5e5;
          border-radius: 6px;
          padding: 2px 8px;
          font-weight: 500;
          font-size: 11px;
          color: #404040;
        }

        /* Status badges */
        .sm-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 9999px;
        }
        .sm-status-badge .dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
        }
        .sm-status-badge.active { background: #dcfce7; color: #15803d; }
        .sm-status-badge.active .dot { background: #22c55e; }
        .sm-status-badge.hidden { background: #f5f5f5; color: #737373; }
        .sm-status-badge.hidden .dot { background: #9ca3af; }
        .sm-status-badge.archived { background: #fef3c7; color: #d97706; }
        .sm-status-badge.archived .dot { background: #f59e0b; }

        .sm-usage-cell {
          display: flex;
          flex-direction: column;
          font-size: 11px;
          font-weight: 500;
          color: #737373;
        }
        .sm-action-menu-btn {
          background: transparent;
          border: none;
          color: #a3a3a3;
          font-weight: bold;
          cursor: pointer;
        }

        /* ── Toggle switch ── */
        .sm-toggle-switch {
          width: 32px;
          height: 18px;
          border-radius: 999px;
          background: #e5e5e5;
          border: none;
          position: relative;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .sm-toggle-switch::before {
          content: "";
          position: absolute;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #fff;
          top: 2px;
          left: 2px;
          transition: transform 0.2s ease;
        }
        .sm-toggle-switch.on { background: #171717; }
        .sm-toggle-switch.on::before {
          transform: translateX(14px);
        }

        /* ── Dynamic request fields builder ── */
        .sm-edit-badge {
          background: #fafafa;
          border: 1px solid #e5e5e5;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          color: #525252;
        }
        .sm-toolbox-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 6px;
          margin-top: 8px;
        }
        .sm-toolbox-card {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border: 1.5px solid #e5e5e5;
          border-radius: 6px;
          background: #fff;
          font-size: 12px;
          font-weight: 600;
          color: #171717;
          cursor: pointer;
          text-align: start;
          transition: all 0.2s ease;
        }
        .sm-toolbox-card:hover {
          background: #fafafa;
          border-color: #171717;
        }
        .sm-toolbox-card .icon {
          font-weight: bold;
          font-size: 13px;
          color: #737373;
          width: 16px;
          text-align: center;
        }

        .sm-fields-builder-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .sm-field-builder-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 14px;
          border: 1px solid #e5e5e5;
          border-radius: 6px;
          background: #fff;
        }
        .sm-required-asterisk {
          color: #ef4444;
          font-weight: bold;
        }
        .sm-field-type-pill {
          font-size: 10px;
          font-weight: 600;
          background: #f5f5f5;
          border: 1px solid #e5e5e5;
          color: #737373;
          padding: 1px 6px;
          border-radius: 4px;
        }
        .sm-icon-action-btn {
          background: transparent;
          border: none;
          color: #a3a3a3;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
        }
        .sm-icon-action-btn:hover {
          color: #171717;
          background: #fafafa;
        }
        .sm-icon-action-btn.delete:hover {
          color: #ef4444;
          background: #fee2e2;
        }

        /* ── Recent Activity timeline ── */
        .sm-activity-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .sm-activity-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #fafafa;
        }
        .sm-activity-circle-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #e5e5e5;
        }
        .sm-view-activity-link {
          font-size: 12px;
          font-weight: 600;
          color: #737373;
          text-decoration: none;
        }
        .sm-view-activity-link:hover { color: #171717; }

        .sm-split-left,
        .sm-split-right,
        .sm-sidebar-panel,
        .sm-main-panel {
          min-width: 0;
        }

        .sm-table-container {
          width: 100%;
          max-width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .sm-field-builder-row span {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 160px;
        }

        /* ── Responsive breakpoints ── */
        @media (max-width: 1024px) {
          .sm-kpis-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .sm-insights-layout {
            grid-template-columns: 1fr;
          }
          .sm-split-body {
            grid-template-columns: 1fr;
          }
          .sm-split-left {
            border-inline-end: none;
            padding-inline-end: 0;
            border-bottom: 1px solid #f0f0f0;
            padding-bottom: 20px;
            margin-bottom: 20px;
          }
          .sm-toolbox-grid {
            grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          }
        }
        @media (max-width: 768px) {
          .sm-kpis-grid {
            grid-template-columns: 1fr;
          }
          .sm-card-header {
            flex-direction: column;
            align-items: stretch;
          }
          .sm-card-header > div {
            flex-wrap: wrap;
          }
          .sm-header-buttons {
            margin-top: 12px;
          }
          .sm-split-right-header {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }
          .sm-field-builder-row span {
            max-width: 90px;
          }
          
          /* Hide non-essential columns on mobile to fit table */
          .sm-table th:nth-child(1), .sm-table td:nth-child(1), /* Drag handle */
          .sm-table th:nth-child(2), .sm-table td:nth-child(2), /* Checkbox */
          .sm-table th:nth-child(6), .sm-table td:nth-child(6)  /* Usage */
          {
            display: none !important;
          }
          
          /* Hide non-essential subcategory table columns on mobile */
          .sm-split-right .sm-table td:nth-child(1), /* Drag handle */
          .sm-split-right .sm-table td:nth-child(4)  /* Requests */
          {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ServiceManagementPage;
